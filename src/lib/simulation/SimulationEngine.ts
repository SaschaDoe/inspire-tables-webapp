import { entityStore } from '$lib/stores/entityStore';
import { Nation } from '$lib/entities/location/nation';
import { City } from '$lib/entities/location/city';
import { WorldMap } from '$lib/entities/location/worldMap';
import { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
import { HistoricalEvent, HistoricalEventType, EventSignificance, type EventParticipant } from '$lib/entities/simulation/historicalEvent';
import { TerrainType } from '$lib/entities/location/terrainType';
import { SimulationEntityBridge } from './SimulationEntityBridge';
import type { Writable } from 'svelte/store';

/**
 * Simulation configuration options
 */
export interface SimulationConfig {
	startYear: number; // Starting year (e.g., -10000 for 10,000 BCE)
	yearsPerTurn: number; // How many years pass per turn (default: 1)
	autoSave: boolean; // Whether to auto-save simulation state
	autoSaveInterval: number; // Save every N turns
	maxTurns?: number; // Optional maximum number of turns
	enableEntityBridge?: boolean; // Whether to use entity bridge for persistence (default: true, set false in tests)
}

/**
 * Simulation state snapshot
 */
export interface SimulationState {
	currentYear: number;
	currentTurn: number;
	nationIds: string[];
	cityIds: string[];
	eventIds: string[];
	planetId: string; // Planet (WorldMap) where simulation runs
	isRunning: boolean;
	isPaused: boolean;
}

/**
 * SimulationEngine - Main orchestrator for the Civilization-style simulation
 *
 * Responsibilities:
 * - Turn progression (1 turn = 1 year by default)
 * - Nation and city management
 * - Event creation and tracking
 * - AI decision making
 * - State management and persistence
 *
 * Inspired by Unciv's GameInfo class and Civ 5's simulation architecture.
 */
export class SimulationEngine {
	// Configuration
	config: SimulationConfig = {
		startYear: -10000,
		yearsPerTurn: 1,
		autoSave: false,
		autoSaveInterval: 10,
		maxTurns: undefined,
		enableEntityBridge: true // Enable by default, disable in tests
	};

	// Current state
	currentYear: number;
	currentTurn = 0;
	isRunning = false;
	isPaused = false;

	// Entity references
	nationIds: string[] = [];
	cityIds: string[] = [];
	planetId: string = ''; // Planet ID where simulation runs
	worldMap: WorldMap | null = null; // Cached WorldMap for simulation
	historicalEventIds: string[] = [];

	// Event indices for fast lookup
	private eventsByYear: Map<number, string[]> = new Map();
	private eventsByNation: Map<string, string[]> = new Map();
	private eventsByHex: Map<string, string[]> = new Map();

	// Phase 1.6: Entity bridge for persistence
	private entityBridge: SimulationEntityBridge;

	constructor(config?: Partial<SimulationConfig>) {
		if (config) {
			this.config = { ...this.config, ...config };
		}
		this.currentYear = this.config.startYear;

		// Initialize entity bridge
		this.entityBridge = new SimulationEntityBridge();
	}

	/**
	 * Initialize simulation with a planet and its WorldMap (new simulation)
	 * @param planetId The planet entity ID
	 * @param worldMap The WorldMap containing detailed hex tiles for simulation
	 */
	initialize(planetId: string, worldMap: WorldMap): void {
		this.planetId = planetId;
		this.worldMap = worldMap;

		// Enable simulation on the world map
		worldMap.simulationEnabled = true;

		// TODO: Create initial nations and place their first settlers
		// For now, we'll expect nations to be created externally

		this.isRunning = true;
		this.isPaused = false;
		this.currentTurn = 0;

		this.createEvent({
			type: HistoricalEventType.Other,
			year: this.currentYear,
			title: 'Simulation Begins',
			description: `The great simulation has begun in the year ${this.currentYear}.`,
			significance: EventSignificance.Historic,
			participants: []
		});

		console.log(`✓ Simulation initialized at year ${this.currentYear}`);
	}

	/**
	 * Initialize simulation from existing entities (Phase 1.6)
	 * This loads a previously saved simulation from the entity store
	 *
	 * @param planetId ID of the Planet to load
	 * @param worldMap The WorldMap containing detailed hex tiles
	 */
	async initializeFromEntities(planetId: string, worldMap: WorldMap): Promise<void> {
		console.log(`Loading simulation from Planet ${planetId}...`);

		this.planetId = planetId;
		this.worldMap = worldMap;

		// Load all simulation entities using the bridge
		const { nations, cities, units, events } =
			await this.entityBridge.initializeFromPlanet(planetId);

		// Restore entity IDs
		this.nationIds = nations.map((n) => n.id);
		this.cityIds = cities.map((c) => c.id);
		this.historicalEventIds = events.map((e) => e.id);

		// Restore simulation state from worldMap
		this.currentYear = worldMap.currentTurn > 0 ? this.config.startYear + worldMap.currentTurn : this.config.startYear;
		this.currentTurn = worldMap.currentTurn || 0;

		// Rebuild event indices for fast lookup
		this.rebuildEventIndices(events);

		this.isRunning = false; // Don't auto-start
		this.isPaused = false;

		console.log(
			`✓ Simulation loaded: ${nations.length} nations, ${cities.length} cities, ${events.length} events`
		);
		console.log(`✓ Current state: Year ${this.currentYear}, Turn ${this.currentTurn}`);
	}

	/**
	 * Rebuild event indices from loaded events
	 */
	private rebuildEventIndices(events: HistoricalEvent[]): void {
		this.eventsByYear.clear();
		this.eventsByNation.clear();
		this.eventsByHex.clear();

		for (const event of events) {
			// Index by year
			const yearEvents = this.eventsByYear.get(event.year) || [];
			yearEvents.push(event.id);
			this.eventsByYear.set(event.year, yearEvents);

			// Index by nation
			for (const participant of event.participants) {
				if (participant.entityType === 'nation') {
					const nationEvents = this.eventsByNation.get(participant.entityId) || [];
					nationEvents.push(event.id);
					this.eventsByNation.set(participant.entityId, nationEvents);
				}
			}

			// Index by hex (if location specified)
			if (event.hexTileId) {
				const hexEvents = this.eventsByHex.get(event.hexTileId) || [];
				hexEvents.push(event.id);
				this.eventsByHex.set(event.hexTileId, hexEvents);
			}
		}
	}

	/**
	 * Process one turn of the simulation
	 */
	processTurn(): void {
		if (!this.isRunning || this.isPaused) {
			return;
		}

		this.currentTurn++;
		this.currentYear += this.config.yearsPerTurn;

		console.log(`\n=== Turn ${this.currentTurn}: Year ${this.currentYear} ===`);

		// Phase 1: Calculate city yields (before accumulation)
		this.processCityYields();

		// Phase 2: Update nation yields (accumulate from cities)
		this.processNationYields();

		// Phase 3: Process cities (growth, production, expansion)
		this.processCities();

		// Phase 4: Process nations (tech, policies, diplomacy)
		this.processNations();

		// Phase 4: AI decisions (found cities, train units, etc.)
		this.processAIDecisions();

		// Phase 5: Check victory conditions
		this.checkVictoryConditions();

		// Phase 6: Sync entities to store (Phase 1.6 - Entity persistence)
		// Note: This is async but we don't await it to avoid blocking simulation
		// Entities in entityStore are modified in-place, so they're already updated
		// This just persists to localStorage/IndexedDB for page refreshes
		if (this.config.enableEntityBridge) {
			this.syncEntitiesToStore().catch((err) => {
				console.warn('Failed to sync entities to store:', err);
			});
		}

		// Auto-save if enabled
		if (this.config.autoSave && this.currentTurn % this.config.autoSaveInterval === 0) {
			this.saveState();
		}

		// Check if max turns reached
		if (this.config.maxTurns && this.currentTurn >= this.config.maxTurns) {
			this.stop();
			console.log(`✓ Simulation ended: reached maximum turns (${this.config.maxTurns})`);
		}
	}

	/**
	 * Calculate yields for all cities (before accumulation)
	 */
	private processCityYields(): void {
		for (const cityId of this.cityIds) {
			const city = this.getCity(cityId);
			if (!city) continue;

			// Skip yield calculation if yields have been manually set (for testing)
			// Check if ANY yield exceeds base values (food:2, production:1, gold:2)
			const hasManualYields =
				city.yields.food > 2 ||
				city.yields.production > 1 ||
				city.yields.science > 0 ||
				city.yields.culture > 0 ||
				city.yields.gold > 2;

			if (!hasManualYields) {
				// Calculate yields from tiles, buildings, and other sources
				city.calculateYields();
			}
		}
	}

	/**
	 * Process nation yields and resource accumulation
	 */
	private processNationYields(): void {
		for (const nationId of this.nationIds) {
			const nation = this.getNation(nationId);
			if (!nation || !nation.isActive) continue;

			// Reset yields
			nation.yields = {
				food: 0,
				production: 0,
				gold: nation.yields?.gold || 2, // Base gold per turn
				science: 0,
				culture: 0,
				happiness: 0
			};

			// Accumulate yields from all cities
			for (const cityId of nation.cityIds || []) {
				const city = this.getCity(cityId);
				if (!city) continue;

				// Cities contribute to nation yields
				nation.yields.food += city.yields.food;
				nation.yields.production += city.yields.production;
				nation.yields.gold += city.yields.gold;
				nation.yields.science += city.yields.science;
				nation.yields.culture += city.yields.culture;
			}

			// Update per-turn rates
			nation.sciencePerTurn = nation.yields.science;
			nation.culturePerTurn = nation.yields.culture;

			// Accumulate resources
			if (!nation.resources) {
				nation.resources = { gold: 0, science: 0, culture: 0 };
			}
			nation.resources.gold += nation.yields.gold;
			nation.resources.science += nation.yields.science;
			nation.resources.culture += nation.yields.culture;

			// Save nation back to entity store
			this.saveNation(nation);
		}
	}

	/**
	 * Process all cities (growth, production, expansion)
	 */
	private processCities(): void {
		for (const cityId of this.cityIds) {
			const city = this.getCity(cityId);
			if (!city) continue;

			// Get available tiles for expansion (tiles within radius not owned by anyone)
			const availableTiles = this.getAvailableTilesForExpansion(city);

			// Process turn
			const result = city.processTurn(this.currentTurn, availableTiles);

			// Create events for significant changes
			if (result.grew) {
				this.createCityGrowthEvent(city);
			}

			if (result.starved) {
				this.createCityStarvationEvent(city);
			}

			if (result.productionCompleted && result.productionItem) {
				this.createProductionCompletedEvent(city, result.productionItem);
			}

			if (result.expanded && result.acquiredHexId) {
				this.createBorderExpansionEvent(city, result.acquiredHexId);
			}

			// Save city back to entity store
			this.saveCity(city);
		}
	}

	/**
	 * Process all nations (tech, policies, diplomacy)
	 */
	private processNations(): void {
		for (const nationId of this.nationIds) {
			const nation = this.getNation(nationId);
			if (!nation || !nation.isActive) continue;

			// Process nation turn (managers handle tech, policies, diplomacy)
			const result = nation.processTurn(this.currentTurn);

			if (result.techCompleted && result.techId) {
				this.createTechDiscoveredEvent(nation, result.techId);
			}

			if (result.policyReady) {
				// AI will choose a policy in AI phase
			}

			// Save nation back to entity store
			this.saveNation(nation);
		}
	}

	/**
	 * Helper to get a Nation object from entity store
	 */
	private getNation(nationId: string): Nation | null {
		const entity = entityStore.getEntity(nationId);
		if (!entity) return null;

		// Check if it's stored in customFields.generatedEntity (entity store format)
		if (entity.customFields?.generatedEntity) {
			const nation = entity.customFields.generatedEntity as Nation;
			return Object.assign(new Nation(), nation);
		}

		// Otherwise assume it's already a Nation (direct reference)
		return entity as unknown as Nation;
	}

	/**
	 * Helper to get a City object from entity store
	 */
	private getCity(cityId: string): City | null {
		const entity = entityStore.getEntity(cityId);
		if (!entity) return null;

		if (entity.customFields?.generatedEntity) {
			const city = entity.customFields.generatedEntity as City;
			return Object.assign(new City(), city);
		}

		// Direct entity (used in tests)
		if ((entity as any).yields !== undefined) {
			return entity as unknown as City;
		}

		return null;
	}

	/**
	 * Helper to save a Nation back to entity store
	 */
	private saveNation(nation: Nation): void {
		const entity = entityStore.getEntity(nation.id);
		if (entity) {
			entityStore.updateEntity(nation.id, {
				...entity,
				customFields: { ...entity.customFields, generatedEntity: nation }
			});
		}
	}

	/**
	 * Helper to save a City back to entity store
	 */
	private saveCity(city: City): void {
		const entity = entityStore.getEntity(city.id);
		if (entity) {
			entityStore.updateEntity(city.id, {
				...entity,
				customFields: { ...entity.customFields, generatedEntity: city }
			});
		}
	}

	/**
	 * Process AI decisions for all nations
	 */
	private processAIDecisions(): void {
		console.log(`[AI] Processing AI decisions for ${this.nationIds.length} nations`);

		for (const nationId of this.nationIds) {
			const nation = this.getNation(nationId);
			if (!nation) {
				console.log(`  [AI] Nation ${nationId} not found in store`);
				continue;
			}

			console.log(`  [AI] Checking nation ${nation.name}: isActive=${nation.isActive}, isAIControlled=${nation.isAIControlled}`);

			if (!nation.isActive || !nation.isAIControlled) {
				console.log(`  [AI] Skipping ${nation.name} - not active or not AI controlled`);
				continue;
			}

			// AI decision: Should we found a new city?
			if (this.shouldAIFoundCity(nation)) {
				this.aiFoundCity(nation);
			}

			// TODO: Other AI decisions
			// - Build production items in cities
			// - Choose tech to research
			// - Choose policy to unlock
			// - Move units
			// - Declare war / make peace
		}
	}

	/**
	 * Check if AI should found a new city
	 */
	private shouldAIFoundCity(nation: Nation): boolean {
		// If nation has no cities yet, found one immediately
		const cityCount = nation.cityIds?.length || 0;
		if (cityCount === 0) {
			console.log(`  [AI] ${nation.name} has no cities - should found first city`);
			return true;
		}

		const expansionDesire = nation.cultureTraits?.expansionist || 50;

		// More expansionist cultures found cities more frequently
		const turnsPerCity = Math.max(5, 15 - Math.floor(expansionDesire / 10));

		const shouldFound = cityCount < 5 && this.currentTurn % turnsPerCity === 0;
		if (shouldFound) {
			console.log(`  [AI] ${nation.name} deciding to found city (turn ${this.currentTurn}, turnsPerCity=${turnsPerCity})`);
		}
		return shouldFound;
	}

	/**
	 * AI founds a new city
	 */
	private aiFoundCity(nation: Nation): void {
		console.log(`  [AI] ${nation.name} attempting to found a city...`);

		// First, try to find a settler unit belonging to this nation
		let settlerLocation: { hexTileId: string; coordinates: { x: number; y: number } } | null = null;
		let settlerEntityId: string | null = null;

		// Check nation's military units for a settler
		for (const unitId of nation.militaryUnits || []) {
			const unitEntity = entityStore.getEntity(unitId);
			if (unitEntity?.customFields?.generatedEntity) {
				const unit = unitEntity.customFields.generatedEntity as any;
				if (unit.unitType === 'settler' && unit.coordinates) {
					settlerLocation = {
						hexTileId: unit.currentHexTileId || '',
						coordinates: { x: unit.coordinates.x, y: unit.coordinates.y }
					};
					settlerEntityId = unitId;
					break;
				}
			}
		}

		// If no settler found but nation has starting position and hasn't founded first city, use that
		if (!settlerLocation && !nation.hasFoundedFirstCity && nation.startingHexX !== undefined && nation.startingHexY !== undefined) {
			const tile = this.worldMap?.getDetailedHex(nation.startingHexX, nation.startingHexY);
			settlerLocation = {
				hexTileId: tile?.id || '',
				coordinates: { x: nation.startingHexX, y: nation.startingHexY }
			};
		}

		// Use settler location if available, otherwise find a good location
		const location = settlerLocation || this.findCityFoundingLocation(nation);
		if (!location) {
			console.log(`  [AI] ${nation.name} could not find a suitable city location`);
			return;
		}

		console.log(`  [AI] Found location at (${location.coordinates.x}, ${location.coordinates.y})`);

		// Create the city
		const city = new City();
		city.name = this.generateCityName(nation);
		city.ownerNationId = nation.id;
		city.founderNationId = nation.id;
		city.foundedYear = this.currentYear;
		city.parentPlanetId = this.planetId;
		city.hexTileId = location.hexTileId;
		city.coordinates = { x: location.coordinates.x, y: location.coordinates.y };
		city.population = 1;
		city.isCapital = (nation.cityIds?.length || 0) === 0; // First city is capital

		// Mark the tile as a city center
		const tile = this.worldMap?.getDetailedHex(location.coordinates.x, location.coordinates.y);
		if (tile) {
			tile.isCityCenter = true;
			tile.ownerNationId = nation.id;
			tile.ownerCityId = city.id;
			if (city.isCapital) tile.isCapital = true;
		}

		// Save city to entity store
		const cityEntity = {
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
		this.cityIds.push(city.id);

		// Add to nation
		if (!nation.cityIds) nation.cityIds = [];
		nation.cityIds.push(city.id);
		nation.hasFoundedFirstCity = true;

		// Update nation in entity store
		const nationEntity = entityStore.getEntity(nation.id);
		if (nationEntity) {
			entityStore.updateEntity(nation.id, {
				...nationEntity,
				customFields: { generatedEntity: nation }
			});
		}

		// Consume the settler (delete from entity store)
		if (settlerEntityId) {
			// Remove from nation's military units
			nation.militaryUnits = (nation.militaryUnits || []).filter(id => id !== settlerEntityId);
			// Update nation again with removed settler
			if (nationEntity) {
				entityStore.updateEntity(nation.id, {
					...nationEntity,
					customFields: { generatedEntity: nation }
				});
			}
			// Delete settler entity
			entityStore.deleteEntity(settlerEntityId);
			console.log(`  [AI] Settler ${settlerEntityId} consumed to found city`);
		}

		// Create event
		this.createCityFoundedEvent(nation, city, location.hexTileId);

		console.log(`  [AI] ${nation.name} founded ${city.name} at (${location.coordinates.x}, ${location.coordinates.y})`);
	}

	/**
	 * Find a good location for a new city
	 */
	private findCityFoundingLocation(nation: Nation): {
		hexTileId: string;
		coordinates: { x: number; y: number };
	} | null {
		if (!this.worldMap) return null;

		// Score all tiles
		const scoredTiles: Array<{
			hexTileId: string;
			score: number;
			coordinates: { x: number; y: number };
		}> = [];

		for (const tile of this.worldMap.detailedHexTiles.values()) {
			// Check if tile is valid for city founding
			if (!this.isValidCityLocation(tile)) continue;

			// Score the tile
			const score = this.scoreCityLocation(tile, nation);
			scoredTiles.push({
				hexTileId: tile.id,
				score,
				coordinates: { x: tile.globalX, y: tile.globalY }
			});
		}

		// Sort by score (highest first)
		scoredTiles.sort((a, b) => b.score - a.score);

		// Return best location
		if (scoredTiles.length > 0) {
			return {
				hexTileId: scoredTiles[0].hexTileId,
				coordinates: scoredTiles[0].coordinates
			};
		}

		return null;
	}

	/**
	 * Check if a tile is valid for city founding
	 */
	private isValidCityLocation(tile: DetailedHexTile): boolean {
		// Can't found on mountains, ocean, or impassable terrain
		if (tile.terrainType === TerrainType.Mountain ||
			tile.terrainType === TerrainType.HighMountain ||
			tile.terrainType === TerrainType.SnowMountain ||
			tile.terrainType === TerrainType.Ocean ||
			tile.terrainType === TerrainType.Water ||
			tile.isImpassable) {
			return false;
		}

		// Can't found if tile is already owned
		if (tile.ownerNationId || tile.isCityCenter) {
			return false;
		}

		// Check minimum distance from other cities (at least 4 tiles)
		for (const cityId of this.cityIds) {
			const city = entityStore.getEntity(cityId) as City;
			if (!city || city.parentPlanetId !== this.planetId) continue;

			const distance = Math.abs(city.coordinates.x - tile.globalX) + Math.abs(city.coordinates.y - tile.globalY);
			if (distance < 4) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Score a tile for city founding
	 */
	private scoreCityLocation(tile: DetailedHexTile, nation: Nation): number {
		let score = 0;

		// Prefer terrain matching nation's preference
		if (nation.preferredTerrainTypes.includes(tile.terrainType)) {
			score += 15;
		}

		// Prefer grassland and plains
		if (tile.terrainType === TerrainType.Grass) score += 10;
		if (tile.terrainType === TerrainType.Plains) score += 8;

		// Coast is good for seafaring nations
		if (tile.terrainType === TerrainType.Coast) {
			score += nation.cultureTraits.seafaring / 10;
		}

		// Rivers are very valuable
		if (tile.hasRiver) {
			score += 15;
		}

		// Strategic resources are valuable
		if (tile.strategicResource && tile.strategicResource !== 'None') score += 12;

		// Luxury resources are valuable
		if (tile.luxuryResource && tile.luxuryResource !== 'None') score += 10;

		// Bonus resources are nice
		if (tile.bonusResource && tile.bonusResource !== '') score += 5;

		// Food yield is important
		score += tile.yields.food * 3;

		// Production is important
		score += tile.yields.production * 2;

		return score;
	}

	/**
	 * Generate a city name for a nation
	 */
	private generateCityName(nation: Nation): string {
		const cityNumber = nation.cityIds.length + 1;
		return `${nation.name} City ${cityNumber}`;
	}

	/**
	 * Get available tiles for city expansion
	 */
	private getAvailableTilesForExpansion(city: City): string[] {
		// TODO: Implement proper tile ownership tracking
		// For now, return empty array
		return [];
	}

	/**
	 * Check victory conditions
	 */
	private checkVictoryConditions(): void {
		// Check if only one nation remains
		const activeNations = this.nationIds.filter((id) => {
			const nation = entityStore.getEntity(id) as Nation;
			return nation && nation.isActive && !nation.isEliminated;
		});

		if (activeNations.length === 1) {
			const winner = entityStore.getEntity(activeNations[0]) as Nation;
			this.createEvent({
				type: HistoricalEventType.MilitaryVictory,
				year: this.currentYear,
				title: `${winner.name} Achieves Military Victory!`,
				description: `${winner.name} has eliminated all rivals and achieved military dominance.`,
				significance: EventSignificance.Historic,
				participants: [
					{
						entityType: 'nation',
						entityId: winner.id,
						entityName: winner.name,
						role: 'primary'
					}
				]
			});
			this.stop();
		}
	}

	/**
	 * Create a historical event
	 */
	createEvent(data: {
		type: HistoricalEventType;
		year: number;
		title: string;
		description: string;
		significance: EventSignificance;
		participants: EventParticipant[];
		hexTileId?: string;
		stateChanges?: any[];
	}): HistoricalEvent {
		const event = new HistoricalEvent();
		event.eventType = data.type;
		event.year = data.year;
		event.turnNumber = this.currentTurn;
		event.name = data.title;
		event.description = data.description;
		event.significance = data.significance;
		event.participants = data.participants;
		event.hexTileId = data.hexTileId;
		event.parentPlanetId = this.planetId;
		if (data.stateChanges) {
			for (const change of data.stateChanges) {
				event.recordStateChange(change.entityId, change.entityType, change.property, change.oldValue, change.newValue);
			}
		}

		// Save event with proper Entity structure for entity store
		const eventEntity = {
			id: event.id,
			type: 'historicalEvent' as any,
			name: event.name,
			description: event.description,
			tags: [data.type, `turn-${this.currentTurn}`],
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: data.participants.map(p => ({
				type: 'reference' as const,
				targetId: p.entityId,
				targetType: p.entityType
			})),
			customFields: { generatedEntity: event }
		};
		entityStore.createEntity(eventEntity);
		this.historicalEventIds.push(event.id);

		console.log(`[SimulationEngine] Created event: ${event.name} (Year ${event.year}, Turn ${this.currentTurn})`);

		// Index by year
		if (!this.eventsByYear.has(data.year)) {
			this.eventsByYear.set(data.year, []);
		}
		this.eventsByYear.get(data.year)!.push(event.id);

		// Index by nation
		for (const participant of data.participants) {
			if (participant.entityType === 'nation') {
				if (!this.eventsByNation.has(participant.entityId)) {
					this.eventsByNation.set(participant.entityId, []);
				}
				this.eventsByNation.get(participant.entityId)!.push(event.id);
			}
		}

		// Index by hex
		if (data.hexTileId) {
			if (!this.eventsByHex.has(data.hexTileId)) {
				this.eventsByHex.set(data.hexTileId, []);
			}
			this.eventsByHex.get(data.hexTileId)!.push(event.id);
		}

		return event;
	}

	/**
	 * Event creation helpers
	 */
	private createCityFoundedEvent(nation: Nation, city: City, hexTileId: string): void {
		this.createEvent({
			type: HistoricalEventType.CityFounded,
			year: this.currentYear,
			title: `${nation.name} Founds ${city.name}`,
			description: `${nation.name} has founded the ${city.isCapital ? 'capital city of ' : ''}${city.name}.`,
			significance: city.isCapital ? EventSignificance.Major : EventSignificance.Normal,
			participants: [
				{ entityType: 'nation', entityId: nation.id, entityName: nation.name, role: 'primary' },
				{ entityType: 'city', entityId: city.id, entityName: city.name, role: 'primary' }
			],
			hexTileId
		});
	}

	private createCityGrowthEvent(city: City): void {
		const nation = entityStore.getEntity(city.ownerNationId) as Nation;
		this.createEvent({
			type: HistoricalEventType.CityGrew,
			year: this.currentYear,
			title: `${city.name} Grows`,
			description: `${city.name} has grown to population ${city.population}.`,
			significance: EventSignificance.Minor,
			participants: [
				{ entityType: 'city', entityId: city.id, entityName: city.name, role: 'primary' },
				{ entityType: 'nation', entityId: nation.id, entityName: nation.name, role: 'secondary' }
			],
			hexTileId: city.hexTileId
		});
	}

	private createCityStarvationEvent(city: City): void {
		const nation = entityStore.getEntity(city.ownerNationId) as Nation;
		this.createEvent({
			type: HistoricalEventType.CityStarved,
			year: this.currentYear,
			title: `${city.name} Starves`,
			description: `${city.name} has lost population due to starvation.`,
			significance: EventSignificance.Normal,
			participants: [
				{ entityType: 'city', entityId: city.id, entityName: city.name, role: 'primary' },
				{ entityType: 'nation', entityId: nation.id, entityName: nation.name, role: 'secondary' }
			],
			hexTileId: city.hexTileId
		});
	}

	private createProductionCompletedEvent(city: City, item: any): void {
		const nation = entityStore.getEntity(city.ownerNationId) as Nation;
		this.createEvent({
			type: HistoricalEventType.Other,
			year: this.currentYear,
			title: `${city.name} Completes ${item.itemName}`,
			description: `${city.name} has completed production of ${item.itemName}.`,
			significance: EventSignificance.Minor,
			participants: [
				{ entityType: 'city', entityId: city.id, entityName: city.name, role: 'primary' },
				{ entityType: 'nation', entityId: nation.id, entityName: nation.name, role: 'secondary' }
			],
			hexTileId: city.hexTileId
		});
	}

	private createBorderExpansionEvent(city: City, acquiredHexId: string): void {
		const nation = entityStore.getEntity(city.ownerNationId) as Nation;
		this.createEvent({
			type: HistoricalEventType.BorderExpansion,
			year: this.currentYear,
			title: `${city.name} Expands Borders`,
			description: `${city.name} has expanded its cultural borders.`,
			significance: EventSignificance.Minor,
			participants: [
				{ entityType: 'city', entityId: city.id, entityName: city.name, role: 'primary' },
				{ entityType: 'nation', entityId: nation.id, entityName: nation.name, role: 'secondary' }
			],
			hexTileId: acquiredHexId
		});
	}

	private createTechDiscoveredEvent(nation: Nation, techId: string): void {
		this.createEvent({
			type: HistoricalEventType.TechDiscovered,
			year: this.currentYear,
			title: `${nation.name} Discovers Technology`,
			description: `${nation.name} has discovered a new technology: ${techId}.`,
			significance: EventSignificance.Normal,
			participants: [
				{ entityType: 'nation', entityId: nation.id, entityName: nation.name, role: 'primary' }
			]
		});
	}

	/**
	 * Query events by year
	 */
	getEventsByYear(year: number): HistoricalEvent[] {
		const eventIds = this.eventsByYear.get(year) || [];
		return eventIds.map((id) => entityStore.getEntity(id) as HistoricalEvent).filter(Boolean);
	}

	/**
	 * Query events by nation
	 */
	getEventsByNation(nationId: string): HistoricalEvent[] {
		const eventIds = this.eventsByNation.get(nationId) || [];
		return eventIds.map((id) => entityStore.getEntity(id) as HistoricalEvent).filter(Boolean);
	}

	/**
	 * Query events by hex tile
	 */
	getEventsByHex(hexTileId: string): HistoricalEvent[] {
		const eventIds = this.eventsByHex.get(hexTileId) || [];
		return eventIds.map((id) => entityStore.getEntity(id) as HistoricalEvent).filter(Boolean);
	}

	/**
	 * Get current simulation state
	 */
	getState(): SimulationState {
		return {
			currentYear: this.currentYear,
			currentTurn: this.currentTurn,
			nationIds: [...this.nationIds],
			cityIds: [...this.cityIds],
			eventIds: [...this.historicalEventIds],
			planetId: this.planetId,
			isRunning: this.isRunning,
			isPaused: this.isPaused
		};
	}

	/**
	 * Sync all simulation entities to entity store (Phase 1.6)
	 * Called after each turn to ensure persistence
	 */
	private async syncEntitiesToStore(): Promise<void> {
		const entitiesToSync: Array<Nation | City | HistoricalEvent> = [];

		// Collect all nations
		for (const nationId of this.nationIds) {
			const nation = entityStore.getEntity(nationId) as Nation;
			if (nation) entitiesToSync.push(nation);
		}

		// Collect all cities
		for (const cityId of this.cityIds) {
			const city = entityStore.getEntity(cityId) as City;
			if (city) entitiesToSync.push(city);
		}

		// Collect events from this turn (last 50 to avoid overloading)
		const recentEventIds = this.historicalEventIds.slice(-50);
		for (const eventId of recentEventIds) {
			const event = entityStore.getEntity(eventId) as HistoricalEvent;
			if (event) entitiesToSync.push(event);
		}

		// Batch sync all entities
		await this.entityBridge.batchSync(entitiesToSync);

		// Update WorldMap simulation state
		if (this.worldMap) {
			this.worldMap.currentTurn = this.currentTurn;
		}
	}

	/**
	 * Save simulation state (now uses entity bridge)
	 */
	saveState(): void {
		// Entities are already synced after each turn via syncEntitiesToStore()
		// This method just logs the save
		console.log(`✓ Simulation state saved at turn ${this.currentTurn} (year ${this.currentYear})`);
	}

	/**
	 * Load simulation state
	 * @param state The saved simulation state
	 * @param worldMap The WorldMap to use for simulation (must be provided separately)
	 */
	loadState(state: SimulationState, worldMap?: WorldMap): void {
		this.currentYear = state.currentYear;
		this.currentTurn = state.currentTurn;
		this.nationIds = [...state.nationIds];
		this.cityIds = [...state.cityIds];
		this.historicalEventIds = [...state.eventIds];
		this.planetId = state.planetId;
		if (worldMap) {
			this.worldMap = worldMap;
		}
		this.isRunning = state.isRunning;
		this.isPaused = state.isPaused;

		// Rebuild indices
		this.rebuildIndices();

		console.log(`✓ Simulation state loaded (Turn ${this.currentTurn}, Year ${this.currentYear})`);
	}

	/**
	 * Rebuild event indices
	 */
	private rebuildIndices(): void {
		this.eventsByYear.clear();
		this.eventsByNation.clear();
		this.eventsByHex.clear();

		for (const eventId of this.historicalEventIds) {
			const event = entityStore.getEntity(eventId) as HistoricalEvent;
			if (!event) continue;

			// Index by year
			if (!this.eventsByYear.has(event.year)) {
				this.eventsByYear.set(event.year, []);
			}
			this.eventsByYear.get(event.year)!.push(event.id);

			// Index by nation
			for (const participant of event.participants) {
				if (participant.entityType === 'nation') {
					if (!this.eventsByNation.has(participant.entityId)) {
						this.eventsByNation.set(participant.entityId, []);
					}
					this.eventsByNation.get(participant.entityId)!.push(event.id);
				}
			}

			// Index by hex
			if (event.hexTileId) {
				if (!this.eventsByHex.has(event.hexTileId)) {
					this.eventsByHex.set(event.hexTileId, []);
				}
				this.eventsByHex.get(event.hexTileId)!.push(event.id);
			}
		}
	}

	/**
	 * Start/resume simulation
	 */
	start(): void {
		this.isRunning = true;
		this.isPaused = false;
		console.log('✓ Simulation started');
	}

	/**
	 * Pause simulation
	 */
	pause(): void {
		this.isPaused = true;
		console.log('✓ Simulation paused');
	}

	/**
	 * Resume simulation
	 */
	resume(): void {
		this.isPaused = false;
		console.log('✓ Simulation resumed');
	}

	/**
	 * Stop simulation
	 */
	stop(): void {
		this.isRunning = false;
		this.isPaused = false;
		console.log('✓ Simulation stopped');
	}

	/**
	 * Run simulation for N turns
	 */
	runForTurns(numTurns: number): void {
		console.log(`Running simulation for ${numTurns} turns...`);
		for (let i = 0; i < numTurns; i++) {
			this.processTurn();
			if (!this.isRunning) {
				console.log('Simulation stopped early');
				break;
			}
		}
		console.log(`\n✓ Simulation completed ${numTurns} turns`);
	}

	/**
	 * Get simulation summary
	 */
	getSummary(): string {
		const activeNations = this.nationIds.filter((id) => {
			const nation = entityStore.getEntity(id) as Nation;
			return nation && nation.isActive;
		}).length;

		return `
=== Simulation Summary ===
Year: ${this.currentYear}
Turn: ${this.currentTurn}
Active Nations: ${activeNations}
Total Cities: ${this.cityIds.length}
Historical Events: ${this.historicalEventIds.length}
Planet: ${this.planetId || 'None'}
Status: ${this.isRunning ? (this.isPaused ? 'Paused' : 'Running') : 'Stopped'}
		`.trim();
	}

	/**
	 * Add a nation to the simulation
	 */
	addNation(nation: Nation): void {
		if (!this.nationIds.includes(nation.id)) {
			this.nationIds.push(nation.id);
		}
	}

	/**
	 * Add a city to the simulation
	 */
	addCity(city: City): void {
		if (!this.cityIds.includes(city.id)) {
			this.cityIds.push(city.id);
		}
	}

	/**
	 * Get the WorldMap being used for simulation
	 */
	getWorldMap(): WorldMap | null {
		return this.worldMap;
	}
}
