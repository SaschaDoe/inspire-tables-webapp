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
	import { WorldMapCreator, type WorldMapProgress } from '$lib/entities/location/worldMapCreator';
	import { WorldMap } from '$lib/entities/location/worldMap';
	import { HexTile } from '$lib/entities/location/hexTile';
	import type { RegionalHexData } from '$lib/entities/location/regionalHexData';
	import type { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
	import { TerrainType } from '$lib/entities/location/terrainType';
	import { entityStore } from '$lib/stores/entityStore';
	import { NationCreator } from '$lib/entities/location/nationCreator';
	import { Nation } from '$lib/entities/location/nation';
	import { worldMapTileStore } from '$lib/stores/worldMapTileStore';
	import { SimulationEngine } from '$lib/simulation/SimulationEngine';
	import { Unit, UnitType } from '$lib/entities/military/unit';
	import { City } from '$lib/entities/location/city';
	import type { HistoricalEvent } from '$lib/entities/simulation/historicalEvent';
	import EventHistoryPanel from '$lib/components/simulation/EventHistoryPanel.svelte';
	import TileEntityPanel from '$lib/components/simulation/TileEntityPanel.svelte';

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
	let simulationYear = $state(-10000);

	// Simulation engine
	let simulationEngine: SimulationEngine | null = $state(null);

	// Nations on this planet
	let nations: Nation[] = $state([]);

	// Units and cities on this planet
	let units: Unit[] = $state([]);
	let cities: City[] = $state([]);

	// Historical events
	let historicalEvents: HistoricalEvent[] = $state([]);

	// Reference to the hex map component for panning
	let hexMapComponent: HexMapWebGL | null = $state(null);

	// Local world map state - keeps detailed tiles in memory even after store saves
	// (The store only saves lightweight version without detailed tiles)
	let localWorldMap: WorldMap | null = $state(null);

	// World map generation progress state
	let isGenerating = $state(false);
	let generationProgress: WorldMapProgress | null = $state(null);

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

		// Load nations, units, cities for this planet from entity store
		loadEntitiesFromStore();

		// Initialize simulation engine if we have nations
		initializeSimulationEngine();
	});

	/**
	 * Initialize the simulation engine
	 */
	function initializeSimulationEngine() {
		if (!activeWorldMap) return;

		simulationEngine = new SimulationEngine({
			startYear: -10000,
			yearsPerTurn: 1,
			autoSave: false,
			enableEntityBridge: true
		});

		// Initialize with planet and world map
		simulationEngine.initialize(planet.id, activeWorldMap);

		// Add existing nations and cities to engine
		for (const nation of nations) {
			simulationEngine.addNation(nation);
		}
		for (const city of cities) {
			simulationEngine.addCity(city);
		}

		console.log('[PlanetViewer] SimulationEngine initialized');
	}

	/**
	 * Load nations, units, cities, and events from entity store
	 */
	function loadEntitiesFromStore() {
		const allEntities = entityStore.getAllEntities();

		// Load nations
		const nationEntities = allEntities.filter(e => e.type === 'nation');
		const loadedNations: Nation[] = [];
		for (const entity of nationEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as Nation | undefined;
			if (generatedEntity && generatedEntity.parentPlanetId === planet.id) {
				const nation = Object.assign(new Nation(), generatedEntity);
				loadedNations.push(nation);
			}
		}
		if (loadedNations.length > 0) {
			nations = loadedNations;
			console.log(`[PlanetViewer] Loaded ${loadedNations.length} nations from entity store`);
		}

		// Load units
		const unitEntities = allEntities.filter(e => e.type === 'unit');
		const loadedUnits: Unit[] = [];
		for (const entity of unitEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as Unit | undefined;
			if (generatedEntity && generatedEntity.parentPlanetId === planet.id) {
				const unit = Object.assign(new Unit(), generatedEntity);
				loadedUnits.push(unit);
			}
		}
		if (loadedUnits.length > 0) {
			units = loadedUnits;
			console.log(`[PlanetViewer] Loaded ${loadedUnits.length} units from entity store`);
		}

		// Load cities
		const cityEntities = allEntities.filter(e => e.type === 'city');
		const loadedCities: City[] = [];
		for (const entity of cityEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as City | undefined;
			if (generatedEntity && generatedEntity.parentPlanetId === planet.id) {
				const city = Object.assign(new City(), generatedEntity);
				loadedCities.push(city);
			}
		}
		if (loadedCities.length > 0) {
			cities = loadedCities;
			console.log(`[PlanetViewer] Loaded ${loadedCities.length} cities from entity store`);
		}

		// Load historical events
		const eventEntities = allEntities.filter(e => e.type === 'historicalEvent');
		const loadedEvents: HistoricalEvent[] = [];
		for (const entity of eventEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as HistoricalEvent | undefined;
			if (generatedEntity) {
				// Check if event is related to this planet (via participants or hexTileId)
				loadedEvents.push(generatedEntity);
			}
		}
		if (loadedEvents.length > 0) {
			historicalEvents = loadedEvents;
			console.log(`[PlanetViewer] Loaded ${loadedEvents.length} historical events from entity store`);
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
		isGenerating = true;
		generationProgress = null;

		try {
			console.log('[PlanetViewer] Creating world map for planet:', planet.name);

			// Use async generation with progress callback
			const newWorldMap = await WorldMapCreator.createAsync(planet, (progress) => {
				generationProgress = progress;
			});

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
		} finally {
			isGenerating = false;
			generationProgress = null;
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

	/**
	 * Save the selected hex tile to the navigator
	 * Copies the hex tile data and its regional hexes into an entity
	 */
	function saveHexToNavigator() {
		console.log('[PlanetViewer] saveHexToNavigator called');
		console.log('[PlanetViewer] selectedHex:', selectedHex);
		console.log('[PlanetViewer] activeWorldMap:', activeWorldMap ? 'exists' : 'null');
		console.log('[PlanetViewer] isHexSaved:', isHexSaved);

		if (!selectedHex || !activeWorldMap) {
			console.error('[PlanetViewer] No hex selected or no world map');
			return;
		}

		// Create a new HexTile instance with proper class
		const hexTileEntity = new HexTile();

		// Copy all properties from the selected hex
		hexTileEntity.id = `hexTile-${planet.id}-${selectedHex.x}-${selectedHex.y}`;
		hexTileEntity.name = `Hex (${selectedHex.x}, ${selectedHex.y}) - ${TerrainType[selectedHex.terrainType]}`;
		hexTileEntity.x = selectedHex.x;
		hexTileEntity.y = selectedHex.y;
		hexTileEntity.terrainType = selectedHex.terrainType;
		hexTileEntity.elevation = selectedHex.elevation;
		hexTileEntity.temperature = selectedHex.temperature;
		hexTileEntity.dryness = selectedHex.dryness;
		hexTileEntity.continentId = selectedHex.continentId;
		hexTileEntity.parentId = planet.id;
		hexTileEntity.regionalGridSize = selectedHex.regionalGridSize || activeWorldMap.gridSize;

		// Copy regional hexes from the world map's hex tile
		const worldMapHex = activeWorldMap.hexTiles[selectedHex.y]?.[selectedHex.x];
		if (worldMapHex?.regionalHexes) {
			hexTileEntity.regionalHexes = worldMapHex.regionalHexes;
		}

		// Copy other properties
		hexTileEntity.type = selectedHex.type || '';
		hexTileEntity.feature = selectedHex.feature || '';
		hexTileEntity.weather = selectedHex.weather || '';
		hexTileEntity.dungeons = selectedHex.dungeons || [];
		hexTileEntity.hazards = selectedHex.hazards || [];
		hexTileEntity.settlements = selectedHex.settlements || [];
		hexTileEntity.techLevel = selectedHex.techLevel || '';
		hexTileEntity.discovered = selectedHex.discovered || false;

		// Create the entity for the navigator
		const entity: Entity = {
			id: hexTileEntity.id,
			type: 'hexTile' as any,
			name: hexTileEntity.name,
			description: `A ${TerrainType[hexTileEntity.terrainType]} hex tile at coordinates (${hexTileEntity.x}, ${hexTileEntity.y}) on ${planet.name}`,
			tags: [TerrainType[hexTileEntity.terrainType].toLowerCase()],
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [
				{ type: 'belongs_to', targetId: planet.id, targetType: 'planet' }
			],
			customFields: { generatedEntity: hexTileEntity }
		};

		// Check if already saved
		const existingEntity = entityStore.getEntity(hexTileEntity.id);
		console.log('[PlanetViewer] existingEntity check:', existingEntity ? 'found' : 'not found');
		console.log('[PlanetViewer] Entity to save:', {
			id: entity.id,
			type: entity.type,
			name: entity.name,
			hasRegionalHexes: hexTileEntity.regionalHexes?.length > 0
		});

		if (existingEntity) {
			// Update existing
			entityStore.updateEntity(hexTileEntity.id, entity);
			console.log(`[PlanetViewer] Updated hex tile entity: ${hexTileEntity.name}`);
		} else {
			// Create new
			entityStore.createEntity(entity);
			console.log(`[PlanetViewer] Created hex tile entity: ${hexTileEntity.name}`);
		}

		// Verify entity was saved
		const verifyEntity = entityStore.getEntity(entity.id);
		console.log('[PlanetViewer] Verify entity saved:', verifyEntity ? 'success' : 'failed');

		// Open the saved hex tile in a new tab
		console.log('[PlanetViewer] Dispatching openEntity event');
		dispatch('openEntity', { entity });
	}

	/**
	 * Check if the selected hex is already saved to navigator
	 * Note: We check the entity store reactively using $hexTileEntities
	 */
	const isHexSaved = $derived.by(() => {
		if (!selectedHex) return false;
		const hexId = `hexTile-${planet.id}-${selectedHex.x}-${selectedHex.y}`;
		// Use the reactive store to trigger updates
		const entity = entityStore.getEntity(hexId);
		const isSaved = entity !== null && entity !== undefined;
		console.log('[PlanetViewer] isHexSaved check:', { hexId, isSaved, entity: entity ? 'exists' : 'null' });
		return isSaved;
	});

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

		// Initialize engine if not already done
		if (!simulationEngine) {
			initializeSimulationEngine();
		}

		if (!simulationEngine) {
			console.error('[PlanetViewer] Failed to initialize simulation engine');
			return;
		}

		// Make sure engine is running
		if (!simulationEngine.isRunning) {
			simulationEngine.start();
		}

		// Process the turn
		simulationEngine.processTurn();

		// Update local state from engine
		simulationTurn = simulationEngine.currentTurn;
		simulationYear = simulationEngine.currentYear;
		activeWorldMap.currentTurn = simulationTurn;

		// Reload entities to get updated state
		refreshEntitiesFromEngine();

		console.log(`[PlanetViewer] Processed turn ${simulationTurn} (Year ${simulationYear})`);
		console.log(`[PlanetViewer] Nations: ${nations.length}, Cities: ${cities.length}, Units: ${units.length}`);
	}

	/**
	 * Refresh entities from simulation engine state
	 */
	function refreshEntitiesFromEngine() {
		if (!simulationEngine) return;

		// Get updated cities from entity store
		const allEntities = entityStore.getAllEntities();

		// Refresh cities
		const cityEntities = allEntities.filter(e => e.type === 'city');
		const loadedCities: City[] = [];
		for (const entity of cityEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as City | undefined;
			if (generatedEntity && generatedEntity.parentPlanetId === planet.id) {
				const city = Object.assign(new City(), generatedEntity);
				loadedCities.push(city);
			}
		}
		cities = loadedCities;

		// Refresh units
		const unitEntities = allEntities.filter(e => e.type === 'unit');
		const loadedUnits: Unit[] = [];
		for (const entity of unitEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as Unit | undefined;
			if (generatedEntity && generatedEntity.parentPlanetId === planet.id) {
				const unit = Object.assign(new Unit(), generatedEntity);
				loadedUnits.push(unit);
			}
		}
		units = loadedUnits;

		// Refresh historical events
		const eventEntities = allEntities.filter(e => e.type === 'historicalEvent');
		const loadedEvents: HistoricalEvent[] = [];
		for (const entity of eventEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as HistoricalEvent | undefined;
			if (generatedEntity) {
				loadedEvents.push(generatedEntity);
			}
		}
		historicalEvents = loadedEvents;

		// Refresh nations to get updated hasFoundedFirstCity flag
		const nationEntities = allEntities.filter(e => e.type === 'nation');
		const loadedNations: Nation[] = [];
		for (const entity of nationEntities) {
			const generatedEntity = entity.customFields?.generatedEntity as Nation | undefined;
			if (generatedEntity && generatedEntity.parentPlanetId === planet.id) {
				const nation = Object.assign(new Nation(), generatedEntity);
				loadedNations.push(nation);
			}
		}
		nations = loadedNations;

		// Note: Do NOT increment mapKey here - that would reset the map zoom/pan.
		// The cities/units/nations arrays changing will trigger reactivity
		// and the $effect blocks in HexMapWebGL will update the renderer.
	}

	function resetSimulation() {
		if (!activeWorldMap) return;

		simulationTurn = 0;
		simulationYear = -10000;
		activeWorldMap.currentTurn = 0;
		simulationRunning = false;
		activeWorldMap.simulationEnabled = false;

		// Reset ownership on all tiles
		for (const tile of activeWorldMap.detailedHexTiles.values()) {
			tile.ownerNationId = null;
			tile.ownerCityId = null;
			tile.isWorked = false;
			tile.isCityCenter = false;
			tile.isCapital = false;
		}

		// Delete all entities from store
		for (const nation of nations) {
			entityStore.deleteEntity(nation.id);
		}
		for (const city of cities) {
			entityStore.deleteEntity(city.id);
		}
		for (const unit of units) {
			entityStore.deleteEntity(unit.id);
		}

		// Clear all entity arrays
		nations = [];
		cities = [];
		units = [];
		historicalEvents = [];

		// Reset simulation engine
		simulationEngine = null;

		// Force map re-render
		mapKey++;

		console.log('[PlanetViewer] Simulation reset');
	}

	/**
	 * Find a suitable starting hex for a nation based on preferred terrain
	 */
	function findStartingHex(preferredTerrains: TerrainType[]): DetailedHexTile | null {
		if (!activeWorldMap) return null;

		const tiles = activeWorldMap.detailedHexTiles;
		const preferredCandidates: DetailedHexTile[] = [];
		const fallbackCandidates: DetailedHexTile[] = [];

		// Minimum distance from other nation starting positions (in tiles)
		const MIN_DISTANCE = 20;

		// Unspawnable terrain types (can never spawn here)
		const unspawnableTerrain = [
			TerrainType.Water, TerrainType.Ocean, TerrainType.Coast,
			TerrainType.Mountain, TerrainType.HighMountain, TerrainType.SnowMountain,
			TerrainType.Lava
		];

		// Harsh terrain types - only spawn if explicitly preferred
		const harshTerrain = [
			TerrainType.Snow, TerrainType.SnowHills,
			TerrainType.Desert, TerrainType.DesertHills,
			TerrainType.Tundra, TerrainType.TundraHills
		];

		// Collect all valid candidates
		for (const tile of tiles.values()) {
			// Skip unspawnable tiles and already owned tiles
			if (unspawnableTerrain.includes(tile.terrainType) || tile.ownerNationId) {
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

			// Check if this is a preferred terrain
			if (preferredTerrains.includes(tile.terrainType)) {
				preferredCandidates.push(tile);
			} else if (!harshTerrain.includes(tile.terrainType)) {
				// Only add non-harsh terrain as fallback
				// (harsh terrain only allowed if explicitly preferred)
				fallbackCandidates.push(tile);
			}
		}

		// Strongly prefer preferred terrain - only use fallback if no preferred tiles available
		let candidates = preferredCandidates.length > 0 ? preferredCandidates : fallbackCandidates;

		if (candidates.length === 0) {
			// Last resort: allow any non-unspawnable tile (including harsh terrain)
			for (const tile of tiles.values()) {
				if (!unspawnableTerrain.includes(tile.terrainType) && !tile.ownerNationId) {
					candidates.push(tile);
				}
			}
		}

		if (candidates.length === 0) return null;

		// Pick a random candidate
		const index = Math.floor(Math.random() * candidates.length);
		return candidates[index];
	}

	/**
	 * Generate weighted terrain preferences for a nation
	 * Common terrains are more likely, snow/desert are rare, water is impossible
	 */
	function generateTerrainPreferences(): TerrainType[] {
		const preferences: TerrainType[] = [];

		// Weighted terrain pools
		// Common terrains (high chance to be primary): Grass, Plains, Hills
		// Uncommon terrains (medium chance): Forest tiles (via Grass), Coastal preference
		// Rare terrains (low chance): Tundra, Desert
		// Very rare terrains (almost never): Snow
		// Impossible: Water, Ocean

		const weightedPrimary = [
			// Common (weight ~60%)
			{ terrain: TerrainType.Grass, weight: 25 },
			{ terrain: TerrainType.Plains, weight: 20 },
			{ terrain: TerrainType.GrassHills, weight: 15 },
			// Uncommon (weight ~25%)
			{ terrain: TerrainType.Hills, weight: 10 },
			{ terrain: TerrainType.Coast, weight: 8 },
			{ terrain: TerrainType.PlainsHills, weight: 7 },
			// Rare (weight ~12%)
			{ terrain: TerrainType.Tundra, weight: 6 },
			{ terrain: TerrainType.Desert, weight: 5 },
			// Very rare (weight ~3%)
			{ terrain: TerrainType.Snow, weight: 2 },
			{ terrain: TerrainType.DesertHills, weight: 2 }
		];

		// Calculate total weight
		const totalWeight = weightedPrimary.reduce((sum, t) => sum + t.weight, 0);

		// Pick primary terrain
		let roll = Math.random() * totalWeight;
		let primaryTerrain = TerrainType.Grass;
		for (const entry of weightedPrimary) {
			roll -= entry.weight;
			if (roll <= 0) {
				primaryTerrain = entry.terrain;
				break;
			}
		}
		preferences.push(primaryTerrain);

		// Add 3-4 secondary terrains based on primary
		const secondaryTerrains = getSecondaryTerrains(primaryTerrain);
		for (const secondary of secondaryTerrains.slice(0, 4)) {
			if (!preferences.includes(secondary)) {
				preferences.push(secondary);
			}
		}

		return preferences;
	}

	/**
	 * Get secondary terrain types that complement a primary terrain
	 */
	function getSecondaryTerrains(primary: TerrainType): TerrainType[] {
		switch (primary) {
			case TerrainType.Grass:
				return [TerrainType.Plains, TerrainType.GrassHills, TerrainType.PlainsHills, TerrainType.Coast];
			case TerrainType.Plains:
				return [TerrainType.Grass, TerrainType.PlainsHills, TerrainType.GrassHills, TerrainType.Hills];
			case TerrainType.GrassHills:
			case TerrainType.PlainsHills:
			case TerrainType.Hills:
				return [TerrainType.Grass, TerrainType.Plains, TerrainType.GrassHills, TerrainType.PlainsHills];
			case TerrainType.Coast:
				return [TerrainType.Grass, TerrainType.Plains, TerrainType.GrassHills, TerrainType.Coast];
			case TerrainType.Tundra:
				return [TerrainType.TundraHills, TerrainType.Plains, TerrainType.Snow, TerrainType.Grass];
			case TerrainType.Desert:
			case TerrainType.DesertHills:
				return [TerrainType.Desert, TerrainType.DesertHills, TerrainType.Plains, TerrainType.Hills];
			case TerrainType.Snow:
				return [TerrainType.Tundra, TerrainType.TundraHills, TerrainType.Snow, TerrainType.SnowHills];
			default:
				return [TerrainType.Grass, TerrainType.Plains, TerrainType.GrassHills, TerrainType.Hills];
		}
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

		// Override terrain preferences with weighted random selection
		nation.preferredTerrainTypes = generateTerrainPreferences();

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

		// Create a settler unit for this nation at the starting position (creates entity and modifies nation.militaryUnits)
		const settler = createSettlerForNation(nation, startingHex);

		// Save nation to entity store (AFTER settler is added to nation.militaryUnits)
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

		// Add to simulation engine if available
		if (simulationEngine) {
			simulationEngine.addNation(nation);
		}

		// Add to nations list
		nations = [...nations, nation];

		// Add settler to units list
		if (settler) {
			units = [...units, settler];
		}

		console.log(`[PlanetViewer] Added nation "${nation.name}" at (${startingHex.globalX}, ${startingHex.globalY})`);
		console.log(`[PlanetViewer] Created settler "${settler?.name}" for nation`);
		console.log(`[PlanetViewer] Preferred terrain: ${nation.preferredTerrainTypes.map(t => TerrainType[t]).join(', ')}`);
		console.log(`[PlanetViewer] Actual terrain: ${TerrainType[startingHex.terrainType]}`);
	}

	/**
	 * Create a settler unit for a nation
	 */
	function createSettlerForNation(nation: Nation, startingHex: DetailedHexTile): Unit {
		const settler = new Unit();
		settler.name = `${nation.name} Settler`;
		settler.unitType = UnitType.Settler;
		settler.ownerNationId = nation.id;
		settler.parentPlanetId = planet.id;
		settler.currentHexTileId = startingHex.id;
		settler.coordinates = { x: startingHex.globalX, y: startingHex.globalY };
		settler.createdYear = simulationYear;

		// Initialize settler stats
		settler.combatStrength = 0;
		settler.maxMovementPoints = 2;
		settler.movementPoints = 2;

		// Save settler to entity store
		const settlerEntity: Entity = {
			id: settler.id,
			type: 'unit' as any,
			name: settler.name,
			description: `Settler unit for ${nation.name}`,
			tags: ['settler', 'unit'],
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [
				{ type: 'belongs_to', targetId: nation.id, targetType: 'nation' }
			],
			customFields: { generatedEntity: settler }
		};
		entityStore.createEntity(settlerEntity);

		// Add to nation's military units
		nation.militaryUnits.push(settler.id);

		console.log(`[PlanetViewer] Created settler for ${nation.name} at (${startingHex.globalX}, ${startingHex.globalY})`);

		return settler;
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
			// Pan to the nation's starting position and zoom to 70% (good regional view with settler visible)
			hexMapComponent?.panToGlobalHex(nation.startingHexX, nation.startingHexY, 70);
		}
	}

	/**
	 * Handle unit action (e.g., Found City)
	 */
	function handleUnitAction(event: CustomEvent<{ unit: Unit; action: string }>) {
		const { unit, action } = event.detail;

		if (action === 'foundCity') {
			foundCityWithSettler(unit);
		} else if (action === 'fortify') {
			unit.fortify();
			units = [...units]; // Trigger reactivity
		}
	}

	/**
	 * Found a city with a settler unit
	 */
	function foundCityWithSettler(settler: Unit) {
		if (!activeWorldMap) return;

		// Get the nation
		const nation = nations.find(n => n.id === settler.ownerNationId);
		if (!nation) {
			console.error('[PlanetViewer] Nation not found for settler');
			return;
		}

		// Get the tile where settler is
		const tile = activeWorldMap.getDetailedHex(settler.coordinates.x, settler.coordinates.y);
		if (!tile) {
			console.error('[PlanetViewer] Tile not found for settler');
			return;
		}

		// Check if valid location for city
		if (tile.isCityCenter || tile.ownerCityId) {
			console.error('[PlanetViewer] Cannot found city - tile already has a city');
			return;
		}

		// Create the city
		const city = new City();
		city.name = `${nation.name} City ${nation.cityIds.length + 1}`;
		city.ownerNationId = nation.id;
		city.founderNationId = nation.id;
		city.foundedYear = simulationYear;
		city.parentPlanetId = planet.id;
		city.hexTileId = tile.id;
		city.coordinates = { x: tile.globalX, y: tile.globalY };
		city.population = 1;
		city.isCapital = nation.cityIds.length === 0;

		// Mark the tile as city center
		tile.isCityCenter = true;
		tile.ownerNationId = nation.id;
		tile.ownerCityId = city.id;
		if (city.isCapital) tile.isCapital = true;

		// Save city to entity store
		const cityEntity: Entity = {
			id: city.id,
			type: 'city' as any,
			name: city.name,
			description: `City of ${nation.name}`,
			tags: ['city'],
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [
				{ type: 'belongs_to', targetId: nation.id, targetType: 'nation' }
			],
			customFields: { generatedEntity: city }
		};
		entityStore.createEntity(cityEntity);

		// Add to nation
		nation.cityIds.push(city.id);
		nation.hasFoundedFirstCity = true;

		// Update nation entity
		const nationEntity = entityStore.getEntity(nation.id);
		if (nationEntity) {
			entityStore.updateEntity(nation.id, {
				...nationEntity,
				customFields: { generatedEntity: nation }
			});
		}

		// Add city to simulation engine
		if (simulationEngine) {
			simulationEngine.addCity(city);
		}

		// Remove settler (consumed by city founding)
		entityStore.deleteEntity(settler.id);
		units = units.filter(u => u.id !== settler.id);

		// Add city to local list
		cities = [...cities, city];

		// Create historical event
		const event = {
			id: crypto.randomUUID(),
			eventType: 'CityFounded',
			name: `${nation.name} Founds ${city.name}`,
			description: `${nation.name} has founded the ${city.isCapital ? 'capital city of ' : 'city of '}${city.name}.`,
			year: simulationYear,
			turnNumber: simulationTurn,
			significance: city.isCapital ? 'Major' : 'Normal',
			participants: [
				{ entityType: 'nation', entityId: nation.id, entityName: nation.name, role: 'primary' },
				{ entityType: 'city', entityId: city.id, entityName: city.name, role: 'primary' }
			],
			hexTileId: tile.id
		} as HistoricalEvent;
		historicalEvents = [...historicalEvents, event];

		// Force map re-render
		mapKey++;

		console.log(`[PlanetViewer] ${nation.name} founded ${city.name} at (${tile.globalX}, ${tile.globalY})`);
	}

	/**
	 * Handle opening an entity from the tile panel
	 */
	function handleOpenEntityFromTile(event: CustomEvent<{ entity: Unit | City }>) {
		const entity = event.detail.entity;
		const storedEntity = entityStore.getEntity(entity.id);
		if (storedEntity) {
			dispatch('openEntity', { entity: storedEntity });
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
						<span class="year-counter">Year: {simulationYear < 0 ? `${Math.abs(simulationYear)} BCE` : `${simulationYear} CE`}</span>
						<span class="entity-counts">
							Nations: {nations.length} | Cities: {cities.length} | Units: {units.length}
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
						{cities}
						{units}
						on:hexSelected={handleHexSelected}
						on:regionalHexSelected={handleRegionalHexSelected}
					/>
				{/key}
				{#if selectedHex}
					<div class="hex-info-panel">
						<div class="hex-info-header">
							<h4 class="hex-info-title">Selected Hex (General)</h4>
							<button
								class="save-hex-btn"
								class:saved={isHexSaved}
								onclick={saveHexToNavigator}
								title={isHexSaved ? 'Open in Navigator' : 'Save to Navigator'}
							>
								{isHexSaved ? 'Open' : 'Save'}
							</button>
						</div>
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

					<!-- Tile Entity Panel - shows units/cities on selected tile -->
					<TileEntityPanel
						tile={selectedDetailedHex}
						{units}
						{cities}
						on:unitAction={handleUnitAction}
						on:openEntity={handleOpenEntityFromTile}
					/>
				{/if}

				<!-- Event History Panel -->
				<Section title="Simulation History">
					<EventHistoryPanel
						events={historicalEvents}
						currentYear={simulationYear}
						maxEvents={100}
					/>
				</Section>
			{:else}
				<div class="no-map-container">
					{#if showWorldMapError}
						<p class="error-message">{showWorldMapError}</p>
					{/if}
					{#if isGenerating && generationProgress}
						<div class="generation-progress">
							<div class="progress-spinner"></div>
							<p class="progress-label">{generationProgress.phaseLabel}</p>
							<div class="progress-bar-container">
								<div
									class="progress-bar-fill"
									style="width: {generationProgress.percent}%"
								></div>
							</div>
							<p class="progress-percent">{generationProgress.percent}%</p>
						</div>
					{:else if isGenerating}
						<div class="generation-progress">
							<div class="progress-spinner"></div>
							<p class="progress-label">Initializing...</p>
						</div>
					{:else}
						<p class="no-map-text">No world map generated yet.</p>
						<button class="generate-btn" onclick={generateWorldMap}>Generate World Map</button>
					{/if}
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

	.hex-info-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.hex-info-title {
		margin: 0;
		color: rgb(192 132 252);
		font-size: 1rem;
		font-weight: 600;
	}

	.save-hex-btn {
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

	.save-hex-btn:hover {
		background: linear-gradient(135deg, rgb(22 163 74), rgb(21 128 61));
		transform: translateY(-1px);
	}

	.save-hex-btn.saved {
		background: linear-gradient(135deg, rgb(59 130 246), rgb(37 99 235));
	}

	.save-hex-btn.saved:hover {
		background: linear-gradient(135deg, rgb(37 99 235), rgb(29 78 216));
	}

	/* Generation Progress */
	.generation-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		width: 100%;
	}

	.progress-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgb(71 85 105);
		border-top-color: rgb(147 51 234);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.progress-label {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		font-weight: 500;
		margin: 0;
		text-align: center;
	}

	.progress-bar-container {
		width: 100%;
		max-width: 300px;
		height: 12px;
		background: rgb(30 41 59);
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid rgb(71 85 105);
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, rgb(147 51 234), rgb(192 132 252));
		border-radius: 6px;
		transition: width 0.2s ease-out;
	}

	.progress-percent {
		color: rgb(147 51 234);
		font-size: 1rem;
		font-weight: 700;
		margin: 0;
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

	.year-counter {
		color: rgb(250 204 21);
		font-weight: 600;
	}

	.entity-counts {
		color: rgb(134 239 172);
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
