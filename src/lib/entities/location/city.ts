import { Entity } from '../base/entity';
import { CityPopulationManager } from '$lib/simulation/managers/CityPopulationManager';
import { CityProductionManager } from '$lib/simulation/managers/CityProductionManager';
import { CityExpansionManager } from '$lib/simulation/managers/CityExpansionManager';

/**
 * Building types available in cities (Civ 5 inspired)
 */
export enum BuildingType {
	// Ancient Era
	Monument = 'monument',
	Granary = 'granary',
	Shrine = 'shrine',
	Barracks = 'barracks',
	Walls = 'walls',
	Library = 'library',

	// Classical Era
	Lighthouse = 'lighthouse',
	Aqueduct = 'aqueduct',
	Market = 'market',
	Temple = 'temple',
	Stable = 'stable',
	Forge = 'forge',

	// Medieval Era
	University = 'university',
	Workshop = 'workshop',
	Castle = 'castle',
	Monastery = 'monastery',

	// Renaissance Era
	Bank = 'bank',
	Theater = 'theater',
	Arsenal = 'arsenal',

	// Industrial Era
	Factory = 'factory',
	Hospital = 'hospital',
	StockExchange = 'stockExchange',
	Museum = 'museum',

	// Modern Era
	Laboratory = 'laboratory',
	Stadium = 'stadium',
	Airport = 'airport',
	BroadcastTower = 'broadcastTower'
}

/**
 * Production queue item
 */
export interface ProductionQueueItem {
	type: 'unit' | 'building' | 'wonder';
	itemId: string; // Unit type ID or Building type ID
	itemName: string;
	productionCost: number;
	productionProgress: number;
	turnsRemaining: number;
}

/**
 * Worked hex tile reference
 */
export interface WorkedHexTile {
	hexTileId: string;
	yields: {
		food: number;
		production: number;
		gold: number;
		science: number;
		culture: number;
	};
}

/**
 * City yields breakdown
 */
export interface CityYields {
	food: number;
	production: number;
	gold: number;
	science: number;
	culture: number;
	foodFromTiles: number;
	productionFromBuildings: number;
	goldFromBuildings: number;
	scienceFromBuildings: number;
	cultureFromBuildings: number;
}

/**
 * City - Settlement entity for the Civilization-style simulation
 *
 * Cities are the core of the simulation:
 * - Generate population through food
 * - Produce units and buildings through production
 * - Generate gold, science, and culture
 * - Work surrounding hex tiles for resources
 * - Can be conquered or razed in war
 */
export class City extends Entity {
	// Basic properties
	name = '';
	description = '';

	// Ownership
	ownerNationId = ''; // ID of the nation that owns this city
	foundedYear = 0; // Year the city was founded
	founderNationId = ''; // Original founding nation (may differ from current owner if conquered)

	// Location
	hexTileId = ''; // ID of the RegionalHexTile where the city is located
	parentRegionalMapId = ''; // ID of the RegionalMap this city is in
	coordinates = { x: 0, y: 0 }; // Coordinates on the regional map

	// Managers (Unciv-inspired separation of concerns)
	populationManager: CityPopulationManager;
	productionManager: CityProductionManager;
	expansionManager: CityExpansionManager;

	// Worked and owned tiles
	workedTileIds: string[] = []; // Tiles being worked by citizens
	lockedTileIds: string[] = []; // Tiles locked by player (prevent auto-assignment)

	// Population and growth (DEPRECATED - use populationManager)
	population = 1; // Current population (1 pop = ~1,000 people)
	foodStored = 0; // Food accumulated toward next population
	foodNeededForGrowth = 10; // Food needed to grow to next population (increases with pop)
	growthRate = 0; // Food per turn after consumption
	isStarving = false; // Whether city has negative food
	starvationTurns = 0; // Turns with negative food (causes population loss)

	// Production
	productionQueue: ProductionQueueItem[] = []; // What the city is building
	currentProduction?: ProductionQueueItem; // Currently building
	productionPerTurn = 0; // Production generated per turn

	// Buildings and infrastructure
	buildings: BuildingType[] = []; // Buildings constructed in this city
	hasWalls = false; // Whether city has defensive walls
	hasCastle = false; // Whether city has a castle
	wonders: string[] = []; // World wonders built in this city

	// Resources and yields
	yields: CityYields = {
		food: 2, // Base yield from city center
		production: 1,
		gold: 0,
		science: 0,
		culture: 0,
		foodFromTiles: 0,
		productionFromBuildings: 0,
		goldFromBuildings: 0,
		scienceFromBuildings: 0,
		cultureFromBuildings: 0
	};

