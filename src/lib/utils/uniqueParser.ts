/**
 * UniqueParser - Parses and evaluates "Uniques" from buildings, policies, and units
 *
 * Inspired by Unciv's unique system for flexible, string-based bonuses.
 *
 * Examples:
 * - "[+2 Science] from [Jungle] tiles [in this city]"
 * - "[+10]% [Production] [in this city]"
 * - "Free [Great Scientist] appears"
 * - "[+1 Food] from [Farm] tiles [in this city]"
 * - "[+1 Culture] [in all cities]"
 * - "[-25]% Culture cost of acquiring tiles [in this city]"
 * - "[+1 Production] from every [Mountain]"
 */

/**
 * Types of unique effects
 */
export enum UniqueType {
	YieldBonus = 'yield_bonus', // +X to a yield
	YieldPercentage = 'yield_percentage', // +X% to a yield
	TileYieldBonus = 'tile_yield_bonus', // +X yield from specific tiles
	CostModifier = 'cost_modifier', // Change cost of something
	FreeUnit = 'free_unit', // Grant a free unit
	SpecialAbility = 'special_ability', // Unique special ability
	GreatPersonGeneration = 'great_person_generation', // Generate great person points
	Other = 'other' // Uncategorized
}

/**
 * Scope of where a unique applies
 */
export enum UniqueScope {
	ThisCity = 'this_city',
	AllCities = 'all_cities',
	ThisUnit = 'this_unit',
	AllUnits = 'all_units',
	Nation = 'nation',
	None = 'none'
}

/**
 * Parsed unique effect
 */
export interface ParsedUnique {
	type: UniqueType;
	scope: UniqueScope;
	rawText: string; // Original unique string

	// Common fields
	value?: number; // Numeric value (e.g., +2, +10%)
	isPercentage?: boolean; // True for percentage modifiers

	// Yield-related
	yieldType?: string; // 'Food', 'Production', 'Gold', 'Science', 'Culture', 'Faith'

	// Tile-related
	tileType?: string; // 'Jungle', 'Mountain', etc.
	improvementType?: string; // 'Farm', 'Mine', etc.
	resourceType?: string; // 'Iron', 'Wheat', etc.

	// Unit-related
	unitType?: string; // 'Great Scientist', 'Warrior', etc.

	// Cost-related
	costType?: string; // 'Culture cost of acquiring tiles', 'Policy cost', etc.

	// Conditions
	conditionals?: string[]; // Additional conditions (e.g., "when happy")
}

/**
 * UniqueParser - Parse and interpret unique strings
 */
export class UniqueParser {
	/**
	 * Parse a unique string into structured data
	 */
	static parse(uniqueString: string): ParsedUnique {
		const trimmed = uniqueString.trim();

		// Default result
		const result: ParsedUnique = {
			type: UniqueType.Other,
			scope: UniqueScope.None,
			rawText: trimmed
		};

		// Determine scope
		if (trimmed.includes('[in this city]')) {
			result.scope = UniqueScope.ThisCity;
		} else if (trimmed.includes('[in all cities]')) {
			result.scope = UniqueScope.AllCities;
		} else if (trimmed.includes('[in capital]')) {
			result.scope = UniqueScope.ThisCity;
		}

		// Parse percentage modifiers (e.g., "[+10]% [Production]")
		const percentageMatch = trimmed.match(/\[([+-]?\d+)\]%\s+\[(\w+)\]/);
		if (percentageMatch) {
			result.type = UniqueType.YieldPercentage;
			result.value = parseInt(percentageMatch[1]);
			result.yieldType = percentageMatch[2];
			result.isPercentage = true;
			return result;
		}

		// Parse cost modifiers (e.g., "[-25]% Culture cost of acquiring tiles")
		const costModifierMatch = trimmed.match(/\[([+-]?\d+)\]%\s+([\w\s]+)\s+cost/i);
		if (costModifierMatch) {
			result.type = UniqueType.CostModifier;
			result.value = parseInt(costModifierMatch[1]);
			result.costType = costModifierMatch[2].trim();
			result.isPercentage = true;
			return result;
		}

		// Parse tile yield bonuses (e.g., "[+2 Science] from [Jungle] tiles")
		const tileYieldMatch = trimmed.match(/\[([+-]?\d+)\s+(\w+)\]\s+from\s+\[(\w+)\]\s+(tiles?|improvements?)/i);
		if (tileYieldMatch) {
			result.type = UniqueType.TileYieldBonus;
			result.value = parseInt(tileYieldMatch[1]);
			result.yieldType = tileYieldMatch[2];

			// Determine if it's a tile type or improvement
			if (tileYieldMatch[4].toLowerCase().includes('tile')) {
				result.tileType = tileYieldMatch[3];
			} else {
				result.improvementType = tileYieldMatch[3];
			}

			return result;
		}

		// Parse simple yield bonuses (e.g., "[+2 Science]", "[+1 Culture]")
		const yieldMatch = trimmed.match(/\[([+-]?\d+)\s+(\w+)\]/);
		if (yieldMatch && this.isYieldType(yieldMatch[2])) {
			result.type = UniqueType.YieldBonus;
			result.value = parseInt(yieldMatch[1]);
			result.yieldType = yieldMatch[2];
			return result;
		}

		// Parse "per population" bonuses (e.g., "[+1 Science] per [2] population")
		const perPopMatch = trimmed.match(/\[([+-]?\d+)\s+(\w+)\]\s+per\s+\[(\d+)\]\s+population/i);
		if (perPopMatch) {
			result.type = UniqueType.YieldBonus;
			result.value = parseInt(perPopMatch[1]);
			result.yieldType = perPopMatch[2];
			result.conditionals = [`per ${perPopMatch[3]} population`];
			return result;
		}

		// Parse free units (e.g., "Free [Great Scientist] appears")
		const freeUnitMatch = trimmed.match(/Free\s+\[([^\]]+)\]\s+appears?/i);
		if (freeUnitMatch) {
			result.type = UniqueType.FreeUnit;
			result.unitType = freeUnitMatch[1];
			return result;
		}

