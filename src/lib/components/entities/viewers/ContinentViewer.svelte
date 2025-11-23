<script lang="ts">
	import type { Continent } from '$lib/entities/location/continent';
	import { TerrainType } from '$lib/entities/location/terrainType';
	import Section from '../shared/Section.svelte';
	import { entityStore } from '$lib/stores/entityStore';
	import { createEventDispatcher } from 'svelte';
	import { WorldMap } from '$lib/entities/location/worldMap';
	import { HexTile } from '$lib/entities/location/hexTile';
	import { TERRAIN_COLORS } from '$lib/entities/location/terrainType';

	interface Props {
		continent: Continent;
		parentEntity?: any;
	}

	let { continent, parentEntity }: Props = $props();
	const dispatch = createEventDispatcher();

	// Get parent planet info
	const parentPlanet = $derived.by(() => {
		if (continent.parentId) {
			return entityStore.getEntity(continent.parentId);
		}
		return null;
	});

	// Get parent planet's world map for context
	const parentPlanetWorldMap = $derived.by(() => {
		if (parentPlanet && parentPlanet.customFields?.generatedEntity?.worldMap) {
			return parentPlanet.customFields.generatedEntity.worldMap;
		}
		return null;
	});

	// Group hex tiles by terrain type for easier viewing
	const hexTilesByTerrain = $derived.by(() => {
		const grouped = new Map<string, typeof continent.hexTiles>();

		continent.hexTiles.forEach(tile => {
			const terrainName = TerrainType[tile.terrainType];
			if (!grouped.has(terrainName)) {
				grouped.set(terrainName, []);
			}
			grouped.get(terrainName)!.push(tile);
		});

		// Sort by count descending
		return Array.from(grouped.entries())
			.sort((a, b) => b[1].length - a[1].length);
	});

	// Terrain colors for visualization
	const terrainColors: Record<string, string> = {
		Ocean: '#1e40af',
		Plains: '#84cc16',
		Forest: '#15803d',
		Mountains: '#78716c',
		Desert: '#fbbf24',
		Tundra: '#cbd5e1',
		Swamp: '#4d7c0f',
		Hills: '#a16207'
	};

	// Convert continent hex tiles to WorldMap format
	const continentWorldMap = $derived.by(() => {
		const worldMap = new WorldMap();

		if (continent.hexTiles.length === 0) {
			return worldMap;
		}

		// Find grid dimensions
		const maxX = Math.max(...continent.hexTiles.map(t => t.x));
		const maxY = Math.max(...continent.hexTiles.map(t => t.y));
		const minX = Math.min(...continent.hexTiles.map(t => t.x));
		const minY = Math.min(...continent.hexTiles.map(t => t.y));

		worldMap.width = maxX - minX + 1;
		worldMap.height = maxY - minY + 1;
		worldMap.seed = 0; // No seed for individual continents

		// Create 2D grid filled with ocean tiles (for empty spaces)
		// Normalize coordinates to start at (0, 0) for better display
		worldMap.hexTiles = Array(worldMap.height).fill(null).map((_, y) =>
			Array(worldMap.width).fill(null).map((_, x) => {
				const oceanTile = new HexTile();
				oceanTile.x = x;
				oceanTile.y = y;
				oceanTile.terrainType = TerrainType.Ocean;
				oceanTile.elevation = 0;
				return oceanTile;
			})
		);

		// Overwrite grid cells with actual continent tiles (normalize their coordinates)
		continent.hexTiles.forEach(tile => {
			const gridX = tile.x - minX;
			const gridY = tile.y - minY;
			if (gridX >= 0 && gridX < worldMap.width && gridY >= 0 && gridY < worldMap.height) {
				// Create a normalized tile
				const normalizedTile = new HexTile();
				normalizedTile.x = gridX;
				normalizedTile.y = gridY;
				normalizedTile.terrainType = tile.terrainType;
				normalizedTile.elevation = tile.elevation;
				normalizedTile.continentId = tile.continentId;
				worldMap.hexTiles[gridY][gridX] = normalizedTile;
			}
		});

		return worldMap;
	});

	// Map interaction state
	let scale = $state(0.8);
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let isInitialized = $state(false);
	let selectedHexTile = $state<HexTile | null>(null);
	let hexDetailsElement: HTMLElement | null = null;

	const hexSize = 20;
	const zoomFactor = 0.2;
	const minScale = 0.2;
	const maxScale = 4;
	const viewportWidth = 1200; // Approximate viewport width
	const viewportHeight = 600; // Map wrapper height

	// Create a set of continent tile coordinates for quick lookup
	const continentTileSet = $derived.by(() => {
		const set = new Set<string>();
		continent.hexTiles.forEach(tile => {
			set.add(`${tile.x},${tile.y}`);
		});
		return set;
	});

	// Calculate continent center for initial positioning
	const continentCenter = $derived.by(() => {
		if (continent.hexTiles.length === 0) return { x: 0, y: 0 };

		const avgX = continent.hexTiles.reduce((sum, tile) => sum + tile.x, 0) / continent.hexTiles.length;
		const avgY = continent.hexTiles.reduce((sum, tile) => sum + tile.y, 0) / continent.hexTiles.length;

		// Convert to pixel coordinates
		const pixelX = avgX * hexSize * 1.5;
		const pixelY = avgY * hexSize * Math.sqrt(3) + (Math.floor(avgX) % 2) * hexSize * Math.sqrt(3) / 2;

		return { x: pixelX, y: pixelY };
	});

	// Initialize pan to center the continent
	$effect(() => {
		if (!isInitialized && continent.hexTiles.length > 0) {
			const center = continentCenter;
			panX = (viewportWidth / 2) - (center.x * scale);
			panY = (viewportHeight / 2) - (center.y * scale);
			isInitialized = true;
		}
	});

	// Scroll to hex details when a tile is selected
	$effect(() => {
		if (selectedHexTile && hexDetailsElement) {
			hexDetailsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	});

	function getHexPoints(tile: HexTile, size: number): string {
		const x = tile.x * size * 1.5;
		const y = tile.y * size * Math.sqrt(3) + (tile.x % 2) * size * Math.sqrt(3) / 2;
		const points: [number, number][] = [];

		for (let i = 0; i < 6; i++) {
			const angle = (Math.PI / 3) * i;
			const px = x + size * Math.cos(angle);
			const py = y + size * Math.sin(angle);
			points.push([px, py]);
		}

		return points.map(p => `${p[0]},${p[1]}`).join(' ');
	}

	function handleZoom(delta: number) {
		const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
		scale = newScale;
	}

	function handleReset() {
		scale = 0.8;
		const center = continentCenter;
		panX = (viewportWidth / 2) - (center.x * scale);
		panY = (viewportHeight / 2) - (center.y * scale);
	}

	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		dragStart = { x: e.clientX - panX, y: e.clientY - panY };
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			panX = e.clientX - dragStart.x;
			panY = e.clientY - dragStart.y;
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
		handleZoom(delta);
	}

	function handleParentClick() {
		if (parentPlanet) {
			dispatch('openEntity', { entity: parentPlanet });
		}
	}

	function handleHexClick(tile: HexTile, event: MouseEvent) {
		event.stopPropagation();
		selectedHexTile = tile;
	}

	function closeHexDetails() {
		selectedHexTile = null;
	}
