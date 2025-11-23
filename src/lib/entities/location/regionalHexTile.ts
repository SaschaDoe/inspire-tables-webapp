import { Entity } from '../base/entity';
import { TerrainType } from './terrainType';

/**
 * Resources available in Civilization 5 style
 */
export enum StrategicResource {
	None = 'none',
	Iron = 'iron',
	Horses = 'horses',
	Coal = 'coal',
	Oil = 'oil',
	Aluminum = 'aluminum',
	Uranium = 'uranium'
}

export enum LuxuryResource {
	None = 'none',
	Gold = 'gold',
	Silver = 'silver',
	Gems = 'gems',
	Pearls = 'pearls',
	Silk = 'silk',
	Spices = 'spices',
	Dyes = 'dyes',
	Incense = 'incense',
	Wine = 'wine',
	Cotton = 'cotton',
	Furs = 'furs',
	Ivory = 'ivory'
}

export enum Improvement {
	None = 'none',
	Farm = 'farm',
	Mine = 'mine',
	Plantation = 'plantation',
	Quarry = 'quarry',
	Pasture = 'pasture',
	Camp = 'camp',
	FishingBoats = 'fishingBoats',
	LumberMill = 'lumberMill',
	TradingPost = 'tradingPost',
	Road = 'road',
	Railroad = 'railroad',
	Fort = 'fort',
	Citadel = 'citadel'
}

/**
 * Ownership history entry
 */
export interface OwnershipRecord {
	nationId: string;
	fromYear: number;
	toYear: number | null; // null means current owner
}

/**
 * Discovery record - when a nation first discovered this hex
 */
export interface DiscoveryRecord {
	nationId: string;
	year: number;
}

/**
 * RegionalHexTile - Detailed simulation-level hex tiles
 * Used for the second level of the hierarchical hex map (1 hex ≈ 10-50km)
 *
 * This is where the Civilization 5-style simulation happens:
 * - Nation ownership and borders
 * - Resources (strategic and luxury)
 * - Improvements (farms, mines, roads, etc.)
 * - Cities and units
 * - Battles and historical events
 * - Exploration and discovery
 */
export class RegionalHexTile extends Entity {
	// Grid coordinates in the regional hex map
	x = 0;
	y = 0;

	// Terrain and geography (specific features)
	terrainType: TerrainType = TerrainType.Grass;
	elevation = 0; // Height (0-10 scale)
	feature = ''; // Forest, Jungle, Marsh, Ice, Fallout
	hasRiver = false; // Whether a river flows through or borders this hex
	riverSides: number[] = []; // Which hex sides have rivers (0-5 for hex edges)

	// Resources
	strategicResource: StrategicResource = StrategicResource.None;
	luxuryResource: LuxuryResource = LuxuryResource.None;
	bonusResource = ''; // Wheat, Cattle, Deer, Fish, etc.

	// Improvements and infrastructure
	improvement: Improvement = Improvement.None;
	improvementPillaged = false; // Whether the improvement is damaged
	hasRoad = false;
	hasRailroad = false;

	// Ownership and politics
	ownerNationId?: string; // Current owner nation ID
	ownerCityId?: string; // City controlling this tile
	ownershipHistory: OwnershipRecord[] = []; // Full history of ownership changes

	// Exploration
	discoveredByNations: DiscoveryRecord[] = []; // Which nations have discovered this hex
	visibleToNations: string[] = []; // Which nations can currently see this hex

	// Military and events
	hasCity = false; // Whether a city is located on this hex
	cityId?: string; // ID of the city if present

	hasUnit = false; // Whether any unit is currently on this hex
	unitIds: string[] = []; // IDs of units currently on this hex

	battleSiteIds: string[] = []; // IDs of Battle entities that occurred here
	historicalEventIds: string[] = []; // IDs of HistoricalEvent entities related to this hex

	// Yields (calculated from terrain + feature + improvement)
	yields = {
		food: 0,
		production: 0,
		gold: 0,
		science: 0,
		culture: 0
	};

	// Parent references
	parentRegionalMapId = ''; // ID of the RegionalMap this tile belongs to
	parentPlanetaryHexId = ''; // ID of the PlanetaryHexTile this regional map represents

	// Combat and defense
	defensiveBonus = 0; // Defensive bonus for units on this tile (from terrain/features)
	movementCost = 1; // Movement points required to enter this tile

	// Special features
	isCoastal = false; // Adjacent to water
	isImpassable = false; // Mountains, deep ocean
	canSupportCity = true; // Whether a city can be built here

	constructor() {
		super();
		this.name = `Regional Hex (${this.x}, ${this.y})`;
		this.calculateYields();
		this.calculateDefenseAndMovement();
	}

