/**
 * Diagnostic Test for Turn Processing
 * This test adds detailed logging to understand what's happening during turn processing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SimulationEngine } from '../SimulationEngine';
import { entityStore } from '$lib/stores/entityStore';
import { Nation } from '$lib/entities/location/nation';
import { City } from '$lib/entities/location/city';
import { WorldMap } from '$lib/entities/location/worldMap';
import { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
import { TerrainType } from '$lib/entities/location/terrainType';
import { createTestNation, createTestCity, createTestMap, createTestTile } from './testHelpers';

describe('Turn Processing Diagnostic', () => {
	let engine: SimulationEngine;
	let nation: Nation;
	let nation2: Nation;
	let city: City;
	let worldMap: WorldMap;
	const planetId = 'test-planet';

	beforeEach(async () => {
		await entityStore.clearAll();

		// Create test map
		worldMap = createTestMap(10, 10);
		for (let y = 0; y < 10; y++) {
			for (let x = 0; x < 10; x++) {
				const terrain = y < 2 ? TerrainType.Water : TerrainType.Grass;
				const tile = createTestTile(x, y, terrain);
				worldMap.detailedHexTiles.set(tile.getKey(), tile);
			}
		}

		// Create two nations
		nation = createTestNation({ name: 'Test Nation', foundingYear: -10000 });
		nation.parentPlanetId = planetId;
		entityStore.createEntity(nation);

		nation2 = createTestNation({ name: 'Other Nation', foundingYear: -10000 });
		nation2.parentPlanetId = planetId;
		entityStore.createEntity(nation2);

		// Create test city
		const centerTile = worldMap.getDetailedHex(5, 5);
		city = createTestCity({
			name: 'Capital',
			ownerNationId: nation.id,
			founderNationId: nation.id,
			hexTileId: centerTile?.id || 'test-hex',
			parentPlanetId: planetId,
			coordinates: { x: 5, y: 5 },
			isCapital: true
		});
		entityStore.createEntity(city);

		// Link city to nation
		nation.cityIds = [city.id];
		nation.capitalCityId = city.id;

		// Create simulation engine
		engine = new SimulationEngine({
			startYear: -10000,
			yearsPerTurn: 1,
			autoSave: false,
			enableEntityBridge: false // Disable for tests
		});

		engine['nationIds'] = [nation.id, nation2.id];
		engine['cityIds'] = [city.id];
		engine['planetId'] = planetId;
		engine['worldMap'] = worldMap;
	});

	afterEach(async () => {
		await entityStore.clearAll();
	});

	it('DIAGNOSTIC: city population growth with detailed logging', () => {
		engine['isRunning'] = true;

		console.log('\n========== DIAGNOSTIC START ==========');

		// Set high food yield
		city.yields.food = 10;
		console.log(`[BEFORE] City yields.food: ${city.yields.food}`);
		console.log(`[BEFORE] City populationManager.foodStored: ${city.populationManager.foodStored}`);
		console.log(`[BEFORE] City population: ${city.population}`);
		console.log(`[BEFORE] City populationManager.foodNeeded: ${city.populationManager.foodNeeded}`);

		// Check if city has processTurn method
		console.log(`[CHECK] city.processTurn is a function: ${typeof city.processTurn === 'function'}`);
		console.log(`[CHECK] city instanceof City: ${city instanceof City}`);
		console.log(`[CHECK] city.constructor.name: ${city.constructor.name}`);

		// Process one turn
		console.log('\n[PROCESSING] Calling engine.processTurn()...');
		engine.processTurn();

		// Retrieve city from store
		const updatedCity = entityStore.getEntity(city.id) as City;
		console.log(`\n[AFTER] Retrieved city from store`);
		console.log(`[AFTER] updatedCity is defined: ${updatedCity !== undefined}`);
		console.log(`[AFTER] updatedCity.yields.food: ${updatedCity?.yields.food}`);
		console.log(`[AFTER] updatedCity.populationManager.foodStored: ${updatedCity?.populationManager.foodStored}`);
		console.log(`[AFTER] updatedCity.population: ${updatedCity?.population}`);

		// Check if it's still a City instance
		console.log(`[CHECK] updatedCity instanceof City: ${updatedCity instanceof City}`);
		console.log(`[CHECK] updatedCity.constructor.name: ${updatedCity?.constructor.name}`);
		console.log(`[CHECK] updatedCity.processTurn is a function: ${typeof updatedCity?.processTurn === 'function'}`);

		// Check the original city object (not from store)
		console.log(`\n[ORIGINAL] city.populationManager.foodStored: ${city.populationManager.foodStored}`);
		console.log(`[ORIGINAL] city.population: ${city.population}`);

		console.log('========== DIAGNOSTIC END ==========\n');

		// The actual test
		expect(updatedCity.populationManager.foodStored).toBeGreaterThan(0);
	});

	it('DIAGNOSTIC: tech research with detailed logging', () => {
		engine['isRunning'] = true;

		console.log('\n========== TECH DIAGNOSTIC START ==========');

		city.yields.science = 10;
		nation.techManager.startResearching('agriculture', 20);

		console.log(`[BEFORE] City yields.science: ${city.yields.science}`);
		console.log(`[BEFORE] Nation techManager.researchProgress: ${nation.techManager.researchProgress}`);
		console.log(`[BEFORE] Nation techManager.currentTech: ${nation.techManager.currentTech}`);
		console.log(`[BEFORE] Nation techManager.currentTechCost: ${nation.techManager.currentTechCost}`);
		console.log(`[BEFORE] Nation hasTech('agriculture'): ${nation.techManager.hasTech('agriculture')}`);

		// Check if nation has processTurn method
		console.log(`[CHECK] nation.processTurn is a function: ${typeof nation.processTurn === 'function'}`);
		console.log(`[CHECK] nation instanceof Nation: ${nation instanceof Nation}`);
		console.log(`[CHECK] nation.constructor.name: ${nation.constructor.name}`);

		// Process 3 turns (should accumulate 30 science, tech costs 20)
		for (let i = 0; i < 3; i++) {
			console.log(`\n[TURN ${i + 1}] Processing...`);
			engine.processTurn();

			const updatedNation = entityStore.getEntity(nation.id) as Nation;
			console.log(`[TURN ${i + 1}] Nation techManager.researchProgress: ${updatedNation?.techManager.researchProgress}`);
			console.log(`[TURN ${i + 1}] Nation hasTech('agriculture'): ${updatedNation?.techManager.hasTech('agriculture')}`);
		}

		const updatedNation = entityStore.getEntity(nation.id) as Nation;
		console.log(`\n[FINAL] Nation techManager.researchProgress: ${updatedNation.techManager.researchProgress}`);
		console.log(`[FINAL] Nation hasTech('agriculture'): ${updatedNation.techManager.hasTech('agriculture')}`);
		console.log(`[FINAL] Nation techManager.researchedTechs: ${JSON.stringify(updatedNation.techManager.researchedTechs)}`);

		// Check if it's still a Nation instance
		console.log(`[CHECK] updatedNation instanceof Nation: ${updatedNation instanceof Nation}`);
		console.log(`[CHECK] updatedNation.constructor.name: ${updatedNation.constructor.name}`);

		console.log('========== TECH DIAGNOSTIC END ==========\n');

		expect(updatedNation.techManager.hasTech('agriculture')).toBe(true);
	});

	it('DIAGNOSTIC: check getAvailableTiles for city expansion', () => {
		engine['isRunning'] = true;

		console.log('\n========== EXPANSION DIAGNOSTIC START ==========');

		city.yields.culture = 5;
		console.log(`[BEFORE] City yields.culture: ${city.yields.culture}`);
		console.log(`[BEFORE] City expansionManager.cultureStored: ${city.expansionManager.cultureStored}`);

		// Manually call getAvailableTilesForExpansion to see what it returns
		const availableTiles = (engine as any).getAvailableTilesForExpansion(city);
		console.log(`[CHECK] getAvailableTilesForExpansion returned: ${JSON.stringify(availableTiles)}`);
		console.log(`[CHECK] availableTiles.length: ${availableTiles.length}`);

		// Process turn
		engine.processTurn();

		const updatedCity = entityStore.getEntity(city.id) as City;
		console.log(`[AFTER] City expansionManager.cultureStored: ${updatedCity.expansionManager.cultureStored}`);

		console.log('========== EXPANSION DIAGNOSTIC END ==========\n');
	});
});
