import type { StoryEngineCardType } from './storyEngine';
import type { WorldBuilderCardType } from './worldBuilder';
import type { LoreMasterCardType } from './loreMaster';

// Bridge card types - cards from any deck that have cross-deck links
export type BridgeDeckType = 'story-lore' | 'story-world' | 'world-lore';

// Link reference in a bridge card cue
export interface BridgeLink {
	targetDeck: 'story-engine' | 'world-builder' | 'lore-master';
	targetCardTypes: (StoryEngineCardType | WorldBuilderCardType | LoreMasterCardType)[];
	linkType: 'primary' | 'nickname' | 'background'; // Where the link appears
}

// Story Engine bridge card (from story-lore or story-world)
export interface StoryEngineBridgeCard {
	type: StoryEngineCardType;
	cue: string;
	links?: (LoreMasterCardType | WorldBuilderCardType | string)[]; // Card types this cue references
	isBridge: true;
	bridgeDeck: BridgeDeckType;
}

// World Builder bridge card (from world-lore or story-world)
export interface WorldBuilderBridgeCard {
	type: WorldBuilderCardType;
	cue?: string;
	cues?: string[];
	links?: LoreMasterCardType[]; // For origin/attribute cards with links to lore types
	details?: {
		top_left: string;
		top_right: string;
		bottom: string;
	};
	isBridge: true;
	bridgeDeck: BridgeDeckType;
}

// Lore Master bridge card (from story-lore or world-lore)
export interface LoreMasterBridgeCard {
	type: LoreMasterCardType;
	cue: string;
	nickname_links?: (WorldBuilderCardType | StoryEngineCardType | string)[]; // For completing nickname
	background?: string; // Secondary cue
	background_links?: (LoreMasterCardType | string)[]; // Links in secondary cue
	details?: {
		top_left: string;
		top_right: string;
		bottom: string;
	};
	isBridge: true;
	bridgeDeck: BridgeDeckType;
}

export type BridgeCard = StoryEngineBridgeCard | WorldBuilderBridgeCard | LoreMasterBridgeCard;

// Bridge expansion deck structure
export interface BridgeExpansion {
	name: string;
	description: string;
	bridgeType: BridgeDeckType;
	cards: BridgeCard[];
}

// Parse result for detecting bridge links in card cues
export interface DetectedBridgeLink {
	linkText: string; // The placeholder text (e.g., "a 🎭 Faction")
	emojiIcon?: string; // The emoji if present (🎭, 👤, etc.)
	targetDeck: 'story-engine' | 'world-builder' | 'lore-master';
	targetCardType: StoryEngineCardType | WorldBuilderCardType | LoreMasterCardType;
	position: number; // Position in the cue text
}

// Bridge link icons for visual display
export const BRIDGE_ICONS = {
	// Lore Master icons (as they appear in World Builder bridge cards)
	FACTION: '🎭',
	FIGURE: '👤',
	EVENT: '📅',
	LOCATION: '📍',
	OBJECT: '🎲',
	MATERIAL: '🧱',
	CREATURE: '🐲',
	DEITY: '⚡',

	// World Builder icons (as they appear in Lore Master bridge cards)
	REGION: '🌲',
	LANDMARK: '🏛',
	NAMESAKE: '👤', // Same as FIGURE but context matters
	ORIGIN: '📖',
	ATTRIBUTE: '🎲', // Same as OBJECT but context matters
	ADVENT: '🌸',

	// Story Engine (no specific icons, referred to by type name)
	AGENT: '🎭',
	ENGINE: '⚙️',
	ANCHOR: '⚓',
	CONFLICT: '⚔️',
	ASPECT: '✨'
} as const;

// Map emoji to card type
export const EMOJI_TO_LORE_MASTER_TYPE: Record<string, LoreMasterCardType> = {
	'🎭': 'faction',
	'👤': 'figure',
	'📅': 'event',
	'📍': 'location',
	'🎲': 'object',
	'🧱': 'material',
	'🐲': 'creature',
	'⚡': 'deity'
};

export const EMOJI_TO_WORLD_BUILDER_TYPE: Record<string, WorldBuilderCardType> = {
	'🌲': 'region',
	'🏛': 'landmark',
	'📖': 'origin',
	'⭐': 'attribute',
	'🌸': 'advent'
};

// Helper: Check if a card is a bridge card
export function isBridgeCard(card: any): card is BridgeCard {
	return card?.isBridge === true;
}

// Helper: Get all links from a bridge card
export function getBridgeLinks(card: BridgeCard): BridgeLink[] {
	const links: BridgeLink[] = [];

	if ('links' in card && card.links) {
		// Determine target deck based on link content
		const targetDeck = card.links.some((l) =>
			['faction', 'figure', 'event', 'location', 'object', 'material', 'creature', 'deity'].includes(
				l as string
			)
		)
			? 'lore-master'
			: 'world-builder';

		links.push({
			targetDeck,
			targetCardTypes: card.links.filter((l) => typeof l === 'string') as any[],
			linkType: 'primary'
		});
	}

	if ('nickname_links' in card && card.nickname_links) {
		const targetDeck = card.nickname_links.some((l) =>
			['region', 'landmark', 'namesake', 'origin', 'attribute', 'advent'].includes(l as string)
		)
			? 'world-builder'
			: 'story-engine';

		links.push({
			targetDeck,
			targetCardTypes: card.nickname_links.filter((l) => typeof l === 'string') as any[],
			linkType: 'nickname'
		});
	}

	if ('background_links' in card && card.background_links) {
		links.push({
			targetDeck: 'lore-master',
			targetCardTypes: card.background_links.filter((l) => typeof l === 'string') as any[],
			linkType: 'background'
		});
	}

	return links;
}
