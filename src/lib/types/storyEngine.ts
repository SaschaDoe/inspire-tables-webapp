export type StoryEngineCardType = 'agent' | 'engine' | 'anchor' | 'conflict' | 'aspect';

export interface StoryEngineCard {
	type: StoryEngineCardType;
	cues: string[]; // 2 or 4 cues depending on type
	expansion?: string; // e.g., 'main', 'curio-backstory', etc.
}

export interface StoryEngineDeck {
	name: string;
	description?: string;
	cards: {
		agents: StoryEngineCard[];
		engines: StoryEngineCard[];
		anchors: StoryEngineCard[];
		conflicts: StoryEngineCard[];
		aspects: StoryEngineCard[];
	};
}

// Type info for UI display
export interface StoryEngineCardTypeInfo {
	type: StoryEngineCardType;
	name: string;
	icon: string;
	color: string; // Tailwind gradient class
	cueCount: 2 | 4;
	description: string;
}

// Card type metadata
export const STORY_ENGINE_CARD_TYPES: Record<StoryEngineCardType, StoryEngineCardTypeInfo> = {
	agent: {
		type: 'agent',
		name: 'Agent',
		icon: '🟠',
		color: 'from-orange-500 to-amber-500',
		cueCount: 4,
		description: 'Characters who make choices'
	},
	engine: {
		type: 'engine',
		name: 'Engine',
		icon: '🟣',
		color: 'from-purple-500 to-violet-500',
		cueCount: 2,
		description: 'Motivations and relationships'
	},
	anchor: {
		type: 'anchor',
		name: 'Anchor',
		icon: '🔵',
		color: 'from-blue-500 to-cyan-500',
		cueCount: 4,
		description: 'Objects, locations, events'
	},
	conflict: {
		type: 'conflict',
		name: 'Conflict',
		icon: '🔴',
		color: 'from-red-500 to-rose-500',
		cueCount: 2,
		description: 'Obstacles and consequences'
	},
	aspect: {
		type: 'aspect',
		name: 'Aspect',
		icon: '🟢',
		color: 'from-green-500 to-emerald-500',
		cueCount: 4,
		description: 'Descriptive adjectives'
	}
};