		// Parse Great Person generation (e.g., "[+3] [Great Scientist] points per turn")
		const greatPersonMatch = trimmed.match(/\[([+-]?\d+)\]\s+\[(Great\s+\w+)\]\s+points/i);
		if (greatPersonMatch) {
			result.type = UniqueType.GreatPersonGeneration;
			result.value = parseInt(greatPersonMatch[1]);
			result.unitType = greatPersonMatch[2];
			return result;
		}

		// Parse special abilities (e.g., "Can build [road] improvements")
		if (trimmed.toLowerCase().includes('can build') ||
		    trimmed.toLowerCase().includes('can enter') ||
		    trimmed.toLowerCase().includes('ignores terrain')) {
			result.type = UniqueType.SpecialAbility;
			return result;
		}

		return result;
	}

	/**
	 * Parse multiple uniques at once
	 */
	static parseMany(uniqueStrings: string[]): ParsedUnique[] {
		return uniqueStrings.map(str => this.parse(str));
	}

	/**
	 * Check if a string represents a yield type
	 */
	private static isYieldType(str: string): boolean {
		const yieldTypes = [
			'Food', 'Production', 'Gold', 'Science', 'Culture', 'Faith',
			'Happiness', 'food', 'production', 'gold', 'science', 'culture', 'faith'
		];
		return yieldTypes.includes(str);
	}

	/**
	 * Filter uniques by type
	 */
	static filterByType(uniques: ParsedUnique[], type: UniqueType): ParsedUnique[] {
		return uniques.filter(u => u.type === type);
	}

	/**
	 * Filter uniques by scope
	 */
	static filterByScope(uniques: ParsedUnique[], scope: UniqueScope): ParsedUnique[] {
		return uniques.filter(u => u.scope === scope);
	}

	/**
	 * Get total yield bonus from a list of uniques
	 * @param uniques List of parsed uniques
	 * @param yieldType Which yield to calculate (Food, Production, etc.)
	 * @param scope Optional scope filter
	 */
	static getTotalYieldBonus(
		uniques: ParsedUnique[],
		yieldType: string,
		scope?: UniqueScope
	): number {
		let total = 0;

		for (const unique of uniques) {
			// Skip if wrong scope
			if (scope && unique.scope !== scope) {
				continue;
			}

			// Only count yield bonuses (not percentages)
			if (unique.type === UniqueType.YieldBonus &&
			    unique.yieldType?.toLowerCase() === yieldType.toLowerCase() &&
			    unique.value !== undefined) {
				total += unique.value;
			}
		}

		return total;
	}

	/**
	 * Get total percentage modifier from a list of uniques
	 * @param uniques List of parsed uniques
	 * @param yieldType Which yield to calculate (Food, Production, etc.)
	 * @param scope Optional scope filter
	 */
	static getTotalYieldPercentage(
		uniques: ParsedUnique[],
		yieldType: string,
		scope?: UniqueScope
	): number {
		let total = 0;

		for (const unique of uniques) {
			// Skip if wrong scope
			if (scope && unique.scope !== scope) {
				continue;
			}

			// Only count percentage modifiers
			if (unique.type === UniqueType.YieldPercentage &&
			    unique.yieldType?.toLowerCase() === yieldType.toLowerCase() &&
			    unique.value !== undefined) {
				total += unique.value;
			}
		}

		return total;
	}

	/**
	 * Get tile yield bonuses for a specific tile or improvement
	 * @param uniques List of parsed uniques
	 * @param yieldType Which yield to calculate
	 * @param tileType Terrain type (e.g., 'Jungle', 'Mountain')
	 * @param improvementType Improvement type (e.g., 'Farm', 'Mine')
	 */
	static getTileYieldBonus(
		uniques: ParsedUnique[],
		yieldType: string,
		tileType?: string,
		improvementType?: string
	): number {
		let total = 0;

		for (const unique of uniques) {
			if (unique.type !== UniqueType.TileYieldBonus ||
			    unique.yieldType?.toLowerCase() !== yieldType.toLowerCase() ||
			    unique.value === undefined) {
				continue;
			}

			// Check if tile type matches
			if (tileType && unique.tileType?.toLowerCase() === tileType.toLowerCase()) {
				total += unique.value;
			}

			// Check if improvement type matches
			if (improvementType && unique.improvementType?.toLowerCase() === improvementType.toLowerCase()) {
				total += unique.value;
			}
		}

		return total;
	}

	/**
	 * Get cost modifier for a specific cost type
	 * @param uniques List of parsed uniques
	 * @param costType Type of cost (e.g., 'Culture cost of acquiring tiles')
	 */
	static getCostModifier(uniques: ParsedUnique[], costType: string): number {
		let total = 0;

		for (const unique of uniques) {
			if (unique.type === UniqueType.CostModifier &&
			    unique.costType?.toLowerCase().includes(costType.toLowerCase()) &&
			    unique.value !== undefined) {
				total += unique.value;
			}
		}

		return total;
	}

	/**
	 * Get free units from uniques
	 */
	static getFreeUnits(uniques: ParsedUnique[]): string[] {
		return uniques
			.filter(u => u.type === UniqueType.FreeUnit && u.unitType)
			.map(u => u.unitType!);
	}

	/**
	 * Get Great Person generation rates
	 */
	static getGreatPersonGeneration(uniques: ParsedUnique[]): Map<string, number> {
		const rates = new Map<string, number>();

		for (const unique of uniques) {
			if (unique.type === UniqueType.GreatPersonGeneration &&
			    unique.unitType &&
			    unique.value !== undefined) {
				const current = rates.get(unique.unitType) || 0;
				rates.set(unique.unitType, current + unique.value);
			}
		}

		return rates;
	}

	/**
	 * Get special abilities
	 */
	static getSpecialAbilities(uniques: ParsedUnique[]): string[] {
		return uniques
			.filter(u => u.type === UniqueType.SpecialAbility)
			.map(u => u.rawText);
	}

	/**
	 * Apply uniques to base yields (for testing/evaluation)
	 * Returns modified yields with bonuses and percentages applied
	 */
	static applyYieldUniques(
		uniques: ParsedUnique[],
		baseYields: { food: number; production: number; gold: number; science: number; culture: number; faith?: number },
		scope?: UniqueScope
	): typeof baseYields {
		const result = { ...baseYields };

		// Apply flat bonuses first
		const yieldTypes = ['food', 'production', 'gold', 'science', 'culture', 'faith'];

		for (const yieldType of yieldTypes) {
			const flatBonus = this.getTotalYieldBonus(uniques, yieldType, scope);
			if (flatBonus !== 0) {
				(result as any)[yieldType] = ((result as any)[yieldType] || 0) + flatBonus;
			}
		}

		// Apply percentage modifiers
		for (const yieldType of yieldTypes) {
			const percentageBonus = this.getTotalYieldPercentage(uniques, yieldType, scope);
			if (percentageBonus !== 0) {
				const currentValue = (result as any)[yieldType] || 0;
				(result as any)[yieldType] = Math.floor(currentValue * (1 + percentageBonus / 100));
			}
		}

		return result;
	}
}

/**
 * Helper function to parse a single unique string
 */
export function parseUnique(uniqueString: string): ParsedUnique {
	return UniqueParser.parse(uniqueString);
}

/**
 * Helper function to parse multiple unique strings
 */
export function parseUniques(uniqueStrings: string[]): ParsedUnique[] {
	return UniqueParser.parseMany(uniqueStrings);
}
