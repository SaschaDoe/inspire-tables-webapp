import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';
import { FATE_CHART_DATA, OddsLevel } from './types';

/**
 * Mythic GME Fate Chart
 * 2D lookup table for determining Fate Question outcomes
 * Cross-references Odds Level with Chaos Factor
 */
export class FateChartTable extends Table {
	constructor() {
		// Create dummy entries for Table base class compatibility
		// The Fate Chart is actually a 2D lookup, not a rollable 1D table
		const entries = [
			new TableEntry('Fate Chart - Use lookup() method for 2D access').withRoleInterval(1, 1)
		];

		super(entries, TableTitles.MythicFateChart, TableType.SoloRPG, new DiceRole(1, 100));
	}

	/**
	 * Look up Fate Chart thresholds for a given Odds Level and Chaos Factor
	 * @param oddsLevel - The odds level (Impossible to Certain)
	 * @param chaosFactor - The chaos factor (1-9)
	 * @returns Object with low (Exceptional Yes ≤), mid (Yes ≤), high (Exceptional No ≥) thresholds
	 */
	lookup(oddsLevel: OddsLevel, chaosFactor: number): { low: number; mid: number; high: number } {
		if (chaosFactor < 1 || chaosFactor > 9) {
			throw new Error('Chaos Factor must be between 1 and 9');
		}

		const result = FATE_CHART_DATA[oddsLevel][chaosFactor];
		if (!result) {
			throw new Error(`No Fate Chart data for ${oddsLevel} at Chaos Factor ${chaosFactor}`);
		}

		return result;
	}

	/**
	 * Evaluate a d100 roll against the Fate Chart
	 * @param roll - The d100 roll (1-100)
	 * @param oddsLevel - The odds level
	 * @param chaosFactor - The chaos factor (1-9)
	 * @returns The fate answer: 'Exceptional Yes', 'Yes', 'No', or 'Exceptional No'
	 */
	evaluateRoll(
		roll: number,
		oddsLevel: OddsLevel,
		chaosFactor: number
	): 'Exceptional Yes' | 'Yes' | 'No' | 'Exceptional No' {
		const thresholds = this.lookup(oddsLevel, chaosFactor);

		// Check for Exceptional Yes (roll ≤ low threshold)
		// Note: low threshold of 0 means Exceptional Yes is not possible (marked as 'X' in chart)
		if (thresholds.low > 0 && roll <= thresholds.low) {
			return 'Exceptional Yes';
		}

		// Check for Yes (roll ≤ mid threshold)
		if (roll <= thresholds.mid) {
			return 'Yes';
		}

		// Check for Exceptional No (roll ≥ high threshold)
		// Note: high threshold of 101 means Exceptional No is not possible (marked as 'x' in chart)
		if (thresholds.high <= 100 && roll >= thresholds.high) {
			return 'Exceptional No';
		}

		// Otherwise it's a regular No
		return 'No';
	}

	/**
	 * Check if a d100 roll triggers a Random Event
	 * Random Event occurs when roll is doubles (11, 22, 33...) AND single digit ≤ Chaos Factor
	 * @param roll - The d100 roll (1-100)
	 * @param chaosFactor - The chaos factor (1-9)
	 * @returns true if this roll triggers a Random Event
	 */
	isRandomEvent(roll: number, chaosFactor: number): boolean {
		// Check if roll is doubles
		const tens = Math.floor(roll / 10);
		const ones = roll % 10;
		const isDoubles = tens === ones;

		// Single digit is the ones place
		return isDoubles && ones <= chaosFactor;
	}
}
