// Fate Chart utilities for Mythic GME
import type { FateAnswer } from './mythicDice';

export enum OddsLevel {
	Impossible = 'Impossible',
	NearlyImpossible = 'Nearly Impossible',
	VeryUnlikely = 'Very Unlikely',
	Unlikely = 'Unlikely',
	FiftyFifty = '50/50',
	Likely = 'Likely',
	VeryLikely = 'Very Likely',
	NearlyCertain = 'Nearly Certain',
	Certain = 'Certain'
}

// Ordered array for UI dropdowns
export const ODDS_LEVELS = [
	OddsLevel.Impossible,
	OddsLevel.NearlyImpossible,
	OddsLevel.VeryUnlikely,
	OddsLevel.Unlikely,
	OddsLevel.FiftyFifty,
	OddsLevel.Likely,
	OddsLevel.VeryLikely,
	OddsLevel.NearlyCertain,
	OddsLevel.Certain
];

interface FateThresholds {
	exceptionalYes: number; // Roll <= this for Exceptional Yes
	yes: number; // Roll <= this for Yes
	exceptionalNo: number; // Roll > this for Exceptional No
}

/**
 * Mythic GME 2nd Edition Fate Chart Data
 * Row = Odds Level, Column = Chaos Factor (1-9)
 * Values represent the threshold for YES (roll at or below)
 * Exceptional Yes is typically first 20% of YES range
 * Exceptional No is typically last 20% of NO range
 */
export const FATE_CHART_DATA: Record<number, Record<OddsLevel, FateThresholds>> = {
	1: {
		[OddsLevel.Impossible]: { exceptionalYes: 1, yes: 10, exceptionalNo: 95 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 1, yes: 15, exceptionalNo: 95 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 1, yes: 25, exceptionalNo: 95 },
		[OddsLevel.Unlikely]: { exceptionalYes: 2, yes: 45, exceptionalNo: 96 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 3, yes: 65, exceptionalNo: 97 },
		[OddsLevel.Likely]: { exceptionalYes: 5, yes: 85, exceptionalNo: 98 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 10, yes: 95, exceptionalNo: 99 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 15, yes: 99, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 20, yes: 100, exceptionalNo: 100 }
	},
	2: {
		[OddsLevel.Impossible]: { exceptionalYes: 1, yes: 10, exceptionalNo: 95 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 1, yes: 15, exceptionalNo: 95 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 1, yes: 25, exceptionalNo: 95 },
		[OddsLevel.Unlikely]: { exceptionalYes: 2, yes: 45, exceptionalNo: 96 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 3, yes: 65, exceptionalNo: 97 },
		[OddsLevel.Likely]: { exceptionalYes: 5, yes: 85, exceptionalNo: 98 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 10, yes: 95, exceptionalNo: 99 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 15, yes: 99, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 20, yes: 100, exceptionalNo: 100 }
	},
	3: {
		[OddsLevel.Impossible]: { exceptionalYes: 1, yes: 10, exceptionalNo: 95 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 1, yes: 15, exceptionalNo: 95 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 1, yes: 30, exceptionalNo: 96 },
		[OddsLevel.Unlikely]: { exceptionalYes: 3, yes: 50, exceptionalNo: 97 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 5, yes: 70, exceptionalNo: 98 },
		[OddsLevel.Likely]: { exceptionalYes: 7, yes: 85, exceptionalNo: 98 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 10, yes: 95, exceptionalNo: 99 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 15, yes: 99, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 20, yes: 100, exceptionalNo: 100 }
	},
	4: {
		[OddsLevel.Impossible]: { exceptionalYes: 1, yes: 15, exceptionalNo: 96 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 2, yes: 20, exceptionalNo: 96 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 2, yes: 35, exceptionalNo: 97 },
		[OddsLevel.Unlikely]: { exceptionalYes: 3, yes: 55, exceptionalNo: 97 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 5, yes: 75, exceptionalNo: 98 },
		[OddsLevel.Likely]: { exceptionalYes: 8, yes: 90, exceptionalNo: 99 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 12, yes: 97, exceptionalNo: 99 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 16, yes: 99, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 20, yes: 100, exceptionalNo: 100 }
	},
	5: {
		[OddsLevel.Impossible]: { exceptionalYes: 1, yes: 15, exceptionalNo: 96 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 2, yes: 25, exceptionalNo: 97 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 3, yes: 40, exceptionalNo: 97 },
		[OddsLevel.Unlikely]: { exceptionalYes: 4, yes: 60, exceptionalNo: 98 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 6, yes: 80, exceptionalNo: 99 },
		[OddsLevel.Likely]: { exceptionalYes: 10, yes: 95, exceptionalNo: 99 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 15, yes: 99, exceptionalNo: 100 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 19, yes: 99, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 23, yes: 100, exceptionalNo: 100 }
	},
	6: {
		[OddsLevel.Impossible]: { exceptionalYes: 2, yes: 20, exceptionalNo: 97 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 3, yes: 30, exceptionalNo: 97 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 4, yes: 45, exceptionalNo: 98 },
		[OddsLevel.Unlikely]: { exceptionalYes: 6, yes: 65, exceptionalNo: 98 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 9, yes: 85, exceptionalNo: 99 },
		[OddsLevel.Likely]: { exceptionalYes: 13, yes: 95, exceptionalNo: 99 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 17, yes: 99, exceptionalNo: 100 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 22, yes: 99, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 26, yes: 100, exceptionalNo: 100 }
	},
	7: {
		[OddsLevel.Impossible]: { exceptionalYes: 2, yes: 25, exceptionalNo: 97 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 4, yes: 35, exceptionalNo: 98 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 5, yes: 50, exceptionalNo: 98 },
		[OddsLevel.Unlikely]: { exceptionalYes: 8, yes: 70, exceptionalNo: 99 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 11, yes: 90, exceptionalNo: 99 },
		[OddsLevel.Likely]: { exceptionalYes: 16, yes: 97, exceptionalNo: 100 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 20, yes: 99, exceptionalNo: 100 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 25, yes: 100, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 29, yes: 100, exceptionalNo: 100 }
	},
	8: {
		[OddsLevel.Impossible]: { exceptionalYes: 3, yes: 30, exceptionalNo: 98 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 5, yes: 40, exceptionalNo: 98 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 7, yes: 55, exceptionalNo: 99 },
		[OddsLevel.Unlikely]: { exceptionalYes: 10, yes: 75, exceptionalNo: 99 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 14, yes: 95, exceptionalNo: 100 },
		[OddsLevel.Likely]: { exceptionalYes: 19, yes: 99, exceptionalNo: 100 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 23, yes: 99, exceptionalNo: 100 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 28, yes: 100, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 32, yes: 100, exceptionalNo: 100 }
	},
	9: {
		[OddsLevel.Impossible]: { exceptionalYes: 4, yes: 40, exceptionalNo: 99 },
		[OddsLevel.NearlyImpossible]: { exceptionalYes: 7, yes: 50, exceptionalNo: 99 },
		[OddsLevel.VeryUnlikely]: { exceptionalYes: 9, yes: 65, exceptionalNo: 99 },
		[OddsLevel.Unlikely]: { exceptionalYes: 13, yes: 85, exceptionalNo: 100 },
		[OddsLevel.FiftyFifty]: { exceptionalYes: 19, yes: 95, exceptionalNo: 100 },
		[OddsLevel.Likely]: { exceptionalYes: 24, yes: 99, exceptionalNo: 100 },
		[OddsLevel.VeryLikely]: { exceptionalYes: 29, yes: 100, exceptionalNo: 100 },
		[OddsLevel.NearlyCertain]: { exceptionalYes: 34, yes: 100, exceptionalNo: 100 },
		[OddsLevel.Certain]: { exceptionalYes: 39, yes: 100, exceptionalNo: 100 }
	}
};

