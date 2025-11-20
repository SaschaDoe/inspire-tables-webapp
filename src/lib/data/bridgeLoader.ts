import type { BridgeExpansion, BridgeCard, BridgeDeckType } from '$lib/types/bridge';
import type { StoryEngineCard, StoryEngineCardType } from '$lib/types/storyEngine';
import type { WorldBuilderCard, WorldBuilderCardType } from '$lib/types/worldBuilder';
import type { LoreMasterCard, LoreMasterCardType } from '$lib/types/loreMaster';

// Import bridge expansion JSON files
import storyLoreBridgeData from './bridge/story-lore-bridge-expansion-cards.json';
import storyWorldBridgeData from './bridge/story-world-bridge-expansion-cards.json';
import worldLoreBridgeData from './bridge/world-lore-bridge-expansion-cards.json';

// Cache for loaded bridge expansions
let bridgeExpansions: Map<BridgeDeckType, BridgeExpansion> | null = null;

/**
 * Load all bridge expansion decks
 */
export async function loadBridgeExpansions(): Promise<Map<BridgeDeckType, BridgeExpansion>> {
	if (bridgeExpansions) return bridgeExpansions;

	bridgeExpansions = new Map();

	// Parse Story-Lore Bridge
	const storyLoreBridge: BridgeExpansion = {
		name: storyLoreBridgeData.name,
		description: storyLoreBridgeData.description,
		bridgeType: 'story-lore',
		cards: storyLoreBridgeData.cards.map((card: any) => ({
			...card,
			isBridge: true,
			bridgeDeck: 'story-lore'
		})) as BridgeCard[]
	};

	// Parse Story-World Bridge
	const storyWorldBridge: BridgeExpansion = {
		name: storyWorldBridgeData.name,
		description: storyWorldBridgeData.description,
		bridgeType: 'story-world',
		cards: storyWorldBridgeData.cards.map((card: any) => ({
			...card,
			isBridge: true,
			bridgeDeck: 'story-world'
		})) as BridgeCard[]
	};

	// Parse World-Lore Bridge
	const worldLoreBridge: BridgeExpansion = {
		name: worldLoreBridgeData.name,
		description: worldLoreBridgeData.description,
		bridgeType: 'world-lore',
		cards: worldLoreBridgeData.cards.map((card: any) => ({
			...card,
			isBridge: true,
			bridgeDeck: 'world-lore'
		})) as BridgeCard[]
	};

	bridgeExpansions.set('story-lore', storyLoreBridge);
	bridgeExpansions.set('story-world', storyWorldBridge);
	bridgeExpansions.set('world-lore', worldLoreBridge);

	return bridgeExpansions;
}

/**
 * Get a specific bridge expansion
 */
export async function getBridgeExpansion(type: BridgeDeckType): Promise<BridgeExpansion> {
	const expansions = await loadBridgeExpansions();
	const expansion = expansions.get(type);
	if (!expansion) {
		throw new Error(`Bridge expansion ${type} not found`);
	}
	return expansion;
}

/**
 * Get all bridge cards for a specific deck
 */
export async function getBridgeCardsForDeck(
	deck: 'story-engine' | 'world-builder' | 'lore-master'
): Promise<BridgeCard[]> {
	const expansions = await loadBridgeExpansions();
	const cards: BridgeCard[] = [];

	if (deck === 'story-engine') {
		// Story Engine bridge cards from story-lore and story-world
		const storyLore = expansions.get('story-lore');
		const storyWorld = expansions.get('story-world');
		if (storyLore) {
			cards.push(...storyLore.cards.filter((c) => ['engine', 'conflict'].includes(c.type)));
		}
		if (storyWorld) {
			cards.push(...storyWorld.cards.filter((c) => ['engine', 'conflict'].includes(c.type)));
		}
	} else if (deck === 'world-builder') {
		// World Builder bridge cards from world-lore and story-world
		const worldLore = expansions.get('world-lore');
		const storyWorld = expansions.get('story-world');
		if (worldLore) {
			cards.push(
				...worldLore.cards.filter((c) =>
					['region', 'landmark', 'origin', 'attribute', 'advent'].includes(c.type)
				)
			);
		}
		if (storyWorld) {
			cards.push(
				...storyWorld.cards.filter((c) =>
					['region', 'landmark', 'origin', 'attribute', 'advent'].includes(c.type)
				)
			);
		}
	} else if (deck === 'lore-master') {
		// Lore Master bridge cards from world-lore and story-lore
		const worldLore = expansions.get('world-lore');
		const storyLore = expansions.get('story-lore');
		if (worldLore) {
			cards.push(
				...worldLore.cards.filter((c) =>
					['faction', 'figure', 'event', 'location', 'object', 'material', 'creature', 'deity'].includes(
						c.type
					)
				)
			);
		}
		if (storyLore) {
			cards.push(
				...storyLore.cards.filter((c) =>
					['faction', 'figure', 'event', 'location', 'object', 'material', 'creature', 'deity'].includes(
						c.type
					)
				)
			);
		}
	}

	return cards;
}

