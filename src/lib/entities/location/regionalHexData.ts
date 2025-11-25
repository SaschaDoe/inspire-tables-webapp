import { TerrainType } from './terrainType';
import { StrategicResource, LuxuryResource, Improvement } from './regionalHexTile';

/**
 * Lightweight regional hex data (not an Entity - for embedded use in HexTile)
 * This avoids the overhead of Entity ID generation when creating thousands of regional hexes
 */
export interface RegionalHexData {
	// Grid coordinates in the regional hex map
	x: number;
	y: number;

	// Terrain and geography
	terrainType: TerrainType;
	elevation: number;
	feature: string; // Forest, Jungle, Marsh, Ice, Fallout

	// River
	hasRiver: boolean;
	riverSides: number[]; // Which hex sides have rivers (0-5)

	// Resources
	strategicResource: StrategicResource;
	luxuryResource: LuxuryResource;
	bonusResource: string;

	// Ownership (for simulation)
	ownerNationId?: string;
	ownerCityId?: string;

	// Yields
	yields: {
		food: number;
		production: number;
		gold: number;
		science: number;
		culture: number;
	};

	// Combat and defense
	defensiveBonus: number;
	movementCost: number;
	isImpassable: boolean;
	isCoastal: boolean;
}

/**
 * Create a default regional hex data object
 */
export function createRegionalHexData(x: number, y: number): RegionalHexData {
	return {
		x,
		y,
		terrainType: TerrainType.Grass,
		elevation: 0,
		feature: '',
		hasRiver: false,
		riverSides: [],
		strategicResource: StrategicResource.None,
		luxuryResource: LuxuryResource.None,
		bonusResource: '',
		ownerNationId: undefined,
		ownerCityId: undefined,
		yields: { food: 0, production: 0, gold: 0, science: 0, culture: 0 },
		defensiveBonus: 0,
		movementCost: 1,
		isImpassable: false,
		isCoastal: false
	};
}

/**
 * Calculate yields for a regional hex
 */
export function calculateRegionalYields(hex: RegionalHexData): void {
	// Reset yields
	hex.yields = { food: 0, production: 0, gold: 0, science: 0, culture: 0 };

	// Base terrain yields
	switch (hex.terrainType) {
		case TerrainType.Grass:
			hex.yields.food = 2;
			break;
		case TerrainType.Plains:
			hex.yields.food = 1;
			hex.yields.production = 1;
			break;
		case TerrainType.Desert:
			// No base yields
			break;
		case TerrainType.Tundra:
			hex.yields.food = 1;
			break;
		case TerrainType.Snow:
			// No base yields
			break;
		case TerrainType.Water:
		case TerrainType.Ocean:
			hex.yields.food = 1;
			hex.yields.gold = 1;
			break;
		case TerrainType.Coast:
			hex.yields.food = 1;
			hex.yields.gold = 2; // Coastal waters are good for fishing/trade
			break;
		case TerrainType.Mountain:
		case TerrainType.HighMountain:
		case TerrainType.SnowMountain:
			// Mountains don't have yields (impassable)
			hex.isImpassable = true;
			break;
		case TerrainType.Jungle:
			hex.yields.food = 2;
			break;
		case TerrainType.Hills:
		case TerrainType.GrassHills:
			hex.yields.food = 1;
			hex.yields.production = 1;
			break;
	}

	// Feature modifiers
	if (hex.feature === 'Forest') {
		hex.yields.production += 1;
	} else if (hex.feature === 'Jungle') {
		hex.yields.food += 1;
	} else if (hex.feature === 'Marsh') {
		hex.yields.food += 1;
	}

	// River bonus
	if (hex.hasRiver) {
		hex.yields.gold += 1;
	}
}

/**
 * Calculate defense and movement for a regional hex
 */
export function calculateRegionalDefense(hex: RegionalHexData): void {
	hex.defensiveBonus = 0;
	hex.movementCost = 1;

	// Terrain modifiers
	switch (hex.terrainType) {
		case TerrainType.Mountain:
		case TerrainType.HighMountain:
		case TerrainType.SnowMountain:
			hex.isImpassable = true;
			hex.movementCost = 999;
			break;
		case TerrainType.Water:
		case TerrainType.Ocean:
		case TerrainType.IceFloe:
			hex.movementCost = 999; // Impassable without ships
			break;
		case TerrainType.Coast:
			hex.movementCost = 999; // Impassable without ships, but can embark/disembark
			hex.isCoastal = true;
			break;
		case TerrainType.Hills:
		case TerrainType.GrassHills:
		case TerrainType.JungleHills:
			hex.defensiveBonus = 25;
			hex.movementCost = 2;
			break;
	}

	// Feature modifiers
	if (hex.feature === 'Forest' || hex.feature === 'Jungle') {
		hex.defensiveBonus = 25;
		hex.movementCost = 2;
	} else if (hex.feature === 'Marsh') {
		hex.defensiveBonus = 10;
		hex.movementCost = 2;
	}
}
