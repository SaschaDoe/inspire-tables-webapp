/**
 * Mythic GME 2nd Edition - Core Types and Constants
 */

// Odds levels for Fate Questions
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
] as const;

// Event Focus types
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

// Event Focus with roll ranges
export const EVENT_FOCUS_RANGES = [
	{ range: [1, 5] as const, focus: EventFocus.RemoteEvent },
	{ range: [6, 10] as const, focus: EventFocus.AmbiguousEvent },
	{ range: [11, 20] as const, focus: EventFocus.NewNPC },
	{ range: [21, 40] as const, focus: EventFocus.NPCAction },
	{ range: [41, 45] as const, focus: EventFocus.NPCNegative },
	{ range: [46, 50] as const, focus: EventFocus.NPCPositive },
	{ range: [51, 55] as const, focus: EventFocus.MoveTowardThread },
	{ range: [56, 65] as const, focus: EventFocus.MoveAwayFromThread },
	{ range: [66, 70] as const, focus: EventFocus.CloseThread },
	{ range: [71, 80] as const, focus: EventFocus.PCNegative },
	{ range: [81, 85] as const, focus: EventFocus.PCPositive },
	{ range: [86, 100] as const, focus: EventFocus.CurrentContext }
] as const;

// Scene Adjustment types
export enum SceneAdjustment {
	RemoveCharacter = 'Remove A Character',
	AddCharacter = 'Add A Character',
	ReduceRemoveActivity = 'Reduce/Remove An Activity',
	IncreaseActivity = 'Increase An Activity',
	RemoveObject = 'Remove An Object',
	AddObject = 'Add An Object',
	MakeTwoAdjustments = 'Make 2 Adjustments'
}

// Fate Answer types
export type FateAnswer = 'Yes' | 'No' | 'Exceptional Yes' | 'Exceptional No';

// Fate Chart data structure
// Format: { exceptionalYes: number, yes: number, exceptionalNo: number }
export const FATE_CHART_DATA: Record<OddsLevel, Record<number, { low: number; mid: number; high: number }>> = {
	[OddsLevel.Certain]: {
		1: { low: 10, mid: 50, high: 91 },
		2: { low: 13, mid: 65, high: 94 },
		3: { low: 15, mid: 75, high: 96 },
		4: { low: 17, mid: 85, high: 98 },
		5: { low: 18, mid: 90, high: 99 },
		6: { low: 19, mid: 95, high: 100 },
		7: { low: 20, mid: 99, high: 101 }, // 101 means no exceptional no
		8: { low: 20, mid: 99, high: 101 },
		9: { low: 20, mid: 99, high: 101 }
	},
	[OddsLevel.NearlyCertain]: {
		1: { low: 7, mid: 35, high: 88 },
		2: { low: 10, mid: 50, high: 91 },
		3: { low: 13, mid: 65, high: 94 },
		4: { low: 15, mid: 75, high: 96 },
		5: { low: 17, mid: 85, high: 98 },
		6: { low: 18, mid: 90, high: 99 },
		7: { low: 19, mid: 95, high: 100 },
		8: { low: 20, mid: 99, high: 101 },
		9: { low: 20, mid: 99, high: 101 }
	},
	[OddsLevel.VeryLikely]: {
		1: { low: 5, mid: 25, high: 86 },
		2: { low: 7, mid: 35, high: 88 },
		3: { low: 10, mid: 50, high: 91 },
		4: { low: 13, mid: 65, high: 94 },
		5: { low: 15, mid: 75, high: 96 },
		6: { low: 17, mid: 85, high: 98 },
		7: { low: 18, mid: 90, high: 99 },
		8: { low: 19, mid: 95, high: 100 },
		9: { low: 20, mid: 99, high: 101 }
	},
	[OddsLevel.Likely]: {
		1: { low: 3, mid: 15, high: 84 },
		2: { low: 5, mid: 25, high: 86 },
		3: { low: 7, mid: 35, high: 88 },
		4: { low: 10, mid: 50, high: 91 },
		5: { low: 13, mid: 65, high: 94 },
		6: { low: 15, mid: 75, high: 96 },
		7: { low: 17, mid: 85, high: 98 },
		8: { low: 18, mid: 90, high: 99 },
		9: { low: 19, mid: 95, high: 100 }
	},
	[OddsLevel.FiftyFifty]: {
		1: { low: 2, mid: 10, high: 83 },
		2: { low: 3, mid: 15, high: 84 },
		3: { low: 5, mid: 25, high: 86 },
		4: { low: 7, mid: 35, high: 88 },
		5: { low: 10, mid: 50, high: 91 },
		6: { low: 13, mid: 65, high: 94 },
		7: { low: 15, mid: 75, high: 96 },
		8: { low: 17, mid: 85, high: 98 },
		9: { low: 18, mid: 90, high: 99 }
	},
	[OddsLevel.Unlikely]: {
		1: { low: 1, mid: 5, high: 82 },
		2: { low: 2, mid: 10, high: 83 },
		3: { low: 3, mid: 15, high: 84 },
		4: { low: 5, mid: 25, high: 86 },
		5: { low: 7, mid: 35, high: 88 },
		6: { low: 10, mid: 50, high: 91 },
		7: { low: 13, mid: 65, high: 94 },
		8: { low: 15, mid: 75, high: 96 },
		9: { low: 17, mid: 85, high: 98 }
	},
	[OddsLevel.VeryUnlikely]: {
		1: { low: 0, mid: 1, high: 81 },
		2: { low: 1, mid: 5, high: 82 },
		3: { low: 2, mid: 10, high: 83 },
		4: { low: 3, mid: 15, high: 84 },
		5: { low: 5, mid: 25, high: 86 },
		6: { low: 7, mid: 35, high: 88 },
		7: { low: 10, mid: 50, high: 91 },
		8: { low: 13, mid: 65, high: 94 },
		9: { low: 15, mid: 75, high: 96 }
	},
	[OddsLevel.NearlyImpossible]: {
		1: { low: 0, mid: 1, high: 81 },
		2: { low: 0, mid: 1, high: 81 },
		3: { low: 1, mid: 5, high: 82 },
		4: { low: 2, mid: 10, high: 83 },
		5: { low: 3, mid: 15, high: 84 },
		6: { low: 5, mid: 25, high: 86 },
		7: { low: 7, mid: 35, high: 88 },
		8: { low: 10, mid: 50, high: 91 },
		9: { low: 13, mid: 65, high: 94 }
	},
	[OddsLevel.Impossible]: {
		1: { low: 0, mid: 1, high: 81 },
		2: { low: 0, mid: 1, high: 81 },
		3: { low: 0, mid: 1, high: 81 },
		4: { low: 1, mid: 5, high: 82 },
		5: { low: 2, mid: 10, high: 83 },
		6: { low: 3, mid: 15, high: 84 },
		7: { low: 5, mid: 25, high: 86 },
		8: { low: 7, mid: 35, high: 88 },
		9: { low: 10, mid: 50, high: 91 }
	}
};
