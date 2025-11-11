/**
 * Mystery Event Focus Table (Mythic Magazine Volume 6)
 * Used for Random Events and Interrupt Scenes during Mystery Adventures
 * Replaces the standard Event Focus Table
 */

import { rollD100 } from '$lib/utils/mythicDice';
import type { EventFocus } from '$lib/utils/eventFocus';

// Extended type for mystery-specific focuses
export type MysteryEventFocus = EventFocus | 'Clue Element' | 'Suspect Element';

export interface MysteryEventFocusResult {
	focus: MysteryEventFocus;
	roll: number;
}

/**
 * Roll on the Mystery Event Focus Table
 * This replaces the standard Event Focus table during mystery adventures
 */
export function rollMysteryEventFocus(): MysteryEventFocusResult {
	const roll = rollD100();
	let focus: MysteryEventFocus;

	if (roll >= 1 && roll <= 15) {
		focus = 'Clue Element';
	} else if (roll >= 16 && roll <= 30) {
		focus = 'Suspect Element';
	} else if (roll >= 31 && roll <= 34) {
		focus = 'Remote Event';
	} else if (roll >= 35 && roll <= 38) {
		focus = 'Ambiguous Event';
	} else if (roll >= 39 && roll <= 44) {
		focus = 'New NPC';
	} else if (roll >= 45 && roll <= 58) {
		focus = 'NPC Action';
	} else if (roll >= 59 && roll <= 66) {
		focus = 'NPC Negative';
	} else if (roll >= 67 && roll <= 71) {
		focus = 'NPC Positive';
	} else if (roll >= 72 && roll <= 79) {
		focus = 'Move Toward A Thread';
	} else if (roll >= 80 && roll <= 84) {
		focus = 'Move Away From A Thread';
	} else if (roll >= 85 && roll <= 86) {
		focus = 'Close A Thread';
	} else if (roll >= 87 && roll <= 94) {
		focus = 'PC Negative';
	} else {
		// 95-100
		focus = 'PC Positive';
	}

	return {
		focus,
		roll
	};
}

/**
 * Get description of mystery event focus
 */
export function getMysteryEventFocusDescription(focus: MysteryEventFocus): string {
	switch (focus) {
		case 'Clue Element':
			return 'CLUE ELEMENT: A clue falls into your lap! Roll on the Mystery Elements Table (Clues). This clue should be immediately apparent in the scene.';
		case 'Suspect Element':
			return 'SUSPECT ELEMENT: A suspect reveals themselves! Roll on the Mystery Elements Table (Suspects). This suspect should be immediately apparent in the scene.';
		case 'Remote Event':
			return 'Something important happens, but not necessarily right where the Characters are.';
		case 'Ambiguous Event':
			return 'Something happens but the meaning or significance is unclear or muddy.';
		case 'New NPC':
			return 'A new NPC makes an entrance, could be a helpful contact, witness, or complication.';
		case 'NPC Action':
			return 'An NPC takes action, either within the scene or offstage affecting the investigation.';
		case 'NPC Negative':
			return 'Something bad or negative happens regarding an NPC - they might be harmed, act against the Characters, or become an obstacle.';
		case 'NPC Positive':
			return 'Something good happens with an NPC - they help, cooperate, or become an ally.';
		case 'Move Toward A Thread':
			return 'The investigation moves forward - a Thread progresses or becomes clearer.';
		case 'Move Away From A Thread':
			return 'A complication arises - a Thread becomes more difficult to resolve or evidence becomes muddied.';
		case 'Close A Thread':
			return 'A Thread is resolved or becomes irrelevant to the mystery.';
		case 'PC Negative':
			return 'Something bad happens to the Player Character - an obstacle, setback, or personal complication.';
		case 'PC Positive':
			return 'Something good happens for the Player Character - a break, opportunity, or personal victory.';
		default:
			return focus;
	}
}

/**
 * Check if this focus grants a free Mystery Elements roll
 */
export function grantsFreeElementRoll(focus: MysteryEventFocus): {
	grants: boolean;
	category?: 'clues' | 'suspects';
} {
	if (focus === 'Clue Element') {
		return { grants: true, category: 'clues' };
	} else if (focus === 'Suspect Element') {
		return { grants: true, category: 'suspects' };
	}
	return { grants: false };
}
