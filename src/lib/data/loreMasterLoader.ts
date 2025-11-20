import type { LoreMasterCard, LoreMasterDeck, LoreMasterCardType } from '$lib/types/loreMaster';
import { isExpansionVariant, extractDeityName } from '$lib/utils/linkIconParser';

let cachedDeck: LoreMasterDeck | null = null;
let loadingPromise: Promise<LoreMasterDeck> | null = null;

/**
 * Parse lore cards from a deck data structure
 */
function parseCardsFromDeck(
	deckData: any,
	cardType: LoreMasterCardType,
	deck: LoreMasterDeck,
	expansion: string = 'main-deck'
) {
	const typeData = deckData.cardTypes?.[cardType];
	if (!typeData) return;

	const targetArray = getCardArray(deck, cardType);

	typeData.cards.forEach((cardData: any) => {
		const card: LoreMasterCard = {
			type: cardType,
			primaryCues: cardData.primaryCues || [],
			secondaryCues: cardData.secondaryCues || cardData.cues || [],
			expansion
		};
		targetArray.push(card);
	});
}

/**
 * Get the appropriate card array for a card type
 */
function getCardArray(deck: LoreMasterDeck, cardType: LoreMasterCardType): LoreMasterCard[] {
	switch (cardType) {
		case 'faction':
			return deck.cards.factions;
		case 'figure':
			return deck.cards.figures;
		case 'event':
			return deck.cards.events;
		case 'location':
			return deck.cards.locations;
		case 'object':
			return deck.cards.objects;
		case 'material':
			return deck.cards.materials;
		case 'creature':
			return deck.cards.creatures;
		case 'modifier':
			return deck.cards.modifiers;
		case 'deity':
			return deck.cards.deities;
	}
}

/**
 * Merge modifier cards from two files (representing the two sides with 4 cues each)
 */
function mergeModifierCards(side1Data: any, side2Data: any): LoreMasterCard[] {
	const side1Cards = side1Data.cardTypes?.modifier?.cards || [];
	const side2Cards = side2Data.cardTypes?.modifier?.cards || [];

	const mergedCards: LoreMasterCard[] = [];
	const maxLength = Math.max(side1Cards.length, side2Cards.length);

	for (let i = 0; i < maxLength; i++) {
		const cues1 = side1Cards[i]?.cues || [];
		const cues2 = side2Cards[i]?.cues || [];

		mergedCards.push({
			type: 'modifier',
			primaryCues: [], // Modifiers have no primary cues
			secondaryCues: [...cues1, ...cues2], // 8 cues total (4 from each side)
			expansion: 'main-deck'
		});
	}

	return mergedCards;
}

/**
 * Load all Lore Master's Deck cards
 */
export async function loadLoreMasterDeck(): Promise<LoreMasterDeck> {
	if (cachedDeck) {
		return cachedDeck;
	}

	if (loadingPromise) {
		return loadingPromise;
	}

	loadingPromise = (async () => {
		const deck: LoreMasterDeck = {
			name: "Lore Master's Deck - Complete Collection",
			cards: {
				factions: [],
				figures: [],
				events: [],
				locations: [],
				objects: [],
				materials: [],
				creatures: [],
				modifiers: [],
				deities: []
			}
		};

		// Load all lore card types
		const factionData = await import('./lore-master/loremaster-deck-faction-cards-1.json');
		parseCardsFromDeck(factionData, 'faction', deck);

		const figureData = await import('./lore-master/loremaster-deck-figure-cards-2.json');
		parseCardsFromDeck(figureData, 'figure', deck);

		const eventData = await import('./lore-master/loremaster-deck-event-cards-3.json');
		parseCardsFromDeck(eventData, 'event', deck);

		const locationData = await import('./lore-master/loremaster-deck-location-cards-4.json');
		parseCardsFromDeck(locationData, 'location', deck);

		const objectData = await import('./lore-master/loremaster-deck-object-cards-5.json');
		parseCardsFromDeck(objectData, 'object', deck);

		const materialData = await import('./lore-master/loremaster-deck-material-cards-6.json');
		parseCardsFromDeck(materialData, 'material', deck);

		const creatureData = await import('./lore-master/loremaster-deck-creature-cards-7.json');
		parseCardsFromDeck(creatureData, 'creature', deck);

		// Load and merge modifier cards (from two files representing two sides)
		const modifierData1 = await import('./lore-master/loremaster-deck-modifier-cards-8.json');
		const modifierData2 = await import('./lore-master/loremaster-deck-modifier-cards-9.json');
		deck.cards.modifiers = mergeModifierCards(modifierData1, modifierData2);

		// Load Deities Expansion
		const deitiesExpansionData = await import('./lore-master/loremaster-deck-deity-expansion.json');

		// Load deity cards from the expansion
		parseCardsFromDeck(deitiesExpansionData, 'deity', deck, 'deities-expansion');

		// Load expansion variant cards (faction, figure, event, location, object, material, creature)
		// These are special cards with ⚪ placeholders that require deity pairing
		parseCardsFromDeck(deitiesExpansionData, 'faction', deck, 'deities-expansion');
		parseCardsFromDeck(deitiesExpansionData, 'figure', deck, 'deities-expansion');
		parseCardsFromDeck(deitiesExpansionData, 'event', deck, 'deities-expansion');
		parseCardsFromDeck(deitiesExpansionData, 'location', deck, 'deities-expansion');
		parseCardsFromDeck(deitiesExpansionData, 'object', deck, 'deities-expansion');
		parseCardsFromDeck(deitiesExpansionData, 'material', deck, 'deities-expansion');
		parseCardsFromDeck(deitiesExpansionData, 'creature', deck, 'deities-expansion');

		cachedDeck = deck;
		loadingPromise = null;
		return deck;
	})();

	return loadingPromise;
}