	// Worked tiles
	workedHexTiles: WorkedHexTile[] = []; // Hex tiles being worked by citizens
	cityRadius = 3; // How many tiles away citizens can work (default 3)
	availableWorkTiles: string[] = []; // IDs of hex tiles within work range

	// Combat and defense
	combatStrength = 8; // Base combat strength (like Civ 5 city strength)
	rangedStrength = 0; // Ranged attack strength (0 if no ranged attack)
	hitPoints = 200; // Current HP (max 200 like Civ 5)
	maxHitPoints = 200;
	isUnderSiege = false; // Whether city is being besieged
	garrison: string[] = []; // IDs of units garrisoned in the city

	// Status flags
	isCapital = false; // Whether this is the nation's capital
	isPuppet = false; // Puppet cities (conquered, limited control)
	isBeingRazed = false; // Whether city is being destroyed
	razeTurnsRemaining = 0; // Turns until city is completely razed
	isConnectedToCapital = false; // Whether connected by road/harbor

	// Happiness and culture
	happiness = 0; // Happiness contribution (can be negative)
	cultureAccumulated = 0; // Total culture generated
	cultureBorderExpansion = 0; // Culture needed for next border expansion
	culturalInfluence: Map<string, number> = new Map(); // Cultural pressure from other nations

	// Historical tracking
	historicalEventIds: string[] = []; // Events related to this city
	conquestHistory: Array<{
		conquerorNationId: string;
		year: number;
		razed: boolean;
	}> = [];

	// Specialists (citizens assigned to buildings)
	specialists = {
		scientists: 0, // Assigned to libraries/universities (+science)
		merchants: 0, // Assigned to markets/banks (+gold)
		artists: 0, // Assigned to monuments/theaters (+culture)
		engineers: 0 // Assigned to workshops/factories (+production)
	};

	constructor() {
		super();
		this.name = 'New City';

		// Initialize managers
		this.populationManager = new CityPopulationManager();
		this.productionManager = new CityProductionManager();
		this.expansionManager = new CityExpansionManager(''); // Will be set when city is placed

		// Legacy compatibility
		this.calculateFoodNeededForGrowth();
	}

	/**
	 * Set city location (updates expansion manager)
	 */
	setLocation(hexTileId: string, parentRegionalMapId: string, coordinates: { x: number; y: number }): void {
		this.hexTileId = hexTileId;
		this.parentRegionalMapId = parentRegionalMapId;
		this.coordinates = coordinates;

		// Reinitialize expansion manager with correct center hex
		this.expansionManager = new CityExpansionManager(hexTileId);
	}

	/**
	 * Process one turn for all managers
	 */
	processTurn(currentTurn: number, availableTilesForExpansion: string[] = []): {
		grew: boolean;
		starved: boolean;
		productionCompleted: boolean;
		productionItem?: any;
		expanded: boolean;
		acquiredHexId?: string;
	} {
		// Calculate yields first
		this.calculateYields();

		// Process population
		const foodYield = this.yields.food - this.population * 2; // Food after consumption
		const popResult = this.populationManager.processTurn(foodYield);

		// Sync population back to legacy property
		this.population = this.populationManager.population;
		this.foodStored = this.populationManager.foodStored;
		this.isStarving = this.populationManager.isStarving;

		// Process production
		const prodResult = this.productionManager.processTurn(this.yields.production);

		// Process expansion
		const expResult = this.expansionManager.processTurn(
			this.yields.culture,
			currentTurn,
			availableTilesForExpansion
		);

		return {
			grew: popResult.grew,
			starved: popResult.starved,
			productionCompleted: prodResult.completed,
			productionItem: prodResult.item,
			expanded: expResult.expanded,
			acquiredHexId: expResult.acquiredHexId
		};
	}

	/**
	 * Calculate food needed for next population growth (legacy compatibility)
	 */
	calculateFoodNeededForGrowth(): void {
		// Civ 5 formula: 15 + (8 * (pop - 1))
		this.foodNeededForGrowth = 15 + 8 * (this.population - 1);
	}

