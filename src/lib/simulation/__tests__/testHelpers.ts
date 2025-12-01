/**
 * Test Helpers and Data Builders
 *
 * Provides factory functions for creating test data
 */

import { Nation, Era, type CultureTraits } from '$lib/entities/location/nation';
import { City } from '$lib/entities/location/city';
import { WorldMap } from '$lib/entities/location/worldMap';
import { DetailedHexTile, type TileYields } from '$lib/entities/location/detailedHexTile';
import { TerrainType } from '$lib/entities/location/terrainType';
import { MockEntityStore } from '../interfaces/IEntityStore';
import { BasicAIController } from '../ai/BasicAIController';

/**
 * Create a test nation with sensible defaults
 */
export function createTestNation(overrides?: Partial<Nation>): Nation {
	const nation = new Nation();
	nation.name = 'Test Nation';
	nation.adjective = 'Test';
	nation.culturalIdentity = 'Test Culture';
	nation.race = 'Human';
	nation.foundingYear = -10000;
	nation.leaderName = 'Test Leader';
	nation.leaderTitle = 'Chief';
	nation.governmentType = 'Tribal';
	nation.currentEra = Era.Ancient;
	nation.isAIControlled = true;
	nation.isActive = true;
	nation.cultureTraits = {
		militaristic: 50,
		expansionist: 50,
		commercial: 50,
		scientific: 50,
		seafaring: 50,
		diplomatic: 50
	};
	nation.yields = {
		food: 0,
		production: 0,
		gold: 2,
		science: 0,
		culture: 0,
		happiness: 0
	};
	nation.cityIds = [];

	// Apply overrides
	if (overrides) {
		Object.assign(nation, overrides);
	}

	return nation;
}

/**
 * Create a test city with sensible defaults
 */
export function createTestCity(overrides?: Partial<City>): City {
	const city = new City();
	city.name = 'Test City';
	city.ownerNationId = 'test-nation';
	city.founderNationId = 'test-nation';
	city.foundedYear = -10000;
	city.hexTileId = 'test-hex';
	city.parentPlanetId = 'test-planet';
	city.coordinates = { x: 5, y: 5 };
	city.population = 1;
	city.foodStored = 0;
	city.isCapital = false;
	city.yields = {
		food: 2,
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

	// Apply overrides
	if (overrides) {
		Object.assign(city, overrides);
	}

	return city;
}

/**
 * Create a test world map
 */
export function createTestMap(width: number = 10, height: number = 10): WorldMap {
	const map = new WorldMap();
	map.width = width;
	map.height = height;
	map.detailedWidth = width;
	map.detailedHeight = height;
	map.gridSize = 1; // For testing, 1:1 ratio

	return map;
}

/**
 * Create a test hex tile
 */
export function createTestTile(
	x: number = 0,
	y: number = 0,
	terrain: TerrainType = TerrainType.Grass
): DetailedHexTile {
	const tile = new DetailedHexTile('test-planet', 'test-general', x, y, x, y);
	tile.terrainType = terrain;
	tile.yields = getDefaultYieldsForTerrain(terrain);
	tile.riverSides = [];

	return tile;
}

/**
 * Get default yields for terrain type
 */
function getDefaultYieldsForTerrain(terrain: TerrainType): TileYields {
	const yields: TileYields = {
		food: 0,
		production: 0,
		gold: 0,
		science: 0,
		culture: 0,
		faith: 0
	};

	switch (terrain) {
		case TerrainType.Grass:
			yields.food = 2;
			break;
		case TerrainType.Plains:
			yields.food = 1;
			yields.production = 1;
			break;
		case TerrainType.Desert:
			// No yields
			break;
		case TerrainType.Tundra:
			yields.food = 1;
			break;
		case TerrainType.Hills:
			yields.production = 2;
			break;
		case TerrainType.Mountain:
			// Not workable
			break;
		case TerrainType.Ocean:
			yields.food = 1;
			break;
		case TerrainType.Coast:
			yields.food = 1;
			yields.gold = 1;
			break;
		default:
			yields.food = 1;
	}

	return yields;
}

/**
 * Create a populated test map with tiles
 */
export function createPopulatedTestMap(
	width: number = 10,
	height: number = 10,
	store?: MockEntityStore
): WorldMap {
	const map = createTestMap(width, height);

	// Create tiles for the entire map
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			// Vary terrain to make it realistic
			let terrain = TerrainType.Grass;
			if (x === 0 || x === width - 1) {
				terrain = TerrainType.Ocean;
			} else if (x === 1 || x === width - 2) {
				terrain = TerrainType.Coast;
			} else if (y % 3 === 0) {
				terrain = TerrainType.Plains;
			}

			const tile = createTestTile(x, y, terrain);
			map.detailedHexTiles.set(tile.getKey(), tile);

			if (store) {
				store.setEntity(tile.id, tile);
			}
		}
	}

	return map;
}

/**
 * Create a test simulation setup
 */
export function createTestSimulation(): {
	store: MockEntityStore;
	ai: BasicAIController;
	nation: Nation;
	map: WorldMap;
	planetId: string;
} {
	const store = new MockEntityStore();
	const ai = new BasicAIController();
	const nation = createTestNation();
	const map = createPopulatedTestMap(10, 10, store);
	const planetId = 'test-planet';

	store.setEntity(nation.id, nation);

	return { store, ai, nation, map, planetId };
}

/**
 * Create multiple test nations with different traits
 */
export function createMultipleTestNations(count: number): Nation[] {
	const nations: Nation[] = [];
	const cultureProfiles: CultureTraits[] = [
		// Militaristic
		{ militaristic: 80, expansionist: 60, commercial: 40, scientific: 30, seafaring: 30, diplomatic: 20 },
		// Scientific
		{ militaristic: 30, expansionist: 40, commercial: 50, scientific: 90, seafaring: 50, diplomatic: 60 },
		// Expansionist
		{ militaristic: 50, expansionist: 90, commercial: 40, scientific: 40, seafaring: 60, diplomatic: 40 },
		// Commercial
		{ militaristic: 30, expansionist: 50, commercial: 90, scientific: 50, seafaring: 70, diplomatic: 70 },
		// Diplomatic
		{ militaristic: 20, expansionist: 30, commercial: 60, scientific: 60, seafaring: 40, diplomatic: 90 }
	];

	for (let i = 0; i < count; i++) {
		const profile = cultureProfiles[i % cultureProfiles.length];
		const nation = createTestNation({
			name: `Nation ${i + 1}`,
			cultureTraits: profile
		});
		nations.push(nation);
	}

	return nations;
}
