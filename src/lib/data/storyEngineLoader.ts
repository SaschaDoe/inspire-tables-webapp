import type { StoryEngineCard, StoryEngineDeck, StoryEngineCardType } from '$lib/types/storyEngine';

let cachedDeck: StoryEngineDeck | null = null;
let loadingPromise: Promise<StoryEngineDeck> | null = null;

/**
 * Load the main Story Engine deck (lazy loaded)
 */
export async function loadStoryEngineMainDeck(): Promise<StoryEngineDeck> {
	if (cachedDeck) {
		return cachedDeck;
	}

	// If already loading, return the existing promise
	if (loadingPromise) {
		return loadingPromise;
	}

	loadingPromise = (async () => {
		// Dynamic import for lazy loading
		const storyEngineData = await import('./story-engine/story-engine-cards.json');

		const deck: StoryEngineDeck = {
			name: storyEngineData.deck,
			cards: {
				agents: [],
				engines: [],
				anchors: [],
				conflicts: [],
				aspects: []
			}
		};

		// Parse agents
		if (storyEngineData.cardTypes.agent) {
			deck.cards.agents = storyEngineData.cardTypes.agent.cards.map((card: any) => ({
				type: 'agent' as StoryEngineCardType,
				cues: card.cues,
				expansion: 'main'
			}));
		}

		// Parse engines
		if (storyEngineData.cardTypes.engine) {
			deck.cards.engines = storyEngineData.cardTypes.engine.cards.map((card: any) => ({
				type: 'engine' as StoryEngineCardType,
				cues: card.cues,
				expansion: 'main'
			}));
		}

		// Parse anchors
		if (storyEngineData.cardTypes.anchor) {
			deck.cards.anchors = storyEngineData.cardTypes.anchor.cards.map((card: any) => ({
				type: 'anchor' as StoryEngineCardType,
				cues: card.cues,
				expansion: 'main'
			}));
		}

		// Parse conflicts
		if (storyEngineData.cardTypes.conflict) {
			deck.cards.conflicts = storyEngineData.cardTypes.conflict.cards.map((card: any) => ({
				type: 'conflict' as StoryEngineCardType,
				cues: card.cues,
				expansion: 'main'
			}));
		}

		// Parse aspects
		if (storyEngineData.cardTypes.aspect) {
			deck.cards.aspects = storyEngineData.cardTypes.aspect.cards.map((card: any) => ({
				type: 'aspect' as StoryEngineCardType,
				cues: card.cues,
				expansion: 'main'
			}));
		}

		cachedDeck = deck;
		loadingPromise = null;
		return deck;
	})();

	return loadingPromise;
}

/**
 * Get all cards as a flat array
 */
export async function getAllStoryEngineCards(): Promise<StoryEngineCard[]> {
	const deck = await loadStoryEngineMainDeck();
	return [
		...deck.cards.agents,
		...deck.cards.engines,
		...deck.cards.anchors,
		...deck.cards.conflicts,
		...deck.cards.aspects
	];
}

/**
 * Get all cards of a specific type
 */
export async function getCardsByType(type: StoryEngineCardType): Promise<StoryEngineCard[]> {
	const deck = await loadStoryEngineMainDeck();

	switch (type) {
		case 'agent':
			return deck.cards.agents;
		case 'engine':
			return deck.cards.engines;
		case 'anchor':
			return deck.cards.anchors;
		case 'conflict':
			return deck.cards.conflicts;
		case 'aspect':
			return deck.cards.aspects;
	}
}

/**
 * Get a random card, optionally filtered by type
 */
export async function getRandomCard(type?: StoryEngineCardType): Promise<StoryEngineCard> {
	const cards = type ? await getCardsByType(type) : await getAllStoryEngineCards();

	if (cards.length === 0) {
		throw new Error(`No cards available${type ? ` for type: ${type}` : ''}`);
	}

	const randomIndex = Math.floor(Math.random() * cards.length);
	return cards[randomIndex];
}

/**
 * Generate a Story Seed (5-card prompt)
 * Returns: [Agent, Engine, Anchor, Conflict, Aspect]
 */
export async function generateStorySeed(): Promise<
	[StoryEngineCard, StoryEngineCard, StoryEngineCard, StoryEngineCard, StoryEngineCard]
> {
	return [
		await getRandomCard('agent'),
		await getRandomCard('engine'),
		await getRandomCard('anchor'),
		await getRandomCard('conflict'),
		await getRandomCard('aspect')
	];
}

/**
 * Get deck statistics
 */
export async function getDeckStats() {
	const deck = await loadStoryEngineMainDeck();
	return {
		name: deck.name,
		totalCards:
			deck.cards.agents.length +
			deck.cards.engines.length +
			deck.cards.anchors.length +
			deck.cards.conflicts.length +
			deck.cards.aspects.length,
		agents: deck.cards.agents.length,
		engines: deck.cards.engines.length,
		anchors: deck.cards.anchors.length,
		conflicts: deck.cards.conflicts.length,
		aspects: deck.cards.aspects.length
	};
}
