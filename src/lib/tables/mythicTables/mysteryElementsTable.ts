/**
 * Mystery Elements Table (Mythic Magazine Volume 6)
 * Used for Discovery Checks to generate new clues and suspects
 */

import { rollD10 } from '$lib/utils/mythicDice';

export type MysteryElementResult =
	| 'New Clue'
	| 'New Suspect'
	| 'New Linked Clue'
	| 'New Linked Suspect'
	| 'Link Clue To Suspect'
	| 'Link Clue To Suspect or New'
	| 'Roll Twice'
	| 'Special'
	| 'Clincher Clue'
	| 'Link Clue To Suspect, PP-6';

export interface MysteryElementRollResult {
	result: MysteryElementResult;
	roll: number; // d10 + PP
	diceRoll: number; // Just the d10
	progressPoints: number; // PP applied
}

/**
 * Roll on the Mystery Elements Table
 * @param progressPoints Current progress points for this category
 * @param category 'clues' or 'suspects'
 * @returns The table result
 */
export function rollMysteryElement(
	progressPoints: number,
	category: 'clues' | 'suspects'
): MysteryElementRollResult {
	const diceRoll = rollD10();
	const total = diceRoll + progressPoints;

	let result: MysteryElementResult;

	// Clues Column
	if (category === 'clues') {
		if (total <= 5) {
			result = 'New Clue';
		} else if (total >= 6 && total <= 8) {
			result = 'New Linked Clue';
		} else if (total >= 9 && total <= 10) {
			result = 'Link Clue To Suspect or New';
		} else if (total === 11) {
			result = 'Roll Twice';
		} else if (total === 12) {
			result = 'New Clue';
		} else if (total === 13) {
			result = 'Special';
		} else if (total >= 14 && total <= 15) {
			result = 'Clincher Clue';
		} else {
			// 16 or more
			result = 'Link Clue To Suspect, PP-6';
		}
	}
	// Suspects Column
	else {
		if (total <= 5) {
			result = 'New Suspect';
		} else if (total >= 6 && total <= 8) {
			result = 'New Linked Suspect';
		} else if (total >= 9 && total <= 10) {
			result = 'Link Clue To Suspect or New';
		} else if (total === 11) {
			result = 'Roll Twice';
		} else if (total === 12) {
			result = 'New Suspect';
		} else if (total === 13) {
			result = 'Special';
		} else if (total >= 14 && total <= 15) {
			result = 'Link Clue To Suspect';
		} else {
			// 16 or more
			result = 'Link Clue To Suspect, PP-6';
		}
	}

	return {
		result,
		roll: total,
		diceRoll,
		progressPoints
	};
}

/**
 * Get human-readable description of result
 */
export function getMysteryElementDescription(
	result: MysteryElementResult,
	category: 'clues' | 'suspects'
): string {
	switch (result) {
		case 'New Clue':
			return 'New Clue: Discover a new clue with no initial links.';
		case 'New Suspect':
			return 'New Suspect: Identify a new suspect with no initial links.';
		case 'New Linked Clue':
			return 'New Linked Clue: Discover a new clue already linked to a suspect.';
		case 'New Linked Suspect':
			return 'New Linked Suspect: Identify a new suspect already linked to a clue.';
		case 'Link Clue To Suspect':
			return 'Link Clue To Suspect: Connect an existing clue to an existing suspect.';
		case 'Link Clue To Suspect or New':
			if (category === 'clues') {
				return 'Link Clue To Suspect OR New Clue: Link existing elements, or add new clue if none exist.';
			} else {
				return 'Link Clue To Suspect OR New Suspect: Link existing elements, or add new suspect if none exist.';
			}
		case 'Roll Twice':
			return 'Roll Twice: Make two rolls on this same category. If you roll this again, treat as "Link Clue To Suspect".';
		case 'Special':
			return 'Special: Roll on the Mystery Special Table for a twist or complication.';
		case 'Clincher Clue':
			return 'Clincher Clue: The final clue! This solves the mystery - link it to the suspect with most clue points.';
		case 'Link Clue To Suspect, PP-6':
			return 'Link Clue To Suspect: Connect existing elements. Also reduce Progress Points by 6.';
		default:
			return result;
	}
}
