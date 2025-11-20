<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { WorldMap } from '$lib/entities/location/worldMap';
	import type { HexTile } from '$lib/entities/location/hexTile';
	import { TERRAIN_COLORS, TerrainType } from '$lib/entities/location/terrainType';

	interface Props {
		worldMap: WorldMap;
		hexSize?: number;
		showContinents?: boolean;
		continentSelectionMode?: boolean;
	}

	let {
		worldMap,
		hexSize = 20,
		showContinents = false,
		continentSelectionMode = false
	}: Props = $props();

	const dispatch = createEventDispatcher();

	let selectedHex: HexTile | null = $state(null);
	let hoveredHex: HexTile | null = $state(null);
	let selectedContinentId: number | null = $state(null);
	let scale = $state(0.6); // Start zoomed out

	// Generate distinct colors for each continent
	const continentColors = $derived.by(() => {
		const colors = new Map<number, string>();

		if (!worldMap.continents || worldMap.continents.length === 0) {
			return colors;
		}

		const hueStep = 360 / worldMap.continents.length;

		worldMap.continents.forEach((continent, index) => {
			const hue = (index * hueStep) % 360;
			const saturation = 60 + (index % 3) * 10;
			const lightness = 50 + (index % 2) * 10;
			colors.set(continent.id, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`);
		});

		return colors;
	});

	const zoomFactor = 0.2;
	const minScale = 0.2;
	const maxScale = 4;

	// Calculate SVG viewBox based on map dimensions (reactive)
	const viewBox = $derived.by(() => {
		const width = (worldMap.width + 1) * hexSize * 1.5;
		const height = worldMap.height * hexSize * Math.sqrt(3) + hexSize;
		return {
			x: -width * 0.1,
			y: -height * 0.1,
			width: width * 1.2,
			height: height * 1.2
		};
	});

	/**
	 * Generate SVG points for a hexagon
	 */
	function getHexPoints(hexTile: HexTile): string {
		const center = hexToPixel(hexTile.x, hexTile.y);
		const points: string[] = [];

		for (let i = 0; i < 6; i++) {
			const angle = (Math.PI / 3) * i;
			const hx = center.x + hexSize * Math.cos(angle);
			const hy = center.y + hexSize * Math.sin(angle);
			points.push(`${hx},${hy}`);
		}

		return points.join(' ');
	}

	/**
	 * Convert hex grid coordinates to pixel coordinates
	 * Uses offset-column layout (odd columns offset down)
	 */
	function hexToPixel(x: number, y: number): { x: number; y: number } {
		const pixelX = hexSize * 1.5 * x + hexSize;
		const pixelY =
			hexSize * Math.sqrt(3) * (y + (x % 2) * 0.5) + (hexSize * Math.sqrt(3)) / 2;
		return { x: pixelX, y: pixelY };
	}

	/**
	 * Handle hex click (optimized to batch state updates)
	 */
	function handleHexClick(hexTile: HexTile) {
		if (
			continentSelectionMode &&
			hexTile.continentId !== undefined &&
			worldMap.continents
		) {
			// Only update if selecting a different continent
			if (selectedContinentId !== hexTile.continentId) {
				selectedContinentId = hexTile.continentId;
				const continent = worldMap.continents.find((c) => c.id === hexTile.continentId);
				if (continent) {
					dispatch('continentSelected', { continent, tiles: continent.tiles });
				}
			}
		} else {
			// Select single hex
			selectedHex = hexTile;
			selectedContinentId = null;
			dispatch('hexSelected', { hex: hexTile });
		}
	}

	/**
	 * Get fill color for a hex tile (terrain color or continent overlay)
	 */
	function getHexFill(hexTile: HexTile): string {
		if (showContinents && hexTile.continentId !== undefined) {
			return continentColors.get(hexTile.continentId) || TERRAIN_COLORS[hexTile.terrainType];
		}
		return TERRAIN_COLORS[hexTile.terrainType];
	}

	/**
	 * Handle hex hover (disabled during continent selection for performance)
	 */
	function handleHexHover(hexTile: HexTile) {
		if (!continentSelectionMode) {
			hoveredHex = hexTile;
		}
	}

	/**
	 * Handle hex hover end
	 */
	function handleHexLeave() {
		if (!continentSelectionMode) {
			hoveredHex = null;
		}
	}

	/**
	 * Handle zoom with mouse wheel
	 */
	function handleZoom(event: WheelEvent) {
		event.preventDefault();

		// Adjust scale factor
		if (event.deltaY < 0) {
			scale = Math.min(scale + zoomFactor, maxScale);
		} else {
			scale = Math.max(scale - zoomFactor, minScale);
		}
	}

	/**
	 * Zoom in
	 */
	function zoomIn() {
		scale = Math.min(scale + zoomFactor * 1.5, maxScale);
	}

	/**
	 * Zoom out
	 */
	function zoomOut() {
		scale = Math.max(scale - zoomFactor * 1.5, minScale);
	}

	/**
	 * Reset zoom
	 */
	function resetZoom() {
		scale = 0.6;
	}

	// Pre-compute tile keys for faster lookups
	const selectedHexKey = $derived(selectedHex ? `${selectedHex.x},${selectedHex.y}` : null);
	const hoveredHexKey = $derived(hoveredHex ? `${hoveredHex.x},${hoveredHex.y}` : null);

	/**
	 * Get stroke color for hex (optimized with early exit)
	 */
	function getHexStroke(hexTile: HexTile): string {
		// Fast path: continent selection mode
		if (continentSelectionMode && selectedContinentId !== null) {
			return hexTile.continentId === selectedContinentId ? '#f59e0b' : 'rgba(0, 0, 0, 0.2)';
		}

		// Fast path: nothing selected or hovered
		if (!selectedHexKey && !hoveredHexKey) {
			return 'rgba(0, 0, 0, 0.2)';
		}

		const tileKey = `${hexTile.x},${hexTile.y}`;

		// Single hex selection
		if (selectedHexKey === tileKey) return '#f59e0b';

		// Hover
		if (hoveredHexKey === tileKey) return '#a855f7';

		return 'rgba(0, 0, 0, 0.2)';
	}

	/**
	 * Get stroke width for hex (optimized with early exit)
	 */
	function getHexStrokeWidth(hexTile: HexTile): number {
		// Fast path: continent selection mode
		if (continentSelectionMode && selectedContinentId !== null) {
			return hexTile.continentId === selectedContinentId ? 2.5 : 0.5;
		}

		// Fast path: nothing selected or hovered
		if (!selectedHexKey && !hoveredHexKey) {
			return 0.5;
		}

		const tileKey = `${hexTile.x},${hexTile.y}`;

		// Single hex selection
		if (selectedHexKey === tileKey) return 2;

		// Hover
		if (hoveredHexKey === tileKey) return 1.5;

		return 0.5;
	}

	/**
	 * Get terrain name for display
	 */
	function getTerrainName(terrainType: TerrainType): string {
		return TerrainType[terrainType];
	}

	/**
	 * Export selected hex for parent component
	 */
	export function getSelectedHex(): HexTile | null {
		return selectedHex;
	}
</script>

<div class="hex-map-container">
	<div class="zoom-controls">
		<button class="zoom-btn" onclick={zoomIn} title="Zoom in">+</button>
		<button class="zoom-btn" onclick={zoomOut} title="Zoom out">−</button>
		<button class="zoom-btn reset-btn" onclick={resetZoom} title="Reset zoom">⟲</button>
		<span class="zoom-level">{Math.round(scale * 100)}%</span>
	</div>
	<div class="svg-container" onwheel={handleZoom}>
		{#key worldMap.seed}
			<svg
				viewBox="{viewBox.x} {viewBox.y} {viewBox.width} {viewBox.height}"
				style="transform: scale({scale}); transition: transform 0.2s ease-out;"
			>
				<g class="hex-grid">
					{#each worldMap.hexTiles as row}
						{#each row as hexTile}
							<polygon
								points={getHexPoints(hexTile)}
								fill={getHexFill(hexTile)}
								stroke={getHexStroke(hexTile)}
								stroke-width={getHexStrokeWidth(hexTile)}
								class="hex-tile"
								onclick={() => handleHexClick(hexTile)}
								onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleHexClick(hexTile); }}
								onmouseenter={() => handleHexHover(hexTile)}
								onmouseleave={handleHexLeave}
								role="button"
								tabindex="0"
							>
								<title
									>{getTerrainName(hexTile.terrainType)} ({hexTile.x}, {hexTile.y}){hexTile.continentId
										? ` - Continent ${hexTile.continentId}`
										: ''}</title
								>
							</polygon>
						{/each}
					{/each}
				</g>
			</svg>
		{/key}
	</div>
</div>

<style>
	.hex-map-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: rgb(15 23 42);
		border-radius: 0.5rem;
		padding: 1rem;
		position: relative;
	}

	.zoom-controls {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
	}

	.zoom-btn {
		width: 36px;
		height: 36px;
		background: rgb(30 41 59);
		border: 2px solid rgb(71 85 105);
		border-radius: 0.375rem;
		color: rgb(203 213 225);
		font-size: 1.25rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.zoom-btn:hover {
		background: rgb(51 65 85);
		border-color: rgb(147 51 234);
		color: white;
	}

	.reset-btn {
		font-size: 1.5rem;
	}

	.zoom-level {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		font-weight: 500;
		min-width: 50px;
		text-align: center;
	}

	.svg-container {
		width: 100%;
		height: 600px;
		border: 2px solid rgb(71 85 105);
		border-radius: 0.375rem;
		background: rgb(30 41 59);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	svg {
		width: 100%;
		height: 100%;
		transform-origin: center center;
	}

	.hex-tile {
		cursor: pointer;
		transition: stroke 0.15s ease, stroke-width 0.15s ease;
	}

	.hex-tile:hover {
		filter: brightness(1.1);
	}
</style>
