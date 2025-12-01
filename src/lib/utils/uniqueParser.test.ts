/**
 * Unit tests for UniqueParser
 */

import { describe, it, expect } from 'vitest';
import {
	UniqueParser,
	UniqueType,
	UniqueScope,
	parseUnique,
	parseUniques
} from './uniqueParser';

describe('UniqueParser', () => {
	describe('Scope Detection', () => {
		it('should detect "in this city" scope', () => {
			const result = parseUnique('[+2 Science] [in this city]');
			expect(result.scope).toBe(UniqueScope.ThisCity);
		});

		it('should detect "in all cities" scope', () => {
			const result = parseUnique('[+1 Culture] [in all cities]');
			expect(result.scope).toBe(UniqueScope.AllCities);
		});

		it('should detect "in capital" scope', () => {
			const result = parseUnique('[+5 Gold] [in capital]');
			expect(result.scope).toBe(UniqueScope.ThisCity);
		});
	});

	describe('Yield Bonuses', () => {
		it('should parse simple yield bonus', () => {
			const result = parseUnique('[+2 Science]');
			expect(result.type).toBe(UniqueType.YieldBonus);
			expect(result.value).toBe(2);
			expect(result.yieldType).toBe('Science');
		});

		it('should parse negative yield', () => {
			const result = parseUnique('[-1 Gold]');
			expect(result.type).toBe(UniqueType.YieldBonus);
			expect(result.value).toBe(-1);
			expect(result.yieldType).toBe('Gold');
		});

		it('should parse culture bonus', () => {
			const result = parseUnique('[+1 Culture] [in this city]');
			expect(result.type).toBe(UniqueType.YieldBonus);
			expect(result.value).toBe(1);
			expect(result.yieldType).toBe('Culture');
			expect(result.scope).toBe(UniqueScope.ThisCity);
		});
	});

	describe('Percentage Modifiers', () => {
		it('should parse percentage production bonus', () => {
			const result = parseUnique('[+10]% [Production] [in this city]');
			expect(result.type).toBe(UniqueType.YieldPercentage);
			expect(result.value).toBe(10);
			expect(result.yieldType).toBe('Production');
			expect(result.isPercentage).toBe(true);
			expect(result.scope).toBe(UniqueScope.ThisCity);
		});

		it('should parse negative percentage modifier', () => {
			const result = parseUnique('[-20]% [Gold]');
			expect(result.type).toBe(UniqueType.YieldPercentage);
			expect(result.value).toBe(-20);
			expect(result.yieldType).toBe('Gold');
		});
	});

	describe('Tile Yield Bonuses', () => {
		it('should parse yield from terrain tiles', () => {
			const result = parseUnique('[+2 Science] from [Jungle] tiles [in this city]');
			expect(result.type).toBe(UniqueType.TileYieldBonus);
			expect(result.value).toBe(2);
			expect(result.yieldType).toBe('Science');
			expect(result.tileType).toBe('Jungle');
			expect(result.scope).toBe(UniqueScope.ThisCity);
		});

		it('should parse yield from improvements', () => {
			const result = parseUnique('[+1 Food] from [Farm] improvements');
			expect(result.type).toBe(UniqueType.TileYieldBonus);
			expect(result.value).toBe(1);
			expect(result.yieldType).toBe('Food');
			expect(result.improvementType).toBe('Farm');
		});

		it('should parse production from mountain tiles', () => {
			const result = parseUnique('[+1 Production] from [Mountain] tiles');
			expect(result.type).toBe(UniqueType.TileYieldBonus);
			expect(result.value).toBe(1);
			expect(result.yieldType).toBe('Production');
			expect(result.tileType).toBe('Mountain');
		});
	});

	describe('Cost Modifiers', () => {
		it('should parse culture cost reduction', () => {
			const result = parseUnique('[-25]% Culture cost of acquiring tiles [in this city]');
			expect(result.type).toBe(UniqueType.CostModifier);
			expect(result.value).toBe(-25);
			expect(result.costType).toBe('Culture');
			expect(result.isPercentage).toBe(true);
			expect(result.scope).toBe(UniqueScope.ThisCity);
		});

		it('should parse policy cost modifier', () => {
			const result = parseUnique('[-10]% Policy cost');
			expect(result.type).toBe(UniqueType.CostModifier);
			expect(result.value).toBe(-10);
			expect(result.costType).toBe('Policy');
		});
	});

	describe('Free Units', () => {
		it('should parse free Great Scientist', () => {
			const result = parseUnique('Free [Great Scientist] appears');
			expect(result.type).toBe(UniqueType.FreeUnit);
			expect(result.unitType).toBe('Great Scientist');
		});

		it('should parse free Settler', () => {
			const result = parseUnique('Free [Settler] appears');
			expect(result.type).toBe(UniqueType.FreeUnit);
			expect(result.unitType).toBe('Settler');
		});
	});

	describe('Great Person Generation', () => {
		it('should parse Great Scientist points', () => {
			const result = parseUnique('[+3] [Great Scientist] points per turn');
			expect(result.type).toBe(UniqueType.GreatPersonGeneration);
			expect(result.value).toBe(3);
			expect(result.unitType).toBe('Great Scientist');
		});

		it('should parse Great Artist points', () => {
			const result = parseUnique('[+2] [Great Artist] points per turn');
			expect(result.type).toBe(UniqueType.GreatPersonGeneration);
			expect(result.value).toBe(2);
			expect(result.unitType).toBe('Great Artist');
		});
	});

	describe('Per Population', () => {
		it('should parse science per population', () => {
			const result = parseUnique('[+1 Science] per [2] population [in this city]');
			expect(result.type).toBe(UniqueType.YieldBonus);
			expect(result.value).toBe(1);
			expect(result.yieldType).toBe('Science');
			// TODO: Parser doesn't currently support conditionals for per-population bonuses
			// This is a known limitation that should be addressed in the parser implementation
		});
	});

	describe('Special Abilities', () => {
		it('should detect "can build" abilities', () => {
			const result = parseUnique('Can build [road] improvements');
			expect(result.type).toBe(UniqueType.SpecialAbility);
		});

		it('should detect terrain ignoring abilities', () => {
			const result = parseUnique('Ignores terrain cost');
			expect(result.type).toBe(UniqueType.SpecialAbility);
		});
	});

	describe('Batch Parsing', () => {
		it('should parse multiple uniques at once', () => {
			const uniques = [
				'[+2 Science] [in this city]',
				'[+10]% [Production] [in this city]',
				'Free [Great Scientist] appears'
			];

			const results = parseUniques(uniques);

			expect(results).toHaveLength(3);
			expect(results[0].type).toBe(UniqueType.YieldBonus);
			expect(results[1].type).toBe(UniqueType.YieldPercentage);
			expect(results[2].type).toBe(UniqueType.FreeUnit);
		});
	});

	describe('Filtering', () => {
		const uniques = parseUniques([
			'[+2 Science] [in this city]',
			'[+1 Culture] [in all cities]',
			'[+10]% [Production] [in this city]',
			'Free [Great Scientist] appears'
		]);

		it('should filter by type', () => {
			const yieldBonuses = UniqueParser.filterByType(uniques, UniqueType.YieldBonus);
			expect(yieldBonuses).toHaveLength(2);
		});

		it('should filter by scope', () => {
			const cityUniques = UniqueParser.filterByScope(uniques, UniqueScope.ThisCity);
			expect(cityUniques).toHaveLength(2);
		});
	});

	describe('Total Calculations', () => {
		const uniques = parseUniques([
			'[+2 Science] [in this city]',
			'[+1 Science] [in this city]',
			'[+3 Science] [in all cities]',
			'[+10]% [Science] [in this city]'
		]);

		it('should calculate total yield bonus', () => {
			const total = UniqueParser.getTotalYieldBonus(uniques, 'Science');
			expect(total).toBe(6); // 2 + 1 + 3
		});

		it('should calculate yield bonus for specific scope', () => {
			const total = UniqueParser.getTotalYieldBonus(uniques, 'Science', UniqueScope.ThisCity);
			expect(total).toBe(3); // 2 + 1
		});

		it('should calculate total percentage modifier', () => {
			const total = UniqueParser.getTotalYieldPercentage(uniques, 'Science', UniqueScope.ThisCity);
			expect(total).toBe(10);
		});
	});

	describe('Tile Yield Calculations', () => {
		const uniques = parseUniques([
			'[+2 Science] from [Jungle] tiles [in this city]',
			'[+1 Food] from [Farm] improvements',
			'[+1 Production] from [Mine] improvements'
		]);

		it('should calculate jungle science bonus', () => {
			const bonus = UniqueParser.getTileYieldBonus(uniques, 'Science', 'Jungle');
			expect(bonus).toBe(2);
		});

		it('should calculate farm food bonus', () => {
			const bonus = UniqueParser.getTileYieldBonus(uniques, 'Food', undefined, 'Farm');
			expect(bonus).toBe(1);
		});

		it('should return 0 for non-matching tiles', () => {
			const bonus = UniqueParser.getTileYieldBonus(uniques, 'Gold', 'Desert');
			expect(bonus).toBe(0);
		});
	});

	describe('Cost Modifier Calculations', () => {
		const uniques = parseUniques([
			'[-25]% Culture cost of acquiring tiles [in this city]',
			'[-10]% Policy cost'
		]);

		it('should calculate culture cost modifier', () => {
			const modifier = UniqueParser.getCostModifier(uniques, 'Culture');
			expect(modifier).toBe(-25);
		});

		it('should calculate policy cost modifier', () => {
			const modifier = UniqueParser.getCostModifier(uniques, 'Policy');
			expect(modifier).toBe(-10);
		});
	});

	describe('Free Units', () => {
		const uniques = parseUniques([
			'Free [Great Scientist] appears',
			'Free [Settler] appears',
			'[+2 Science] [in this city]' // Not a free unit
		]);

		it('should extract free units', () => {
			const freeUnits = UniqueParser.getFreeUnits(uniques);
			expect(freeUnits).toHaveLength(2);
			expect(freeUnits).toContain('Great Scientist');
			expect(freeUnits).toContain('Settler');
		});
	});

	describe('Great Person Generation', () => {
		const uniques = parseUniques([
			'[+3] [Great Scientist] points per turn',
			'[+2] [Great Artist] points per turn',
			'[+1] [Great Scientist] points per turn' // Stacks
		]);

		it('should calculate Great Person generation rates', () => {
			const rates = UniqueParser.getGreatPersonGeneration(uniques);
			expect(rates.get('Great Scientist')).toBe(4); // 3 + 1
			expect(rates.get('Great Artist')).toBe(2);
		});
	});

	describe('Apply Yield Uniques', () => {
		const uniques = parseUniques([
			'[+2 Science] [in this city]',
			'[+10]% [Production] [in this city]',
			'[+1 Food] [in this city]'
		]);

		it('should apply flat and percentage bonuses', () => {
			const baseYields = {
				food: 5,
				production: 10,
				gold: 3,
				science: 2,
				culture: 1
			};

			const modified = UniqueParser.applyYieldUniques(uniques, baseYields, UniqueScope.ThisCity);

			expect(modified.food).toBe(6); // 5 + 1
			expect(modified.production).toBe(11); // floor(10 * 1.1) = 11
			expect(modified.science).toBe(4); // 2 + 2
			expect(modified.culture).toBe(1); // Unchanged
		});
	});

	describe('Real-World Examples from Unciv', () => {
		it('should parse Library unique', () => {
			const result = parseUnique('[+1 Science] per [2] population [in this city]');
			expect(result.type).toBe(UniqueType.YieldBonus);
			expect(result.yieldType).toBe('Science');
			expect(result.value).toBe(1);
		});

		it('should parse Tradition opener unique', () => {
			const result = parseUnique('[-25]% Culture cost of acquiring tiles [in this city]');
			expect(result.type).toBe(UniqueType.CostModifier);
			expect(result.value).toBe(-25);
			expect(result.costType).toBe('Culture');
		});

		it('should parse University unique', () => {
			const result = parseUnique('[+2 Science] from [Jungle] tiles [in this city]');
			expect(result.type).toBe(UniqueType.TileYieldBonus);
			expect(result.value).toBe(2);
			expect(result.yieldType).toBe('Science');
			expect(result.tileType).toBe('Jungle');
		});

		it('should parse Workshop unique', () => {
			const result = parseUnique('[+10]% [Production] [in this city]');
			expect(result.type).toBe(UniqueType.YieldPercentage);
			expect(result.value).toBe(10);
			expect(result.yieldType).toBe('Production');
		});
	});
});
