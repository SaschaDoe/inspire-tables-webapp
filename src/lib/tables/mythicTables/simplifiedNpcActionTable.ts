/**
 * Simplified NPC Action Table
 * Quick determination of NPC behavior during encounters
 * Uses d20 roll to determine NPC actions
 */

import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { DiceRole } from '../diceRole';

export type NpcActionContext = 'changes' | 'within' | 'self-interest';

export interface NpcActionResult {
	action: string;
	context: NpcActionContext;
	contextDescription: string;
}

export class SimplifiedNpcActionTable extends Table {
	constructor() {
		const entries = [
			new TableEntry(1, 4, 'Talks, Exposition'),
			new TableEntry(5, 5, 'Performs an Ambiguous Action'),
			new TableEntry(6, 7, 'Acts Out of PC Interest'),
			new TableEntry(8, 8, 'NPC Continues -2'),
			new TableEntry(9, 10, 'NPC Continues'),
			new TableEntry(11, 11, 'NPC Continues +2'),
			new TableEntry(12, 12, 'Context Action'),
			new TableEntry(13, 13, 'Gives Something'),
			new TableEntry(14, 14, 'Seeks to End the Encounter'),
			new TableEntry(15, 16, 'Acts Out of Self Interest'),
			new TableEntry(17, 17, 'Takes Something'),
			new TableEntry(18, 20, 'Causes Harm')
		];

		super(entries, TableTitles.SimplifiedNpcAction);
	}

	/**
	 * Get the result with context information
	 */
	getActionWithContext(roll?: number): NpcActionResult {
		const entry = this.getEntry(roll);
		const action = entry?.text || 'NPC Continues';

		// Determine context based on action
		let context: NpcActionContext;
		let contextDescription: string;

		if (
			action.includes('PC Interest') ||
			action.includes('Self Interest') ||
			action.includes('Takes Something') ||
			action.includes('Causes Harm')
		) {
			context = 'changes';
			contextDescription = "The Character's Action changes the current Context.";
		} else if (action.includes('Continues') || action.includes('Context Action')) {
			context = 'within';
			contextDescription = "The Character's Action is within the current Context.";
		} else {
			// Talks, Ambiguous, Gives Something, Seeks to End
			context = 'self-interest';
			contextDescription = "The Character's Action changes the current Context.";
		}

		return {
			action,
			context,
			contextDescription
		};
	}
}

/**
 * Helper function to interpret "Continues" results
 * The +2/-2 modifiers suggest intensity changes
 */
export function interpretContinues(modifier: number, currentAction?: string): string {
	if (!currentAction) {
		return "NPC continues their current course of action";
	}

	if (modifier === -2) {
		return `NPC continues ${currentAction}, but with less intensity or commitment`;
	} else if (modifier === 2) {
		return `NPC continues ${currentAction}, but with greater intensity or commitment`;
	} else {
		return `NPC continues ${currentAction}`;
	}
}

/**
 * Get color coding for action context (for UI)
 */
export function getContextColor(context: NpcActionContext): string {
	switch (context) {
		case 'changes':
			return 'text-orange-600 dark:text-orange-400';
		case 'within':
			return 'text-blue-600 dark:text-blue-400';
		case 'self-interest':
			return 'text-purple-600 dark:text-purple-400';
		default:
			return 'text-gray-600 dark:text-gray-400';
	}
}

/**
 * Get icon for action context (for UI)
 */
export function getContextIcon(context: NpcActionContext): string {
	switch (context) {
		case 'changes':
			return '🔄'; // Changes context
		case 'within':
			return '➡️'; // Stays in context
		case 'self-interest':
			return '🎯'; // Self interest
		default:
			return '❓';
	}
}

/**
 * Detailed interpretations for each action
 */
export const NPC_ACTION_INTERPRETATIONS: Record<string, string> = {
	'Talks, Exposition':
		'The NPC provides information, explains something, or engages in conversation.',
	'Performs an Ambiguous Action':
		'The NPC does something unclear or mysterious. Their intent is not obvious.',
	'Acts Out of PC Interest':
		'The NPC acts in a way that benefits or aligns with the player character.',
	'NPC Continues -2':
		'The NPC continues their current action but with reduced intensity or commitment.',
	'NPC Continues': 'The NPC continues whatever they were doing.',
	'NPC Continues +2':
		'The NPC continues their current action but with increased intensity or commitment.',
	'Context Action': 'The NPC acts in a way that makes sense for the current situation.',
	'Gives Something':
		'The NPC offers or provides something (item, information, help, etc.).',
	'Seeks to End the Encounter':
		'The NPC attempts to conclude or leave the current interaction.',
	'Acts Out of Self Interest':
		'The NPC acts selfishly or in their own best interest, possibly against PC interests.',
	'Takes Something': 'The NPC attempts to take or acquire something.',
	'Causes Harm': 'The NPC acts aggressively or harmfully toward the PC or others.'
};