	/**
	 * Calculate yields from all sources
	 */
	calculateYields(): void {
		// Reset yields
		this.yields = {
			food: 2, // Base from city center
			production: 1,
			gold: 0,
			science: 0,
			culture: 0,
			foodFromTiles: 0,
			productionFromBuildings: 0,
			goldFromBuildings: 0,
			scienceFromBuildings: 0,
			cultureFromBuildings: 0
		};

		// Add yields from worked tiles
		for (const workedTile of this.workedHexTiles) {
			this.yields.food += workedTile.yields.food;
			this.yields.production += workedTile.yields.production;
			this.yields.gold += workedTile.yields.gold;
			this.yields.science += workedTile.yields.science;
			this.yields.culture += workedTile.yields.culture;
			this.yields.foodFromTiles += workedTile.yields.food;
		}

		// Add yields from buildings
		this.addBuildingYields();

		// Add specialist yields
		this.yields.science += this.specialists.scientists * 3;
		this.yields.gold += this.specialists.merchants * 3;
		this.yields.culture += this.specialists.artists * 3;
		this.yields.production += this.specialists.engineers * 2;

		// Calculate growth rate (food - consumption)
		const foodConsumption = this.population * 2; // Each pop consumes 2 food
		this.growthRate = this.yields.food - foodConsumption;
		this.isStarving = this.growthRate < 0;

		// Set production per turn
		this.productionPerTurn = this.yields.production;
	}

	/**
	 * Add yields from buildings
	 */
	private addBuildingYields(): void {
		for (const building of this.buildings) {
			switch (building) {
				case BuildingType.Granary:
					this.yields.food += 2;
					break;
				case BuildingType.Library:
					this.yields.science += 2;
					this.yields.scienceFromBuildings += 2;
					break;
				case BuildingType.Market:
					this.yields.gold += 2;
					this.yields.goldFromBuildings += 2;
					break;
				case BuildingType.Monument:
					this.yields.culture += 2;
					this.yields.cultureFromBuildings += 2;
					break;
				case BuildingType.Workshop:
					this.yields.production += 2;
					this.yields.productionFromBuildings += 2;
					break;
				case BuildingType.University:
					this.yields.science += 5;
					this.yields.scienceFromBuildings += 5;
					break;
				case BuildingType.Factory:
					this.yields.production += 4;
					this.yields.productionFromBuildings += 4;
					break;
				case BuildingType.Bank:
					this.yields.gold += 3;
					this.yields.goldFromBuildings += 3;
					break;
				case BuildingType.Theater:
					this.yields.culture += 3;
					this.yields.cultureFromBuildings += 3;
					break;
				case BuildingType.Hospital:
					this.yields.food += 3;
					break;
				case BuildingType.Laboratory:
					this.yields.science += 7;
					this.yields.scienceFromBuildings += 7;
					break;
				// Add more buildings as needed
			}

			// Set defensive flags
			if (building === BuildingType.Walls) {
				this.hasWalls = true;
			} else if (building === BuildingType.Castle) {
				this.hasCastle = true;
			}
		}
	}

	/**
	 * Calculate combat strength based on buildings, garrison, and HP
	 */
	calculateCombatStrength(): void {
		let strength = 8; // Base strength

		// Add strength from buildings
		if (this.hasWalls) {
			strength += 5;
		}
		if (this.hasCastle) {
			strength += 7;
		}

		// Add strength from garrison (simplified)
		strength += this.garrison.length * 3;

		// Reduce strength based on damage
		const hpRatio = this.hitPoints / this.maxHitPoints;
		strength = Math.floor(strength * (0.5 + 0.5 * hpRatio));

		this.combatStrength = strength;

		// Ranged strength (if city has walls)
		if (this.hasWalls) {
			this.rangedStrength = this.combatStrength;
		}
	}

	/**
	 * Add a building to the city
	 */
	addBuilding(building: BuildingType): void {
		if (!this.buildings.includes(building)) {
			this.buildings.push(building);
			this.calculateYields();
			this.calculateCombatStrength();
		}
	}

	/**
	 * Check if city has a specific building
	 */
	hasBuilding(building: BuildingType): boolean {
		return this.buildings.includes(building);
	}

	/**
	 * Add a production item to the queue
	 */
	addToProductionQueue(
		type: 'unit' | 'building' | 'wonder',
		itemId: string,
		itemName: string,
		productionCost: number
	): void {
		const turnsRemaining = Math.ceil(productionCost / Math.max(1, this.productionPerTurn));

		this.productionQueue.push({
			type,
			itemId,
			itemName,
			productionCost,
			productionProgress: 0,
			turnsRemaining
		});

		// If nothing is being produced, start this item
		if (!this.currentProduction) {
			this.currentProduction = this.productionQueue[0];
		}
	}

