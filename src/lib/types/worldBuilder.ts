export type WorldBuilderCardType = 'region' | 'landmark' | 'namesake' | 'origin' | 'attribute' | 'advent' | 'adventure' | 'keyhole' | 'opus' | 'flourish';

export interface WorldBuilderCard {
	type: WorldBuilderCardType;
	cues?: string[]; // 4 cues for most types, or question cues for adventure cards
	cue?: string; // Single cue for advent cards
	interpretations?: string[]; // For advent cards with interpretation suggestions
	title?: string; // For adventure cards - quest title
	summary?: string; // For adventure cards - quest description
	questions?: string[]; // For keyhole cards - 4 cultural questions
	expansion?: string; // e.g., 'eco-cards', 'fantasy', 'horror', 'sci-fi', 'adventure-prompts', 'culture-keyholes'
}

export interface WorldBuilderDeck {
	name: string;
	description?: string;
	cards: {
		regions: WorldBuilderCard[];
		landmarks: WorldBuilderCard[];
		namesakes: WorldBuilderCard[];
		origins: WorldBuilderCard[];
		attributes: WorldBuilderCard[];
		advents: WorldBuilderCard[];
		adventures: WorldBuilderCard[];
		keyholes: WorldBuilderCard[];
		opuses: WorldBuilderCard[];
		flourishes: WorldBuilderCard[];
	};
}

// Type info for UI display
export interface WorldBuilderCardTypeInfo {
	type: WorldBuilderCardType;
	name: string;
	icon: string;
	color: string; // Tailwind gradient class
	cueCount: 4 | 'text'; // 'text' for advent cards with long-form content
	description: string;
}

// Card type metadata
export const WORLD_BUILDER_CARD_TYPES: Record<WorldBuilderCardType, WorldBuilderCardTypeInfo> = {
	region: {
		type: 'region',
		name: 'Region',
		icon: '🟢',
		color: 'from-green-600 to-teal-600',
		cueCount: 4,
		description: 'Main terrain types - hub for microsettings'
	},
	landmark: {
		type: 'landmark',
		name: 'Landmark',
		icon: '🔵',
		color: 'from-blue-600 to-indigo-600',
		cueCount: 4,
		description: 'Geographical sites and points of interest'
	},
	namesake: {
		type: 'namesake',
		name: 'Namesake',
		icon: '🟠',
		color: 'from-orange-600 to-amber-600',
		cueCount: 4,
		description: 'In-world nicknames for atmospheric names'
	},
	origin: {
		type: 'origin',
		name: 'Origin',
		icon: '📘',
		color: 'from-indigo-600 to-purple-600',
		cueCount: 4,
		description: 'Historical events that shaped the area (past)'
	},
	attribute: {
		type: 'attribute',
		name: 'Attribute',
		icon: '⭐',
		color: 'from-cyan-600 to-sky-600',
		cueCount: 4,
		description: 'Current characteristics and features (present)'
	},
	advent: {
		type: 'advent',
		name: 'Advent',
		icon: '🔮',
		color: 'from-fuchsia-600 to-pink-600',
		cueCount: 'text',
		description: 'Future-changing events with interpretation suggestions'
	},
	adventure: {
		type: 'adventure',
		name: 'Adventure',
		icon: '⚔️',
		color: 'from-red-600 to-orange-600',
		cueCount: 'text',
		description: 'Quest hooks with customizable story elements'
	},
	keyhole: {
		type: 'keyhole',
		name: 'Keyhole',
		icon: '🔑',
		color: 'from-amber-600 to-yellow-600',
		cueCount: 'text',
		description: 'Cultural worldbuilding questions about beliefs and customs'
	},
	opus: {
		type: 'opus',
		name: 'Opus',
		icon: '📜',
		color: 'from-purple-600 to-violet-600',
		cueCount: 4,
		description: 'Lore formats for creating in-world cultural artifacts'
	},
	flourish: {
		type: 'flourish',
		name: 'Flourish',
		icon: '🎭',
		color: 'from-violet-600 to-fuchsia-600',
		cueCount: 4,
		description: 'Stylistic quirks and creative challenges for lore creation'
	}
};

// Microsetting: The core building block of Deck of Worlds
export interface Microsetting {
	region: WorldBuilderCard;
	landmarks: WorldBuilderCard[];
	namesake: WorldBuilderCard;
	origin: WorldBuilderCard;
	attribute: WorldBuilderCard;
	advent: WorldBuilderCard;
}
