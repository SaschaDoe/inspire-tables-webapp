<script lang="ts">
	import type { RegionalMap } from '$lib/entities/location/regionalMap';
	import type { RegionalHexTile } from '$lib/entities/location/regionalHexTile';
	import { TerrainType } from '$lib/entities/location/terrainType';
	import { StrategicResource, LuxuryResource } from '$lib/entities/location/regionalHexTile';
	import Section from '../shared/Section.svelte';
	import { entityStore } from '$lib/stores/entityStore';
	import EntityViewer from '../EntityViewer.svelte';
	import { AssetLoader } from '$lib/utils/assetLoader';
	import { onMount } from 'svelte';
	import SimulationControlPanel from '../../simulation/SimulationControlPanel.svelte';
	import type { SimulationEngine } from '$lib/simulation/SimulationEngine';
	import HexMapRenderer from '../../simulation/HexMapRenderer.svelte';

	interface Props {
		regionalMap: RegionalMap;
		parentEntity?: any;
	}

	let { regionalMap, parentEntity }: Props = $props();
	const dispatch = createEventDispatcher();

	// Graphics mode state
	let useGraphics = $state(true); // Try to use graphics by default
	let assetsAvailable = $state(false);
	let assetsChecked = $state(false);

	// Load all regional hex tiles from entity store
	const regionalHexTiles = $derived.by(() => {
		return regionalMap.hexTileIds
			.map(id => entityStore.getEntity(id))
			.filter(tile => tile !== null) as RegionalHexTile[];
	});

	// Group hex tiles by terrain type for stats
	const hexTilesByTerrain = $derived.by(() => {
		const grouped = new Map<string, RegionalHexTile[]>();

		regionalHexTiles.forEach(tile => {
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

	// Count resources
	const resourceStats = $derived.by(() => {
		let strategicCount = 0;
		let luxuryCount = 0;
		let bonusCount = 0;
		let riverTileCount = 0;

		regionalHexTiles.forEach(tile => {
			if (tile.strategicResource !== StrategicResource.None) strategicCount++;
			if (tile.luxuryResource !== LuxuryResource.None) luxuryCount++;
			if (tile.bonusResource) bonusCount++;
			if (tile.hasRiver) riverTileCount++;
		});

		return { strategicCount, luxuryCount, bonusCount, riverTileCount };
	});

	// Terrain colors (Civ 5-style)
	const terrainColors: Record<number, string> = {
		[TerrainType.Ocean]: '#1e40af',
		[TerrainType.Coast]: '#3b82f6',
		[TerrainType.Grass]: '#22c55e',
		[TerrainType.Plains]: '#fbbf24',
		[TerrainType.Desert]: '#f59e0b',
		[TerrainType.Tundra]: '#cbd5e1',
		[TerrainType.Snow]: '#f8fafc',
		[TerrainType.Mountain]: '#78716c',
		[TerrainType.Hills]: '#a16207',
		[TerrainType.Forest]: '#15803d',
		[TerrainType.Jungle]: '#166534',
		[TerrainType.Swamp]: '#4d7c0f',
		[TerrainType.Lake]: '#2563eb',
		[TerrainType.Lava]: '#dc2626',
		[TerrainType.AshPlains]: '#6b7280',
		[TerrainType.IceFloe]: '#e0f2fe',
		[TerrainType.SaltLake]: '#94a3b8',
		[TerrainType.Volcanic]: '#7c2d12',
		[TerrainType.Marsh]: '#4d7c0f'
	};

	// Map interaction state
	let scale = $state(1.0);
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let isInitialized = $state(false);
	let selectedHexTile = $state<RegionalHexTile | null>(null);
	let hexDetailsElement: HTMLElement | null = null;

	// Simulation state (Phase 2.6)
	let simulationEngine = $state<SimulationEngine | null>(null);
	let mapNeedsUpdate = $state(false);

	const hexSize = 15;
	const zoomFactor = 0.3;
	const minScale = 0.3;
	const maxScale = 5;
	const viewportWidth = 1200;
	const viewportHeight = 800;

	// Calculate map center for initial positioning
	const mapCenter = $derived.by(() => {
		const avgX = regionalMap.width / 2;
		const avgY = regionalMap.height / 2;

		// Convert to pixel coordinates
		const pixelX = avgX * hexSize * 1.5;
		const pixelY = avgY * hexSize * Math.sqrt(3) + (Math.floor(avgX) % 2) * hexSize * Math.sqrt(3) / 2;

		return { x: pixelX, y: pixelY };
	});

	// Initialize pan to center the map
	$effect(() => {
		if (!isInitialized && regionalHexTiles.length > 0) {
			const center = mapCenter;
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

	function handleZoom(delta: number) {
		const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
		scale = newScale;
	}

	function handleReset() {
		scale = 1.0;
		const center = mapCenter;
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

	function handleHexClick(tile: RegionalHexTile, event: MouseEvent) {
		event.stopPropagation();
		selectedHexTile = tile;
	}

	function closeHexDetails() {
		selectedHexTile = null;
	}

	/**
	 * Handle simulation updates (Phase 2.6)
	 */
	function handleSimulationUpdate(engine: SimulationEngine) {
		simulationEngine = engine;
		mapNeedsUpdate = true;

		// Trigger re-render of hex tiles with updated ownership, cities, etc.
		// The reactive statements will automatically update when regionalMap changes
	}

	function toggleGraphicsMode() {
		useGraphics = !useGraphics;
	}

	// Check if Unciv graphics are available on mount
	onMount(async () => {
		assetsAvailable = await AssetLoader.checkAssetsAvailable();
		assetsChecked = true;

		// Auto-disable graphics mode if assets not available
		if (!assetsAvailable && useGraphics) {
			console.log('Unciv graphics not found - using colored hexes fallback');
		}
	});
</script>

<div class="regional-map-viewer">
	<!-- Header -->
	<div class="header">
		<h2 class="map-name">{regionalMap.name}</h2>
	</div>

	<!-- Overview Cards -->
	<div class="overview-cards">
		<div class="info-card">
			<div class="card-label">Dimensions</div>
			<div class="card-value">{regionalMap.width} × {regionalMap.height}</div>
		</div>
		<div class="info-card">
			<div class="card-label">Total Hexes</div>
			<div class="card-value">{regionalHexTiles.length}</div>
		</div>
		<div class="info-card highlight">
			<div class="card-label">Rivers</div>
			<div class="card-value">{resourceStats.riverTileCount} tiles</div>
		</div>
		<div class="info-card highlight">
			<div class="card-label">Strategic Resources</div>
			<div class="card-value">{resourceStats.strategicCount}</div>
		</div>
		<div class="info-card highlight">
			<div class="card-label">Luxury Resources</div>
			<div class="card-value">{resourceStats.luxuryCount}</div>
		</div>
		<div class="info-card">
			<div class="card-label">Bonus Resources</div>
			<div class="card-value">{resourceStats.bonusCount}</div>
		</div>
	</div>

	<!-- Simulation Control Panel (Phase 2.6) -->
	<SimulationControlPanel {regionalMap} onSimulationUpdate={handleSimulationUpdate} />

	<!-- Terrain Distribution -->
	<Section title="Terrain Distribution">
		<div class="terrain-distribution">
			{#each hexTilesByTerrain as [terrainName, tiles]}
				{@const percentage = (tiles.length / regionalHexTiles.length) * 100}
				{@const terrainType = TerrainType[terrainName as keyof typeof TerrainType]}
				{@const color = terrainColors[terrainType] || '#64748b'}
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
	<Section title="Regional Map">
		<div class="map-container">
			{#if regionalHexTiles.length > 0}
				<div class="map-wrapper">
					<div class="map-controls">
						<button class="map-btn" onclick={() => handleZoom(zoomFactor)}>+</button>
						<button class="map-btn" onclick={() => handleZoom(-zoomFactor)}>−</button>
						<button class="map-btn" onclick={handleReset}>⟲</button>
						<span class="zoom-level">{Math.round(scale * 100)}%</span>
						{#if assetsChecked}
							<button
								class="map-btn"
								class:active={useGraphics && assetsAvailable}
								onclick={toggleGraphicsMode}
								title={assetsAvailable ? 'Toggle graphics/colors' : 'Graphics not available'}
								disabled={!assetsAvailable}
							>
								🎨
							</button>
						{/if}
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
						aria-label="Regional hex map"
					>
						<HexMapRenderer
							hexTiles={regionalHexTiles}
							hexSize={hexSize}
							panX={panX}
							panY={panY}
							scale={scale}
							selectedHexId={selectedHexTile?.id}
							onHexClick={handleHexClick}
							showCities={true}
							showUnits={true}
							showBorders={true}
							showLabels={true}
						/>
					</svg>
				</div>
			{:else}
				<p class="no-tiles-text">No regional hex tiles found for this map.</p>
			{/if}
		</div>
	</Section>

	<!-- Hex Tile Details Panel -->
	{#if selectedHexTile}
		<div class="hex-details-container" bind:this={hexDetailsElement}>
			<div class="hex-details-header">
				<h3>Selected Hex: ({selectedHexTile.x}, {selectedHexTile.y})</h3>
				<button class="close-btn" onclick={closeHexDetails}>✕</button>
			</div>
			<EntityViewer
				entity={selectedHexTile}
				entityType="regionalHexTile"
				parentEntity={regionalMap}
			/>
		</div>
	{/if}
</div>

<style>
	.regional-map-viewer {
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

	.map-name {
		font-size: 2rem;
		font-weight: 700;
		color: rgb(34 197 94);
		margin: 0;
		letter-spacing: 0.02em;
	}

	/* Overview Cards */
	.overview-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.info-card {
		padding: 1rem;
		background: rgb(20 83 45 / 0.3);
		border: 1px solid rgb(34 197 94 / 0.3);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.info-card:hover {
		border-color: rgb(34 197 94 / 0.5);
		transform: translateY(-2px);
	}

	.info-card.highlight {
		background: rgb(34 197 94 / 0.15);
		border-color: rgb(34 197 94 / 0.5);
	}

	.card-label {
		font-size: 0.75rem;
		color: rgb(74 222 128);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.card-value {
		font-size: 1.125rem;
		color: rgb(134 239 172);
		font-weight: 600;
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
		background: rgb(20 83 45 / 0.2);
		border: 1px solid rgb(34 197 94 / 0.2);
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
		background: rgb(20 83 45 / 0.3);
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
		background: rgb(20 83 45 / 0.2);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 800px;
	}

	.map-wrapper {
		width: 100%;
		height: 800px;
		position: relative;
		background: #0f172a;
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
		background: rgba(20, 83, 45, 0.9);
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid rgb(34 197 94 / 0.4);
	}

	.map-btn {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(34 197 94);
		border: none;
		border-radius: 0.25rem;
		color: white;
		font-size: 1.25rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.map-btn:hover {
		background: rgb(22 163 74);
	}

	.map-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.map-btn:disabled:hover {
		background: rgb(34 197 94);
	}

	.map-btn.active {
		background: rgb(16 185 129);
		box-shadow: 0 0 0 2px rgb(16 185 129 / 0.3);
	}

	.zoom-level {
		color: rgb(134 239 172);
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

	.regional-tile {
		transition: all 0.2s;
	}

	.regional-tile.clickable {
		cursor: pointer;
	}

	.regional-tile.clickable:hover {
		filter: brightness(1.3);
		stroke-width: 2;
	}

	.no-tiles-text {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		text-align: center;
		padding: 2rem;
		margin: 0;
	}

	/* Hex Tile Details Container */
	.hex-details-container {
		margin-top: 1.5rem;
		background: rgb(20 83 45 / 0.2);
		border: 1px solid rgb(34 197 94 / 0.4);
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.hex-details-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgb(34 197 94 / 0.3);
	}

	.hex-details-header h3 {
		margin: 0;
		font-size: 1.5rem;
		color: rgb(74 222 128);
		font-weight: 600;
	}

	.close-btn {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(34 197 94 / 0.2);
		border: 1px solid rgb(34 197 94 / 0.4);
		border-radius: 0.25rem;
		color: rgb(134 239 172);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgb(34 197 94 / 0.4);
		border-color: rgb(34 197 94 / 0.7);
	}
</style>
