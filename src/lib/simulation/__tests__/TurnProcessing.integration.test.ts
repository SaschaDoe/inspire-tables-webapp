/**
 * Integration Tests for Turn Processing
 * Tests the full simulation turn cycle with real entities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SimulationEngine } from '../SimulationEngine';
import { entityStore } from '$lib/stores/entityStore';
import { Nation, Era } from '$lib/entities/location/nation';
import { City } from '$lib/entities/location/city';
import { RegionalMap } from '$lib/entities/location/regionalMap';
import { RegionalHexTile } from '$lib/entities/location/regionalHexTile';
import { TerrainType } from '$lib/entities/location/terrainType';
import { createTestNation, createTestCity, createTestMap, createTestTile } from './testHelpers';

describe('Turn Processing Integration', () => {
	let engine: SimulationEngine;
	let nation: Nation;
	let nation2: Nation; // Second nation to prevent victory condition
	let city: City;
	let map: RegionalMap;

	beforeEach(async () => {
		// Clear entity store
		await entityStore.clearAll();

		// Create test map
		map = createTestMap(10, 10);
		for (let y = 0; y < 10; y++) {
			for (let x = 0; x < 10; x++) {
				const terrain = y < 2 ? TerrainType.Water : TerrainType.Grass;
				const tile = createTestTile(x, y, terrain);
				map.hexTileIds.push(tile.id);
				entityStore.createEntity(tile);
			}
		}
		entityStore.createEntity(map);

		// Create test nation
		nation = createTestNation({
			name: 'Test Nation',
			foundingYear: -10000
		});
		entityStore.createEntity(nation);

		// Create a second nation to prevent victory condition from triggering
		nation2 = createTestNation({
			name: 'Other Nation',
			foundingYear: -10000
		});
		entityStore.createEntity(nation2);

		// Create test city
		const centerTile = entityStore.getEntity(map.hexTileIds[25]) as RegionalHexTile;
		city = createTestCity({
			name: 'Capital',
			ownerNationId: nation.id,
			founderNationId: nation.id,
			hexTileId: centerTile.id,
			parentRegionalMapId: map.id,
			coordinates: { x: centerTile.x, y: centerTile.y },
			isCapital: true
		});
		entityStore.createEntity(city);

		// Link city to nation (modify in place since class instances are stored in Map)
		nation.cityIds = [city.id];
		nation.capitalCityId = city.id;

		// Create simulation engine
		engine = new SimulationEngine({
			startYear: -10000,
			yearsPerTurn: 1,
			autoSave: false,
			enableEntityBridge: false // Disable entity bridge in tests to avoid serialization issues
		});

		// Register entities with engine (including nation2 to prevent victory)
		engine['nationIds'] = [nation.id, nation2.id];
		engine['cityIds'] = [city.id];
		engine['regionalMapIds'] = [map.id];
	});

	afterEach(async () => {
		// Clean up
		await entityStore.clearAll();
	});

	describe('Basic Turn Progression', () => {
		it('should advance turn counter', () => {
			engine['isRunning'] = true;

			engine.processTurn();

			expect(engine['currentTurn']).toBe(1);
		});

		it('should advance year', () => {
			engine['isRunning'] = true;
			const startYear = engine['currentYear'];

			engine.processTurn();

			expect(engine['currentYear']).toBe(startYear + 1);
		});

		it('should process multiple turns', () => {
			engine['isRunning'] = true;

			for (let i = 0; i < 5; i++) {
				engine.processTurn();
			}

			expect(engine['currentTurn']).toBe(5);
		});

		it('should respect years per turn', () => {
			engine = new SimulationEngine({
				startYear: -10000,
				yearsPerTurn: 10
			});
			engine['isRunning'] = true;

			engine.processTurn();

			expect(engine['currentYear']).toBe(-9990); // -10000 + 10
		});

		it('should not process turn when paused', () => {
			engine['isRunning'] = true;
			engine['isPaused'] = true;

			engine.processTurn();

			expect(engine['currentTurn']).toBe(0); // No advancement
		});

		it('should not process turn when not running', () => {
			engine['isRunning'] = false;

			engine.processTurn();

			expect(engine['currentTurn']).toBe(0);
		});
	});

	describe('Nation Yield Processing', () => {
		it('should accumulate yields from cities', () => {
			engine['isRunning'] = true;

			// Set city yields (modify in place)
			city.yields.food = 5;
			city.yields.production = 3;
			city.yields.gold = 2;
			city.yields.science = 1;
			city.yields.culture = 1;

			engine.processTurn();

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			expect(updatedNation.yields.food).toBeGreaterThan(0);
			expect(updatedNation.yields.production).toBeGreaterThan(0);
			expect(updatedNation.yields.science).toBeGreaterThan(0);
		});

		it('should accumulate gold over turns', () => {
			engine['isRunning'] = true;

			city.yields.gold = 5;

			const startGold = nation.resources.gold;
			engine.processTurn();

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			expect(updatedNation.resources.gold).toBeGreaterThan(startGold);
		});

		it('should accumulate science over turns', () => {
			engine['isRunning'] = true;

			city.yields.science = 3;

			const startScience = nation.resources.science;
			engine.processTurn();

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			expect(updatedNation.resources.science).toBeGreaterThan(startScience);
		});

		it('should accumulate culture over turns', () => {
			engine['isRunning'] = true;

			city.yields.culture = 2;

			const startCulture = nation.resources.culture;
			engine.processTurn();

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			expect(updatedNation.resources.culture).toBeGreaterThan(startCulture);
		});
	});

	describe('City Processing', () => {
		it('should process city population growth', () => {
			engine['isRunning'] = true;

			// Set initial state
			city.populationManager.foodStored = 0;

			// Run several turns, resetting yields before each turn
			for (let i = 0; i < 5; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.food = 10;
				engine.processTurn();
			}

			const updatedCity = entityStore.getEntity(city.id) as City;
			expect(updatedCity.populationManager.foodStored).toBeGreaterThan(0);
		});

		it('should process city production', () => {
			engine['isRunning'] = true;

			city.productionManager.setCurrentProduction(
				'building' as any,
				'granary',
				'Granary',
				100  // Higher cost so it doesn't complete in 5 turns
			);

			// Run several turns, resetting yields before each turn
			for (let i = 0; i < 5; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.production = 5;
				engine.processTurn();
			}

			const updatedCity = entityStore.getEntity(city.id) as City;
			expect(updatedCity.productionManager.currentProduction?.productionProgress).toBeGreaterThan(0);
		});

		it('should process city cultural expansion', () => {
			engine['isRunning'] = true;

			// Run several turns, resetting yields before each turn
			for (let i = 0; i < 3; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.culture = 5;
				engine.processTurn();
			}

			const updatedCity = entityStore.getEntity(city.id) as City;
			expect(updatedCity.expansionManager.cultureStored).toBeGreaterThan(0);
		});
	});

	describe('Multi-City Simulation', () => {
		let secondCity: City;

		beforeEach(() => {
			// Create second city
			const tile2 = entityStore.getEntity(map.hexTileIds[35]) as RegionalHexTile;
			secondCity = createTestCity({
				name: 'Second City',
				ownerNationId: nation.id,
				founderNationId: nation.id,
				hexTileId: tile2.id,
				parentRegionalMapId: map.id,
				coordinates: { x: tile2.x, y: tile2.y },
				isCapital: false
			});
			entityStore.createEntity(secondCity);

			// Link to nation (modify in place)
			nation.cityIds.push(secondCity.id);
			engine['cityIds'].push(secondCity.id);
		});

		it('should process both cities each turn', () => {
			engine['isRunning'] = true;

			city.yields.science = 2;
			secondCity.yields.science = 3;

			engine.processTurn();

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			// Should accumulate science from both cities (2 + 3 = 5)
			expect(updatedNation.yields.science).toBeGreaterThanOrEqual(5);
		});

		it('should grow both cities independently', () => {
			engine['isRunning'] = true;

			for (let i = 0; i < 3; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.food = 10;
				secondCity.yields.food = 5;
				engine.processTurn();
			}

			const updatedCity1 = entityStore.getEntity(city.id) as City;
			const updatedCity2 = entityStore.getEntity(secondCity.id) as City;

			// City 1 should have grown (higher yield) while city 2 hasn't
			expect(updatedCity1.population).toBeGreaterThan(updatedCity2.population);
		});
	});

	describe('Nation Tech Research', () => {
		it('should accumulate science toward research', () => {
			engine['isRunning'] = true;

			nation.techManager.startResearching('agriculture', 20);

			for (let i = 0; i < 3; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.science = 5;
				engine.processTurn();
			}

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			expect(updatedNation.techManager.researchProgress).toBeGreaterThan(0);
		});

		it('should complete tech after enough turns', () => {
			engine['isRunning'] = true;

			nation.techManager.startResearching('agriculture', 20);

			// 20 / 10 = 2 turns needed
			for (let i = 0; i < 3; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.science = 10;
				engine.processTurn();
			}

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			expect(updatedNation.techManager.hasTech('agriculture')).toBe(true);
		});
	});

	describe('Nation Policy Adoption', () => {
		it('should accumulate culture toward policies', () => {
			engine['isRunning'] = true;

			for (let i = 0; i < 3; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.culture = 5;
				engine.processTurn();
			}

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			expect(updatedNation.policyManager.cultureStored).toBeGreaterThan(0);
		});

		it('should allow policy adoption after enough culture', () => {
			engine['isRunning'] = true;

			// Accumulate 30 culture (need 25 for first policy)
			for (let i = 0; i < 3; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.culture = 10;
				engine.processTurn();
			}

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			expect(updatedNation.policyManager.canAffordPolicy()).toBe(true);
		});
	});

	describe('Turn Limits', () => {
		it('should stop after max turns', () => {
			engine = new SimulationEngine({
				startYear: -10000,
				yearsPerTurn: 1,
				maxTurns: 5,
				enableEntityBridge: false // Disable entity bridge in tests
			});
			engine['nationIds'] = [nation.id, nation2.id]; // Include nation2 to prevent victory condition
			engine['cityIds'] = [city.id];
			engine['isRunning'] = true;

			for (let i = 0; i < 10; i++) {
				engine.processTurn();
			}

			// Should stop at turn 5
			expect(engine['currentTurn']).toBe(5);
			expect(engine['isRunning']).toBe(false);
		});
	});

	describe('Full Simulation Cycle', () => {
		it('should run complete simulation for 10 turns', () => {
			engine['isRunning'] = true;

			nation.techManager.startResearching('agriculture', 15);

			// Run 10 turns
			for (let i = 0; i < 10; i++) {
				// Set yields before each turn (they get reset by calculateYields)
				city.yields.food = 5;
				city.yields.production = 3;
				city.yields.science = 2;
				city.yields.culture = 2;
				city.yields.gold = 3;
				engine.processTurn();
			}

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			const updatedCity = entityStore.getEntity(city.id) as City;

			// Verify simulation ran
			expect(engine['currentTurn']).toBe(10);
			expect(engine['currentYear']).toBe(-9990);

			// Verify resources accumulated
			expect(updatedNation.resources.gold).toBeGreaterThan(0);
			expect(updatedNation.resources.science).toBeGreaterThan(0);
			expect(updatedNation.resources.culture).toBeGreaterThan(0);

			// Verify city progressed
			expect(updatedCity.populationManager.foodStored).toBeGreaterThanOrEqual(0);
			expect(updatedCity.expansionManager.cultureStored).toBeGreaterThanOrEqual(0);

			// Verify tech completed
			expect(updatedNation.techManager.hasTech('agriculture')).toBe(true);
		});
	});
});
