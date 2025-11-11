// Event Focus utilities for Mythic GME

export enum EventFocus {
	RemoteEvent = 'Remote Event',
	AmbiguousEvent = 'Ambiguous Event',
	NewNPC = 'New NPC',
	NPCAction = 'NPC Action',
	NPCNegative = 'NPC Negative',
	NPCPositive = 'NPC Positive',
	MoveTowardThread = 'Move Toward A Thread',
	MoveAwayFromThread = 'Move Away From A Thread',
	CloseThread = 'Close A Thread',
	PCNegative = 'PC Negative',
	PCPositive = 'PC Positive',
	CurrentContext = 'Current Context'
}

// Event Focus with roll ranges (d100)
interface EventFocusRange {
	min: number;
	max: number;
	focus: EventFocus;
}

export const EVENT_FOCUS_RANGES: EventFocusRange[] = [
	{ min: 1, max: 7, focus: EventFocus.RemoteEvent },
	{ min: 8, max: 10, focus: EventFocus.AmbiguousEvent },
	{ min: 11, max: 28, focus: EventFocus.NewNPC },
	{ min: 29, max: 35, focus: EventFocus.NPCAction },
	{ min: 36, max: 45, focus: EventFocus.NPCNegative },
	{ min: 46, max: 52, focus: EventFocus.NPCPositive },
	{ min: 53, max: 55, focus: EventFocus.MoveTowardThread },
	{ min: 56, max: 67, focus: EventFocus.MoveAwayFromThread },
	{ min: 68, max: 71, focus: EventFocus.CloseThread },
	{ min: 72, max: 83, focus: EventFocus.PCNegative },
	{ min: 84, max: 90, focus: EventFocus.PCPositive },
	{ min: 91, max: 100, focus: EventFocus.CurrentContext }
];

/**
 * Get Event Focus from a d100 roll
 */
export function getEventFocus(roll: number): EventFocus {
	if (roll < 1 || roll > 100) {
		throw new Error('Roll must be between 1 and 100');
	}

	const range = EVENT_FOCUS_RANGES.find((r) => roll >= r.min && roll <= r.max);
	if (!range) {
		throw new Error(`No Event Focus found for roll ${roll}`);
	}

	return range.focus;
}

/**
 * Determine if an Event Focus requires rolling on lists
 * Returns 'threads', 'characters', or null
 */
export function needsListRoll(focus: EventFocus): 'threads' | 'characters' | null {
	switch (focus) {
		case EventFocus.NPCAction:
		case EventFocus.NPCNegative:
		case EventFocus.NPCPositive:
		case EventFocus.NewNPC:
			return 'characters';

		case EventFocus.MoveTowardThread:
		case EventFocus.MoveAwayFromThread:
		case EventFocus.CloseThread:
			return 'threads';

		default:
			return null;
	}
}

/**
 * Suggest which Meaning Tables to use based on Event Focus
 * Returns array of table names/categories
 */
export function suggestMeaningTables(focus: EventFocus): string[] {
	switch (focus) {
		case EventFocus.NewNPC:
			return ['Character Descriptors', 'Character Identity', 'Character Appearance'];

		case EventFocus.NPCAction:
			return ['Character Actions (General)', 'Character Actions (Combat)', 'Actions Table 1'];

		case EventFocus.NPCNegative:
		case EventFocus.NPCPositive:
			return ['Character Descriptors', 'Character Personality', 'Actions Table 1'];

		case EventFocus.MoveTowardThread:
		case EventFocus.MoveAwayFromThread:
			return ['Actions Table 1', 'Descriptions Table 1', 'Locations Elements'];

		case EventFocus.CloseThread:
			return ['Actions Table 1', 'Descriptions Table 1'];

		case EventFocus.PCNegative:
		case EventFocus.PCPositive:
			return ['Actions Table 1', 'Descriptions Table 1'];

		case EventFocus.RemoteEvent:
			return ['Actions Table 1', 'Locations Elements', 'Descriptions Table 1'];

		case EventFocus.AmbiguousEvent:
			return ['Actions Table 2', 'Descriptions Table 2'];

		case EventFocus.CurrentContext:
			return ['Actions Table 1', 'Descriptions Table 1', 'Objects Elements'];

		default:
			return ['Actions Table 1', 'Descriptions Table 1'];
	}
}

/**
 * Get a description of what an Event Focus means
 */
export function getEventFocusDescription(focus: EventFocus): string {
	const descriptions: Record<EventFocus, string> = {
		[EventFocus.RemoteEvent]:
			'An event not directly related to the current scene or characters. Something happening elsewhere or to someone else.',
		[EventFocus.AmbiguousEvent]:
			'An unclear or mysterious event. The meaning is uncertain and open to interpretation.',
		[EventFocus.NewNPC]:
			'A new character appears or is introduced into the story. Roll on Characters List or create a new NPC.',
		[EventFocus.NPCAction]:
			'An existing NPC takes an action. Roll on Characters List to determine which NPC, then roll for what they do.',
		[EventFocus.NPCNegative]:
			'Something negative happens to or is caused by an NPC. Roll on Characters List.',
		[EventFocus.NPCPositive]:
			'Something positive happens to or is caused by an NPC. Roll on Characters List.',
		[EventFocus.MoveTowardThread]:
			'Progress is made toward resolving a thread/goal. Roll on Threads List.',
		[EventFocus.MoveAwayFromThread]:
			'A setback occurs regarding a thread/goal. Roll on Threads List.',
		[EventFocus.CloseThread]:
			'A thread/goal is resolved or concluded. Roll on Threads List.',
		[EventFocus.PCNegative]:
			'Something negative happens to the player character(s).',
		[EventFocus.PCPositive]:
			'Something positive happens to the player character(s).',
		[EventFocus.CurrentContext]:
			'The event relates to the current scene, location, or situation.'
	};

	return descriptions[focus];
}

/**
 * All Event Focus options in order for UI display
 */
export const ALL_EVENT_FOCUSES = [
	EventFocus.RemoteEvent,
	EventFocus.AmbiguousEvent,
	EventFocus.NewNPC,
	EventFocus.NPCAction,
	EventFocus.NPCNegative,
	EventFocus.NPCPositive,
	EventFocus.MoveTowardThread,
	EventFocus.MoveAwayFromThread,
	EventFocus.CloseThread,
	EventFocus.PCNegative,
	EventFocus.PCPositive,
	EventFocus.CurrentContext
];