/**
 * Get all cards of a specific type
 */
export async function getCardsByType(type: LoreMasterCardType): Promise<LoreMasterCard[]> {
	const deck = await loadLoreMasterDeck();
	return getCardArray(deck, type);
}

/**
 * Get a random card of a specific type
 * @param type The card type to draw
 * @param expansionOnly If true, only draw cards from the deities expansion (with ⚪ placeholders)
 * @param baseOnly If true, only draw cards from the base deck (without ⚪ placeholders)
 */
export async function getRandomCard(
	type: LoreMasterCardType,
	expansionOnly: boolean = false,
	baseOnly: boolean = false
): Promise<LoreMasterCard> {
	let cards = await getCardsByType(type);

	// Filter based on expansion preferences
	if (expansionOnly) {
		cards = cards.filter((card) => card.expansion === 'deities-expansion');
	} else if (baseOnly) {
		cards = cards.filter((card) => card.expansion !== 'deities-expansion');
	}

	if (cards.length === 0) {
		throw new Error(
			`No cards available for type: ${type} with expansion filter (expansionOnly: ${expansionOnly}, baseOnly: ${baseOnly})`
		);
	}

	const randomIndex = Math.floor(Math.random() * cards.length);
	return cards[randomIndex];
}

/**
 * Get a random deity card
 */
export async function getRandomDeityCard(): Promise<LoreMasterCard> {
	return getRandomCard('deity');
}

/**
 * Check if a card needs deity pairing and pair it if so
 * @returns The card with paired deity info if it's an expansion variant, or null if it doesn't need pairing
 */
export async function pairWithDeityIfNeeded(
	card: LoreMasterCard
): Promise<{ card: LoreMasterCard; deityName: string } | null> {
	if (!isExpansionVariant(card)) {
		return null;
	}

	const deityCard = await getRandomDeityCard();
	const deityName = extractDeityName(deityCard);

	return {
		card: deityCard,
		deityName
	};
}

/**
 * Get deck statistics
 */
export async function getDeckStats() {
	const deck = await loadLoreMasterDeck();
	return {
		name: deck.name,
		totalCards:
			deck.cards.factions.length +
			deck.cards.figures.length +
			deck.cards.events.length +
			deck.cards.locations.length +
			deck.cards.objects.length +
			deck.cards.materials.length +
			deck.cards.creatures.length +
			deck.cards.modifiers.length +
			deck.cards.deities.length,
		factions: deck.cards.factions.length,
		figures: deck.cards.figures.length,
		events: deck.cards.events.length,
		locations: deck.cards.locations.length,
		objects: deck.cards.objects.length,
		materials: deck.cards.materials.length,
		creatures: deck.cards.creatures.length,
		modifiers: deck.cards.modifiers.length,
		deities: deck.cards.deities.length
	};
}