</script>

<div class="continent-viewer">
	<!-- Header with continent name and parent link -->
	<div class="header">
		<h2 class="continent-name">{continent.name}</h2>
		{#if parentPlanet}
			<button class="parent-link" onclick={handleParentClick}>
				<span class="parent-icon">🪐</span>
				<span>{parentPlanet?.name || 'Parent Planet'}</span>
			</button>
		{/if}
	</div>

	<!-- Overview Cards -->
	<div class="overview-cards">
		<div class="info-card">
			<div class="card-label">Size</div>
			<div class="card-value">{continent.size}</div>
		</div>
		<div class="info-card">
			<div class="card-label">Climate</div>
			<div class="card-value">{continent.climate}</div>
		</div>
		<div class="info-card">
			<div class="card-label">Landscape</div>
			<div class="card-value">{continent.dominantLandscape}</div>
		</div>
		<div class="info-card">
			<div class="card-label">Weather</div>
			<div class="card-value">{continent.primaryWeather}</div>
		</div>
		<div class="info-card highlight">
			<div class="card-label">Total Hexes</div>
			<div class="card-value">{continent.hexTiles.length}</div>
		</div>
	</div>

	<!-- Terrain Distribution with Visual Bars -->
	<Section title="Terrain Distribution">
		<div class="terrain-distribution">
			{#each hexTilesByTerrain as [terrainName, tiles]}
				{@const percentage = (tiles.length / continent.hexTiles.length) * 100}
				{@const color = terrainColors[terrainName] || '#64748b'}
				<div class="terrain-bar">
					<div class="terrain-info">
						<span class="terrain-name" style="color: {color}">● {terrainName}</span>
						<span class="terrain-count">{tiles.length} tiles ({percentage.toFixed(1)}%)</span>
					</div>
					<div class="bar-container">
						<div class="bar-fill" style="width: {percentage}%; background-color: {color}"></div>
					</div>
				</div>
			{/each}
		</div>
	</Section>

	<!-- Hex Map Visualization -->
	<Section title="Continent Map">
		<div class="map-container">
			{#if continent.hexTiles.length > 0 && parentPlanetWorldMap && parentPlanetWorldMap.hexTiles}
				{@const planetMap = parentPlanetWorldMap}
				<!-- Custom map showing planet context with continent highlighted -->
				<div class="map-wrapper">
					<div class="map-controls">
						<button class="map-btn" onclick={() => handleZoom(zoomFactor)}>+</button>
						<button class="map-btn" onclick={() => handleZoom(-zoomFactor)}>−</button>
						<button class="map-btn" onclick={handleReset}>⟲</button>
						<span class="zoom-level">{Math.round(scale * 100)}%</span>
					</div>
					<svg
						class="hex-map-svg"
						class:dragging={isDragging}
						onmousedown={handleMouseDown}
						onmousemove={handleMouseMove}
						onmouseup={handleMouseUp}
						onmouseleave={handleMouseUp}
						onwheel={handleWheel}
						role="img"
						aria-label="Continent hex map"
					>
						<g style="transform: translate({panX}px, {panY}px) scale({scale}); transition: transform 0.2s ease-out;">
							<!-- Background: Full planet map (grayed out) -->
							<g class="planet-background" opacity="0.25">
								{#each planetMap.hexTiles as row}
									{#each row as tile}
										{#if tile}
											<polygon
												points={getHexPoints(tile, hexSize)}
												fill={TERRAIN_COLORS[tile.terrainType] || '#64748b'}
												stroke="#334155"
												stroke-width="0.5"
											/>
										{/if}
									{/each}
								{/each}
							</g>

							<!-- Foreground: Continent tiles (full color, highlighted, clickable) -->
							<g class="continent-highlight">
								{#each planetMap.hexTiles as row}
									{#each row as tile}
										{#if tile && continentTileSet.has(`${tile.x},${tile.y}`)}
											<polygon
												points={getHexPoints(tile, hexSize)}
												fill={TERRAIN_COLORS[tile.terrainType] || '#64748b'}
												stroke={selectedHexTile?.x === tile.x && selectedHexTile?.y === tile.y ? '#ffffff' : '#f59e0b'}
												stroke-width={selectedHexTile?.x === tile.x && selectedHexTile?.y === tile.y ? '3' : '2'}
												class="continent-tile clickable"
												onclick={(e) => handleHexClick(tile, e)}
											/>
										{/if}
									{/each}
								{/each}
							</g>
						</g>
					</svg>
				</div>
			{:else}
				<p class="no-tiles-text">No hex tiles or planet data found for this continent.</p>
			{/if}
		</div>
	</Section>

	<!-- Hex Tile Details Panel -->
	{#if selectedHexTile}
		<Section title="Hex Tile Details">
			<div class="hex-details" bind:this={hexDetailsElement}>
				<div class="hex-details-header">
					<h3>Hex Tile ({selectedHexTile.x}, {selectedHexTile.y})</h3>
					<button class="close-btn" onclick={closeHexDetails}>✕</button>
				</div>

				<div class="hex-details-grid">
					<div class="detail-card">
						<div class="detail-label">Terrain Type</div>
						<div class="detail-value" style="color: {TERRAIN_COLORS[selectedHexTile.terrainType]}">
							{TerrainType[selectedHexTile.terrainType]}
						</div>
					</div>

					<div class="detail-card">
						<div class="detail-label">Elevation</div>
						<div class="detail-value">{selectedHexTile.elevation}/10</div>
					</div>

					<div class="detail-card">
						<div class="detail-label">Temperature</div>
						<div class="detail-value">{selectedHexTile.temperature}°</div>
					</div>

					<div class="detail-card">
						<div class="detail-label">Dryness</div>
						<div class="detail-value">{selectedHexTile.dryness}%</div>
					</div>

					{#if selectedHexTile.feature}
						<div class="detail-card">
							<div class="detail-label">Feature</div>
							<div class="detail-value">{selectedHexTile.feature}</div>
						</div>
					{/if}

					{#if selectedHexTile.weather}
						<div class="detail-card">
							<div class="detail-label">Weather</div>
							<div class="detail-value">{selectedHexTile.weather}</div>
						</div>
					{/if}

					{#if selectedHexTile.settlements && selectedHexTile.settlements.length > 0}
						<div class="detail-card full-width">
							<div class="detail-label">Settlements</div>
							<div class="detail-list">
								{#each selectedHexTile.settlements as settlement}
									<span class="list-item">{settlement.name}</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if selectedHexTile.dungeons && selectedHexTile.dungeons.length > 0}
						<div class="detail-card full-width">
							<div class="detail-label">Dungeons</div>
							<div class="detail-list">
								{#each selectedHexTile.dungeons as dungeon}
									<span class="list-item">{dungeon.name}</span>
								{/each}
							</div>
						</div>
					{/if}

					{#if selectedHexTile.hazards && selectedHexTile.hazards.length > 0}
						<div class="detail-card full-width">
							<div class="detail-label">Hazards</div>
							<div class="detail-list">
								{#each selectedHexTile.hazards as hazard}
									<span class="list-item hazard">{hazard}</span>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</Section>
	{/if}
</div>

<style>
	.continent-viewer {
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Header */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.continent-name {
		font-size: 2rem;
		font-weight: 700;
		color: rgb(192 132 252);
		margin: 0;
		letter-spacing: 0.02em;
	}

	.parent-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.parent-link:hover {
		background: rgb(30 27 75 / 0.8);
		border-color: rgb(168 85 247 / 0.6);
		transform: translateY(-1px);
	}

	.parent-icon {
		font-size: 1.25rem;
	}

	/* Overview Cards */
	.overview-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.info-card {
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.info-card:hover {
		border-color: rgb(168 85 247 / 0.4);
		transform: translateY(-2px);
	}

	.info-card.highlight {
		background: rgb(168 85 247 / 0.1);
		border-color: rgb(168 85 247 / 0.4);
	}

	.card-label {
		font-size: 0.75rem;
		color: rgb(168 85 247);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.card-value {
		font-size: 1.125rem;
		color: rgb(216 180 254);
		font-weight: 600;
		text-transform: capitalize;
	}

	/* Terrain Distribution */
	.terrain-distribution {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.terrain-bar {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.3);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
	}

	.terrain-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
	}

	.terrain-name {
		font-weight: 600;
		font-size: 1rem;
	}

	.terrain-count {
		color: rgb(203 213 225);
		font-size: 0.875rem;
	}

	.bar-container {
		width: 100%;
		height: 8px;
		background: rgb(30 27 75 / 0.5);
		border-radius: 999px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		transition: width 0.3s ease;
		border-radius: 999px;
	}

	/* Map Container */
	.map-container {
		background: rgb(30 27 75 / 0.2);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 600px;
	}

	.map-wrapper {
		width: 100%;
		height: 600px;
		position: relative;
		background: #1e293b;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.map-controls {
		position: absolute;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		background: rgba(30, 27, 75, 0.9);
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid rgb(168 85 247 / 0.3);
	}

	.map-btn {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(168 85 247);
		border: none;
		border-radius: 0.25rem;
		color: white;
		font-size: 1.25rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.map-btn:hover {
		background: rgb(147 51 234);
	}

	.zoom-level {
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 600;
		min-width: 3rem;
		text-align: center;
	}

	.hex-map-svg {
		width: 100%;
		height: 100%;
		cursor: grab;
	}

	.hex-map-svg.dragging {
		cursor: grabbing;
	}

	.continent-tile {
		transition: all 0.2s;
	}

	.continent-tile.clickable {
		cursor: pointer;
	}

	.continent-tile.clickable:hover {
		filter: brightness(1.2);
		stroke-width: 3;
	}

	.no-tiles-text {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		text-align: center;
		padding: 2rem;
		margin: 0;
	}

	/* Hex Tile Details */
	.hex-details {
		background: rgb(30 27 75 / 0.3);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.hex-details-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.hex-details-header h3 {
		margin: 0;
		font-size: 1.5rem;
		color: rgb(192 132 252);
		font-weight: 600;
	}

	.close-btn {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(168 85 247 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.25rem;
		color: rgb(216 180 254);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgb(168 85 247 / 0.4);
		border-color: rgb(168 85 247 / 0.6);
	}

	.hex-details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.detail-card {
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
	}

	.detail-card.full-width {
		grid-column: 1 / -1;
	}

	.detail-label {
		font-size: 0.75rem;
		color: rgb(168 85 247);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.detail-value {
		font-size: 1.125rem;
		color: rgb(216 180 254);
		font-weight: 600;
	}

	.detail-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.list-item {
		padding: 0.25rem 0.75rem;
		background: rgb(168 85 247 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.25rem;
		font-size: 0.875rem;
		color: rgb(216 180 254);
	}

	.list-item.hazard {
		background: rgb(239 68 68 / 0.2);
		border-color: rgb(239 68 68 / 0.3);
		color: rgb(252 165 165);
	}
</style>
