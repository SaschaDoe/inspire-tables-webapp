// Lore Master's Deck card types and interfaces

export type LoreMasterCardType =
	| 'faction'
	| 'figure'
	| 'event'
	| 'location'
	| 'object'
	| 'material'
	| 'creature'
	| 'modifier'
	| 'deity';

// Link icon types that appear in secondary cues
export type LinkIconType = '⚪' | '⚫';

// Position of a card in a lore cluster
export type ClusterPosition = 'primary' | 'top' | 'right' | 'bottom' | 'left';

export interface LoreMasterCard {
	type: LoreMasterCardType;
	primaryCues: string[]; // 4 primary cues (or empty for modifier cards)
	secondaryCues: string[]; // 4 secondary cues (8 for modifier cards)
	expansion?: string; // e.g., 'main-deck', 'bridge', etc.
	activePrimaryCueIndex?: number; // Which primary cue is active (0-3)
	activeSecondaryCueIndex?: number; // Which secondary cue is active (0-3 or 0-7 for modifiers)
}

// A card positioned within a cluster
export interface ClusteredCard {
	card: LoreMasterCard;
	position: ClusterPosition;
	activeCueIndex: number; // The active cue for this card in the cluster
	rotation?: number; // Rotation in degrees for tucked cards
}

// Link information parsed from cue text
export interface ParsedLink {
	originalCue: string; // Full cue text
	linkType: 'simple' | 'choice' | 'double'; // ⚪, ⚪/⚫, ⚪+⚫
	icons: LinkIconType[]; // The icon(s) found in the cue
	cardTypes: LoreMasterCardType[]; // The card type(s) to draw
}

// A complete lore cluster (5 cards: 1 primary + 4 secondary)
export interface LoreCluster {
	id: string;
	primaryCard: ClusteredCard; // Center card
	topCard: ClusteredCard | null;
	rightCard: ClusteredCard | null;
	bottomCard: ClusteredCard | null;
	leftCard: ClusteredCard | null;
	modifierCard?: ClusteredCard; // Modifier card if this cluster was expanded
	expandedFrom?: string; // ID of the cluster this was expanded from
}

// Lore Master's Deck collection
export interface LoreMasterDeck {
	name: string;
	cards: {
		factions: LoreMasterCard[];
		figures: LoreMasterCard[];
		events: LoreMasterCard[];
		locations: LoreMasterCard[];
		objects: LoreMasterCard[];
		materials: LoreMasterCard[];
		creatures: LoreMasterCard[];
		modifiers: LoreMasterCard[];
		deities: LoreMasterCard[];
	};
}

// Metadata for card types
export interface LoreMasterCardTypeInfo {
	type: LoreMasterCardType;
	name: string;
	emoji: string; // Display emoji (1️⃣, 2️⃣, etc.)
	linkIcon: string; // Icon used in link cues (⚪, ⚫, etc.)
	color: string; // Tailwind gradient class
	description: string;
}

// Card type metadata
export const LORE_MASTER_CARD_TYPES: Record<LoreMasterCardType, LoreMasterCardTypeInfo> = {
	faction: {
		type: 'faction',
		name: 'Faction',
		emoji: '1️⃣',
		linkIcon: '⚪',
		color: 'from-red-600 to-orange-600',
		description: 'Organized groups of people, from druid circles to military units'
	},
	figure: {
		type: 'figure',
		name: 'Figure',
		emoji: '2️⃣',
		linkIcon: '⚫',
		color: 'from-purple-600 to-pink-600',
		description: 'Individual people and characters, from wise rulers to gifted scholars'
	},
	event: {
		type: 'event',
		name: 'Event',
		emoji: '3️⃣',
		linkIcon: '⚪',
		color: 'from-yellow-600 to-amber-600',
		description: 'Important historical moments, from battles to magical cataclysms'
	},
	location: {
		type: 'location',
		name: 'Location',
		emoji: '4️⃣',
		linkIcon: '⚪',
		color: 'from-green-600 to-teal-600',
		description: 'Landmarks or geographical areas, from secret springs to shattered towers'
	},
	object: {
		type: 'object',
		name: 'Object',
		emoji: '5️⃣',
		linkIcon: '⚪',
		color: 'from-blue-600 to-indigo-600',
		description: 'Significant items and artifacts, from deity-slaying spears to prophesied amulets'
	},
	material: {
		type: 'material',
		name: 'Material',
		emoji: '6️⃣',
		linkIcon: '⚪',
		color: 'from-cyan-600 to-sky-600',
		description: 'Physical materials and resources, from shape-shifting ink to kinetic metals'
	},
	creature: {
		type: 'creature',
		name: 'Creature',
		emoji: '7️⃣',
		linkIcon: '⚪',
		color: 'from-lime-600 to-green-600',
		description: 'Animals, plants, and life forms, from carnivorous trees to spell-eating beetles'
	},
	modifier: {
		type: 'modifier',
		name: 'Modifier',
		emoji: '⭕',
		linkIcon: '',
		color: 'from-gray-600 to-slate-600',
		description: 'Adjectives that modify or describe primary lore cues'
	},
	deity: {
		type: 'deity',
		name: 'Deity',
		emoji: '✨',
		linkIcon: '⚪',
		color: 'from-amber-600 to-yellow-500',
		description: 'Gods, spirits, deities, and cosmic entities that shape the world'
	}
};

// Helper: Map link icon to card type
export function linkIconToCardType(icon: string): LoreMasterCardType | null {
	// Use reverse lookup from card type metadata
	for (const [cardType, info] of Object.entries(LORE_MASTER_CARD_TYPES)) {
		if (info.linkIcon === icon) {
			return cardType as LoreMasterCardType;
		}
	}
	return null;
}

// Helper: Parse link information from a cue
export function parseLinkFromCue(cue: string): ParsedLink | null {
	// Match patterns like: ⚪, ⚪/⚫, ⚪+⚫
	const linkPattern = /([⚪⚫])([/+]([⚪⚫]))?/g;
	const matches = Array.from(cue.matchAll(linkPattern));

	if (matches.length === 0) return null;

	const icons: LinkIconType[] = [];
	const cardTypes: LoreMasterCardType[] = [];
	let linkType: 'simple' | 'choice' | 'double' = 'simple';

	matches.forEach((match) => {
		const icon1 = match[1] as LinkIconType;
		const operator = match[2]?.[0]; // '/' or '+'
		const icon2 = match[3] as LinkIconType | undefined;

		icons.push(icon1);
		const type1 = linkIconToCardType(icon1);
		if (type1) cardTypes.push(type1);

		if (operator && icon2) {
			icons.push(icon2);
			const type2 = linkIconToCardType(icon2);
			if (type2) cardTypes.push(type2);

			linkType = operator === '/' ? 'choice' : 'double';
		}
	});

	return {
		originalCue: cue,
		linkType,
		icons,
		cardTypes
	};
}