/**
 * Get bridge cards by type
 */
export async function getBridgeCardsByType<T extends BridgeCard>(
	deck: 'story-engine' | 'world-builder' | 'lore-master',
	cardType: string
): Promise<T[]> {
	const cards = await getBridgeCardsForDeck(deck);
	return cards.filter((c) => c.type === cardType) as T[];
}

/**
 * Draw a random bridge card
 */
export async function getRandomBridgeCard(
	deck: 'story-engine' | 'world-builder' | 'lore-master',
	cardType?: string
): Promise<BridgeCard> {
	const cards = cardType
		? await getBridgeCardsByType(deck, cardType)
		: await getBridgeCardsForDeck(deck);

	if (cards.length === 0) {
		return null;
	}

	return cards[Math.floor(Math.random() * cards.length)];
}

/**
 * Format a cue with link references appended
 */
function formatCueWithLinks(cue: string, links?: (string | LoreMasterCardType | WorldBuilderCardType)[]): string {
	if (!links || links.length === 0) {
		return cue;
	}

	// Capitalize first letter of card type for display
	const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

	// Determine article (a/an) for each link
	const getArticle = (cardType: string) => {
		const vowels = ['a', 'e', 'i', 'o', 'u'];
		return vowels.includes(cardType[0].toLowerCase()) ? 'an' : 'a';
	};

	// Format each link as "a CardType"
	const formattedLinks = links.map((link) => {
		const cardType = link as string;
		return `${getArticle(cardType)} ${capitalize(cardType)}`;
	});

	// Join links with "or" and append to cue
	const linksText = formattedLinks.join(' or ');
	return `${cue} ${linksText}`;
}

/**
 * Convert bridge card to regular card format for use in existing systems
 */
export function bridgeCardToStoryEngineCard(bridgeCard: BridgeCard): StoryEngineCard {
	if (!['engine', 'conflict', 'agent', 'anchor', 'aspect'].includes(bridgeCard.type)) {
		throw new Error('Not a Story Engine bridge card');
	}


	// Format cue with links if present
	const links = 'links' in bridgeCard ? bridgeCard.links : undefined;
	console.log('[Bridge Debug]', { cue: bridgeCard.cue, links, bridgeDeck: (bridgeCard as any).bridgeDeck });
	const formattedCue = formatCueWithLinks(bridgeCard.cue, links);
	console.log('[Bridge Debug] Formatted:', formattedCue);

	return {
		type: bridgeCard.type as any,
		cues: [formattedCue, formattedCue], // Story Engine cards have 2 cues
		expansion: `bridge-${(bridgeCard as any).bridgeDeck}`
	};
}

export function bridgeCardToWorldBuilderCard(bridgeCard: BridgeCard): WorldBuilderCard {
	if (
		!['region', 'landmark', 'namesake', 'origin', 'attribute', 'advent'].includes(bridgeCard.type)
	) {
		throw new Error('Not a World Builder bridge card');
	}

	const card: WorldBuilderCard = {
		type: bridgeCard.type as any,
		expansion: `bridge-${(bridgeCard as any).bridgeDeck}`
	};

	// Format cue with links if present (for bridge link detection)
	const links = 'links' in bridgeCard ? bridgeCard.links : undefined;
	const baseCue = bridgeCard.cue;
	const formattedCue = formatCueWithLinks(baseCue, links);

	// Handle different card structures
	if ('cues' in bridgeCard && bridgeCard.cues) {
		card.cues = bridgeCard.cues;
	} else if ('cue' in bridgeCard && bridgeCard.cue) {
		if (bridgeCard.type === 'advent') {
			card.cue = formattedCue; // Use formatted cue with links appended
		} else {
			// For origin/attribute, create 4 cues from details
			const details = (bridgeCard as any).details;
			if (details) {
				// Append links to each cue for proper bridge link detection
				card.cues = [
					formatCueWithLinks(details.top_left, links),
					formatCueWithLinks(details.top_right, links),
					formattedCue, // Main cue with links
					formatCueWithLinks(details.bottom, links)
				];
			} else {
				card.cues = [formattedCue, formattedCue, formattedCue, formattedCue];
			}
		}
	}

	return card;
}

