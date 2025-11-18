/**
 * Utility for parsing and handling placeholder entities in adventure text
 */

export interface PlaceholderInfo {
	hasPlaceholder: boolean;
	prefix: string; // The text before the placeholder (e.g., "introduce fraction:")
	placeholder: string; // The placeholder text (e.g., "Faction")
	entityType: string; // The entity type to generate (e.g., "faction")
	fullText: string; // The complete original text
}

/**
 * Map of placeholder text to entity types
 */
const PLACEHOLDER_TO_ENTITY_TYPE: Record<string, string> = {
	'Faction': 'faction',
	'NPC Character': 'character',
	'Artefact': 'artefact',
	'Character': 'character',
	'Monster': 'monster',
	'Dungeon': 'dungeon',
	'NPC': 'character'
};

/**
 * Known placeholder values
 */
const PLACEHOLDER_VALUES = Object.keys(PLACEHOLDER_TO_ENTITY_TYPE);

/**
 * Parse text to detect if it contains a placeholder entity
 */
export function parsePlaceholder(text: string): PlaceholderInfo {
	const result: PlaceholderInfo = {
		hasPlaceholder: false,
		prefix: '',
		placeholder: '',
		entityType: '',
		fullText: text
	};

	// Check if the text ends with any known placeholder
	for (const placeholder of PLACEHOLDER_VALUES) {
		if (text.endsWith(placeholder)) {
			result.hasPlaceholder = true;
			result.placeholder = placeholder;
			result.prefix = text.substring(0, text.length - placeholder.length).trim();
			// Remove trailing colon from prefix if present
			if (result.prefix.endsWith(':')) {
				result.prefix = result.prefix.slice(0, -1).trim();
			}
			result.entityType = PLACEHOLDER_TO_ENTITY_TYPE[placeholder];
			break;
		}
	}

	return result;
}

/**
 * Check if text contains a placeholder
 */
export function hasPlaceholder(text: string): boolean {
	return parsePlaceholder(text).hasPlaceholder;
}

/**
 * Get the entity type from a placeholder text
 */
export function getEntityTypeFromPlaceholder(placeholder: string): string | null {
	return PLACEHOLDER_TO_ENTITY_TYPE[placeholder] || null;
}
