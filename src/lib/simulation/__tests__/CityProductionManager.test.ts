/**
 * Unit tests for CityProductionManager
 * Tests production queue, building construction, and unit creation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	CityProductionManager,
	ProductionItemType
} from '../managers/CityProductionManager';

describe('CityProductionManager', () => {
	let manager: CityProductionManager;

	beforeEach(() => {
		manager = new CityProductionManager();
	});

	describe('Queue Management', () => {
		it('should add items to production queue', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);

			expect(manager.productionQueue).toHaveLength(1);
			expect(manager.productionQueue[0].itemId).toBe('granary');
			expect(manager.productionQueue[0].itemName).toBe('Granary');
			expect(manager.productionQueue[0].productionCost).toBe(60);
		});

		it('should set first item as current production automatically', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);

			expect(manager.currentProduction).toBeDefined();
			expect(manager.currentProduction?.itemId).toBe('granary');
		});

		it('should calculate turns remaining when adding to queue', () => {
			manager.productionPerTurn = 10;
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);

			// 60 / 10 = 6 turns
			expect(manager.productionQueue[0].turnsRemaining).toBe(6);
		});

		it('should handle multiple items in queue', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);
			manager.addToQueue(ProductionItemType.Wonder, 'stonehenge', 'Stonehenge', 185);

			expect(manager.productionQueue).toHaveLength(3);
			expect(manager.currentProduction?.itemId).toBe('granary'); // First item
		});

		it('should remove items from queue by index', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);

			manager.removeFromQueue(1); // Remove warrior

			expect(manager.productionQueue).toHaveLength(1);
			expect(manager.productionQueue[0].itemId).toBe('granary');
		});

		it('should move to next item when removing current production', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);

			manager.removeFromQueue(0); // Remove granary (current)

			expect(manager.currentProduction?.itemId).toBe('warrior');
		});

		it('should handle removing last item in queue', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);

			manager.removeFromQueue(0);

			expect(manager.productionQueue).toHaveLength(0);
			expect(manager.currentProduction).toBeUndefined();
		});

		it('should clear entire queue', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);

			manager.clearQueue();

			expect(manager.productionQueue).toHaveLength(0);
			expect(manager.currentProduction).toBeUndefined();
		});
	});

	describe('Set Current Production', () => {
		it('should set item as current production', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);

			expect(manager.currentProduction?.itemId).toBe('granary');
		});

		it('should move item to front of queue', () => {
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);

			expect(manager.productionQueue[0].itemId).toBe('granary');
			expect(manager.productionQueue[1].itemId).toBe('warrior');
		});

		it('should remove duplicate if item already in queue', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);

			// Move granary to front again (should not duplicate)
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);

			expect(manager.productionQueue).toHaveLength(2); // Not 3
			expect(manager.productionQueue[0].itemId).toBe('granary');
		});
	});

	describe('Production Modifiers', () => {
		it('should add production modifiers', () => {
			manager.addProductionModifier('Forge', 15); // +15%

			expect(manager.getTotalProductionModifier()).toBe(15);
		});

		it('should stack modifiers from different sources', () => {
			manager.addProductionModifier('Forge', 15);
			manager.addProductionModifier('Workshop', 10);

			expect(manager.getTotalProductionModifier()).toBe(25);
		});

		it('should replace modifier from same source', () => {
			manager.addProductionModifier('Forge', 15);
			manager.addProductionModifier('Forge', 25); // Upgrade

			expect(manager.getTotalProductionModifier()).toBe(25);
		});

		it('should remove modifier when set to 0', () => {
			manager.addProductionModifier('Forge', 15);
			manager.addProductionModifier('Forge', 0); // Remove

			expect(manager.getTotalProductionModifier()).toBe(0);
		});

		it('should apply modifiers to effective production', () => {
			manager.addProductionModifier('Forge', 25); // +25%
			const effectiveProduction = manager.getEffectiveProduction(10);

			// 10 * 1.25 = 12.5, floored to 12
			expect(effectiveProduction).toBe(12);
		});

		it('should floor effective production', () => {
			manager.addProductionModifier('Forge', 10); // +10%
			const effectiveProduction = manager.getEffectiveProduction(5);

			// 5 * 1.10 = 5.5, floored to 5
			expect(effectiveProduction).toBe(5);
		});
	});

	describe('Production Progress', () => {
		it('should accumulate production toward current item', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.productionPerTurn = 10;

			const result = manager.processTurn(10);

			expect(result.completed).toBe(false);
			expect(manager.currentProduction?.productionProgress).toBe(10);
		});

		it('should complete item when cost is reached', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 30);
			manager.productionPerTurn = 10;

			// Turn 1: 10 production
			manager.processTurn(10);
			// Turn 2: 20 production
			manager.processTurn(10);
			// Turn 3: 30 production - complete!
			const result = manager.processTurn(10);

			expect(result.completed).toBe(true);
			expect(result.item?.itemId).toBe('granary');
		});

		it('should move to next item after completion', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 20);
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);
			manager.productionPerTurn = 10;

			// Complete granary (2 turns)
			manager.processTurn(10);
			manager.processTurn(10);

			expect(manager.currentProduction?.itemId).toBe('warrior');
		});

		it('should add building to builtBuildings when completed', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 20);

			manager.processTurn(20);

			expect(manager.builtBuildings).toContain('granary');
			expect(manager.hasBuilding('granary')).toBe(true);
		});

		it('should add wonder to builtWonders when completed', () => {
			manager.setCurrentProduction(ProductionItemType.Wonder, 'stonehenge', 'Stonehenge', 100);

			manager.processTurn(100);

			expect(manager.builtWonders).toContain('stonehenge');
			expect(manager.hasWonder('stonehenge')).toBe(true);
		});

		it('should not duplicate buildings in builtBuildings', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 20);
			manager.processTurn(20); // Complete once

			// Try to build again (shouldn't happen in real game, but test the safety)
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 20);
			manager.processTurn(20);

			const granaryCount = manager.builtBuildings.filter(b => b === 'granary').length;
			expect(granaryCount).toBe(1); // Only one
		});

		it('should update turns remaining as production progresses', () => {
			// Set production per turn FIRST
			manager.productionPerTurn = 10;
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);

			// Initial: 60 / 10 = 6 turns
			expect(manager.currentProduction?.turnsRemaining).toBe(6);

			manager.processTurn(10); // Now 50 remaining
			// 50 / 10 = 5 turns
			expect(manager.currentProduction?.turnsRemaining).toBe(5);

			manager.processTurn(10); // Now 40 remaining
			expect(manager.currentProduction?.turnsRemaining).toBe(4);
		});
	});

	describe('Overflow Production', () => {
		it('should calculate 50% overflow when production exceeds cost', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 50);

			// Produce 60 (10 overflow)
			const result = manager.processTurn(60);

			expect(result.completed).toBe(true);
			// 50% of 10 = 5
			expect(result.overflowProduction).toBe(5);
			expect(manager.overflowProduction).toBe(5);
		});

		it('should apply overflow to next item', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 50);
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);

			// Complete granary with 10 overflow (5 after 50% rule)
			const result = manager.processTurn(60);
			expect(result.completed).toBe(true);
			expect(result.overflowProduction).toBe(5);

			// Now on warrior, overflow is stored but not yet applied
			expect(manager.currentProduction?.itemId).toBe('warrior');
			expect(manager.overflowProduction).toBe(5);

			// Next turn will apply the overflow
			manager.processTurn(10); // 10 base + 5 overflow = 15
			expect(manager.currentProduction?.productionProgress).toBe(15);
		});

		it('should accumulate overflow when nothing is being produced', () => {
			// No production set
			manager.processTurn(10);

			expect(manager.overflowProduction).toBe(10);

			manager.processTurn(10);

			expect(manager.overflowProduction).toBe(20);
		});

		it('should apply overflow with modifiers correctly', () => {
			manager.addProductionModifier('Forge', 50); // +50%
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 50);

			// 10 base * 1.5 = 15 effective, completes in 4 turns
			// Turn 1: 15
			manager.processTurn(10);
			// Turn 2: 30
			manager.processTurn(10);
			// Turn 3: 45
			manager.processTurn(10);
			// Turn 4: 60 (10 overflow, 5 after 50%)
			const result = manager.processTurn(10);

			expect(result.completed).toBe(true);
			expect(result.overflowProduction).toBe(5);
		});
	});

	describe('Rush Production (Gold Purchase)', () => {
		it('should complete production immediately when rushed', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.currentProduction!.productionProgress = 20;

			const success = manager.rushProduction(200, () => true);

			expect(success).toBe(true);
			expect(manager.builtBuildings).toContain('granary');
			expect(manager.currentProduction).toBeUndefined(); // Queue is empty
		});

		it('should fail rush if payment fails', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);

			const success = manager.rushProduction(200, () => false);

			expect(success).toBe(false);
			expect(manager.currentProduction?.itemId).toBe('granary'); // Still producing
		});

		it('should move to next item after rush', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);

			manager.rushProduction(200, () => true);

			expect(manager.currentProduction?.itemId).toBe('warrior');
		});

		it('should return false if nothing is being produced', () => {
			const success = manager.rushProduction(200, () => true);

			expect(success).toBe(false);
		});
	});

	describe('Query Methods', () => {
		it('should check if producing specific item', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);

			expect(manager.isProducing(ProductionItemType.Building, 'granary')).toBe(true);
			expect(manager.isProducing(ProductionItemType.Unit, 'warrior')).toBe(false);
		});

		it('should calculate turns until completion', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.productionPerTurn = 10;

			const turns = manager.getTurnsUntilCompletion(10);

			// 60 / 10 = 6 turns
			expect(turns).toBe(6);
		});

		it('should return Infinity if nothing is being produced', () => {
			const turns = manager.getTurnsUntilCompletion(10);

			expect(turns).toBe(Infinity);
		});

		it('should return Infinity if production is 0', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);

			const turns = manager.getTurnsUntilCompletion(0);

			expect(turns).toBe(Infinity);
		});

		it('should account for current progress in turns calculation', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.currentProduction!.productionProgress = 30;

			const turns = manager.getTurnsUntilCompletion(10);

			// 30 / 10 = 3 turns remaining
			expect(turns).toBe(3);
		});

		it('should check if building has been built', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 20);
			manager.processTurn(20);

			expect(manager.hasBuilding('granary')).toBe(true);
			expect(manager.hasBuilding('library')).toBe(false);
		});

		it('should check if wonder has been built', () => {
			manager.setCurrentProduction(ProductionItemType.Wonder, 'stonehenge', 'Stonehenge', 100);
			manager.processTurn(100);

			expect(manager.hasWonder('stonehenge')).toBe(true);
			expect(manager.hasWonder('pyramids')).toBe(false);
		});
	});

	describe('Summary', () => {
		it('should show production summary with progress', () => {
			manager.setCurrentProduction(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.currentProduction!.productionProgress = 30;

			const summary = manager.getSummary(10);

			expect(summary).toContain('Granary');
			expect(summary).toContain('50%'); // 30/60 = 50%
			expect(summary).toContain('3 turns'); // (60-30)/10 = 3
		});

		it('should show "None" when nothing is being produced', () => {
			const summary = manager.getSummary(10);

			expect(summary).toBe('Production: None');
		});
	});

	describe('Clone and Serialization', () => {
		it('should clone correctly', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.addProductionModifier('Forge', 15);
			manager.builtBuildings = ['monument'];
			manager.overflowProduction = 5;

			const cloned = manager.clone();

			expect(cloned.productionQueue).toHaveLength(1);
			expect(cloned.getTotalProductionModifier()).toBe(15);
			expect(cloned.builtBuildings).toContain('monument');
			expect(cloned.overflowProduction).toBe(5);
		});

		it('should not share references with clone', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			const cloned = manager.clone();

			manager.addToQueue(ProductionItemType.Unit, 'warrior', 'Warrior', 40);

			expect(manager.productionQueue).toHaveLength(2);
			expect(cloned.productionQueue).toHaveLength(1);
		});

		it('should serialize to JSON correctly', () => {
			manager.addToQueue(ProductionItemType.Building, 'granary', 'Granary', 60);
			manager.builtBuildings = ['monument'];

			const json = manager.toJSON();

			expect(json.productionQueue).toHaveLength(1);
			expect(json.builtBuildings).toContain('monument');
		});

		it('should deserialize from JSON correctly', () => {
			const data = {
				productionQueue: [
					{
						type: ProductionItemType.Building,
						itemId: 'granary',
						itemName: 'Granary',
						productionCost: 60,
						productionProgress: 20,
						turnsRemaining: 4
					}
				],
				currentProduction: {
					type: ProductionItemType.Building,
					itemId: 'granary',
					itemName: 'Granary',
					productionCost: 60,
					productionProgress: 20,
					turnsRemaining: 4
				},
				productionPerTurn: 10,
				productionModifiers: [{ source: 'Forge', value: 15 }],
				builtBuildings: ['monument'],
				builtWonders: [],
				overflowProduction: 5
			};

			const restored = CityProductionManager.fromJSON(data);

			expect(restored.productionQueue).toHaveLength(1);
			expect(restored.getTotalProductionModifier()).toBe(15);
			expect(restored.builtBuildings).toContain('monument');
			expect(restored.overflowProduction).toBe(5);
		});
	});
});
