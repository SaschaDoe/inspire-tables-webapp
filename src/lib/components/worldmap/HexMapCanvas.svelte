<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { WorldMap } from '$lib/entities/location/worldMap';
	import type { HexTile } from '$lib/entities/location/hexTile';
	import { TERRAIN_COLORS, TerrainType } from '$lib/entities/location/terrainType';

	interface Props {
		worldMap: WorldMap;
		hexSize?: number;
	}

	let { worldMap, hexSize = 20 }: Props = $props();

	const dispatch = createEventDispatcher();

	let selectedHex: HexTile | null = $state(null);
	let hoveredHex: HexTile | null = $state(null);
	let scale = $state(0.6); // Start zoomed out

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
	 * Handle hex click
	 */
	function handleHexClick(hexTile: HexTile) {
		selectedHex = hexTile;
		dispatch('hexSelected', { hex: hexTile });
	}

	/**
	 * Handle hex hover
	 */
	function handleHexHover(hexTile: HexTile) {
		hoveredHex = hexTile;
	}

	/**
	 * Handle hex hover end
	 */
	function handleHexLeave() {
		hoveredHex = null;
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

	/**
	 * Get stroke color for hex
	 */
	function getHexStroke(hexTile: HexTile): string {
		if (selectedHex?.x === hexTile.x && selectedHex?.y === hexTile.y) {
			return '#f59e0b';
		}
		if (hoveredHex?.x === hexTile.x && hoveredHex?.y === hexTile.y) {
			return '#a855f7';
		}
		return 'rgba(0, 0, 0, 0.2)';
	}

	/**
	 * Get stroke width for hex
	 */
	function getHexStrokeWidth(hexTile: HexTile): number {
		if (selectedHex?.x === hexTile.x && selectedHex?.y === hexTile.y) {
			return 2;
		}
		if (hoveredHex?.x === hexTile.x && hoveredHex?.y === hexTile.y) {
			return 1.5;
		}
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
								fill={TERRAIN_COLORS[hexTile.terrainType]}
								stroke={getHexStroke(hexTile)}
								stroke-width={getHexStrokeWidth(hexTile)}
								class="hex-tile"
								onclick={() => handleHexClick(hexTile)}
								onmouseenter={() => handleHexHover(hexTile)}
								onmouseleave={handleHexLeave}
								role="button"
								tabindex="0"
							>
								<title>{getTerrainName(hexTile.terrainType)} ({hexTile.x}, {hexTile.y})</title>
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
