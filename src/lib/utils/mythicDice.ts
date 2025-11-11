// Dice rolling utilities for Mythic GME

export type FateAnswer = 'Exceptional Yes' | 'Yes' | 'No' | 'Exceptional No';

/**
 * Roll a single d10 (1-10)
 */
export function rollD10(): number {
	return Math.floor(Math.random() * 10) + 1;
}

/**
 * Roll a d100 (1-100)
 */
export function rollD100(): number {
	return Math.floor(Math.random() * 100) + 1;
}

/**
 * Roll 2d10 for Fate Check method
 * Returns both dice and their sum
 */
export function roll2D10(): { dice1: number; dice2: number; total: number } {
	const dice1 = rollD10();
	const dice2 = rollD10();
	return { dice1, dice2, total: dice1 + dice2 };
}

/**
 * Check if a d100 roll is doubles (11, 22, 33, etc.)
 */
export function isDoubles(roll: number): boolean {
	if (roll < 11 || roll > 99) return false;
	const tens = Math.floor(roll / 10);
	const ones = roll % 10;
	return tens === ones;
}

/**
 * Get the single digit from a d100 roll
 * For doubles: 11 -> 1, 22 -> 2, etc.
 * For non-doubles: any digit works (typically use ones place)
 */
export function getSingleDigit(roll: number): number {
	return roll % 10;
}

/**
 * Check if a roll triggers a Random Event
 * Requires: doubles AND single digit <= Chaos Factor
 */
export function checkRandomEvent(roll: number, chaosFactor: number): boolean {
	if (!isDoubles(roll)) return false;
	const digit = getSingleDigit(roll);
	return digit <= chaosFactor;
}

/**
 * Determine Fate Answer based on roll and thresholds
 * @param roll - The d100 roll
 * @param exceptionalYes - Threshold for Exceptional Yes (e.g., 1-10)
 * @param yes - Threshold for Yes (e.g., 1-65)
 * @param exceptionalNo - Threshold for No beyond this (e.g., 95-100)
 */
export function getFateResult(
	roll: number,
	exceptionalYes: number,
	yes: number,
	exceptionalNo: number
): FateAnswer {
	if (roll <= exceptionalYes) {
		return 'Exceptional Yes';
	} else if (roll <= yes) {
		return 'Yes';
	} else if (roll > exceptionalNo) {
		return 'Exceptional No';
	} else {
		return 'No';
	}
}

/**
 * Roll on a list with dynamic dice based on element count
 * Returns section (1-5), line within section (1-5), and absolute position
 *
 * @param elementCount - Number of filled elements in the list (1-25)
 * @returns { section: number, line: number, position: number }
 *
 * Examples:
 * - 1-5 elements: roll d6 (6 = choose)
 * - 6-10 elements: roll d4 for section, d6 for line
 * - 11-15 elements: roll d6 for section, d6 for line
 * - 16-20 elements: roll d8 for section, d6 for line
 * - 21-25 elements: roll d10 for section, d6 for line
 */
export function rollOnList(elementCount: number): {
	section: number;
	line: number;
	position: number;
	diceUsed: string;
} {
	if (elementCount < 1 || elementCount > 25) {
		throw new Error('Element count must be between 1 and 25');
	}

	// Determine which sections are active
	const activeSections = Math.ceil(elementCount / 5);

	// Single section (1-5 elements)
	if (activeSections === 1) {
		const roll = Math.floor(Math.random() * 6) + 1; // d6
		if (roll === 6) {
			// "Choose" result
			return {
				section: 1,
				line: 0, // 0 indicates "choose"
				position: 0,
				diceUsed: 'd6'
			};
		}
		return {
			section: 1,
			line: roll,
			position: roll,
			diceUsed: 'd6'
		};
	}

	// Multiple sections: roll for section first
	let sectionDie: number;
	let sectionRoll: number;

	if (activeSections === 2) {
		sectionDie = 4;
		sectionRoll = Math.floor(Math.random() * 4) + 1;
	} else if (activeSections === 3) {
		sectionDie = 6;
		sectionRoll = Math.floor(Math.random() * 6) + 1;
	} else if (activeSections === 4) {
		sectionDie = 8;
		sectionRoll = Math.floor(Math.random() * 8) + 1;
	} else {
		// 5 sections
		sectionDie = 10;
		sectionRoll = Math.floor(Math.random() * 10) + 1;
	}

	// Convert section roll to actual section number (1-5)
	const section = Math.min(Math.ceil(sectionRoll / 2), activeSections);

	// Roll for line within section
	const lineRoll = Math.floor(Math.random() * 6) + 1; // d6

	if (lineRoll === 6) {
		// "Choose" result
		return {
			section,
			line: 0,
			position: 0,
			diceUsed: `d${sectionDie}+d6`
		};
	}

	const line = lineRoll;
	const position = (section - 1) * 5 + line;

	// Check if position exceeds element count
	if (position > elementCount) {
		// Treat as "choose"
		return {
			section,
			line: 0,
			position: 0,
			diceUsed: `d${sectionDie}+d6`
		};
	}

	return {
		section,
		line,
		position,
		diceUsed: `d${sectionDie}+d6`
	};
}

/**
 * Calculate the dice needed for a list of given size
 */
export function getDiceForListSize(elementCount: number): string {
	if (elementCount < 1) return 'empty';
	if (elementCount <= 5) return 'd6';

	const activeSections = Math.ceil(elementCount / 5);

	if (activeSections === 2) return 'd4 + d6';
	if (activeSections === 3) return 'd6 + d6';
	if (activeSections === 4) return 'd8 + d6';
	return 'd10 + d6';
}