	/**
	 * Calculate yields based on terrain, feature, and improvement
	 */
	calculateYields(): void {
		// Reset yields
		this.yields = { food: 0, production: 0, gold: 0, science: 0, culture: 0 };

		// Base terrain yields
		switch (this.terrainType) {
			case TerrainType.Grass:
				this.yields.food = 2;
				break;
			case TerrainType.Plains:
				this.yields.food = 1;
				this.yields.production = 1;
				break;
			case TerrainType.Desert:
				// No base yields
				break;
			case TerrainType.Tundra:
				this.yields.food = 1;
				break;
			case TerrainType.Snow:
				// No base yields
				break;
			case TerrainType.Ocean:
				this.yields.food = 1;
				break;
			case TerrainType.Coast:
				this.yields.food = 1;
				this.yields.gold = 1;
				break;
			case TerrainType.Mountain:
				// Mountains don't have yields (impassable)
				this.isImpassable = true;
				this.canSupportCity = false;
				break;
		}

		// Feature modifiers
		if (this.feature === 'Forest') {
			this.yields.production += 1;
			this.yields.food -= 1;
		} else if (this.feature === 'Jungle') {
			this.yields.food += 1;
			this.yields.production -= 1;
		} else if (this.feature === 'Marsh') {
			this.yields.food += 1;
		}

		// Improvement bonuses
		switch (this.improvement) {
			case Improvement.Farm:
				this.yields.food += 1;
				break;
			case Improvement.Mine:
				this.yields.production += 1;
				if (this.strategicResource === StrategicResource.Iron) {
					this.yields.production += 1;
				}
				break;
			case Improvement.Plantation:
				this.yields.food += 1;
				this.yields.gold += 1;
				break;
			case Improvement.Quarry:
				this.yields.production += 1;
				break;
			case Improvement.Pasture:
				this.yields.food += 1;
				break;
			case Improvement.TradingPost:
				this.yields.gold += 1;
				break;
			case Improvement.LumberMill:
				this.yields.production += 1;
				break;
		}

		// River bonus
		if (this.hasRiver) {
			this.yields.gold += 1;
		}
	}

	/**
	 * Calculate defensive bonus and movement cost based on terrain and features
	 */
	calculateDefenseAndMovement(): void {
		this.defensiveBonus = 0;
		this.movementCost = 1;

		// Terrain modifiers
		switch (this.terrainType) {
			case TerrainType.Mountain:
				this.isImpassable = true;
				this.movementCost = 999; // Effectively impassable
				break;
			case TerrainType.Desert:
			case TerrainType.Tundra:
			case TerrainType.Snow:
				this.movementCost = 1;
				break;
			case TerrainType.Plains:
			case TerrainType.Grass:
				this.movementCost = 1;
				break;
			case TerrainType.Ocean:
				this.movementCost = 999; // Impassable without ships
				break;
			case TerrainType.Coast:
				this.movementCost = 1; // For ships
				break;
		}

		// Feature modifiers
		if (this.feature === 'Forest' || this.feature === 'Jungle') {
			this.defensiveBonus = 25;
			this.movementCost = 2;
		} else if (this.feature === 'Marsh') {
			this.defensiveBonus = 10;
			this.movementCost = 2;
		} else if (this.feature === 'Hills') {
			this.defensiveBonus = 25;
			this.movementCost = 2;
		}

		// River crossing penalty
		if (this.hasRiver) {
			// Rivers impose penalties when crossing (handled in combat/movement logic)
		}

		// Improvement modifiers
		if (this.improvement === Improvement.Fort) {
			this.defensiveBonus = 50;
		} else if (this.improvement === Improvement.Citadel) {
			this.defensiveBonus = 100;
		}
	}

	/**
	 * Check if a nation has discovered this hex
	 */
	isDiscoveredBy(nationId: string): boolean {
		return this.discoveredByNations.some(d => d.nationId === nationId);
	}

	/**
	 * Record discovery by a nation
	 */
	discoverBy(nationId: string, year: number): void {
		if (!this.isDiscoveredBy(nationId)) {
			this.discoveredByNations.push({ nationId, year });
		}
	}

	/**
	 * Check if a nation currently owns this hex
	 */
	isOwnedBy(nationId: string): boolean {
		return this.ownerNationId === nationId;
	}

	/**
	 * Change ownership of this hex
	 */
	changeOwnership(newOwnerId: string | undefined, year: number): void {
		// End current ownership record
		if (this.ownerNationId) {
			const currentRecord = this.ownershipHistory.find(
				r => r.nationId === this.ownerNationId && r.toYear === null
			);
			if (currentRecord) {
				currentRecord.toYear = year;
			}
		}

		// Start new ownership record
		if (newOwnerId) {
			this.ownershipHistory.push({
				nationId: newOwnerId,
				fromYear: year,
				toYear: null
			});
		}

		this.ownerNationId = newOwnerId;
	}

	/**
	 * Get ownership history for display
	 */
	getOwnershipHistory(): OwnershipRecord[] {
		return [...this.ownershipHistory];
	}

	/**
	 * Build an improvement on this tile
	 */
	buildImprovement(improvement: Improvement): void {
		this.improvement = improvement;
		this.improvementPillaged = false;
		this.calculateYields();

		// Roads and railroads set flags
		if (improvement === Improvement.Road) {
			this.hasRoad = true;
		} else if (improvement === Improvement.Railroad) {
			this.hasRailroad = true;
			this.hasRoad = true; // Railroads include road functionality
		}
	}

	/**
	 * Pillage the improvement on this tile
	 */
	pillageImprovement(): void {
		if (this.improvement !== Improvement.None) {
			this.improvementPillaged = true;
			this.calculateYields(); // Pillaged improvements don't provide yields
		}
	}

	/**
	 * Repair a pillaged improvement
	 */
	repairImprovement(): void {
		if (this.improvementPillaged) {
			this.improvementPillaged = false;
			this.calculateYields();
		}
	}

	/**
	 * Get a summary label for this regional hex
	 */
	getSummaryLabel(): string {
		const terrainName = TerrainType[this.terrainType] || 'Unknown';
		const featureStr = this.feature ? ` (${this.feature})` : '';
		return `${terrainName}${featureStr} at (${this.x}, ${this.y})`;
	}

	/**
	 * Check if this hex can be worked by a city
	 */
	canBeWorked(): boolean {
		return !this.isImpassable && this.yields.food + this.yields.production + this.yields.gold > 0;
	}
}
