/**
 * Backstory Focus Table 2 (Mythic Magazine Volume 2)
 * Used for generating compelling character backstories with multiple rolls
 */

import { rollD100 } from '$lib/utils/mythicDice';

export type BackstoryFocusResult =
	| 'New NPC'
	| 'NPC Action, Or New NPC'
	| 'NPC Negative, Or New NPC'
	| 'NPC Positive, Or New NPC'
	| 'New Thread'
	| 'Close A Thread, Or New Thread'
	| 'Subject Negative'
	| 'Subject Positive'
	| 'Connection, NPC To NPC'
	| 'Connection, NPC To Subject'
	| 'Complete, Or New Thread';

export interface BackstoryFocusRollResult {
	result: BackstoryFocusResult;
	roll: number;
}

/**
 * Roll on the Backstory Focus Table 2
 * @returns The table result
 */
export function rollBackstoryFocus(): BackstoryFocusRollResult {
	const roll = rollD100();
	let result: BackstoryFocusResult;

	if (roll >= 1 && roll <= 13) {
		result = 'New NPC';
	} else if (roll >= 14 && roll <= 21) {
		result = 'NPC Action, Or New NPC';
	} else if (roll >= 22 && roll <= 28) {
		result = 'NPC Negative, Or New NPC';
	} else if (roll >= 29 && roll <= 35) {
		result = 'NPC Positive, Or New NPC';
	} else if (roll >= 36 && roll <= 42) {
		result = 'New Thread';
	} else if (roll >= 43 && roll <= 55) {
		result = 'Close A Thread, Or New Thread';
	} else if (roll >= 56 && roll <= 64) {
		result = 'Subject Negative';
	} else if (roll >= 65 && roll <= 72) {
		result = 'Subject Positive';
	} else if (roll >= 73 && roll <= 78) {
		result = 'Connection, NPC To NPC';
	} else if (roll >= 79 && roll <= 86) {
		result = 'Connection, NPC To Subject';
	} else {
		// 87-100
		result = 'Complete, Or New Thread';
	}

	return { result, roll };
}

/**
 * Get human-readable description of backstory focus result
 */
export function getBackstoryFocusDescription(result: BackstoryFocusResult): string {
	switch (result) {
		case 'New NPC':
			return 'Generate a new NPC for the backstory. Roll on Description Meaning Tables for physical description, and Action Meaning Tables for what they are doing.';
		case 'NPC Action, Or New NPC':
			return 'Randomly determine an NPC from your backstory Characters List, then roll on Action Meaning Tables for what action they have taken. If no NPCs exist, treat as New NPC.';
		case 'NPC Negative, Or New NPC':
			return 'Randomly determine an NPC from your backstory Characters List, then roll on Action Meaning Tables to determine what negative thing happens to them. If no NPCs exist, treat as New NPC.';
		case 'NPC Positive, Or New NPC':
			return 'Randomly determine an NPC from your backstory Characters List, then roll on Action Meaning Tables to determine what positive thing happens to them. If no NPCs exist, treat as New NPC.';
		case 'New Thread':
			return 'Roll on Action Meaning Tables to create a new Thread (open goal or plotline) for the backstory. This represents an important event or objective in the past.';
		case 'Close A Thread, Or New Thread':
			return 'Randomly determine a Thread from your backstory Threads List, then roll on Action Meaning Tables to determine how it was resolved. If no Threads exist, treat as New Thread.';
		case 'Subject Negative':
			return 'Something negative happens to the Subject (the character this backstory is about). Roll on Action Meaning Tables for what happens.';
		case 'Subject Positive':
			return 'Something positive happens to the Subject (the character this backstory is about). Roll on Action Meaning Tables for what happens.';
		case 'Connection, NPC To NPC':
			return 'Create a connection between two NPCs in the backstory. Roll twice on the Characters List for two separate NPCs, then roll on Action Meaning Tables to determine the nature of their relationship. If not enough NPCs, treat as New NPC.';
		case 'Connection, NPC To Subject':
			return 'Create a connection between an NPC and the Subject. Roll once on the Characters List, then roll on Action Meaning Tables to determine how this NPC is connected to the Subject. If no NPCs exist, treat as New NPC.';
		case 'Complete, Or New Thread':
			return 'Your backstory is complete! Review all generated events and weave them into a cohesive narrative. If this is your first roll, treat as New Thread instead.';
		default:
			return result;
	}
}

/**
 * Get detailed guidance for interpreting a backstory result
 */
export function getBackstoryFocusGuidance(result: BackstoryFocusResult): string {
	switch (result) {
		case 'New NPC':
			return 'Remember that a "Character" in Mythic can be a person, place, or object. For backstories, this new NPC should fit within the context of the unfolding history. Consider how they relate to previous results.';
		case 'NPC Action, Or New NPC':
			return 'View this action within the context of the growing backstory. How does this NPC\'s action affect the story? Does it create conflict, resolve tension, or add complexity?';
		case 'NPC Negative, Or New NPC':
		case 'NPC Positive, Or New NPC':
			return 'Tie this event to the unfolding backstory. Consider how this positive or negative event impacts other NPCs and Threads. Let the events start to connect naturally.';
		case 'New Thread':
			return 'A Thread is an open goal or unresolved plotline. In a backstory, this represents something important that was happening in the past. It might get closed later, or remain open to suggest ongoing concerns.';
		case 'Close A Thread, Or New Thread':
			return 'Consider the context of the developing backstory when resolving this Thread. Include any elements that have already been introduced in your interpretation.';
		case 'Subject Negative':
		case 'Subject Positive':
			return 'This is about the main character whose backstory you are creating. Consider how this event shaped them. Did it make them stronger? More cautious? Did it give them skills or trauma?';
		case 'Connection, NPC To NPC':
			return 'Connections flesh out personal relationships and add richness to the backstory. Were these NPCs allies? Enemies? Family? Rivals? How did their relationship affect the events of the backstory?';
		case 'Connection, NPC To Subject':
			return 'This connection explains how an NPC relates to the Subject. This is often very important for understanding who the character is. Was this NPC a mentor? An enemy? A lost love? A betrayer?';
		case 'Complete, Or New Thread':
			return 'Take all the results you generated and interpret them into a cohesive whole. Don\'t worry if some elements seem disconnected - use your creative license to tie them together. Decide when in the past these events occurred.';
		default:
			return '';
	}
}

/**
 * Determine if a result needs NPCs to exist
 */
export function requiresNPCs(result: BackstoryFocusResult): boolean {
	return [
		'NPC Action, Or New NPC',
		'NPC Negative, Or New NPC',
		'NPC Positive, Or New NPC',
		'Connection, NPC To NPC',
		'Connection, NPC To Subject'
	].includes(result);
}

/**
 * Determine if a result needs Threads to exist
 */
export function requiresThreads(result: BackstoryFocusResult): boolean {
	return result === 'Close A Thread, Or New Thread';
}

/**
 * Get the fallback result when required elements don't exist
 */
export function getFallbackResult(
	result: BackstoryFocusResult,
	hasNPCs: boolean,
	hasThreads: boolean
): BackstoryFocusResult {
	if (requiresNPCs(result) && !hasNPCs) {
		return 'New NPC';
	}
	if (requiresThreads(result) && !hasThreads) {
		return 'New Thread';
	}
	return result;
}
