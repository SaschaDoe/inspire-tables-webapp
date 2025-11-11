/**
 * Mystery Special Table (Mythic Magazine Volume 6)
 * Rolled when "Special" result comes up on Mystery Elements Table
 */

import { rollD100 } from '$lib/utils/mythicDice';

export type MysterySpecialResult =
	| 'Unclinch'
	| 'Remove Clue/Suspect'
	| 'Intensify Clue'
	| 'Progress Points -3'
	| 'Progress Points +3';

export interface MysterySpecialRollResult {
	result: MysterySpecialResult;
	roll: number; // d100
}

/**
 * Roll on the Mystery Special Table
 * @returns The special result
 */
export function rollMysterySpecial(): MysterySpecialRollResult {
	const roll = rollD100();

	let result: MysterySpecialResult;

	if (roll >= 1 && roll <= 10) {
		result = 'Unclinch';
	} else if (roll >= 11 && roll <= 25) {
		result = 'Remove Clue/Suspect';
	} else if (roll >= 26 && roll <= 75) {
		result = 'Intensify Clue';
	} else if (roll >= 76 && roll <= 90) {
		result = 'Progress Points -3';
	} else {
		// 91-100
		result = 'Progress Points +3';
	}

	return {
		result,
		roll
	};
}

/**
 * Get human-readable description of special result
 */
export function getMysterySpecialDescription(
	result: MysterySpecialResult,
	category: 'clues' | 'suspects'
): string {
	switch (result) {
		case 'Unclinch':
			return 'UNCLINCH: If you reached the Clincher Clue, it is now invalidated - the mystery continues! If no Clincher yet, treat as New Clue.';
		case 'Remove Clue/Suspect':
			return `REMOVE: An existing ${category === 'clues' ? 'Clue' : 'Suspect'} is removed from the Matrix. Roll to determine which one - something invalidates it. If you have none yet, treat as New ${category === 'clues' ? 'Clue' : 'Suspect'}.`;
		case 'Intensify Clue':
			return 'INTENSIFY CLUE: An existing Clue becomes more important. Roll for the Clue. All Suspects linked to it get +1 Clue Point for that Clue. This stacks! If you have no Clues yet, treat as New Clue.';
		case 'Progress Points -3':
			return `PROGRESS POINTS -3: Deduct 3 points from ${category === 'clues' ? 'Clue' : 'Suspect'} Progress Points (minimum 0).`;
		case 'Progress Points +3':
			return `PROGRESS POINTS +3: Add 3 points to ${category === 'clues' ? 'Clue' : 'Suspect'} Progress Points.`;
		default:
			return result;
	}
}

/**
 * Get detailed guidance for interpreting special results
 */
export function getMysterySpecialGuidance(result: MysterySpecialResult): string {
	switch (result) {
		case 'Unclinch':
			return 'This represents a major twist - what you thought solved the mystery actually doesn\'t. Perhaps the witness lied, evidence was planted, or there\'s a deeper conspiracy. Remove the Clincher Clue marker.';
		case 'Remove Clue/Suspect':
			return 'Something proves this clue or suspect is no longer relevant. An alibi surfaces, evidence is proven false, or the person is cleared of suspicion. Remove it from the Matrix along with all its links.';
		case 'Intensify Clue':
			return 'This clue becomes more significant. Perhaps additional evidence strengthens it, or you realize it\'s more important than initially thought. The clue now counts for more Clue Points when linked.';
		case 'Progress Points -3':
			return 'The investigation has hit a dead end or red herring. Progress Points represent momentum, and you\'ve lost some ground.';
		case 'Progress Points +3':
			return 'A breakthrough! The investigation is moving forward with new energy. Perhaps multiple leads are coming together or you\'ve gained access to new resources.';
		default:
			return '';
	}
}