export function bridgeCardToLoreMasterCard(bridgeCard: BridgeCard): LoreMasterCard {
	if (
		!['faction', 'figure', 'event', 'location', 'object', 'material', 'creature', 'deity'].includes(
			bridgeCard.type
		)
	) {
		throw new Error('Not a Lore Master bridge card');
	}

	// Format cues with links if present (for bridge link detection)
	const nicknameLinks = 'nickname_links' in bridgeCard ? (bridgeCard as any).nickname_links : undefined;
	const backgroundLinks = 'background_links' in bridgeCard ? (bridgeCard as any).background_links : undefined;

	// Construct primary and secondary cues
	const primaryCues: string[] = [];
	const secondaryCues: string[] = [];

	// Primary cue (with nickname links appended)
	const formattedCue = formatCueWithLinks(bridgeCard.cue, nicknameLinks);
	primaryCues.push(formattedCue);

	// Add details as additional primary cues if available
	if ('details' in bridgeCard && bridgeCard.details) {
		primaryCues.push(formatCueWithLinks(bridgeCard.details.top_left, nicknameLinks));
		primaryCues.push(formatCueWithLinks(bridgeCard.details.top_right, nicknameLinks));
		primaryCues.push(formatCueWithLinks(bridgeCard.details.bottom, nicknameLinks));
	} else {
		// Fill to 4 primary cues
		while (primaryCues.length < 4) {
			primaryCues.push(formattedCue);
		}
	}

	// Secondary cue (background with background links appended)
	if ('background' in bridgeCard && bridgeCard.background) {
		const formattedBackground = formatCueWithLinks((bridgeCard as any).background, backgroundLinks);
		secondaryCues.push(formattedBackground);
	}

	// Fill secondary cues to 4 (or 8 for modifiers)
	while (secondaryCues.length < 4) {
		secondaryCues.push(formattedCue);
	}

	return {
		type: bridgeCard.type as any,
		primaryCues,
		secondaryCues,
		expansion: `bridge-${(bridgeCard as any).bridgeDeck}`
	};
}

/**
 * Get stats about bridge expansions
 */
export async function getBridgeStats() {
	const expansions = await loadBridgeExpansions();
	const stats = {
		totalCards: 0,
		byExpansion: {} as Record<BridgeDeckType, number>,
		byDeck: {
			'story-engine': 0,
			'world-builder': 0,
			'lore-master': 0
		}
	};

	for (const [type, expansion] of expansions) {
		stats.totalCards += expansion.cards.length;
		stats.byExpansion[type] = expansion.cards.length;
	}

	// Count by target deck
	const storyEngineCards = await getBridgeCardsForDeck('story-engine');
	const worldBuilderCards = await getBridgeCardsForDeck('world-builder');
	const loreMasterCards = await getBridgeCardsForDeck('lore-master');

	stats.byDeck['story-engine'] = storyEngineCards.length;
	stats.byDeck['world-builder'] = worldBuilderCards.length;
	stats.byDeck['lore-master'] = loreMasterCards.length;

	return stats;
}

/**
 * Get a random bridge card as a Story Engine card
 */
export async function getRandomBridgeStoryEngineCard(cardType?: StoryEngineCardType): Promise<StoryEngineCard> {
	const bridgeCard = await getRandomBridgeCard('story-engine', cardType);
	if (!bridgeCard) {
		const { getRandomCard } = await import('./storyEngineLoader');
		console.log(`No bridge cards for ${cardType}, falling back to regular card`);
		return await getRandomCard(cardType);
	}
	return bridgeCardToStoryEngineCard(bridgeCard);
}

/**
 * Get a random bridge card as a World Builder card
 */
export async function getRandomBridgeWorldBuilderCard(cardType?: WorldBuilderCardType): Promise<WorldBuilderCard> {
	const bridgeCard = await getRandomBridgeCard('world-builder', cardType);
	if (!bridgeCard) {
		const { getRandomCard } = await import('./worldBuilderLoader');
		console.log(`No bridge cards for ${cardType}, falling back to regular card`);
		return await getRandomCard(cardType);
	}
	return bridgeCardToWorldBuilderCard(bridgeCard);
}

/**
 * Get a random bridge card as a Lore Master card
 */
export async function getRandomBridgeLoreMasterCard(cardType?: LoreMasterCardType): Promise<LoreMasterCard> {
	const bridgeCard = await getRandomBridgeCard('lore-master', cardType);
	if (!bridgeCard) {
		const { getRandomCard } = await import('./loreMasterLoader');
		console.log(`No bridge cards for ${cardType}, falling back to regular card`);
		return await getRandomCard(cardType);
	}
	return bridgeCardToLoreMasterCard(bridgeCard);
}
