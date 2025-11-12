/**
 * Meaning Tables Roller - Helper functions for rolling on Action and Description Meaning Tables
 * Returns two-word combinations for narrative inspiration
 */

import { ActionsTable1, ActionsTable2, DescriptionsTable1, DescriptionsTable2 } from './index';
import { rollD100 } from '$lib/utils/mythicDice';

export interface MeaningResult {
	word1: string;
	word2: string;
	roll1: number;
	roll2: number;
}

/**
 * Roll on Action Meaning Tables
 * Rolls once on each Actions table (1 and 2) to get two action words
 */
export function rollActionMeaning(): MeaningResult {
	const table1 = new ActionsTable1();
	const table2 = new ActionsTable2();

	const result1 = table1.role();
	const result2 = table2.role();

	return {
		word1: result1.text || '',
		word2: result2.text || '',
		roll1: 0, // Table class handles rolling internally
		roll2: 0
	};
}

/**
 * Roll on Description Meaning Tables
 * Rolls once on each Descriptions table (1 and 2) to get two descriptive words
 */
export function rollDescriptionMeaning(): MeaningResult {
	const table1 = new DescriptionsTable1();
	const table2 = new DescriptionsTable2();

	const result1 = table1.role();
	const result2 = table2.role();

	return {
		word1: result1.text || '',
		word2: result2.text || '',
		roll1: 0, // Table class handles rolling internally
		roll2: 0
	};
}
