import type { StoryEngineCard, StoryEngineDeck, StoryEngineCardType } from '$lib/types/storyEngine';

let cachedDeck: StoryEngineDeck | null = null;
let loadingPromise: Promise<StoryEngineDeck> | null = null;

/**
 * Parse cards from a deck data structure
 */
function parseCardsFromDeck(deckData: any, expansionName: string, deck: StoryEngineDeck) {
	if (deckData.cardTypes.agent) {
		deck.cards.agents.push(
			...deckData.cardTypes.agent.cards.map((card: any) => ({
				type: 'agent' as StoryEngineCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	if (deckData.cardTypes.engine) {
		deck.cards.engines.push(
			...deckData.cardTypes.engine.cards.map((card: any) => ({
				type: 'engine' as StoryEngineCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	if (deckData.cardTypes.anchor) {
		deck.cards.anchors.push(
			...deckData.cardTypes.anchor.cards.map((card: any) => ({
				type: 'anchor' as StoryEngineCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	if (deckData.cardTypes.conflict) {
		deck.cards.conflicts.push(
			...deckData.cardTypes.conflict.cards.map((card: any) => ({
				type: 'conflict' as StoryEngineCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}

	if (deckData.cardTypes.aspect) {
		deck.cards.aspects.push(
			...deckData.cardTypes.aspect.cards.map((card: any) => ({
				type: 'aspect' as StoryEngineCardType,
				cues: card.cues,
				expansion: expansionName
			}))
		);
	}
}

/**
 * Parse cards from a booster set structure
 */
function parseCardsFromBoosterSet(boosterSetData: any, deck: StoryEngineDeck) {
	// Booster sets have a "boosters" object with multiple boosters inside
	if (boosterSetData.boosters) {
		for (const [boosterKey, boosterData] of Object.entries(boosterSetData.boosters)) {
			const booster = boosterData as any;
			const expansionName = booster.theme || boosterKey;

			if (booster.cards) {
				// Parse agents
				if (booster.cards.agents?.cards) {
					deck.cards.agents.push(
						...booster.cards.agents.cards.map((card: any) => ({
							type: 'agent' as StoryEngineCardType,
							cues: card.cues,
							expansion: expansionName
						}))
					);
				}

				// Parse engines
				if (booster.cards.engines?.cards) {
					deck.cards.engines.push(
						...booster.cards.engines.cards.map((card: any) => ({
							type: 'engine' as StoryEngineCardType,
							cues: card.cues,
							expansion: expansionName
						}))
					);
				}

				// Parse anchors
				if (booster.cards.anchors?.cards) {
					deck.cards.anchors.push(
						...booster.cards.anchors.cards.map((card: any) => ({
							type: 'anchor' as StoryEngineCardType,
							cues: card.cues,
							expansion: expansionName
						}))
					);
				}

				// Parse conflicts
				if (booster.cards.conflicts?.cards) {
					deck.cards.conflicts.push(
						...booster.cards.conflicts.cards.map((card: any) => ({
							type: 'conflict' as StoryEngineCardType,
							cues: card.cues,
							expansion: expansionName
						}))
					);
				}

				// Parse aspects
				if (booster.cards.aspects?.cards) {
					deck.cards.aspects.push(
						...booster.cards.aspects.cards.map((card: any) => ({
							type: 'aspect' as StoryEngineCardType,
							cues: card.cues,
							expansion: expansionName
						}))
					);
				}
			}
		}
	}
}

/**
 * Parse cards from an expansion set structure (like starter set)
 */
function parseCardsFromExpansionSet(expansionSetData: any, deck: StoryEngineDeck) {
	// Expansion sets have an "expansions" object with multiple expansions inside
	if (expansionSetData.expansions) {
		for (const [expansionKey, expansionData] of Object.entries(expansionSetData.expansions)) {
			const expansion = expansionData as any;
			const expansionName = expansion.theme || expansionKey;

			if (expansion.cards) {
				// Parse agents
				if (expansion.cards.agents?.cards) {
					deck.cards.agents.push(
						...expansion.cards.agents.cards.map((card: any) => ({
							type: 'agent' as StoryEngineCardType,
							cues: card.cues,
							expansion: expansionName
						}))
					);
				}

				// Parse engines - note: engines may have "cue" (singular) instead of "cues"
				if (expansion.cards.engines?.cards) {
					deck.cards.engines.push(
						...expansion.cards.engines.cards.map((card: any) => ({
							type: 'engine' as StoryEngineCardType,
							cues: card.cues || (card.cue ? [card.cue] : []),
							expansion: expansionName
						}))
					);
				}

				// Parse anchors
				if (expansion.cards.anchors?.cards) {
					deck.cards.anchors.push(
						...expansion.cards.anchors.cards.map((card: any) => ({
							type: 'anchor' as StoryEngineCardType,
							cues: card.cues,
							expansion: expansionName
						}))
					);
				}

				// Parse conflicts - note: conflicts may have "cue" (singular) instead of "cues"
				if (expansion.cards.conflicts?.cards) {
					deck.cards.conflicts.push(
						...expansion.cards.conflicts.cards.map((card: any) => ({
							type: 'conflict' as StoryEngineCardType,
							cues: card.cues || (card.cue ? [card.cue] : []),
							expansion: expansionName
						}))
					);
				}

				// Parse aspects
				if (expansion.cards.aspects?.cards) {
					deck.cards.aspects.push(
						...expansion.cards.aspects.cards.map((card: any) => ({
							type: 'aspect' as StoryEngineCardType,
							cues: card.cues || (card.cue ? [card.cue] : []),
							expansion: expansionName
						}))
					);
				}
			}
		}
	}
}

/**
 * Load all Story Engine cards (main deck + all expansions + all boosters)
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
		const deck: StoryEngineDeck = {
			name: 'Story Engine - Complete Collection',
			cards: {
				agents: [],
				engines: [],
				anchors: [],
				conflicts: [],
				aspects: []
			}
		};

		// Load main deck
		const mainDeck = await import('./story-engine/story-engine-cards.json');
		parseCardsFromDeck(mainDeck, 'main', deck);

		// Load all expansions
		const fantasyExpansion = await import('./story-engine/story-engine-fantasy-expansion.json');
		parseCardsFromDeck(fantasyExpansion, 'fantasy', deck);

		const horrorExpansion = await import('./story-engine/story-engine-horror-expansion.json');
		parseCardsFromDeck(horrorExpansion, 'horror', deck);

		const backstoriesExpansion = await import(
			'./story-engine/story-engine-backstories-expansion.json'
		);
		parseCardsFromDeck(backstoriesExpansion, 'backstories', deck);

		const mysteryExpansion = await import('./story-engine/story-engine-mystery-expansion.json');
		parseCardsFromDeck(mysteryExpansion, 'mystery', deck);

		const uniqueItemsExpansion = await import(
			'./story-engine/story-engine-unique-items-expansion.json'
		);
		parseCardsFromDeck(uniqueItemsExpansion, 'unique-items', deck);

		// Load starter expansion set (contains 3 expansions: Fantasy, Horror, Sci-Fi)
		const starterExpansionSet = await import(
			'./story-engine/story-engine-starter-expansion-set.json'
		);
		parseCardsFromExpansionSet(starterExpansionSet, deck);

		// Load booster sets
		const dreamerBoosterSet = await import('./story-engine/story-engine-dreamer-booster-set.json');
		parseCardsFromBoosterSet(dreamerBoosterSet, deck);

		const founderBoosterSet = await import('./story-engine/story-engine-founder-booster-set.json');
		parseCardsFromBoosterSet(founderBoosterSet, deck);

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
