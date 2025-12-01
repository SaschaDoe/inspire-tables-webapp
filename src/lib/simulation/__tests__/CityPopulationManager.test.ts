/**
 * Unit tests for CityPopulationManager
 * Tests population growth, starvation, and food mechanics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CityPopulationManager } from '../managers/CityPopulationManager';

describe('CityPopulationManager', () => {
	let manager: CityPopulationManager;

	beforeEach(() => {
		manager = new CityPopulationManager(1);
	});

	describe('Food Calculation', () => {
		it('should calculate correct food needed for population 1', () => {
			// Formula: 15 + 8 * (pop - 1) = 15 + 8 * 0 = 15
			expect(manager.foodNeededForGrowth).toBe(15);
		});

		it('should calculate correct food needed for population 5', () => {
			manager.population = 5;
			manager.calculateFoodNeededForGrowth();
			// Formula: 15 + 8 * (5 - 1) = 15 + 32 = 47
			expect(manager.foodNeededForGrowth).toBe(47);
		});

		it('should calculate correct food needed for population 10', () => {
			manager.population = 10;
			manager.calculateFoodNeededForGrowth();
			// Formula: 15 + 8 * (10 - 1) = 15 + 72 = 87
			expect(manager.foodNeededForGrowth).toBe(87);
		});

		it('should update food needed when population changes', () => {
			expect(manager.foodNeededForGrowth).toBe(15);
			manager.population = 2;
			manager.calculateFoodNeededForGrowth();
			expect(manager.foodNeededForGrowth).toBe(23); // 15 + 8
		});
	});

	describe('Food Consumption', () => {
		it('should calculate 2 food per population', () => {
			expect(manager.getFoodConsumption()).toBe(2); // 1 pop * 2
		});

		it('should scale with population', () => {
			manager.population = 5;
			expect(manager.getFoodConsumption()).toBe(10); // 5 pop * 2
		});

		it('should handle large populations', () => {
			manager.population = 20;
			expect(manager.getFoodConsumption()).toBe(40); // 20 pop * 2
		});
	});

	describe('Growth Rate Calculation', () => {
		it('should calculate positive surplus', () => {
			const foodYield = 5; // 5 food from tiles
			const surplus = manager.calculateGrowthRate(foodYield);
			// 5 food - 2 consumption = +3 surplus
			expect(surplus).toBe(3);
			expect(manager.growthRate).toBe(3);
			expect(manager.isStarving).toBe(false);
		});

		it('should calculate negative surplus (starvation)', () => {
			const foodYield = 1; // Only 1 food from tiles
			const surplus = manager.calculateGrowthRate(foodYield);
			// 1 food - 2 consumption = -1 deficit
			expect(surplus).toBe(-1);
			expect(manager.growthRate).toBe(-1);
			expect(manager.isStarving).toBe(true);
		});

		it('should calculate zero surplus (stagnant)', () => {
			const foodYield = 2; // Exactly matches consumption
			const surplus = manager.calculateGrowthRate(foodYield);
			expect(surplus).toBe(0);
			expect(manager.growthRate).toBe(0);
			expect(manager.isStarving).toBe(false);
		});

		it('should apply food modifiers to surplus', () => {
			manager.addFoodModifier('Granary', 2);
			const foodYield = 5;
			const surplus = manager.calculateGrowthRate(foodYield);
			// 5 food - 2 consumption + 2 modifier = +5 surplus
			expect(surplus).toBe(5);
		});
	});

	describe('Population Growth', () => {
		it('should grow population when food threshold is reached', () => {
			manager.foodStored = 0;
			const foodYield = 5; // +3 surplus per turn

			// Turn 1-4: accumulate food
			for (let i = 0; i < 4; i++) {
				const result = manager.processTurn(foodYield);
				expect(result.grew).toBe(false);
			}

			// Turn 5: 15 food accumulated, should grow
			const result = manager.processTurn(foodYield);
			expect(result.grew).toBe(true);
			expect(result.newPopulation).toBe(2);
			expect(manager.population).toBe(2);
		});

		it('should reset food storage after growth', () => {
			manager.foodStored = 14;
			const result = manager.processTurn(5); // Will reach 17 food

			expect(result.grew).toBe(true);
			expect(manager.foodStored).toBe(0);
		});

		it('should recalculate food needed after growth', () => {
			manager.foodStored = 14;
			manager.processTurn(5);

			// Now population is 2, food needed should be 23
			expect(manager.foodNeededForGrowth).toBe(23);
		});

		it('should reset starvation turns after growth', () => {
			manager.starvationTurns = 2;
			manager.foodStored = 14;
			manager.processTurn(5);

			expect(manager.starvationTurns).toBe(0);
		});

		it('should apply growth modifiers correctly', () => {
			manager.addGrowthModifier('Tradition Policy', 10); // +10% growth
			manager.foodStored = 13; // Need 15, so 13 * 1.10 = 14.3 (not enough)

			let result = manager.processTurn(1); // Add -1 food (1-2), so 12 stored, 12*1.10=13.2 (not enough)
			expect(result.grew).toBe(false);

			// Add enough food: 13 stored + 2 surplus = 15, 15*1.10 = 16.5 (enough!)
			manager.foodStored = 13;
			result = manager.processTurn(4); // +2 surplus = 15 stored, 15*1.10 = 16.5
			expect(result.grew).toBe(true);
		});
	});

	describe('Starvation', () => {
		it('should detect starvation when food is negative', () => {
			manager.calculateGrowthRate(1); // 1 - 2 = -1
			expect(manager.isStarving).toBe(true);
		});

		it('should track starvation turns', () => {
			expect(manager.starvationTurns).toBe(0);

			manager.processTurn(1); // Starving: -1 food
			expect(manager.starvationTurns).toBe(1);

			manager.processTurn(1); // Still starving
			expect(manager.starvationTurns).toBe(2);

			manager.processTurn(1); // Still starving
			expect(manager.starvationTurns).toBe(3);
		});

		it('should lose population after 3 turns of starvation', () => {
			manager.population = 3;
			manager.calculateFoodNeededForGrowth();

			// 3 turns of starvation
			for (let i = 0; i < 2; i++) {
				const result = manager.processTurn(1); // 1 - 6 = -5
				expect(result.starved).toBe(false);
			}

			// Third turn should cause population loss
			const result = manager.processTurn(1);
			expect(result.starved).toBe(true);
			expect(result.newPopulation).toBe(2);
			expect(manager.population).toBe(2);
		});

		it('should reset starvation turns after population loss', () => {
			manager.population = 2;
			manager.starvationTurns = 3;

			manager.processTurn(1); // Will lose population
			expect(manager.starvationTurns).toBe(0);
		});

		it('should reset food storage after population loss', () => {
			manager.population = 2;
			manager.starvationTurns = 3;
			manager.foodStored = 5;

			manager.processTurn(1);
			expect(manager.foodStored).toBe(0);
		});

		it('should not go below population 1', () => {
			manager.population = 1;
			manager.starvationTurns = 3;

			const result = manager.processTurn(0); // Starving
			// Should not lose population when at 1
			expect(manager.population).toBe(1);
			expect(result.starved).toBe(false);
		});

		it('should prevent negative food storage', () => {
			manager.processTurn(0); // 0 - 2 = -2
			expect(manager.foodStored).toBe(0); // Clamped to 0
		});

		it('should reset starvation turns when food becomes positive', () => {
			manager.processTurn(1); // Starving
			manager.processTurn(1); // Starving
			expect(manager.starvationTurns).toBe(2);

			manager.processTurn(5); // Surplus!
			expect(manager.starvationTurns).toBe(0);
		});
	});

	describe('Modifiers', () => {
		it('should add growth modifiers', () => {
			manager.addGrowthModifier('Tradition', 15);
			expect(manager.getTotalGrowthModifier()).toBe(15);
		});

		it('should add food modifiers', () => {
			manager.addFoodModifier('Granary', 2);
			expect(manager.getTotalFoodModifier()).toBe(2);
		});

		it('should replace existing modifiers from same source', () => {
			manager.addGrowthModifier('Tradition', 10);
			manager.addGrowthModifier('Tradition', 15);
			expect(manager.getTotalGrowthModifier()).toBe(15);
		});

		it('should stack modifiers from different sources', () => {
			manager.addGrowthModifier('Tradition', 10);
			manager.addGrowthModifier('Wonder', 5);
			expect(manager.getTotalGrowthModifier()).toBe(15);
		});

		it('should remove modifiers when set to 0', () => {
			manager.addGrowthModifier('Tradition', 10);
			manager.addGrowthModifier('Tradition', 0);
			expect(manager.getTotalGrowthModifier()).toBe(0);
		});
	});

	describe('Turns Until Growth', () => {
		it('should calculate turns until growth correctly', () => {
			manager.foodStored = 0;
			manager.foodNeededForGrowth = 15;
			const turns = manager.getTurnsUntilGrowth(5); // +3 surplus per turn
			// Need 15 food, +3 per turn = 5 turns
			expect(turns).toBe(5);
		});

		it('should return Infinity when starving', () => {
			const turns = manager.getTurnsUntilGrowth(1); // -1 surplus
			expect(turns).toBe(Infinity);
		});

		it('should account for current food storage', () => {
			manager.foodStored = 10;
			manager.foodNeededForGrowth = 15;
			const turns = manager.getTurnsUntilGrowth(5); // +3 surplus per turn
			// Need 5 more food, +3 per turn = 2 turns
			expect(turns).toBe(2);
		});
	});

	describe('Turns Until Starvation', () => {
		it('should calculate turns until starvation death', () => {
			manager.isStarving = true;
			manager.starvationTurns = 1;
			const turns = manager.getTurnsUntilStarvation();
			expect(turns).toBe(2); // 3 - 1 = 2 turns left
		});

		it('should return Infinity when not starving', () => {
			manager.isStarving = false;
			const turns = manager.getTurnsUntilStarvation();
			expect(turns).toBe(Infinity);
		});

		it('should return 0 when starvation death is imminent', () => {
			manager.isStarving = true;
			manager.starvationTurns = 3;
			const turns = manager.getTurnsUntilStarvation();
			expect(turns).toBe(0);
		});
	});

	describe('Population Management', () => {
		it('should set population directly', () => {
			manager.setPopulation(5);
			expect(manager.population).toBe(5);
			expect(manager.foodStored).toBe(0);
			expect(manager.starvationTurns).toBe(0);
		});

		it('should not allow population below 1', () => {
			manager.setPopulation(0);
			expect(manager.population).toBe(1);

			manager.setPopulation(-5);
			expect(manager.population).toBe(1);
		});

		it('should recalculate food needed after setting population', () => {
			manager.setPopulation(3);
			expect(manager.foodNeededForGrowth).toBe(31); // 15 + 8 * 2
		});

		it('should get total population in thousands', () => {
			manager.population = 5;
			expect(manager.getTotalPopulation()).toBe(5000);
		});

		it('should reset growth correctly', () => {
			manager.foodStored = 10;
			manager.starvationTurns = 2;
			manager.resetGrowth();

			expect(manager.foodStored).toBe(0);
			expect(manager.starvationTurns).toBe(0);
		});
	});

	describe('Clone and Serialization', () => {
		it('should clone correctly', () => {
			manager.population = 3;
			manager.foodStored = 10;
			manager.addGrowthModifier('Tradition', 15);
			manager.addFoodModifier('Granary', 2);

			const cloned = manager.clone();

			expect(cloned.population).toBe(3);
			expect(cloned.foodStored).toBe(10);
			expect(cloned.getTotalGrowthModifier()).toBe(15);
			expect(cloned.getTotalFoodModifier()).toBe(2);
		});

		it('should not share references with clone', () => {
			manager.addGrowthModifier('Tradition', 10);
			const cloned = manager.clone();

			manager.addGrowthModifier('Wonder', 5);

			expect(manager.getTotalGrowthModifier()).toBe(15);
			expect(cloned.getTotalGrowthModifier()).toBe(10);
		});

		it('should serialize to JSON correctly', () => {
			manager.population = 3;
			manager.foodStored = 10;

			const json = manager.toJSON();

			expect(json.population).toBe(3);
			expect(json.foodStored).toBe(10);
		});

		it('should deserialize from JSON correctly', () => {
			const data = {
				population: 5,
				foodStored: 20,
				foodNeededForGrowth: 47,
				growthRate: 3,
				isStarving: false,
				starvationTurns: 0,
				growthModifiers: [{ source: 'Tradition', value: 10 }],
				foodModifiers: [{ source: 'Granary', value: 2 }]
			};

			const restored = CityPopulationManager.fromJSON(data);

			expect(restored.population).toBe(5);
			expect(restored.foodStored).toBe(20);
			expect(restored.getTotalGrowthModifier()).toBe(10);
			expect(restored.getTotalFoodModifier()).toBe(2);
		});
	});

	describe('Summary', () => {
		it('should show turns to grow when growing', () => {
			manager.foodStored = 0;
			manager.growthRate = 3;
			const summary = manager.getSummary();

			expect(summary).toContain('Pop: 1');
			expect(summary).toContain('5 turns to grow');
		});

		it('should show starvation warning when starving', () => {
			manager.isStarving = true;
			manager.starvationTurns = 1;
			const summary = manager.getSummary();

			expect(summary).toContain('Starving');
			expect(summary).toContain('2 turns until loss');
		});

		it('should show stagnant when no growth', () => {
			// Create fresh manager to ensure clean state
			const freshManager = new CityPopulationManager(1);
			// Set food yield to exactly match consumption (no surplus, no deficit)
			freshManager.calculateGrowthRate(2); // 2 food - 2 consumption = 0
			expect(freshManager.isStarving).toBe(false); // Verify not starving
			expect(freshManager.growthRate).toBe(0); // Verify no growth

			const summary = freshManager.getSummary();
			expect(summary).toContain('Stagnant');
		});
	});
});
