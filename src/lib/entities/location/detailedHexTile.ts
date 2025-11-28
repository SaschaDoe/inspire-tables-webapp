import { TerrainType } from './terrainType';

/**
 * Resource types for strategic resources (iron, horses, oil, etc.)
 */
export enum StrategicResource {
	None = 'None',
	Iron = 'Iron',
	Horses = 'Horses',
	Coal = 'Coal',
	Oil = 'Oil',
	Aluminum = 'Aluminum',
	Uranium = 'Uranium'
}

/**
 * Resource types for luxury resources
 */
export enum LuxuryResource {
	None = 'None',
	Gold = 'Gold',
	Silver = 'Silver',
	Gems = 'Gems',
	Marble = 'Marble',
	Ivory = 'Ivory',
	Furs = 'Furs',
	Dyes = 'Dyes',
	Spices = 'Spices',
	Silk = 'Silk',
	Sugar = 'Sugar',
	Cotton = 'Cotton',
	Wine = 'Wine',
	Incense = 'Incense',
	Salt = 'Salt',
	Copper = 'Copper',
	Pearls = 'Pearls',
	Whales = 'Whales',
	Citrus = 'Citrus',
	Truffles = 'Truffles',
	Cocoa = 'Cocoa',
	Coffee = 'Coffee'
}

/**
 * Tile improvement types
 */
export enum TileImprovement {
	None = 'None',
	Farm = 'Farm',
	Mine = 'Mine',
	Plantation = 'Plantation',
	Camp = 'Camp',
	Pasture = 'Pasture',
	Quarry = 'Quarry',
	FishingBoats = 'FishingBoats',
	OilWell = 'OilWell',
	LumberMill = 'LumberMill',
	TradingPost = 'TradingPost',
	Fort = 'Fort',
	Citadel = 'Citadel',
	Road = 'Road',
	Railroad = 'Railroad'
}

/**
 * Tile yields structure
 */
export interface TileYields {
	food: number;
	production: number;
	gold: number;
	science: number;
	culture: number;
	faith: number;
}

/**
 * DetailedHexTile - The simulation-level hex tile entity
 *
 * This is the granular tile used for Unciv-style simulation.
 * Each GeneralHexTile contains a grid of DetailedHexTiles.
 *
 * Uses deterministic IDs based on coordinates to avoid ID counter explosion
 * when generating thousands of tiles.
 */
export class DetailedHexTile {
	// Entity-like properties (deterministic ID)
	id: string;
	name: string = '';
	description: string = '';

	// Global coordinates (unique across entire map)
	globalX: number;
	globalY: number;

	// Local coordinates within parent GeneralHexTile
	localX: number;
	localY: number;

	// Parent reference
	parentGeneralHexId: string;
	planetId: string;

	// Terrain properties
	terrainType: TerrainType;
	elevation: number;
	feature: string; // Forest, Jungle, Marsh, Ice, Fallout, Oasis

	// River properties
	hasRiver: boolean;
	riverSides: number[]; // Which hex sides (0-5) have rivers

	// Resources
	strategicResource: StrategicResource;
	luxuryResource: LuxuryResource;
	bonusResource: string; // Wheat, Cattle, Fish, etc.

	// Ownership (simulation)
	ownerNationId: string | null;
	ownerCityId: string | null;
	isWorked: boolean; // Is a citizen working this tile?

	// Yields
	yields: TileYields;

	// Improvements
	improvement: TileImprovement;
	improvementProgress: number; // 0-100, for building improvements
	pillaged: boolean;

	// Roads
	hasRoad: boolean;
	hasRailroad: boolean;

	// Units (references to unit entity IDs)
	unitIds: string[];

	// Combat properties
	defensiveBonus: number;
	movementCost: number;
	isImpassable: boolean;
	isCoastal: boolean;

	// Visibility (fog of war per nation)
	visibleToNations: Set<string>;
	exploredByNations: Set<string>;

	// Special flags
	isCityCenter: boolean;
	isCapital: boolean;

