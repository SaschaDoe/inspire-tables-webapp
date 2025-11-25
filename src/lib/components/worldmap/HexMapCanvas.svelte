<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { WorldMap } from '$lib/entities/location/worldMap';
	import type { HexTile } from '$lib/entities/location/hexTile';
	import type { RegionalHexData } from '$lib/entities/location/regionalHexData';
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

	// Selection state
	let selectedHex: HexTile | null = $state(null);
	let selectedRegionalHex: RegionalHexData | null = $state(null);
	let selectedContinentId: number | null = $state(null);

	// Zoom and pan state
	let scale = $state(0.6); // Start zoomed out
	let panX = $state(0);
	let panY = $state(0);
	let isPanning = $state(false);
	let lastMouseX = $state(0);
	let lastMouseY = $state(0);

	// Zoom thresholds for level switching
	const REGIONAL_ZOOM_THRESHOLD = 2.0; // Switch to regional view above this
	const TRANSITION_RANGE = 0.8; // Smooth transition over this range (wider = smoother)

	// Calculate transition progress (0 = planetary only, 1 = regional only)
	const transitionProgress = $derived.by(() => {
		if (scale < REGIONAL_ZOOM_THRESHOLD - TRANSITION_RANGE / 2) return 0;
		if (scale > REGIONAL_ZOOM_THRESHOLD + TRANSITION_RANGE / 2) return 1;
		return (scale - (REGIONAL_ZOOM_THRESHOLD - TRANSITION_RANGE / 2)) / TRANSITION_RANGE;
	});

	// Are we showing regional hexes?
	const showRegional = $derived(scale >= REGIONAL_ZOOM_THRESHOLD - TRANSITION_RANGE / 2);
	const showPlanetary = $derived(scale <= REGIONAL_ZOOM_THRESHOLD + TRANSITION_RANGE / 2);

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

	const zoomFactor = 0.15; // Smaller increments for smoother zoom
	const minScale = 0.2;
	const maxScale = 8; // Increased for regional zoom

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

	// Regional hex size (smaller than planetary)
	// 10x10 grid means each regional hex is 1/10 the size of planetary hex
	const regionalHexSize = $derived(hexSize / 10);

	/**
	 * Generate SVG points for a hexagon at given center
	 */
	function getHexPointsAtCenter(cx: number, cy: number, size: number): string {
		const points: string[] = [];
		for (let i = 0; i < 6; i++) {
			const angle = (Math.PI / 3) * i;
			const hx = cx + size * Math.cos(angle);
			const hy = cy + size * Math.sin(angle);
			points.push(`${hx},${hy}`);
		}
		return points.join(' ');
	}

	/**
	 * Generate SVG points for a planetary hexagon
	 */
	function getHexPoints(hexTile: HexTile): string {
		const center = hexToPixel(hexTile.x, hexTile.y);
		return getHexPointsAtCenter(center.x, center.y, hexSize);
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
	 * Calculate regional hex center position within a planetary hex
	 */
	function getRegionalHexCenter(
		planetaryHex: HexTile,
		rx: number,
		ry: number
	): { x: number; y: number } {
		const planetaryCenter = hexToPixel(planetaryHex.x, planetaryHex.y);
		const gridSize = planetaryHex.regionalGridSize || 5;

		// Calculate offset from planetary hex center
		// Regional hexes form a grid within the planetary hex
		const regHexWidth = regionalHexSize * 1.5;
		const regHexHeight = regionalHexSize * Math.sqrt(3);

		// Center the regional grid within the planetary hex
		const gridWidth = gridSize * regHexWidth;
		const gridHeight = gridSize * regHexHeight;
		const offsetX = -gridWidth / 2 + regHexWidth / 2;
		const offsetY = -gridHeight / 2 + regHexHeight / 2;

		const regX = planetaryCenter.x + offsetX + rx * regHexWidth;
		const regY = planetaryCenter.y + offsetY + ry * regHexHeight + (rx % 2) * regHexHeight / 2;

		return { x: regX, y: regY };
	}

	/**
	 * Handle planetary hex click
	 */
	function handleHexClick(hexTile: HexTile) {
		if (
			continentSelectionMode &&
			hexTile.continentId !== undefined &&
			worldMap.continents
		) {
			if (selectedContinentId !== hexTile.continentId) {
				selectedContinentId = hexTile.continentId;
				const continent = worldMap.continents.find((c) => c.id === hexTile.continentId);
				if (continent) {
					dispatch('continentSelected', { continent, tiles: continent.tiles });
				}
			}
		} else {
			selectedHex = hexTile;
			selectedRegionalHex = null;
			selectedContinentId = null;
			dispatch('hexSelected', { hex: hexTile });
		}
	}

	/**
	 * Handle regional hex click
	 */
	function handleRegionalHexClick(planetaryHex: HexTile, regionalHex: RegionalHexData) {
		selectedRegionalHex = regionalHex;
		selectedHex = planetaryHex;
		dispatch('regionalHexSelected', {
			planetaryHex,
			regionalHex,
			globalX: planetaryHex.x * (planetaryHex.regionalGridSize || 5) + regionalHex.x,
			globalY: planetaryHex.y * (planetaryHex.regionalGridSize || 5) + regionalHex.y
		});
	}

	/**
	 * Get fill color for a planetary hex tile
	 */
	function getHexFill(hexTile: HexTile): string {
		if (showContinents && hexTile.continentId !== undefined) {
			return continentColors.get(hexTile.continentId) || TERRAIN_COLORS[hexTile.terrainType];
		}
		return TERRAIN_COLORS[hexTile.terrainType];
	}

	/**
	 * Get fill color for a regional hex tile
	 */
	function getRegionalHexFill(regionalHex: RegionalHexData): string {
		let baseColor = TERRAIN_COLORS[regionalHex.terrainType];

		// Darken slightly for features
		if (regionalHex.feature === 'Forest') {
			return '#228B22'; // Forest green
		} else if (regionalHex.feature === 'Jungle') {
			return '#006400'; // Dark green
		} else if (regionalHex.feature === 'Marsh') {
			return '#4A6741'; // Marsh green
		}

		return baseColor;
	}


	/**
	 * Handle zoom with mouse wheel
	 */
	function handleZoom(event: WheelEvent) {
		event.preventDefault();

		if (event.deltaY < 0) {
			scale = Math.min(scale + zoomFactor, maxScale);
		} else {
			scale = Math.max(scale - zoomFactor, minScale);
		}
	}

	/**
	 * Handle pan start
	 */
	function handleMouseDown(event: MouseEvent) {
		if (event.button === 0) { // Left click
			isPanning = true;
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		}
	}

	/**
	 * Handle pan move
	 */
	function handleMouseMove(event: MouseEvent) {
		if (isPanning) {
			const deltaX = event.clientX - lastMouseX;
			const deltaY = event.clientY - lastMouseY;
			panX += deltaX / scale;
			panY += deltaY / scale;
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		}
	}

	/**
	 * Handle pan end
	 */
	function handleMouseUp() {
		isPanning = false;
	}

	/**
	 * Handle mouse leaving the container
	 */
	function handleContainerLeave() {
		isPanning = false;
	}

	function zoomIn() {
		scale = Math.min(scale + zoomFactor * 1.5, maxScale);
	}

	function zoomOut() {
		scale = Math.max(scale - zoomFactor * 1.5, minScale);
	}

	function resetZoom() {
		scale = 0.6;
		panX = 0;
		panY = 0;
	}

	// Pre-compute keys for faster lookups
	const selectedHexKey = $derived(selectedHex ? `${selectedHex.x},${selectedHex.y}` : null);
	const selectedRegionalKey = $derived(
		selectedRegionalHex ? `${selectedRegionalHex.x},${selectedRegionalHex.y}` : null
	);

	/**
	 * Check if hex is selected (for CSS class)
	 */
	function isHexSelected(hexTile: HexTile): boolean {
		if (continentSelectionMode && selectedContinentId !== null) {
			return hexTile.continentId === selectedContinentId;
		}
		const tileKey = `${hexTile.x},${hexTile.y}`;
		return selectedHexKey === tileKey;
	}

	/**
	 * Check if regional hex is selected (for CSS class)
	 */
	function isRegionalHexSelected(regionalHex: RegionalHexData): boolean {
		const key = `${regionalHex.x},${regionalHex.y}`;
		return selectedRegionalKey === key;
	}

	function getTerrainName(terrainType: TerrainType): string {
		return TerrainType[terrainType];
	}

	/**
	 * Get resource icon for regional hex
	 */
	function getResourceIcon(regionalHex: RegionalHexData): string {
		if (regionalHex.strategicResource && regionalHex.strategicResource !== 'none') {
			return '⚔️';
		}
		if (regionalHex.luxuryResource && regionalHex.luxuryResource !== 'none') {
			return '💎';
		}
		if (regionalHex.bonusResource) {
			return '🌾';
		}
		return '';
	}

	/**
	 * Get river path for a regional hex
	 */
	function getRiverPath(planetaryHex: HexTile, regionalHex: RegionalHexData): string {
		if (!regionalHex.hasRiver || regionalHex.riverSides.length === 0) return '';

		const center = getRegionalHexCenter(planetaryHex, regionalHex.x, regionalHex.y);
		const size = regionalHexSize;

		let path = '';
		for (const side of regionalHex.riverSides) {
			const angle1 = (Math.PI / 3) * side;
			const angle2 = (Math.PI / 3) * ((side + 1) % 6);
			const x1 = center.x + size * Math.cos(angle1);
			const y1 = center.y + size * Math.sin(angle1);
			const x2 = center.x + size * Math.cos(angle2);
			const y2 = center.y + size * Math.sin(angle2);
			path += `M ${x1} ${y1} L ${x2} ${y2} `;
		}
		return path;
	}

	export function getSelectedHex(): HexTile | null {
		return selectedHex;
	}

	// View mode indicator
	const viewModeLabel = $derived.by(() => {
		if (transitionProgress === 0) return 'Planetary View';
		if (transitionProgress === 1) return 'Regional View';
		return 'Transitioning...';
	});
</script>

<div class="hex-map-container">
	<div class="zoom-controls">
		<button class="zoom-btn" onclick={zoomIn} title="Zoom in">+</button>
		<button class="zoom-btn" onclick={zoomOut} title="Zoom out">−</button>
		<button class="zoom-btn reset-btn" onclick={resetZoom} title="Reset zoom">⟲</button>
		<span class="zoom-level">{Math.round(scale * 100)}%</span>
		<span class="view-mode">{viewModeLabel}</span>
	</div>
	<div
		class="svg-container"
		onwheel={handleZoom}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleContainerLeave}
		role="application"
		tabindex="0"
	>
		{#key worldMap.seed}
			<svg
				viewBox="{viewBox.x} {viewBox.y} {viewBox.width} {viewBox.height}"
				style="transform: scale({scale}) translate({panX}px, {panY}px); transition: transform 0.25s ease-out;"
			>
				<!-- Planetary hexes layer -->
				{#if showPlanetary}
					<g
						class="hex-grid planetary-layer"
						style="opacity: {1 - transitionProgress}; transition: opacity 0.5s ease-in-out;"
					>
						{#each worldMap.hexTiles as row}
							{#each row as hexTile}
								<polygon
									points={getHexPoints(hexTile)}
									fill={getHexFill(hexTile)}
									class="hex-tile"
									class:selected={isHexSelected(hexTile)}
									onclick={() => handleHexClick(hexTile)}
									onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleHexClick(hexTile); }}
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
				{/if}

				<!-- Regional hexes layer -->
				{#if showRegional}
					<g
						class="hex-grid regional-layer"
						style="opacity: {transitionProgress}; transition: opacity 0.5s ease-in-out;"
					>
						{#each worldMap.hexTiles as row}
							{#each row as hexTile}
								{#if hexTile.regionalHexes && hexTile.regionalHexes.length > 0}
									{#each hexTile.regionalHexes as regionalRow, ry}
										{#each regionalRow as regionalHex, rx}
											{@const center = getRegionalHexCenter(hexTile, rx, ry)}
											<polygon
												points={getHexPointsAtCenter(center.x, center.y, regionalHexSize)}
												fill={getRegionalHexFill(regionalHex)}
												class="regional-hex-tile"
												class:selected={isRegionalHexSelected(regionalHex)}
												onclick={() => handleRegionalHexClick(hexTile, regionalHex)}
												role="button"
												tabindex="-1"
											>
												<title
													>{getTerrainName(regionalHex.terrainType)}{regionalHex.feature ? ` (${regionalHex.feature})` : ''} - Regional ({rx}, {ry})</title
												>
											</polygon>

											<!-- River overlay -->
											{#if regionalHex.hasRiver}
												<path
													d={getRiverPath(hexTile, regionalHex)}
													fill="none"
													stroke="#4A90D9"
													stroke-width="0.3"
													stroke-linecap="round"
													class="river"
												/>
											{/if}

											<!-- Resource icon -->
											{#if getResourceIcon(regionalHex)}
												<text
													x={center.x}
													y={center.y}
													text-anchor="middle"
													dominant-baseline="middle"
													font-size={regionalHexSize * 0.6}
													class="resource-icon"
												>
													{getResourceIcon(regionalHex)}
												</text>
											{/if}
										{/each}
									{/each}
								{/if}
							{/each}
						{/each}
					</g>
				{/if}
			</svg>
		{/key}
	</div>

	<!-- Info panel for selected regional hex -->
	{#if selectedRegionalHex && showRegional}
		<div class="regional-info-panel">
			<h4>Regional Hex ({selectedRegionalHex.x}, {selectedRegionalHex.y})</h4>
			<div class="info-row">
				<span class="label">Terrain:</span>
				<span class="value">{getTerrainName(selectedRegionalHex.terrainType)}</span>
			</div>
			{#if selectedRegionalHex.feature}
				<div class="info-row">
					<span class="label">Feature:</span>
					<span class="value">{selectedRegionalHex.feature}</span>
				</div>
			{/if}
			{#if selectedRegionalHex.strategicResource && selectedRegionalHex.strategicResource !== 'none'}
				<div class="info-row">
					<span class="label">Strategic:</span>
					<span class="value">{selectedRegionalHex.strategicResource}</span>
				</div>
			{/if}
			{#if selectedRegionalHex.luxuryResource && selectedRegionalHex.luxuryResource !== 'none'}
				<div class="info-row">
					<span class="label">Luxury:</span>
					<span class="value">{selectedRegionalHex.luxuryResource}</span>
				</div>
			{/if}
			{#if selectedRegionalHex.bonusResource}
				<div class="info-row">
					<span class="label">Bonus:</span>
					<span class="value">{selectedRegionalHex.bonusResource}</span>
				</div>
			{/if}
			{#if selectedRegionalHex.hasRiver}
				<div class="info-row">
					<span class="label">River:</span>
					<span class="value">Yes</span>
				</div>
			{/if}
			<div class="yields">
				<span title="Food">🌾 {selectedRegionalHex.yields.food}</span>
				<span title="Production">⚙️ {selectedRegionalHex.yields.production}</span>
				<span title="Gold">💰 {selectedRegionalHex.yields.gold}</span>
			</div>
		</div>
	{/if}
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

	.view-mode {
		color: rgb(147 51 234);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.25rem;
		margin-left: 0.5rem;
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
		cursor: grab;
	}

	.svg-container:active {
		cursor: grabbing;
	}

	svg {
		width: 100%;
		height: 100%;
		transform-origin: center center;
	}

	.hex-tile {
		cursor: pointer;
		stroke: rgba(0, 0, 0, 0.2);
		stroke-width: 0.5;
	}

	.hex-tile:hover {
		filter: brightness(1.1);
		stroke: #a855f7;
		stroke-width: 1.5;
	}

	.hex-tile.selected {
		stroke: #f59e0b;
		stroke-width: 2;
	}

	.regional-hex-tile {
		cursor: pointer;
		stroke: rgba(0, 0, 0, 0.15);
		stroke-width: 0.1;
	}

	.regional-hex-tile:hover {
		filter: brightness(1.15);
		stroke: #a855f7;
		stroke-width: 0.3;
	}

	.regional-hex-tile.selected {
		stroke: #f59e0b;
		stroke-width: 0.4;
	}

	.river {
		pointer-events: none;
	}

	.resource-icon {
		pointer-events: none;
		user-select: none;
	}

	.regional-info-panel {
		position: absolute;
		bottom: 1.5rem;
		right: 1.5rem;
		background: rgb(30 27 75 / 0.95);
		border: 2px solid rgb(147 51 234 / 0.5);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		min-width: 180px;
		backdrop-filter: blur(8px);
	}

	.regional-info-panel h4 {
		margin: 0 0 0.5rem 0;
		color: rgb(192 132 252);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		margin-bottom: 0.25rem;
	}

	.info-row .label {
		color: rgb(148 163 184);
	}

	.info-row .value {
		color: rgb(226 232 240);
		font-weight: 500;
	}

	.yields {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid rgb(71 85 105);
		font-size: 0.75rem;
	}

	.yields span {
		color: rgb(203 213 225);
	}
</style>