	/**
	 * Process one turn of production
	 */
	processProduction(): { completed: boolean; item?: ProductionQueueItem } {
		if (!this.currentProduction) {
			return { completed: false };
		}

		// Add production
		this.currentProduction.productionProgress += this.productionPerTurn;

		// Update turns remaining
		const remaining = this.currentProduction.productionCost - this.currentProduction.productionProgress;
		this.currentProduction.turnsRemaining = Math.ceil(remaining / Math.max(1, this.productionPerTurn));

		// Check if completed
		if (this.currentProduction.productionProgress >= this.currentProduction.productionCost) {
			const completedItem = this.currentProduction;

			// Remove from queue
			this.productionQueue.shift();

			// Start next item if available
			this.currentProduction = this.productionQueue.length > 0 ? this.productionQueue[0] : undefined;

			return { completed: true, item: completedItem };
		}

		return { completed: false };
	}

	/**
	 * Process one turn of growth
	 */
	processGrowth(): { grew: boolean; starved: boolean } {
		this.foodStored += this.growthRate;

		// Check for growth
		if (this.foodStored >= this.foodNeededForGrowth) {
			this.population++;
			this.foodStored = 0;
			this.calculateFoodNeededForGrowth();
			this.calculateYields();
			return { grew: true, starved: false };
		}

		// Check for starvation
		if (this.isStarving) {
			this.starvationTurns++;
			this.foodStored = Math.max(0, this.foodStored); // Can't go below 0

			// Lose population after 3 turns of starvation
			if (this.starvationTurns >= 3 && this.population > 1) {
				this.population--;
				this.starvationTurns = 0;
				this.calculateFoodNeededForGrowth();
				this.calculateYields();
				return { grew: false, starved: true };
			}
		} else {
			this.starvationTurns = 0;
		}

		return { grew: false, starved: false };
	}

	/**
	 * Conquer this city (change ownership)
	 */
	conquer(conquerorNationId: string, year: number, raze = false): void {
		// Record conquest in history
		this.conquestHistory.push({
			conquerorNationId,
			year,
			razed: raze
		});

		// Change ownership
		this.ownerNationId = conquerorNationId;

		if (raze) {
			// Start razing the city
			this.isBeingRazed = true;
			this.razeTurnsRemaining = this.population * 2; // Takes 2 turns per population to raze
		} else {
			// City becomes a puppet initially
			this.isPuppet = true;
			this.isCapital = false;

			// Reduce population by 20% (war damage)
			this.population = Math.max(1, Math.floor(this.population * 0.8));
			this.calculateFoodNeededForGrowth();
			this.calculateYields();
		}

		// Damage city
		this.hitPoints = Math.floor(this.maxHitPoints * 0.5);
		this.calculateCombatStrength();
	}

	/**
	 * Process razing (one turn)
	 */
	processRazing(): boolean {
		if (!this.isBeingRazed) return false;

		this.razeTurnsRemaining--;

		// Lose population
		if (this.razeTurnsRemaining % 2 === 0) {
			this.population = Math.max(0, this.population - 1);
		}

		// Check if city is completely razed
		return this.razeTurnsRemaining <= 0 || this.population === 0;
	}

	/**
	 * Annex a puppet city (convert from puppet to full control)
	 */
	annex(): void {
		this.isPuppet = false;
	}

	/**
	 * Heal the city (restore HP)
	 */
	heal(amount: number): void {
		this.hitPoints = Math.min(this.maxHitPoints, this.hitPoints + amount);
		this.calculateCombatStrength();
	}

	/**
	 * Damage the city
	 */
	takeDamage(amount: number): void {
		this.hitPoints = Math.max(0, this.hitPoints - amount);
		this.calculateCombatStrength();
	}

	/**
	 * Get a summary of this city
	 */
	getSummary(): string {
		const popStr = `Pop: ${this.population}`;
		const yieldStr = `+${this.yields.food}F +${this.yields.production}P +${this.yields.gold}G`;
		const statusFlags: string[] = [];

		if (this.isCapital) statusFlags.push('Capital');
		if (this.isPuppet) statusFlags.push('Puppet');
		if (this.isBeingRazed) statusFlags.push('Razing');
		if (this.isUnderSiege) statusFlags.push('Besieged');

		const status = statusFlags.length > 0 ? ` [${statusFlags.join(', ')}]` : '';

		return `${this.name}: ${popStr}, ${yieldStr}${status}`;
	}

	/**
	 * Get population in thousands
	 */
	getTotalPopulation(): number {
		return this.population * 1000;
	}
}
