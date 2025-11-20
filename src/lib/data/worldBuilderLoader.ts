import type {
	WorldBuilderCard,
	WorldBuilderDeck,
	WorldBuilderCardType
} from '$lib/types/worldBuilder';

let cachedDeck: WorldBuilderDeck | null = null;
let loadingPromise: Promise<WorldBuilderDeck> | null = null;

/**
 * Parse cards from a deck data structure
 */
function parseCardsFromDeck(deckData: any, expansionName: string, deck: WorldBuilderDeck) {
	if (!deckData.cardTypes) {
		return; // Skip files without cardTypes structure
	}

	// Parse regions
	if (deckData.cardTypes.region) {
		deck.cards.regions.push(
			...deckData.cardTypes.region.cards.map((card: any) => ({
				type: 'region' as WorldBuilderCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	// Parse landmarks
	if (deckData.cardTypes.landmark) {
		deck.cards.landmarks.push(
			...deckData.cardTypes.landmark.cards.map((card: any) => ({
				type: 'landmark' as WorldBuilderCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	// Parse namesakes
	if (deckData.cardTypes.namesake) {
		deck.cards.namesakes.push(
			...deckData.cardTypes.namesake.cards.map((card: any) => ({
				type: 'namesake' as WorldBuilderCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	// Parse origins
	if (deckData.cardTypes.origin) {
		deck.cards.origins.push(
			...deckData.cardTypes.origin.cards.map((card: any) => ({
				type: 'origin' as WorldBuilderCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	// Parse attributes
	if (deckData.cardTypes.attribute) {
		deck.cards.attributes.push(
			...deckData.cardTypes.attribute.cards.map((card: any) => ({
				type: 'attribute' as WorldBuilderCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	// Parse advents (special handling for cue/interpretations structure)
	if (deckData.cardTypes.advent) {
		deck.cards.advents.push(
			...deckData.cardTypes.advent.cards.map((card: any) => ({
				type: 'advent' as WorldBuilderCardType,
				cue: card.cue,
				interpretations: card.interpretations,
				expansion: expansionName
			}))
		);
	}

	// Parse adventures (quest hooks with title, summary, and question cues)
	if (deckData.cardTypes.adventure) {
		deck.cards.adventures.push(
			...deckData.cardTypes.adventure.cards.map((card: any) => ({
				type: 'adventure' as WorldBuilderCardType,
				title: card.title,
				summary: card.summary,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	// Parse keyholes (cultural worldbuilding questions)
	if (deckData.cardTypes.keyhole) {
		deck.cards.keyholes.push(
			...deckData.cardTypes.keyhole.cards.map((card: any) => ({
				type: 'keyhole' as WorldBuilderCardType,
				questions: card.questions,
				expansion: expansionName
			}))
		);
	}

	// Parse opuses (lore format prompts)
	if (deckData.cardTypes.opus) {
		deck.cards.opuses.push(
			...deckData.cardTypes.opus.cards.map((card: any) => ({
				type: 'opus' as WorldBuilderCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	// Parse flourishes (stylistic modifiers)
	if (deckData.cardTypes.flourish) {
		deck.cards.flourishes.push(
			...deckData.cardTypes.flourish.cards.map((card: any) => ({
				type: 'flourish' as WorldBuilderCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}
}

/**
 * Load all World Builder cards (Deck of Worlds - Eco Cards + expansions)
 */
export async function loadWorldBuilderMainDeck(): Promise<WorldBuilderDeck> {
	if (cachedDeck) {
		return cachedDeck;
	}

	// If already loading, return the existing promise
	if (loadingPromise) {
		return loadingPromise;
	}

	loadingPromise = (async () => {
		const deck: WorldBuilderDeck = {
			name: 'Deck of Worlds - Complete Collection',
			cards: {
				regions: [],
				landmarks: [],
				namesakes: [],
				origins: [],
				attributes: [],
				advents: [],
				adventures: [],
				keyholes: [],
				opuses: [],
				flourishes: []
			}
		};

		// Load Eco Cards (base set)
		const ecoCards = await import('./world-builder/deck-of-worlds-eco-cards.json');
		parseCardsFromDeck(ecoCards, 'eco-cards', deck);

		// Load Adventure Prompts expansion
		const adventurePrompts = await import('./world-builder/deck-of-worlds-adventure-prompts-expansion.json');
		parseCardsFromDeck(adventurePrompts, 'adventure-prompts', deck);

		// Load Culture Keyholes expansion
		const cultureKeyholes = await import('./world-builder/deck-of-worlds-culture-keyholes-expansion.json');
		parseCardsFromDeck(cultureKeyholes, 'culture-keyholes', deck);

		// Load Lore Fragments expansion
		const loreFragments = await import('./world-builder/deck-of-worlds-lore-fragments-expansion.json');
		parseCardsFromDeck(loreFragments, 'lore-fragments', deck);

		// Load Arctic expansion (Worlds of Frost & Fable)
		const arcticExpansion = await import('./world-builder/deck-of-worlds-arctic-expansion.json');
		parseCardsFromDeck(arcticExpansion, 'arctic', deck);

		// Load Coastlines expansion (Worlds of Tide & Tidings)
		const coastlinesExpansion = await import('./world-builder/deck-of-worlds-coastlines-expansion.json');
		parseCardsFromDeck(coastlinesExpansion, 'coastlines', deck);

		// Load Deserts expansion (Worlds of Sun & Sand)
		const desertsExpansion = await import('./world-builder/deck-of-worlds-deserts-expansion.json');
		parseCardsFromDeck(desertsExpansion, 'deserts', deck);

		// Load Fantasy expansion (Worlds of Myth & Magic)
		const fantasyExpansion = await import('./world-builder/deck-of-worlds-fantasy-expansion.json');
		parseCardsFromDeck(fantasyExpansion, 'fantasy', deck);

		// Load Horror expansion (Worlds of Blight & Shadow)
		const horrorExpansion = await import('./world-builder/deck-of-worlds-horror-expansion.json');
		parseCardsFromDeck(horrorExpansion, 'horror', deck);

		// Load Science Fiction expansion (Worlds of Chrome & Starlight)
		const sciFiExpansion = await import('./world-builder/deck-of-worlds-science-fiction-expansion.json');
		parseCardsFromDeck(sciFiExpansion, 'sci-fi', deck);

		cachedDeck = deck;
		loadingPromise = null;
		return deck;
	})();

	return loadingPromise;
}

/**
 * Get all cards as a flat array
 */
export async function getAllWorldBuilderCards(): Promise<WorldBuilderCard[]> {
	const deck = await loadWorldBuilderMainDeck();
	return [
		...deck.cards.regions,
		...deck.cards.landmarks,
		...deck.cards.namesakes,
		...deck.cards.origins,
		...deck.cards.attributes,
		...deck.cards.advents,
		...deck.cards.adventures,
		...deck.cards.keyholes,
		...deck.cards.opuses,
		...deck.cards.flourishes
	];
}

/**
 * Get all cards of a specific type
 */
export async function getCardsByType(type: WorldBuilderCardType): Promise<WorldBuilderCard[]> {
	const deck = await loadWorldBuilderMainDeck();

	switch (type) {
		case 'region':
			return deck.cards.regions;
		case 'landmark':
			return deck.cards.landmarks;
		case 'namesake':
			return deck.cards.namesakes;
		case 'origin':
			return deck.cards.origins;
		case 'attribute':
			return deck.cards.attributes;
		case 'advent':
			return deck.cards.advents;
		case 'adventure':
			return deck.cards.adventures;
		case 'keyhole':
			return deck.cards.keyholes;
		case 'opus':
			return deck.cards.opuses;
		case 'flourish':
			return deck.cards.flourishes;
	}
}

/**
 * Get a random card, optionally filtered by type
 */
export async function getRandomCard(type?: WorldBuilderCardType): Promise<WorldBuilderCard> {
	const cards = type ? await getCardsByType(type) : await getAllWorldBuilderCards();

	if (cards.length === 0) {
		throw new Error(`No cards available${type ? ` for type: ${type}` : ''}`);
	}

	const randomIndex = Math.floor(Math.random() * cards.length);
	return cards[randomIndex];
}

/**
 * Generate a Microsetting (complete worldbuilding prompt)
 * Returns: { region, landmarks, namesake, origin, attribute, advent }
 */
export async function generateMicrosetting(): Promise<{
	region: WorldBuilderCard;
	landmarks: WorldBuilderCard[];
	namesake: WorldBuilderCard;
	origin: WorldBuilderCard;
	attribute: WorldBuilderCard;
	advent: WorldBuilderCard;
}> {
	return {
		region: await getRandomCard('region'),
		landmarks: [
			await getRandomCard('landmark'),
			await getRandomCard('landmark'),
			await getRandomCard('landmark')
		],
		namesake: await getRandomCard('namesake'),
		origin: await getRandomCard('origin'),
		attribute: await getRandomCard('attribute'),
		advent: await getRandomCard('advent')
	};
}

/**
 * Get deck statistics
 */
export async function getDeckStats() {
	const deck = await loadWorldBuilderMainDeck();
	return {
		name: deck.name,
		totalCards:
			deck.cards.regions.length +
			deck.cards.landmarks.length +
			deck.cards.namesakes.length +
			deck.cards.origins.length +
			deck.cards.attributes.length +
			deck.cards.advents.length +
			deck.cards.adventures.length +
			deck.cards.keyholes.length +
			deck.cards.opuses.length +
			deck.cards.flourishes.length,
		regions: deck.cards.regions.length,
		landmarks: deck.cards.landmarks.length,
		namesakes: deck.cards.namesakes.length,
		origins: deck.cards.origins.length,
		attributes: deck.cards.attributes.length,
		advents: deck.cards.advents.length,
		adventures: deck.cards.adventures.length,
		keyholes: deck.cards.keyholes.length,
		opuses: deck.cards.opuses.length,
		flourishes: deck.cards.flourishes.length
	};
}
