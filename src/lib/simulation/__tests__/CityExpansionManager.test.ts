/**
 * Unit tests for CityExpansionManager
 * Tests cultural border expansion and tile acquisition
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CityExpansionManager } from '../managers/CityExpansionManager';

describe('CityExpansionManager', () => {
	let manager: CityExpansionManager;
	const centerHexId = 'hex-center';

	beforeEach(() => {
		manager = new CityExpansionManager(centerHexId);
	});

	describe('Initialization', () => {
		it('should start with center hex owned', () => {
			expect(manager.ownedHexTileIds).toContain(centerHexId);
			expect(manager.ownedHexTileIds).toHaveLength(1);
		});

		it('should calculate initial culture cost', () => {
			// Formula: 10 + (tilesAcquired * 4) + (tilesAcquired ^ 1.5)
			// With tilesAcquired = 0: 10 + 0 + 0 = 10
			expect(manager.cultureNeededForExpansion).toBe(10);
		});

		it('should start with 0 culture stored', () => {
			expect(manager.cultureStored).toBe(0);
		});

		it('should start with 0 tiles acquired', () => {
			expect(manager.tilesAcquired).toBe(0);
		});

		it('should have work radius of 3', () => {
			expect(manager.workRadius).toBe(3);
		});
	});

	describe('Culture Cost Calculation', () => {
		it('should calculate cost for first tile', () => {
			manager.tilesAcquired = 0;
			manager.calculateCultureCost();

			// 10 + 0 + 0 = 10
			expect(manager.cultureNeededForExpansion).toBe(10);
		});

		it('should calculate cost for second tile', () => {
			manager.tilesAcquired = 1;
			manager.calculateCultureCost();

			// 10 + (1*4) + (1^1.5) = 10 + 4 + 1 = 15
			expect(manager.cultureNeededForExpansion).toBe(15);
		});

		it('should calculate cost for third tile', () => {
			manager.tilesAcquired = 2;
			manager.calculateCultureCost();

			// 10 + (2*4) + (2^1.5) = 10 + 8 + 2.828... = 21 (rounded up)
			expect(manager.cultureNeededForExpansion).toBe(21);
		});

		it('should calculate cost for fifth tile', () => {
			manager.tilesAcquired = 4;
			manager.calculateCultureCost();

			// 10 + (4*4) + (4^1.5) = 10 + 16 + 8 = 34
			expect(manager.cultureNeededForExpansion).toBe(34);
		});

		it('should apply culture cost modifiers', () => {
			manager.addCultureCostModifier('Tradition', -25); // -25% cost
			manager.tilesAcquired = 1;
			manager.calculateCultureCost();

			// Base cost: 15
			// With -25%: 15 * 0.75 = 11.25, rounded up to 12
			expect(manager.cultureNeededForExpansion).toBe(12);
		});

		it('should recalculate cost when adding modifier', () => {
			manager.tilesAcquired = 1;
			manager.calculateCultureCost(); // Recalculate after changing tilesAcquired
			const costBefore = manager.cultureNeededForExpansion; // Should be 15

			manager.addCultureCostModifier('Tradition', -25);

			// 15 * 0.75 = 11.25, rounded up to 12
			expect(manager.cultureNeededForExpansion).toBeLessThan(costBefore); // 12 < 15
		});
	});

	describe('Culture Cost Modifiers', () => {
		it('should add culture cost modifiers', () => {
			manager.addCultureCostModifier('Tradition', -25);

			expect(manager.getTotalCultureCostModifier()).toBe(-25);
		});

		it('should stack modifiers from different sources', () => {
			manager.addCultureCostModifier('Tradition', -25);
			manager.addCultureCostModifier('Wonder', -15);

			expect(manager.getTotalCultureCostModifier()).toBe(-40);
		});

		it('should replace modifier from same source', () => {
			manager.addCultureCostModifier('Tradition', -25);
			manager.addCultureCostModifier('Tradition', -33); // Replace

			expect(manager.getTotalCultureCostModifier()).toBe(-33);
		});

		it('should remove modifier when set to 0', () => {
			manager.addCultureCostModifier('Tradition', -25);
			manager.addCultureCostModifier('Tradition', 0); // Remove

			expect(manager.getTotalCultureCostModifier()).toBe(0);
		});
	});

	describe('Cultural Expansion', () => {
		it('should accumulate culture over turns', () => {
			const availableTiles = ['hex-1'];

			manager.processTurn(3, 1, availableTiles);
			expect(manager.cultureStored).toBe(3);

			manager.processTurn(3, 2, availableTiles);
			expect(manager.cultureStored).toBe(6);
		});

		it('should expand when culture threshold is reached', () => {
			const availableTiles = ['hex-1', 'hex-2'];

			// Accumulate culture (need 10)
			manager.processTurn(5, 1, availableTiles); // 5
			manager.processTurn(5, 2, availableTiles); // 10 - expansion!

			expect(manager.ownedHexTileIds).toHaveLength(2);
			expect(manager.ownedHexTileIds).toContain('hex-1'); // First available
		});

		it('should reset culture after expansion', () => {
			const availableTiles = ['hex-1'];

			manager.processTurn(10, 1, availableTiles); // Expand

			expect(manager.cultureStored).toBe(0);
		});

		it('should increment tiles acquired after expansion', () => {
			const availableTiles = ['hex-1'];

			expect(manager.tilesAcquired).toBe(0);

			manager.processTurn(10, 1, availableTiles); // First expansion

			expect(manager.tilesAcquired).toBe(1);
		});

		it('should recalculate culture cost after expansion', () => {
			const availableTiles = ['hex-1', 'hex-2'];

			const costBefore = manager.cultureNeededForExpansion; // 10
			manager.processTurn(10, 1, availableTiles); // First expansion
			const costAfter = manager.cultureNeededForExpansion; // 15

			expect(costAfter).toBeGreaterThan(costBefore);
		});

		it('should track last expansion turn', () => {
			const availableTiles = ['hex-1'];

			manager.processTurn(10, 5, availableTiles); // Expand on turn 5

			expect(manager.lastExpansionTurn).toBe(5);
		});

		it('should return expansion result with acquired hex', () => {
			const availableTiles = ['hex-1'];

			const result = manager.processTurn(10, 1, availableTiles);

			expect(result.expanded).toBe(true);
			expect(result.acquiredHexId).toBe('hex-1');
		});

		it('should not expand if no tiles available', () => {
			const availableTiles: string[] = [];

			const result = manager.processTurn(10, 1, availableTiles);

			expect(result.expanded).toBe(false);
			expect(manager.cultureStored).toBe(10); // Culture not consumed
		});

		it('should track total culture generated', () => {
			const availableTiles = ['hex-1'];

			manager.processTurn(5, 1, availableTiles);
			manager.processTurn(5, 2, availableTiles); // Total: 10

			expect(manager.totalCultureGenerated).toBe(10);
		});
	});

	describe('Tile Acquisition', () => {
		it('should acquire specific tile', () => {
			manager.acquireTile('hex-1', 1);

			expect(manager.ownedHexTileIds).toContain('hex-1');
			expect(manager.tilesAcquired).toBe(1);
		});

		it('should not duplicate tiles', () => {
			manager.acquireTile('hex-1', 1);
			manager.acquireTile('hex-1', 2); // Try again

			const count = manager.ownedHexTileIds.filter(id => id === 'hex-1').length;
			expect(count).toBe(1);
			expect(manager.tilesAcquired).toBe(1); // Still 1
		});

		it('should update last expansion turn on acquisition', () => {
			manager.acquireTile('hex-1', 5);

			expect(manager.lastExpansionTurn).toBe(5);
		});
	});

	describe('Gold Purchase', () => {
		it('should buy tile with gold', () => {
			const success = manager.buyTile('hex-1', 100, () => true, 1);

			expect(success).toBe(true);
			expect(manager.ownedHexTileIds).toContain('hex-1');
		});

		it('should fail if tile already owned', () => {
			manager.acquireTile('hex-1', 1);

			const success = manager.buyTile('hex-1', 100, () => true, 2);

			expect(success).toBe(false);
		});

		it('should fail if payment fails', () => {
			const success = manager.buyTile('hex-1', 100, () => false, 1);

			expect(success).toBe(false);
			expect(manager.ownedHexTileIds).not.toContain('hex-1');
		});

		it('should increment tiles acquired when buying', () => {
			manager.buyTile('hex-1', 100, () => true, 1);

			expect(manager.tilesAcquired).toBe(1);
		});
	});

	describe('Culture Bomb', () => {
		it('should acquire all available tiles instantly', () => {
			const availableTiles = ['hex-1', 'hex-2', 'hex-3'];

			const acquired = manager.cultureBomb(availableTiles, 1);

			expect(acquired).toHaveLength(3);
			expect(manager.ownedHexTileIds).toHaveLength(4); // center + 3
		});

		it('should not acquire already owned tiles', () => {
			manager.acquireTile('hex-1', 1);
			const availableTiles = ['hex-1', 'hex-2', 'hex-3'];

			const acquired = manager.cultureBomb(availableTiles, 2);

			expect(acquired).toHaveLength(2); // Only hex-2 and hex-3
			expect(acquired).not.toContain('hex-1');
		});

		it('should increment tiles acquired for each new tile', () => {
			const availableTiles = ['hex-1', 'hex-2'];

			manager.cultureBomb(availableTiles, 1);

			expect(manager.tilesAcquired).toBe(2);
		});

		it('should return acquired tiles', () => {
			const availableTiles = ['hex-1', 'hex-2'];

			const acquired = manager.cultureBomb(availableTiles, 1);

			expect(acquired).toContain('hex-1');
			expect(acquired).toContain('hex-2');
		});
	});

	describe('Tile Selection', () => {
		it('should select first available tile when no scoring', () => {
			const availableTiles = ['hex-1', 'hex-2', 'hex-3'];

			const selected = manager.selectNextTileToAcquire(availableTiles);

			expect(selected).toBe('hex-1'); // First in list
		});

		it('should return null if no tiles available', () => {
			const availableTiles: string[] = [];

			const selected = manager.selectNextTileToAcquire(availableTiles);

			expect(selected).toBeNull();
		});

		it('should score tiles based on resources and yields', () => {
			const score = manager.scoreTileForAcquisition(
				'hex-1',
				1, // distance
				true, // luxury resource
				false,
				{ food: 2, production: 2, gold: 1, science: 0, culture: 0 }
			);

			// 100 (luxury) + 6 (food) + 6 (prod) + 2 (gold) - 5 (distance) = 109
			expect(score).toBe(109);
		});

		it('should value luxury resources highly', () => {
			const luxuryScore = manager.scoreTileForAcquisition(
				'hex-1',
				1,
				true, // luxury
				false,
				{ food: 0, production: 0, gold: 0, science: 0, culture: 0 }
			);

			const normalScore = manager.scoreTileForAcquisition(
				'hex-2',
				1,
				false,
				false,
				{ food: 0, production: 0, gold: 0, science: 0, culture: 0 }
			);

			expect(luxuryScore).toBeGreaterThan(normalScore);
		});

		it('should prefer closer tiles', () => {
			const nearScore = manager.scoreTileForAcquisition(
				'hex-1',
				1, // close
				false,
				false,
				{ food: 0, production: 0, gold: 0, science: 0, culture: 0 }
			);

			const farScore = manager.scoreTileForAcquisition(
				'hex-2',
				3, // far
				false,
				false,
				{ food: 0, production: 0, gold: 0, science: 0, culture: 0 }
			);

			expect(nearScore).toBeGreaterThan(farScore);
		});
	});

	describe('Workable Tiles', () => {
		it('should check if tile can be worked', () => {
			manager.acquireTile('hex-1', 1);

			expect(manager.canWork('hex-1', 2)).toBe(true); // Within range
			expect(manager.canWork('hex-1', 5)).toBe(false); // Too far
			expect(manager.canWork('hex-2', 1)).toBe(false); // Not owned
		});

		it('should return all workable tiles', () => {
			manager.acquireTile('hex-1', 1);
			manager.acquireTile('hex-2', 2);

			const workable = manager.getWorkableTiles();

			expect(workable).toHaveLength(3); // center + 2
		});
	});

	describe('Turns Until Expansion', () => {
		it('should calculate turns until next expansion', () => {
			manager.cultureStored = 5;
			manager.cultureNeededForExpansion = 15;

			const turns = manager.getTurnsUntilExpansion(5);

			// Need 10 more, at 5 per turn = 2 turns
			expect(turns).toBe(2);
		});

		it('should return Infinity if no culture per turn', () => {
			const turns = manager.getTurnsUntilExpansion(0);

			expect(turns).toBe(Infinity);
		});

		it('should account for current culture stored', () => {
			manager.cultureStored = 8;
			manager.cultureNeededForExpansion = 10;

			const turns = manager.getTurnsUntilExpansion(1);

			// Need 2 more, at 1 per turn = 2 turns
			expect(turns).toBe(2);
		});

		it('should round up fractional turns', () => {
			manager.cultureStored = 0;
			manager.cultureNeededForExpansion = 10;

			const turns = manager.getTurnsUntilExpansion(3);

			// Need 10, at 3 per turn = 3.33... rounded up to 4
			expect(turns).toBe(4);
		});
	});

	describe('Summary', () => {
		it('should show expansion summary with turns', () => {
			manager.cultureStored = 0;
			manager.cultureNeededForExpansion = 10;

			const summary = manager.getSummary(5);

			expect(summary).toContain('1 tiles'); // center only
			expect(summary).toContain('2 turns to expand');
		});

		it('should show "No expansion" when no culture', () => {
			const summary = manager.getSummary(0);

			expect(summary).toContain('No expansion');
		});

		it('should update tile count in summary', () => {
			manager.acquireTile('hex-1', 1);
			manager.acquireTile('hex-2', 2);

			const summary = manager.getSummary(5);

			expect(summary).toContain('3 tiles'); // center + 2
		});
	});

	describe('Clone and Serialization', () => {
		it('should clone correctly', () => {
			manager.acquireTile('hex-1', 1);
			manager.cultureStored = 5;
			manager.addCultureCostModifier('Tradition', -25);

			const cloned = manager.clone();

			expect(cloned.ownedHexTileIds).toHaveLength(2);
			expect(cloned.cultureStored).toBe(5);
			expect(cloned.getTotalCultureCostModifier()).toBe(-25);
		});

		it('should not share references with clone', () => {
			manager.acquireTile('hex-1', 1);
			const cloned = manager.clone();

			manager.acquireTile('hex-2', 2);

			expect(manager.ownedHexTileIds).toHaveLength(3);
			expect(cloned.ownedHexTileIds).toHaveLength(2);
		});

		it('should serialize to JSON correctly', () => {
			manager.acquireTile('hex-1', 1);
			manager.cultureStored = 5;

			const json = manager.toJSON();

			expect(json.ownedHexTileIds).toHaveLength(2);
			expect(json.cultureStored).toBe(5);
		});

		it('should deserialize from JSON correctly', () => {
			const data = {
				ownedHexTileIds: [centerHexId, 'hex-1', 'hex-2'],
				workRadius: 3,
				cultureStored: 5,
				cultureNeededForExpansion: 15,
				totalCultureGenerated: 20,
				tilesAcquired: 2,
				lastExpansionTurn: 5,
				cultureCostModifiers: [{ source: 'Tradition', value: -25 }]
			};

			const restored = CityExpansionManager.fromJSON(data);

			expect(restored.ownedHexTileIds).toHaveLength(3);
			expect(restored.cultureStored).toBe(5);
			expect(restored.tilesAcquired).toBe(2);
			expect(restored.getTotalCultureCostModifier()).toBe(-25);
		});
	});
});
