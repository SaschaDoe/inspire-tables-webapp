/**
 * Unit tests for BasicAIController
 *
 * Demonstrates how the refactored SOLID design enables easy unit testing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BasicAIController } from '../ai/BasicAIController';
import { MockEntityStore } from '../interfaces/IEntityStore';
import { Nation, Era } from '$lib/entities/location/nation';
import { WorldMap } from '$lib/entities/location/worldMap';
import { DetailedHexTile, type TileYields } from '$lib/entities/location/detailedHexTile';
import { TerrainType } from '$lib/entities/location/terrainType';

describe('BasicAIController', () => {
	let ai: BasicAIController;
	let mockStore: MockEntityStore;
	let testNation: Nation;
	const planetId = 'test-planet';

	beforeEach(() => {
		ai = new BasicAIController();
		mockStore = new MockEntityStore();

		// Create test nation
		testNation = new Nation();
		testNation.name = 'Test Nation';
		testNation.currentEra = Era.Ancient;
		testNation.cultureTraits = {
			militaristic: 50,
			expansionist: 60, // Moderate expansion
			commercial: 50,
			scientific: 50,
			seafaring: 50,
			diplomatic: 50
		};
		testNation.cityIds = [];
		testNation.parentPlanetId = planetId;

		mockStore.setEntity(testNation.id, testNation);
	});

	describe('shouldFoundCity', () => {
		it('should return true on turns divisible by expansion rate', () => {
			// expansionist=60 → turnsPerCity=9
			const result1 = ai.shouldFoundCity(testNation, 9);
			expect(result1).toBe(true);

			const result2 = ai.shouldFoundCity(testNation, 18);
			expect(result2).toBe(true);
		});

		it('should return false on other turns', () => {
			const result = ai.shouldFoundCity(testNation, 10);
			expect(result).toBe(false);
		});

		it('should return false when nation has 5+ cities', () => {
			testNation.cityIds = ['city1', 'city2', 'city3', 'city4', 'city5'];
			const result = ai.shouldFoundCity(testNation, 9);
			expect(result).toBe(false);
		});

		it('should found cities faster for highly expansionist nations', () => {
			// High expansionist (80) → turnsPerCity=7
			testNation.cultureTraits.expansionist = 80;
			const result = ai.shouldFoundCity(testNation, 7);
			expect(result).toBe(true);
		});

		it('should found cities slower for low expansionist nations', () => {
			// Low expansionist (20) → turnsPerCity=13
			testNation.cultureTraits.expansionist = 20;
			const result1 = ai.shouldFoundCity(testNation, 9);
			expect(result1).toBe(false);

			const result2 = ai.shouldFoundCity(testNation, 13);
			expect(result2).toBe(true);
		});
	});

	describe('findCityFoundingLocation', () => {
		let worldMap: WorldMap;

		beforeEach(() => {
			// Create small test map
			worldMap = new WorldMap();
			worldMap.width = 5;
			worldMap.height = 5;
			worldMap.detailedWidth = 5;
			worldMap.detailedHeight = 5;
			worldMap.gridSize = 1;

			// Create test tiles
			for (let y = 0; y < 5; y++) {
				for (let x = 0; x < 5; x++) {
					const tile = new DetailedHexTile(planetId, 'test-general', x, y, x, y);
					tile.terrainType = TerrainType.Grass;
					tile.yields = { food: 2, production: 1, gold: 0, science: 0, culture: 0, faith: 0 };
					tile.riverSides = [];

					worldMap.detailedHexTiles.set(tile.getKey(), tile);
					mockStore.setEntity(tile.id, tile);
				}
			}
		});

		it('should find a valid location on empty map', () => {
			const location = ai.findCityFoundingLocation(testNation, worldMap, mockStore, planetId);

			expect(location).not.toBeNull();
			expect(location?.coordinates).toBeDefined();
		});

		it('should prefer tiles with rivers', () => {
			// Add river to center tile
			const riverTile = worldMap.getDetailedHex(2, 2);
			if (riverTile) {
				riverTile.hasRiver = true;
			}

			const location = ai.findCityFoundingLocation(testNation, worldMap, mockStore, planetId);

			expect(location?.hexTileId).toBe(riverTile?.id);
		});

		it('should return null on map with no valid locations', () => {
			// Make all tiles mountains
			for (const tile of worldMap.detailedHexTiles.values()) {
				tile.terrainType = TerrainType.Mountain;
				tile.isImpassable = true;
			}

			const location = ai.findCityFoundingLocation(testNation, worldMap, mockStore, planetId);

			expect(location).toBeNull();
		});

		it('should not found cities on mountains', () => {
			// Make center tile a mountain
			const mountainTile = worldMap.getDetailedHex(2, 2);
			if (mountainTile) {
				mountainTile.terrainType = TerrainType.Mountain;
				mountainTile.isImpassable = true;
				mountainTile.yields.production = 10; // High production, but still invalid
			}

			const location = ai.findCityFoundingLocation(testNation, worldMap, mockStore, planetId);

			// Should find a location, but not the mountain
			expect(location).not.toBeNull();
			expect(location?.hexTileId).not.toBe(mountainTile?.id);
		});

		it('should not found cities on ocean', () => {
			// Make center tile ocean
			const oceanTile = worldMap.getDetailedHex(2, 2);
			if (oceanTile) {
				oceanTile.terrainType = TerrainType.Ocean;
			}

			const location = ai.findCityFoundingLocation(testNation, worldMap, mockStore, planetId);

			expect(location).not.toBeNull();
			expect(location?.hexTileId).not.toBe(oceanTile?.id);
		});
	});

	describe('makeDecisions', () => {
		it('should return city founding decision on appropriate turn', () => {
			const decisions = ai.makeDecisions(testNation, 9, -10000, mockStore);

			expect(decisions.length).toBe(1);
			expect(decisions[0].type).toBe('found_city');
			expect(decisions[0].nationId).toBe(testNation.id);
		});

		it('should return no decisions on non-founding turns', () => {
			const decisions = ai.makeDecisions(testNation, 10, -10000, mockStore);

			expect(decisions.length).toBe(0);
		});

		it('should handle multiple nations independently', () => {
			// Create second nation with different traits
			const nation2 = new Nation();
			nation2.name = 'Aggressive Nation';
			nation2.cultureTraits = {
				militaristic: 50,
				expansionist: 80, // Very expansionist
				commercial: 50,
				scientific: 50,
				seafaring: 50,
				diplomatic: 50
			};
			nation2.cityIds = [];
			mockStore.setEntity(nation2.id, nation2);

			// Turn 9: testNation should found (expansionist=60)
			const decisions1 = ai.makeDecisions(testNation, 9, -10000, mockStore);
			expect(decisions1.length).toBe(1);

			// Turn 7: nation2 should found (expansionist=80)
			const decisions2 = ai.makeDecisions(nation2, 7, -10000, mockStore);
			expect(decisions2.length).toBe(1);
		});
	});
});