	constructor(
		planetId: string,
		parentGeneralHexId: string,
		globalX: number,
		globalY: number,
		localX: number,
		localY: number
	) {
		// Deterministic ID based on coordinates
		this.id = `detailed-${planetId}-${globalX}-${globalY}`;
		this.planetId = planetId;
		this.parentGeneralHexId = parentGeneralHexId;
		this.globalX = globalX;
		this.globalY = globalY;
		this.localX = localX;
		this.localY = localY;

		// Default values
		this.terrainType = TerrainType.Grass;
		this.elevation = 0;
		this.feature = '';

		this.hasRiver = false;
		this.riverSides = [];

		this.strategicResource = StrategicResource.None;
		this.luxuryResource = LuxuryResource.None;
		this.bonusResource = '';

		this.ownerNationId = null;
		this.ownerCityId = null;
		this.isWorked = false;

		this.yields = {
			food: 0,
			production: 0,
			gold: 0,
			science: 0,
			culture: 0,
			faith: 0
		};

		this.improvement = TileImprovement.None;
		this.improvementProgress = 0;
		this.pillaged = false;

		this.hasRoad = false;
		this.hasRailroad = false;

		this.unitIds = [];

		this.defensiveBonus = 0;
		this.movementCost = 1;
		this.isImpassable = false;
		this.isCoastal = false;

		this.visibleToNations = new Set();
		this.exploredByNations = new Set();

		this.isCityCenter = false;
		this.isCapital = false;
	}

	/**
	 * Calculate tile yields based on terrain, features, improvements, and resources
	 */
	calculateYields(): void {
		// Reset yields
		this.yields = { food: 0, production: 0, gold: 0, science: 0, culture: 0, faith: 0 };

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
				// No base yields (unless oasis)
				break;
			case TerrainType.Tundra:
				this.yields.food = 1;
				break;
			case TerrainType.Snow:
				// No base yields
				break;
			case TerrainType.Water:
			case TerrainType.Ocean:
				this.yields.food = 1;
				this.yields.gold = 1;
				break;
			case TerrainType.Coast:
				this.yields.food = 1;
				this.yields.gold = 2;
				break;
			case TerrainType.Hills:
			case TerrainType.GrassHills:
				this.yields.food = 1;
				this.yields.production = 2;
				break;
			case TerrainType.Mountain:
			case TerrainType.HighMountain:
			case TerrainType.SnowMountain:
				// Mountains have no yields and are impassable
				this.isImpassable = true;
				break;
			case TerrainType.Jungle:
				this.yields.food = 2;
				break;
		}

		// Feature modifiers
		if (this.feature === 'Forest') {
			this.yields.production += 1;
		} else if (this.feature === 'Jungle') {
			this.yields.food += 1;
			this.yields.production -= 1; // Jungle slows production
		} else if (this.feature === 'Marsh') {
			this.yields.food += 1;
		} else if (this.feature === 'Oasis') {
			this.yields.food += 3;
			this.yields.gold += 1;
		}

		// River bonus
		if (this.hasRiver) {
			this.yields.gold += 1;
		}

		// Improvement modifiers
		if (!this.pillaged) {
			switch (this.improvement) {
				case TileImprovement.Farm:
					this.yields.food += 1;
					break;
				case TileImprovement.Mine:
					this.yields.production += 1;
					break;
				case TileImprovement.TradingPost:
					this.yields.gold += 1;
					break;
				case TileImprovement.LumberMill:
					this.yields.production += 1;
					break;
			}
		}

