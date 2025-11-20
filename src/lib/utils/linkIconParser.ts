import type { LoreMasterCard } from '$lib/types/loreMaster';
import type { DetectedBridgeLink } from '$lib/types/bridge';
import { EMOJI_TO_LORE_MASTER_TYPE, EMOJI_TO_WORLD_BUILDER_TYPE } from '$lib/types/bridge';

/**
 * Check if a card is an expansion variant (contains ⚪ or 0 placeholders)
 */
export function isExpansionVariant(card: LoreMasterCard): boolean {
	const allCues = [...card.primaryCues, ...card.secondaryCues];
	// Check for ⚪ (white circle) or standalone 0 (used as placeholder in JSON)
	return allCues.some((cue) => cue.includes('⚪') || / 0(?:'S|\/| |,|$)/.test(cue) || cue.startsWith('0\'S') || cue.includes(' 0'));
}

/**
 * Extract the deity name from a deity card
 * Deity cards have their name in secondary cues (e.g., "THE LION", "THE SERPENT")
 */
export function extractDeityName(deityCard: LoreMasterCard): string {
	if (deityCard.type !== 'deity' || deityCard.secondaryCues.length === 0) {
		return '';
	}

	// Deity cards can have multiple names (e.g., ["THE SPIDER", "THE STAG", "THE FLY"])
	// Pick a random one if multiple are available
	const names = deityCard.secondaryCues;
	const randomIndex = Math.floor(Math.random() * names.length);
	return names[randomIndex];
}

/**
 * Replace ⚪ or 0 placeholders in a cue with the deity name
 */
export function replacePlaceholder(cue: string, deityName: string): string {
	// Replace ⚪ (white circle unicode character)
	let result = cue.replace(/⚪/g, deityName);

	// Replace 0 placeholders (digit zero used as placeholder)
	// Handle patterns like: "0'S", " 0 ", " 0/", " 0,", "OF 0", etc.
	result = result.replace(/\b0(?='S|\/|\s|,|:|$)/g, deityName);
	result = result.replace(/^0(?='S)/g, deityName); // Handle "0'S" at start
	result = result.replace(/OF 0\b/g, `OF ${deityName}`); // Handle "OF 0"
	result = result.replace(/\s0\s/g, ` ${deityName} `); // Handle " 0 "
	result = result.replace(/\s0$/g, ` ${deityName}`); // Handle " 0" at end

	return result;
}

/**
 * Get the display text for a cue, with deity name replacement if applicable
 */
export function getDisplayCue(
	cue: string,
	pairedDeity?: { deityName: string }
): string {
	if (!pairedDeity) {
		return cue;
	}

	return replacePlaceholder(cue, pairedDeity.deityName);
}

/**
 * Count how many ⚪ placeholders are in a card's cues
 */
export function countPlaceholders(card: LoreMasterCard): number {
	const allCues = [...card.primaryCues, ...card.secondaryCues];
	let count = 0;

	for (const cue of allCues) {
		const matches = cue.match(/⚪/g);
		if (matches) {
			count += matches.length;
		}
	}

	return count;
}

// ==================== Bridge Card Link Detection ====================

/**
 * Detect bridge links in a card cue
 * Returns array of detected links with their target deck/type
 */
export function detectBridgeLinks(cue: string): DetectedBridgeLink[] {
	const links: DetectedBridgeLink[] = [];

	// Pattern for emoji-based references (e.g., "🎭 Faction", "👤 Figure", "🌲 Region")
	// Captures emoji and optional card type name
	const emojiPattern = /(🎭|👤|📅|📍|🎲|🧱|🐲|⚡|🌲|🏛|📖|⭐|🌸)\s*(\w+)?/gi;

	let match;
	while ((match = emojiPattern.exec(cue)) !== null) {
		const emoji = match[1];
		const typeName = match[2];
		const position = match.index;

		// Check Lore Master types first
		if (emoji in EMOJI_TO_LORE_MASTER_TYPE) {
			const loreMasterType = EMOJI_TO_LORE_MASTER_TYPE[emoji];
			links.push({
				linkText: match[0],
				emojiIcon: emoji,
				targetDeck: 'lore-master',
				targetCardType: loreMasterType,
				position
			});
		}
		// Check World Builder types
		else if (emoji in EMOJI_TO_WORLD_BUILDER_TYPE) {
			const worldBuilderType = EMOJI_TO_WORLD_BUILDER_TYPE[emoji];
			links.push({
				linkText: match[0],
				emojiIcon: emoji,
				targetDeck: 'world-builder',
				targetCardType: worldBuilderType,
				position
			});
		}
	}

	// Pattern for text-based references (e.g., "a Faction", "an Event", "a Region", "a Conflict")
	// Common in bridge card cues
	const textPattern =
		/\b(a|an)\s+(faction|figure|event|location|object|material|creature|deity|region|landmark|namesake|origin|attribute|advent|agent|engine|anchor|conflict|aspect)\b/gi;

	while ((match = textPattern.exec(cue)) !== null) {
		const article = match[1];
		const typeName = match[2].toLowerCase();
		const position = match.index;

		// Check which deck this type belongs to
		const loreMasterTypes = [
			'faction',
			'figure',
			'event',
			'location',
			'object',
			'material',
			'creature',
			'deity'
		];
		const worldBuilderTypes = ['region', 'landmark', 'namesake', 'origin', 'attribute', 'advent'];
		const storyEngineTypes = ['agent', 'engine', 'anchor', 'conflict', 'aspect'];

		if (loreMasterTypes.includes(typeName)) {
			links.push({
				linkText: match[0],
				targetDeck: 'lore-master',
				targetCardType: typeName as any,
				position
			});
		} else if (worldBuilderTypes.includes(typeName)) {
			links.push({
				linkText: match[0],
				targetDeck: 'world-builder',
				targetCardType: typeName as any,
				position
			});
		} else if (storyEngineTypes.includes(typeName)) {
			links.push({
				linkText: match[0],
				targetDeck: 'story-engine',
				targetCardType: typeName as any,
				position
			});
		}
	}

	return links;
}

/**
 * Check if a cue contains any bridge links
 */
export function hasBridgeLinks(cue: string): boolean {
	return detectBridgeLinks(cue).length > 0;
}

/**
 * Highlight bridge links in a cue with HTML markup
 * Useful for rendering clickable links in the UI
 */
export function highlightBridgeLinks(
	cue: string,
	onLinkClick?: (link: DetectedBridgeLink) => void
): string {
	const links = detectBridgeLinks(cue);

	if (links.length === 0) {
		return cue;
	}

	// Sort links by position (descending) to replace from end to start
	links.sort((a, b) => b.position - a.position);

	let result = cue;

	for (const link of links) {
		const before = result.slice(0, link.position);
		const after = result.slice(link.position + link.linkText.length);

		// Create clickable span with data attributes
		const highlighted = `<span class="bridge-link" data-deck="${link.targetDeck}" data-type="${link.targetCardType}">${link.linkText}</span>`;

		result = before + highlighted + after;
	}

	return result;
}
