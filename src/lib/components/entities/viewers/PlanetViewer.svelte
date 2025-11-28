<script lang="ts">
	import type { Planet } from '$lib/entities/celestial/planet';
	import { PlanetCreator } from '$lib/entities/celestial/planetCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';
	import PlanetRenderer from '$lib/components/three/PlanetRenderer.svelte';
	import HexMapWebGL from '$lib/components/worldmap/HexMapWebGL.svelte';
	import type { Entity } from '$lib/types/entity';
	import { WorldMapCreator } from '$lib/entities/location/worldMapCreator';
	import { WorldMap } from '$lib/entities/location/worldMap';
	import type { HexTile } from '$lib/entities/location/hexTile';
	import type { RegionalHexData } from '$lib/entities/location/regionalHexData';
	import type { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
	import { TerrainType } from '$lib/entities/location/terrainType';
	import { entityStore } from '$lib/stores/entityStore';
	import { NationCreator } from '$lib/entities/location/nationCreator';
	import type { Nation } from '$lib/entities/location/nation';
	import { worldMapTileStore } from '$lib/stores/worldMapTileStore';

	interface Props {
		planet: Planet;
		parentEntity?: any;
	}

	let { planet, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	let selectedHex: HexTile | null = $state(null);
	let selectedDetailedHex: DetailedHexTile | null = $state(null);
	let showWorldMapError: string | null = $state(null);
	let mapKey = $state(0); // Force re-render of map component
	let showContinents = $state(false);
	let continentSelectionMode = $state(false);

	// Simulation state
	let simulationRunning = $state(false);
	let simulationTurn = $state(0);

	// Nations on this planet
	let nations: Nation[] = $state([]);

	// Reference to the hex map component for panning
	let hexMapComponent: HexMapWebGL | null = $state(null);

	// Local world map state - keeps detailed tiles in memory even after store saves
	// (The store only saves lightweight version without detailed tiles)
	let localWorldMap: WorldMap | null = $state(null);

	// Get the active world map - prefer local state (has detailed tiles) over planet prop
	const activeWorldMap = $derived(localWorldMap ?? planet.worldMap ?? null);

	// Auto-save nested entities to navigator and load tiles from IndexedDB
	onMount(async () => {
		autoSaveNestedEntities(
			{
				continents: { entities: planet.continents, entityType: 'continent' }
			},
			parentEntity,
			dispatch
		);

		// Try to load detailed tiles from IndexedDB if planet has a world map without detailed tiles
		if (planet.worldMap && planet.worldMap.hexTiles?.length > 0) {
			const tilesSize = planet.worldMap.detailedHexTiles instanceof Map
				? planet.worldMap.detailedHexTiles.size
				: 0;

			if (tilesSize === 0) {
				console.log('[PlanetViewer] World map exists but no detailed tiles in memory, checking IndexedDB...');
				// Create a proper WorldMap instance if needed
				let worldMap: WorldMap;
				if (planet.worldMap instanceof WorldMap) {
					worldMap = planet.worldMap;
				} else {
					// Hydrate from plain object
					worldMap = WorldMap.fromJSON(planet.worldMap as unknown as Record<string, unknown>);
				}

				const loaded = await worldMapTileStore.loadTiles(planet.id, worldMap);
				if (loaded) {
					// Only store in local state - DO NOT set planet.worldMap as it would
					// include detailed tiles with methods that can't be serialized
					localWorldMap = worldMap;
					mapKey++; // Force re-render
					console.log('[PlanetViewer] Loaded detailed tiles from IndexedDB');
				} else {
					console.log('[PlanetViewer] No stored tiles found in IndexedDB');
				}
			} else {
				// Tiles already in memory, use them
				localWorldMap = planet.worldMap instanceof WorldMap
					? planet.worldMap
					: WorldMap.fromJSON(planet.worldMap as unknown as Record<string, unknown>);
			}
		}

		// Load nations for this planet from entity store
		loadNationsFromStore();
	});

	/**
	 * Load nations that belong to this planet from entity store
	 */
	function loadNationsFromStore() {
		// Get all nation entities from the store
		const allEntities = entityStore.getAllEntities();
		const nationEntities = allEntities.filter(e => e.type === 'nation');

		const loadedNations: Nation[] = [];
		for (const entity of nationEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as Nation | undefined;
			if (generatedEntity && generatedEntity.parentPlanetId === planet.id) {
				// Reconstruct the Nation object
				const nation = Object.assign(new Nation(), generatedEntity);
				loadedNations.push(nation);
			}
		}

		if (loadedNations.length > 0) {
			nations = loadedNations;
			console.log(`[PlanetViewer] Loaded ${loadedNations.length} nations from entity store`);
		}
	}

	const basicInfo = $derived([
		{
			label: 'Translation',
			value: planet.nameTranslation ? `${planet.nameTranslation} - "${planet.nameMeaning}"` : '-'
		},
		{ label: 'Type', value: planet.type },
		{ label: 'Livable', value: planet.isLivable ? 'Yes' : 'No' },
		{ label: 'Size', value: planet.size }
	]);

	const atmosphereInfo = $derived([
		{ label: 'Atmosphere', value: planet.atmosphere },
		{ label: 'Weather', value: planet.weather }
	]);

	const orbitalInfo = $derived([
		{ label: 'Distance from Star', value: `${planet.distanceFromStar.toFixed(2)} AU` },
		{
			label: 'Orbital Period',
			value: `${planet.orbitPeriod} days (${(planet.orbitPeriod / 365).toFixed(2)} Earth years)`
		},
		{ label: 'Rotation Period', value: `${planet.rotationPeriod} hours` },
		{ label: 'Axial Tilt', value: `${planet.obliquity}°` }
	]);

	const physicalInfo = $derived([
		{ label: 'Surface Gravity', value: `${planet.surfaceGravity.toFixed(2)}g` },
		{ label: 'Magnetic Field', value: planet.hasMagneticField ? 'Yes' : 'No' },
		{ label: 'Rings', value: planet.rings.length > 0 ? `${planet.rings.length} ring(s)` : 'None' },
		{ label: 'Moons', value: planet.moons.length > 0 ? planet.moons.join(', ') : 'None' }
	]);

	const continentRules = PlanetCreator.NESTED_ENTITY_RULES.continents;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddContinent = createAddEntityHandler(planet, 'continents', parentEntity, dispatch);

	async function generateWorldMap() {
		console.log('[PlanetViewer] Generate World Map button clicked');
		showWorldMapError = null;
		try {
			console.log('[PlanetViewer] Creating world map for planet:', planet.name);
			const newWorldMap = WorldMapCreator.create(planet);
			console.log('[PlanetViewer] World map created successfully');
			console.log('[PlanetViewer] Detailed tiles count:', newWorldMap.detailedHexTiles.size);

			// Store in local state (keeps detailed tiles in memory)
			localWorldMap = newWorldMap;
			// Also set on planet for compatibility
			planet.worldMap = newWorldMap;
			mapKey++; // Force re-render

			// Save detailed tiles to IndexedDB (separate from entity store)
			await worldMapTileStore.saveTiles(planet.id, newWorldMap);
			console.log('[PlanetViewer] Detailed tiles saved to IndexedDB');

			// Save continents to entity store so they appear in navigator
			autoSaveNestedEntities(
				{
					continents: { entities: planet.continents, entityType: 'continent' }
				},
				parentEntity,
				dispatch
			);
			console.log('[PlanetViewer] Continents saved to entity store');

			// Update the parent entity in the store to trigger reactivity
			if (parentEntity) {
				const existingEntity = entityStore.getEntity(parentEntity.id);
				if (existingEntity) {
					// Create a copy without the worldMap (too large to serialize directly)
					// Store only lightweight worldMap data - detailed tiles loaded from IndexedDB on demand
					const { worldMap, ...planetWithoutWorldMap } = planet;
					const worldMapData = newWorldMap.toLightweightJSON();

					// Create the updated entity with serializable worldMap data
					const updatedGeneratedEntity = {
						...planetWithoutWorldMap,
						worldMap: worldMapData
					};

					entityStore.updateEntity(parentEntity.id, {
						...existingEntity,
						customFields: {
							...existingEntity.customFields,
							generatedEntity: updatedGeneratedEntity
						},
						metadata: {
							...existingEntity.metadata,
							updatedAt: new Date()
						}
					});
					console.log('[PlanetViewer] Entity store updated (lightweight, no detailed tiles)');
				}

				dispatch('entityUpdated', { entity: parentEntity });
			}
		} catch (error) {
			console.error('[PlanetViewer] Error generating world map:', error);
			showWorldMapError = error instanceof Error ? error.message : 'Failed to generate world map';
		}
	}

	function regenerateWorldMap() {
		const confirmed = confirm(
			'This will overwrite the existing world map. Are you sure you want to continue?'
		);
		if (confirmed) {
			// Change the seed to generate a different map
			planet.seed = Math.floor(Math.random() * 1000000);
			generateWorldMap();
		}
	}

	function handleHexSelected(event: CustomEvent<{ hex: HexTile }>) {
		selectedHex = event.detail.hex;

		// Also look up a representative detailed tile at the center of this general hex
		// Use activeWorldMap which prefers localWorldMap (has detailed tiles)
		const worldMap = activeWorldMap;
		const detailedTiles = worldMap?.detailedHexTiles;
		const tilesSize = detailedTiles instanceof Map ? detailedTiles.size :
			(detailedTiles && typeof detailedTiles === 'object' ? Object.keys(detailedTiles).length : 0);


		if (worldMap && tilesSize > 0) {
			const gridSize = worldMap.gridSize || 10;
			const centerLocalX = Math.floor(gridSize / 2);
			const centerLocalY = Math.floor(gridSize / 2);

			// Try to get the detailed hex - handle both Map and plain object
			const globalX = event.detail.hex.x * gridSize + centerLocalX;
			const globalY = event.detail.hex.y * gridSize + centerLocalY;
			const key = `${globalX},${globalY}`;

			let centerDetailedHex: DetailedHexTile | undefined;
			if (detailedTiles instanceof Map) {
				centerDetailedHex = detailedTiles.get(key);
			} else if (typeof worldMap.getDetailedHexByLocal === 'function') {
				centerDetailedHex = worldMap.getDetailedHexByLocal(
					event.detail.hex.x,
					event.detail.hex.y,
					centerLocalX,
					centerLocalY
				);
			} else if (detailedTiles && typeof detailedTiles === 'object') {
				centerDetailedHex = (detailedTiles as Record<string, DetailedHexTile>)[key];
			}

			selectedDetailedHex = centerDetailedHex ?? null;
		} else {
			selectedDetailedHex = null;
		}
	}

	function handleRegionalHexSelected(event: CustomEvent<{
		planetaryHex: HexTile;
		regionalHex: RegionalHexData;
		detailedHex: DetailedHexTile | undefined;
		globalX: number;
		globalY: number;
	}>) {
		console.log('[PlanetViewer] Regional hex selected:', {
			globalX: event.detail.globalX,
			globalY: event.detail.globalY,
			detailedHex: event.detail.detailedHex ? 'found' : 'undefined',
			planetaryHex: event.detail.planetaryHex?.x + ',' + event.detail.planetaryHex?.y
		});
		selectedHex = event.detail.planetaryHex;
		selectedDetailedHex = event.detail.detailedHex ?? null;
	}

	function handleContinentSelected(
		event: CustomEvent<{ continent: any; tiles: HexTile[] }>
	) {
		const continentInfo = event.detail.continent;

		// Navigate to the continent entity if it has an entityId
		if (continentInfo.entityId) {
			const continentEntity = planet.continents.find((c) => c.id === continentInfo.entityId);
			if (continentEntity) {
				dispatch('openEntity', { entity: continentEntity });
				return;
			}
		}

		// Fallback: just show the first tile info from the continent
		selectedHex = event.detail.tiles[0] || null;
	}

	// When continent selection mode is enabled, automatically show continents
	$effect(() => {
		if (continentSelectionMode) {
			showContinents = true;
		}
	});

	// Sync simulation state with worldMap
	$effect(() => {
		if (activeWorldMap) {
			simulationTurn = activeWorldMap.currentTurn;
			simulationRunning = activeWorldMap.simulationEnabled;
		}
	});

	function toggleSimulation() {
		if (!activeWorldMap) return;

		simulationRunning = !simulationRunning;
		activeWorldMap.simulationEnabled = simulationRunning;

		if (simulationRunning) {
			console.log('[PlanetViewer] Simulation started');
		} else {
			console.log('[PlanetViewer] Simulation paused');
		}
	}

	function processTurn() {
		if (!activeWorldMap) return;

		simulationTurn++;
		activeWorldMap.currentTurn = simulationTurn;

		// Here you would call the actual simulation engine
		// SimulationEngine.processTurn(activeWorldMap);

		console.log(`[PlanetViewer] Processed turn ${simulationTurn}`);
		console.log(`[PlanetViewer] DetailedHexTiles count: ${activeWorldMap.detailedHexTiles.size}`);
	}

	function resetSimulation() {
		if (!activeWorldMap) return;

		simulationTurn = 0;
		activeWorldMap.currentTurn = 0;
		simulationRunning = false;
		activeWorldMap.simulationEnabled = false;

		// Reset ownership on all tiles
		for (const tile of activeWorldMap.detailedHexTiles.values()) {
			tile.ownerNationId = null;
			tile.ownerCityId = null;
			tile.isWorked = false;
		}

		// Clear nations
		nations = [];

		console.log('[PlanetViewer] Simulation reset');
	}

	/**
	 * Find a suitable starting hex for a nation based on preferred terrain
	 */
	function findStartingHex(preferredTerrains: TerrainType[]): DetailedHexTile | null {
		if (!activeWorldMap) return null;

		const tiles = activeWorldMap.detailedHexTiles;
		const candidates: DetailedHexTile[] = [];

		// Minimum distance from other nation starting positions (in tiles)
		const MIN_DISTANCE = 20;

		// Collect all valid candidates
		for (const tile of tiles.values()) {
			// Skip water, mountains, and already owned tiles
			if (tile.terrainType === TerrainType.Water ||
				tile.terrainType === TerrainType.Ocean ||
				tile.terrainType === TerrainType.Coast ||
				tile.terrainType === TerrainType.Mountain ||
				tile.terrainType === TerrainType.HighMountain ||
				tile.terrainType === TerrainType.SnowMountain ||
				tile.terrainType === TerrainType.Lava ||
				tile.ownerNationId) {
				continue;
			}

			// Check distance from other nations' starting positions
			let tooClose = false;
			for (const nation of nations) {
				if (nation.startingHexX !== undefined && nation.startingHexY !== undefined) {
					const dx = tile.globalX - nation.startingHexX;
					const dy = tile.globalY - nation.startingHexY;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < MIN_DISTANCE) {
						tooClose = true;
						break;
					}
				}
			}
			if (tooClose) continue;

			// Prioritize preferred terrain types
			if (preferredTerrains.includes(tile.terrainType)) {
				// Higher priority for preferred terrain
				candidates.push(tile);
				candidates.push(tile); // Add twice to weight it higher
			} else {
				// Add all valid land tiles as fallback
				candidates.push(tile);
			}
		}

		if (candidates.length === 0) return null;

		// Pick a random candidate
		const index = Math.floor(Math.random() * candidates.length);
		return candidates[index];
	}

	/**
	 * Add a new nation to the planet
	 */
	function addNation() {
		if (!activeWorldMap) {
			console.error('[PlanetViewer] Cannot add nation - no world map');
			return;
		}

		// Create a new nation using the creator
		const creator = new NationCreator();
		const nation = creator.create();

		// Set parent planet
		nation.parentPlanetId = planet.id;
		nation.isSimulationGenerated = true;
		nation.isAIControlled = true;

		// Find a starting position
		const startingHex = findStartingHex(nation.preferredTerrainTypes);
		if (!startingHex) {
			console.error('[PlanetViewer] No suitable starting position found for nation');
			return;
		}

		// Set starting position
		nation.startingHexX = startingHex.globalX;
		nation.startingHexY = startingHex.globalY;
		nation.hasFoundedFirstCity = false;

		// Save nation to entity store so it can be navigated to
		const nationEntity: Entity = {
			id: nation.id,
			type: 'nation' as any,
			name: nation.name,
			description: nation.description || '',
			tags: [],
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [],
			customFields: { generatedEntity: nation }
		};
		entityStore.createEntity(nationEntity);

		// Add to nations list
		nations = [...nations, nation];

		console.log(`[PlanetViewer] Added nation "${nation.name}" at (${startingHex.globalX}, ${startingHex.globalY})`);
		console.log(`[PlanetViewer] Preferred terrain: ${nation.preferredTerrainTypes.map(t => TerrainType[t]).join(', ')}`);
		console.log(`[PlanetViewer] Actual terrain: ${TerrainType[startingHex.terrainType]}`);
	}

	/**
	 * Remove a nation from the planet
	 */
	function removeNation(nationToRemove: Nation) {
		// Remove from entity store
		entityStore.deleteEntity(nationToRemove.id);
		// Remove from local list
		nations = nations.filter(n => n.id !== nationToRemove.id);
		console.log(`[PlanetViewer] Removed nation "${nationToRemove.name}"`);
	}

	/**
	 * Open nation in a new tab (navigate to entity)
	 */
	function openNation(nation: Nation) {
		const nationEntity = entityStore.getEntity(nation.id);
		if (nationEntity) {
			dispatch('openEntity', { entity: nationEntity });
		} else {
			console.error(`[PlanetViewer] Nation entity not found for "${nation.name}"`);
		}
	}

	/**
	 * Pan the map to a nation's location
	 */
	function locateNation(nation: Nation) {
		if (nation.startingHexX !== undefined && nation.startingHexY !== undefined) {
			// Pan to the nation's starting position and zoom in to see the settler
			hexMapComponent?.panToGlobalHex(nation.startingHexX, nation.startingHexY, 1.5);
		}
	}

	const hexInfo = $derived(
		selectedHex
			? [
					{ label: 'X', value: selectedHex.x.toString() },
					{ label: 'Y', value: selectedHex.y.toString() },
					{ label: 'Terrain', value: TerrainType[selectedHex.terrainType] },
					{ label: 'Elevation', value: selectedHex.elevation.toString() },
					{ label: 'Temperature', value: `${selectedHex.temperature.toFixed(0)}°` },
					{
						label: 'Dryness',
						value: `${selectedHex.dryness.toFixed(0)}% (${selectedHex.dryness > 60 ? 'Dry' : selectedHex.dryness > 40 ? 'Moderate' : 'Wet'})`
					}
				]
			: []
	);

	const detailedHexInfo = $derived(
		selectedDetailedHex
			? [
					{ label: 'Global X', value: selectedDetailedHex.globalX.toString() },
					{ label: 'Global Y', value: selectedDetailedHex.globalY.toString() },
					{ label: 'Terrain', value: TerrainType[selectedDetailedHex.terrainType] },
					{ label: 'Elevation', value: selectedDetailedHex.elevation.toString() },
					{ label: 'Feature', value: selectedDetailedHex.feature || 'None' },
					{ label: 'Has River', value: selectedDetailedHex.hasRiver ? 'Yes' : 'No' },
					{ label: 'Food', value: selectedDetailedHex.yields.food.toString() },
					{ label: 'Production', value: selectedDetailedHex.yields.production.toString() },
					{ label: 'Gold', value: selectedDetailedHex.yields.gold.toString() },
					{ label: 'Owner', value: selectedDetailedHex.ownerNationId || 'None' }
				]
			: []
	);
</script>

<div class="planet-viewer">
	<!-- Planet name as heading -->
	<h2 class="planet-name">{planet.name}</h2>

	<!-- Side-by-side layout: Basic info and 3D visualization -->
	<div class="planet-overview">
		<div class="planet-info">
			<InfoGrid items={basicInfo} />
		</div>
		<div class="planet-3d-container">
			<PlanetRenderer {planet} containerWidth={400} containerHeight={400} />
		</div>
	</div>

	<!-- World Map Section -->
	{#if planet.type !== 'gas giant'}
		<Section title="World Map">
			{#if activeWorldMap}
				<div class="world-map-controls">
					<div class="continent-controls">
						<label class="toggle-label">
							<input type="checkbox" bind:checked={showContinents} />
							<span>Show Continents</span>
						</label>
						<label class="toggle-label">
							<input type="checkbox" bind:checked={continentSelectionMode} />
							<span>Continent Selection Mode</span>
						</label>
						{#if activeWorldMap.continents && activeWorldMap.continents.length > 0}
							<span class="continent-count"
								>{activeWorldMap.continents.length}
								{activeWorldMap.continents.length === 1 ? 'Continent' : 'Continents'} Detected</span
							>
						{/if}
					</div>
					<button class="regenerate-btn" onclick={regenerateWorldMap}>Regenerate Map</button>
				</div>

				<!-- Simulation Controls -->
				<div class="simulation-controls">
					<h4 class="simulation-title">Simulation</h4>
					<div class="simulation-buttons">
						<button
							class="sim-btn"
							class:active={simulationRunning}
							onclick={toggleSimulation}
						>
							{simulationRunning ? 'Pause' : 'Start'}
						</button>
						<button class="sim-btn" onclick={processTurn}>
							Next Turn
						</button>
						<button class="sim-btn reset" onclick={resetSimulation}>
							Reset
						</button>
					</div>
					<div class="simulation-info">
						<span class="turn-counter">Turn: {simulationTurn}</span>
						<span class="tile-count">
							Tiles: {activeWorldMap.detailedHexTiles?.size ?? 0}
						</span>
					</div>

					<!-- Nations Panel -->
					<div class="nations-panel">
						<div class="nations-header">
							<h5 class="nations-title">Nations ({nations.length})</h5>
							<button class="add-nation-btn" onclick={addNation}>
								+ Add Nation
							</button>
						</div>
						{#if nations.length > 0}
							<ul class="nations-list">
								{#each nations as nation (nation.id)}
									<li class="nation-item">
										<div class="nation-info">
											<button
												class="nation-name-btn"
												onclick={() => openNation(nation)}
												title="Open nation details"
											>
												{nation.name}
											</button>
											<span class="nation-terrain">
												Prefers: {nation.preferredTerrainTypes.slice(0, 2).map(t => TerrainType[t]).join(', ')}
											</span>
											{#if nation.startingHexX !== undefined}
												<span class="nation-position">
													Start: ({nation.startingHexX}, {nation.startingHexY})
												</span>
											{/if}
										</div>
										<div class="nation-actions">
											<button
												class="locate-nation-btn"
												onclick={() => locateNation(nation)}
												title="Locate on map"
											>
												&#128205;
											</button>
											<button
												class="remove-nation-btn"
												onclick={() => removeNation(nation)}
												title="Remove nation"
											>
												×
											</button>
										</div>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="no-nations">No nations yet. Add a nation to start the simulation.</p>
						{/if}
					</div>
				</div>

				{#key mapKey}
					<HexMapWebGL
						bind:this={hexMapComponent}
						worldMap={activeWorldMap}
						{nations}
						on:hexSelected={handleHexSelected}
						on:regionalHexSelected={handleRegionalHexSelected}
					/>
				{/key}
				{#if selectedHex}
					<div class="hex-info-panel">
						<h4 class="hex-info-title">Selected Hex (General)</h4>
						<InfoGrid items={hexInfo} />
						{#if !selectedDetailedHex}
							<p class="zoom-hint">Zoom in (160%+) to select specific detailed tiles</p>
						{/if}
					</div>
				{/if}
				{#if selectedDetailedHex}
					<div class="hex-info-panel regional">
						<h4 class="hex-info-title">Detailed Tile (Center of Selection)</h4>
						<InfoGrid items={detailedHexInfo} />
					</div>
				{/if}
			{:else}
				<div class="no-map-container">
					{#if showWorldMapError}
						<p class="error-message">{showWorldMapError}</p>
					{/if}
					<p class="no-map-text">No world map generated yet.</p>
					<button class="generate-btn" onclick={generateWorldMap}>Generate World Map</button>
				</div>
			{/if}
		</Section>
	{/if}

	<Section title="Atmosphere">
		<InfoGrid items={atmosphereInfo} />
	</Section>

	<Section title="Orbital Mechanics">
		<InfoGrid items={orbitalInfo} />
	</Section>

	<Section title="Physical Properties">
		<InfoGrid items={physicalInfo} />
	</Section>

	<EntityList
		entities={planet.continents}
		entityType={continentRules.entityType}
		displayName={continentRules.displayName}
		displayNamePlural="Continents"
		icon="🗺️"
		minRequired={continentRules.min}
		maxAllowed={continentRules.max}
		{parentEntity}
		onAddEntity={handleAddContinent}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	{#if planet.description}
		<Section title="Description">
			<p class="description-text">{planet.description}</p>
		</Section>
	{/if}
</div>

<style>
	.planet-viewer {
		padding: 0;
	}

	.planet-name {
		font-size: 2rem;
		font-weight: 700;
		color: rgb(192 132 252);
		margin: 0 0 1.5rem 0;
		text-align: center;
		letter-spacing: 0.02em;
	}

	.planet-overview {
		display: flex;
		gap: 2rem;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.planet-info {
		flex: 0 0 auto;
		width: 280px;
		min-width: 250px;
	}

	/* Make info items display vertically in the planet info section */
	.planet-info :global(.info-grid) {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.planet-info :global(.info-item) {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.375rem;
		border-left: 3px solid rgb(147 51 234 / 0.5);
	}

	.planet-info :global(.info-label) {
		min-width: 90px;
		flex-shrink: 0;
		font-size: 0.7rem;
	}

	.planet-info :global(.info-value) {
		flex: 1;
		font-size: 0.8rem;
	}

	.planet-3d-container {
		width: 500px;
		height: 500px;
		flex-shrink: 0;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.world-map-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.continent-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgb(203 213 225);
		font-size: 0.875rem;
		cursor: pointer;
		user-select: none;
	}

	.toggle-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: rgb(147 51 234);
	}

	.toggle-label:hover span {
		color: rgb(192 132 252);
	}

	.continent-count {
		color: rgb(192 132 252);
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.375rem;
		border: 1px solid rgb(147 51 234 / 0.3);
	}

	.generate-btn,
	.regenerate-btn {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206));
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 0.875rem;
	}

	.generate-btn:hover,
	.regenerate-btn:hover {
		background: linear-gradient(135deg, rgb(126, 34, 206), rgb(107, 33, 168));
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
	}

	.no-map-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
	}

	.no-map-text {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		margin: 0;
	}

	.error-message {
		color: rgb(252 165 165);
		background: rgb(127 29 29 / 0.3);
		padding: 0.75rem 1rem;
		border-left: 3px solid rgb(239 68 68);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		margin: 0;
	}

	.hex-info-panel {
		margin-top: 1rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border-radius: 0.5rem;
		border: 2px solid rgb(147 51 234 / 0.3);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hex-info-title {
		margin: 0 0 0.75rem 0;
		color: rgb(192 132 252);
		font-size: 1rem;
		font-weight: 600;
	}

	.description-text {
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-left: 3px solid rgb(168 85 247);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
		white-space: pre-wrap;
	}

	.zoom-hint {
		margin: 0.5rem 0 0 0;
		padding: 0.5rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: rgb(147 51 234);
		text-align: center;
		font-style: italic;
	}

	.hex-info-panel.regional {
		border-color: rgb(34 197 94 / 0.4);
		background: rgb(15 30 20 / 0.4);
	}

	.hex-info-panel.regional .hex-info-title {
		color: rgb(134 239 172);
	}

	.tile-id {
		margin: 0.5rem 0 0 0;
		font-size: 0.7rem;
		color: rgb(100 116 139);
		font-family: monospace;
	}

	/* Simulation Controls */
	.simulation-controls {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
		border: 2px solid rgb(59 130 246 / 0.3);
		margin-bottom: 1rem;
	}

	.simulation-title {
		margin: 0;
		color: rgb(147 197 253);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.simulation-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.sim-btn {
		padding: 0.5rem 1rem;
		background: rgb(30 41 59);
		border: 2px solid rgb(71 85 105);
		border-radius: 0.375rem;
		color: rgb(203 213 225);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.sim-btn:hover {
		background: rgb(51 65 85);
		border-color: rgb(59 130 246);
		color: white;
	}

	.sim-btn.active {
		background: rgb(37 99 235);
		border-color: rgb(59 130 246);
		color: white;
	}

	.sim-btn.reset {
		border-color: rgb(239 68 68 / 0.5);
	}

	.sim-btn.reset:hover {
		border-color: rgb(239 68 68);
		background: rgb(127 29 29 / 0.3);
	}

	.simulation-info {
		display: flex;
		gap: 1rem;
		font-size: 0.8rem;
		color: rgb(148 163 184);
	}

	.turn-counter {
		color: rgb(147 197 253);
		font-weight: 600;
	}

	.tile-count {
		color: rgb(134 239 172);
	}

	/* Nations Panel */
	.nations-panel {
		margin-top: 1rem;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.4);
		border-radius: 0.5rem;
		border: 1px solid rgb(71 85 105 / 0.5);
	}

	.nations-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.nations-title {
		margin: 0;
		font-size: 0.9rem;
		color: rgb(192 132 252);
		font-weight: 600;
	}

	.add-nation-btn {
		padding: 0.4rem 0.75rem;
		background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-nation-btn:hover {
		background: linear-gradient(135deg, rgb(22 163 74), rgb(21 128 61));
		transform: translateY(-1px);
	}

	.nations-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.nation-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: rgb(15 23 42 / 0.5);
		border-radius: 0.375rem;
		border-left: 3px solid rgb(147 51 234);
	}

	.nation-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.nation-name-btn {
		background: none;
		border: none;
		padding: 0;
		color: rgb(226 232 240);
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
		text-align: left;
		transition: color 0.2s;
	}

	.nation-name-btn:hover {
		color: rgb(192 132 252);
		text-decoration: underline;
	}

	.nation-actions {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.locate-nation-btn {
		width: 24px;
		height: 24px;
		background: transparent;
		border: 1px solid rgb(59 130 246 / 0.5);
		border-radius: 0.25rem;
		color: rgb(59 130 246);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.locate-nation-btn:hover {
		background: rgb(30 58 138 / 0.3);
		border-color: rgb(59 130 246);
	}

	.nation-terrain,
	.nation-position {
		color: rgb(148 163 184);
		font-size: 0.7rem;
	}

	.remove-nation-btn {
		width: 24px;
		height: 24px;
		background: transparent;
		border: 1px solid rgb(239 68 68 / 0.5);
		border-radius: 0.25rem;
		color: rgb(239 68 68);
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove-nation-btn:hover {
		background: rgb(127 29 29 / 0.3);
		border-color: rgb(239 68 68);
	}

	.no-nations {
		color: rgb(148 163 184);
		font-size: 0.8rem;
		text-align: center;
		margin: 0;
		padding: 0.5rem;
	}
</style>