		// Resource bonuses would go here
		// (Strategic, Luxury, and Bonus resources modify yields)
	}

	/**
	 * Calculate defense and movement properties
	 */
	calculateDefense(): void {
		this.defensiveBonus = 0;
		this.movementCost = 1;

		// Terrain modifiers
		switch (this.terrainType) {
			case TerrainType.Mountain:
			case TerrainType.HighMountain:
			case TerrainType.SnowMountain:
				this.isImpassable = true;
				this.movementCost = 999;
				break;
			case TerrainType.Water:
			case TerrainType.Ocean:
			case TerrainType.IceFloe:
				this.movementCost = 999; // Requires ships
				break;
			case TerrainType.Coast:
				this.movementCost = 999; // Requires ships
				this.isCoastal = true;
				break;
			case TerrainType.Hills:
			case TerrainType.GrassHills:
			case TerrainType.JungleHills:
				this.defensiveBonus = 25;
				this.movementCost = 2;
				break;
		}

		// Feature modifiers
		if (this.feature === 'Forest' || this.feature === 'Jungle') {
			this.defensiveBonus = Math.max(this.defensiveBonus, 25);
			this.movementCost = Math.max(this.movementCost, 2);
		} else if (this.feature === 'Marsh') {
			this.defensiveBonus = Math.max(this.defensiveBonus, 10);
			this.movementCost = Math.max(this.movementCost, 2);
		}

		// Improvement modifiers
		if (this.improvement === TileImprovement.Fort && !this.pillaged) {
			this.defensiveBonus += 50;
		} else if (this.improvement === TileImprovement.Citadel && !this.pillaged) {
			this.defensiveBonus += 100;
		}

		// Road reduces movement cost to 0.5 (for friendly units)
		// Railroad reduces it further
		// This is handled in movement calculation, not here
	}

	/**
	 * Check if this tile can have a specific improvement built
	 */
	canBuildImprovement(improvement: TileImprovement): boolean {
		if (this.isImpassable) return false;
		if (this.isCityCenter) return false;

		switch (improvement) {
			case TileImprovement.Farm:
				// Can build on grass, plains, desert (with river), floodplains
				return [TerrainType.Grass, TerrainType.Plains].includes(this.terrainType) ||
					(this.terrainType === TerrainType.Desert && this.hasRiver);
			case TileImprovement.Mine:
				// Can build on hills
				return [TerrainType.Hills, TerrainType.GrassHills, TerrainType.JungleHills].includes(this.terrainType);
			case TileImprovement.LumberMill:
				return this.feature === 'Forest';
			case TileImprovement.Plantation:
				return this.feature === 'Jungle' || this.luxuryResource !== LuxuryResource.None;
			case TileImprovement.Camp:
				return this.feature === 'Forest' || this.bonusResource === 'Deer';
			case TileImprovement.Pasture:
				return this.bonusResource === 'Cattle' || this.bonusResource === 'Sheep' ||
					this.strategicResource === StrategicResource.Horses;
			default:
				return true;
		}
	}

	/**
	 * Get the key for Map storage
	 */
	static getKey(globalX: number, globalY: number): string {
		return `${globalX},${globalY}`;
	}

	/**
	 * Get this tile's key
	 */
	getKey(): string {
		return DetailedHexTile.getKey(this.globalX, this.globalY);
	}
}

/**
 * Create a DetailedHexTile from legacy RegionalHexData
 */
export function createDetailedHexTileFromData(
	planetId: string,
	parentGeneralHexId: string,
	generalX: number,
	generalY: number,
	localX: number,
	localY: number,
	gridSize: number,
	data: {
		terrainType: TerrainType;
		elevation: number;
		feature: string;
		hasRiver: boolean;
		riverSides: number[];
		strategicResource?: StrategicResource;
		luxuryResource?: LuxuryResource;
		bonusResource?: string;
		yields?: TileYields;
		defensiveBonus?: number;
		movementCost?: number;
		isImpassable?: boolean;
		isCoastal?: boolean;
	}
): DetailedHexTile {
	const globalX = generalX * gridSize + localX;
	const globalY = generalY * gridSize + localY;

	const tile = new DetailedHexTile(
		planetId,
		parentGeneralHexId,
		globalX,
		globalY,
		localX,
		localY
	);

	tile.terrainType = data.terrainType;
	tile.elevation = data.elevation;
	tile.feature = data.feature;
	tile.hasRiver = data.hasRiver;
	tile.riverSides = [...data.riverSides];
	tile.strategicResource = data.strategicResource ?? StrategicResource.None;
	tile.luxuryResource = data.luxuryResource ?? LuxuryResource.None;
	tile.bonusResource = data.bonusResource ?? '';

	if (data.yields) {
		tile.yields = { ...data.yields, faith: 0 };
	}
	if (data.defensiveBonus !== undefined) tile.defensiveBonus = data.defensiveBonus;
	if (data.movementCost !== undefined) tile.movementCost = data.movementCost;
	if (data.isImpassable !== undefined) tile.isImpassable = data.isImpassable;
	if (data.isCoastal !== undefined) tile.isCoastal = data.isCoastal;

	return tile;
}