/**
 * Get the Fate thresholds for a given odds level and chaos factor
 */
export function getFateThreshold(odds: OddsLevel, chaosFactor: number): FateThresholds {
	if (chaosFactor < 1 || chaosFactor > 9) {
		throw new Error('Chaos Factor must be between 1 and 9');
	}

	return FATE_CHART_DATA[chaosFactor][odds];
}

/**
 * Determine the Fate Answer based on roll, odds, and chaos factor
 */
export function determineFateAnswer(
	roll: number,
	odds: OddsLevel,
	chaosFactor: number
): FateAnswer {
	const thresholds = getFateThreshold(odds, chaosFactor);

	if (roll <= thresholds.exceptionalYes) {
		return 'Exceptional Yes';
	} else if (roll <= thresholds.yes) {
		return 'Yes';
	} else if (roll > thresholds.exceptionalNo) {
		return 'Exceptional No';
	} else {
		return 'No';
	}
}

/**
 * Calculate Fate Check using 2d10 method (alternative to d100)
 * Formula: 2d10 + odds modifier + CF modifier
 * If total >= 11: Yes, < 11: No
 * Exceptional: doubles on dice
 */
export function calculateFateCheck(
	dice1: number,
	dice2: number,
	oddsModifier: number,
	cfModifier: number
): {
	total: number;
	answer: FateAnswer;
} {
	const total = dice1 + dice2 + oddsModifier + cfModifier;
	const isDoubles = dice1 === dice2;

	if (total >= 11) {
		return {
			total,
			answer: isDoubles ? 'Exceptional Yes' : 'Yes'
		};
	} else {
		return {
			total,
			answer: isDoubles ? 'Exceptional No' : 'No'
		};
	}
}

/**
 * Get odds modifier for Fate Check method
 */
export function getOddsModifier(odds: OddsLevel): number {
	const modifiers: Record<OddsLevel, number> = {
		[OddsLevel.Impossible]: -4,
		[OddsLevel.NearlyImpossible]: -3,
		[OddsLevel.VeryUnlikely]: -2,
		[OddsLevel.Unlikely]: -1,
		[OddsLevel.FiftyFifty]: 0,
		[OddsLevel.Likely]: +1,
		[OddsLevel.VeryLikely]: +2,
		[OddsLevel.NearlyCertain]: +3,
		[OddsLevel.Certain]: +4
	};

	return modifiers[odds];
}

/**
 * Get CF modifier for Fate Check method
 * Chaos Factor modifies the roll slightly
 */
export function getCFModifier(chaosFactor: number): number {
	if (chaosFactor <= 3) return -2;
	if (chaosFactor >= 7) return +2;
	return 0; // CF 4, 5, 6 = no modifier
}
