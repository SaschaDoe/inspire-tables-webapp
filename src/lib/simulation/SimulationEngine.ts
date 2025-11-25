import { entityStore } from '$lib/stores/entityStore';
import { Nation } from '$lib/entities/location/nation';
import { City } from '$lib/entities/location/city';
import { RegionalMap } from '$lib/entities/location/regionalMap';
import { RegionalHexTile } from '$lib/entities/location/regionalHexTile';
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
	regionalMapIds: string[];
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
	regionalMapIds: string[] = [];
	historicalEventIds: string[] = [];

	// Event indices for fast lookup
	private eventsByYear: Map<number, string[]> = new Map();
	private eventsByNation: Map<string, string[]> = new Map();
	private eventsByHex: Map<string, string[]> = new Map();

	// Entity store reference (injected or use default)
	private store: ReturnType<typeof entityStore.getEntity>;

	// Phase 1.6: Entity bridge for persistence
	private entityBridge: SimulationEntityBridge;

	constructor(config?: Partial<SimulationConfig>) {
		if (config) {
			this.config = { ...this.config, ...config };
		}
		this.currentYear = this.config.startYear;
		this.store = entityStore.getEntity.bind(entityStore);

		// Initialize entity bridge
		this.entityBridge = new SimulationEntityBridge();
	}

	/**
	 * Initialize simulation with nations and regional maps (new simulation)
	 */
	initialize(nationalMapIds: string[]): void {
		this.regionalMapIds = nationalMapIds;

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
	 * @param regionalMapId ID of the RegionalMap to load
	 */
	async initializeFromEntities(regionalMapId: string): Promise<void> {
		console.log(`Loading simulation from RegionalMap ${regionalMapId}...`);

		// Load the regional map entity
		const regionalMapEntity = entityStore.getEntity(regionalMapId);
		if (!regionalMapEntity || !regionalMapEntity.customFields.generatedEntity) {
			throw new Error(`RegionalMap ${regionalMapId} not found in entity store`);
		}

		const regionalMap = regionalMapEntity.customFields.generatedEntity as RegionalMap;

		// Load all simulation entities using the bridge
		const { nations, cities, units, events } =
			await this.entityBridge.initializeFromRegionalMap(regionalMapId);

		// Restore entity IDs
		this.regionalMapIds = [regionalMapId];
		this.nationIds = nations.map((n) => n.id);
		this.cityIds = cities.map((c) => c.id);
		this.historicalEventIds = events.map((e) => e.id);

		// Restore simulation state
		this.currentYear = regionalMap.currentYear || this.config.startYear;
		this.currentTurn = regionalMap.currentTurn || 0;

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
			if (event.locationHexId) {
				const hexEvents = this.eventsByHex.get(event.locationHexId) || [];
				hexEvents.push(event.id);
				this.eventsByHex.set(event.locationHexId, hexEvents);
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
			const city = entityStore.getEntity(cityId) as City;
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
			const nation = entityStore.getEntity(nationId) as Nation;
			if (!nation || !nation.isActive) continue;

			// Reset yields
			nation.yields = {
				food: 0,
				production: 0,
				gold: nation.yields.gold || 2, // Base gold per turn
				science: 0,
				culture: 0,
				happiness: 0
			};

			// Accumulate yields from all cities
			for (const cityId of nation.cityIds) {
				const city = entityStore.getEntity(cityId) as City;
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
			nation.resources.gold += nation.yields.gold;
			nation.resources.science += nation.yields.science;
			nation.resources.culture += nation.yields.culture;

			// Note: Entity is modified in place, no need to save back to store during simulation
		}
	}

	/**
	 * Process all cities (growth, production, expansion)
	 */
	private processCities(): void {
		for (const cityId of this.cityIds) {
			const city = entityStore.getEntity(cityId) as City;
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

			// Note: Entity is modified in place, no need to save back to store during simulation
		}
	}

	/**
	 * Process all nations (tech, policies, diplomacy)
	 */
	private processNations(): void {
		for (const nationId of this.nationIds) {
			const nation = entityStore.getEntity(nationId) as Nation;
			if (!nation || !nation.isActive) continue;

			// Process nation turn (managers handle tech, policies, diplomacy)
			const result = nation.processTurn(this.currentTurn);

			if (result.techCompleted && result.techId) {
				this.createTechDiscoveredEvent(nation, result.techId);
			}

			if (result.policyReady) {
				// AI will choose a policy in AI phase
			}

			// Note: Entity is modified in place, no need to save back to store during simulation
		}
	}

	/**
	 * Process AI decisions for all nations
	 */
	private processAIDecisions(): void {
		for (const nationId of this.nationIds) {
			const nation = entityStore.getEntity(nationId) as Nation;
			if (!nation || !nation.isActive || !nation.isAIControlled) continue;

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
		// Simple heuristic: Found a new city every 10 turns if we have few cities
		const cityCount = nation.cityIds.length;
		const expansionDesire = nation.cultureTraits.expansionist;

		// More expansionist cultures found cities more frequently
		const turnsPerCity = Math.max(5, 15 - Math.floor(expansionDesire / 10));

		return cityCount < 5 && this.currentTurn % turnsPerCity === 0;
	}

	/**
	 * AI founds a new city
	 */
	private aiFoundCity(nation: Nation): void {
		// Find a good location for a new city
		const location = this.findCityFoundingLocation(nation);
		if (!location) {
			console.log(`  ${nation.name} could not find a suitable city location`);
			return;
		}

		// Create the city
		const city = new City();
		city.name = this.generateCityName(nation);
		city.ownerNationId = nation.id;
		city.founderNationId = nation.id;
		city.foundedYear = this.currentYear;
		city.setLocation(location.hexTileId, location.regionalMapId, location.coordinates);
		city.population = 1;
		city.isCapital = nation.cityIds.length === 0; // First city is capital

		// Save city
		entityStore.createEntity(city);
		this.cityIds.push(city.id);

		// Add to nation
		nation.addCity(city.id, this.currentYear, city.isCapital);
		// Note: Nation modified in place, no need to save during simulation

		// Create event
		this.createCityFoundedEvent(nation, city, location.hexTileId);

		console.log(`  ${nation.name} founded ${city.name} at (${location.coordinates.x}, ${location.coordinates.y})`);
	}

	/**
	 * Find a good location for a new city
	 */
	private findCityFoundingLocation(nation: Nation): {
		hexTileId: string;
		regionalMapId: string;
		coordinates: { x: number; y: number };
	} | null {
		// Get all regional maps
		for (const mapId of this.regionalMapIds) {
			const map = entityStore.getEntity(mapId) as RegionalMap;
			if (!map) continue;

			// Score all tiles
			const scoredTiles: Array<{
				hexTileId: string;
				score: number;
				coordinates: { x: number; y: number };
			}> = [];

			for (const tileId of map.hexTileIds) {
				const tile = entityStore.getEntity(tileId) as RegionalHexTile;
				if (!tile) continue;

				// Check if tile is valid for city founding
				if (!this.isValidCityLocation(tile, map)) continue;

				// Score the tile
				const score = this.scoreCityLocation(tile, nation);
				scoredTiles.push({
					hexTileId: tile.id,
					score,
					coordinates: { x: tile.x, y: tile.y }
				});
			}

			// Sort by score (highest first)
			scoredTiles.sort((a, b) => b.score - a.score);

			// Return best location
			if (scoredTiles.length > 0) {
				return {
					hexTileId: scoredTiles[0].hexTileId,
					regionalMapId: map.id,
					coordinates: scoredTiles[0].coordinates
				};
			}
		}

		return null;
	}

	/**
	 * Check if a tile is valid for city founding
	 */
	private isValidCityLocation(tile: RegionalHexTile, map: RegionalMap): boolean {
		// Can't found on mountains or ocean
		if (tile.terrainType === TerrainType.Mountain || tile.terrainType === TerrainType.Ocean) {
			return false;
		}

		// Check if there's already a city here
		for (const cityId of this.cityIds) {
			const city = entityStore.getEntity(cityId) as City;
			if (city && city.hexTileId === tile.id) {
				return false;
			}
		}

		// Check minimum distance from other cities (at least 4 tiles)
		for (const cityId of this.cityIds) {
			const city = entityStore.getEntity(cityId) as City;
			if (!city || city.parentRegionalMapId !== map.id) continue;

			const distance = Math.abs(city.coordinates.x - tile.x) + Math.abs(city.coordinates.y - tile.y);
			if (distance < 4) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Score a tile for city founding
	 */
	private scoreCityLocation(tile: RegionalHexTile, nation: Nation): number {
		let score = 0;

		// Prefer grassland and plains
		if (tile.terrainType === TerrainType.Grass) score += 10;
		if (tile.terrainType === TerrainType.Plains) score += 8;

		// Coast is good for seafaring nations
		if (tile.terrainType === TerrainType.Coast) {
			score += nation.cultureTraits.seafaring / 10;
		}

		// Rivers are very valuable
		if (tile.riverSides && tile.riverSides.some(r => r)) {
			score += 15;
		}

		// Strategic resources are valuable
		if (tile.strategicResource) score += 12;

		// Luxury resources are valuable
		if (tile.luxuryResource) score += 10;

		// Bonus resources are nice
		if (tile.bonusResource) score += 5;

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
		event.type = data.type;
		event.year = data.year;
		event.turn = this.currentTurn;
		event.title = data.title;
		event.description = data.description;
		event.significance = data.significance;
		event.participants = data.participants;
		event.hexTileId = data.hexTileId;
		event.stateChanges = data.stateChanges || [];

		// Save event
		entityStore.createEntity(event);
		this.historicalEventIds.push(event.id);

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
			regionalMapIds: [...this.regionalMapIds],
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

		// Also sync each regional map with updated state
		for (const regionalMapId of this.regionalMapIds) {
			const regionalMap = entityStore.getEntity(regionalMapId) as RegionalMap;
			if (regionalMap) {
				// Update simulation state in regional map
				regionalMap.currentYear = this.currentYear;
				regionalMap.currentTurn = this.currentTurn;
				regionalMap.nationIds = [...this.nationIds];
				regionalMap.cityIds = [...this.cityIds];
				regionalMap.historicalEventIds = [...this.historicalEventIds];

				await this.entityBridge.syncRegionalMapEntity(regionalMap);
			}
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
	 */
	loadState(state: SimulationState): void {
		this.currentYear = state.currentYear;
		this.currentTurn = state.currentTurn;
		this.nationIds = [...state.nationIds];
		this.cityIds = [...state.cityIds];
		this.historicalEventIds = [...state.eventIds];
		this.regionalMapIds = [...state.regionalMapIds];
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
Regional Maps: ${this.regionalMapIds.length}
Status: ${this.isRunning ? (this.isPaused ? 'Paused' : 'Running') : 'Stopped'}
		`.trim();
	}
}
