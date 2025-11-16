/**
 * Utility functions for TV Tropes integration
 */

/**
 * Converts a trope name to PascalCase for TV Tropes URL
 * Examples:
 * - "action prologue" -> "ActionPrologue"
 * - "hero's journey" -> "HerosJourney"
 * - "15 minutes of fame" -> "FifteenMinutesOfFame"
 */
function tropeToPascalCase(tropeName: string): string {
	// Handle special cases first
	const specialCases: Record<string, string> = {
		"15 minutes of fame": "FifteenMinutesOfFame",
		"the B grade": "TheBGrade",
		// Add more special cases as needed
	};

	if (specialCases[tropeName.toLowerCase()]) {
		return specialCases[tropeName.toLowerCase()];
	}

	return tropeName
		// Remove possessive apostrophes
		.replace(/'s\b/g, 's')
		// Remove other apostrophes, quotes, commas, and punctuation
		.replace(/['",.!?;:()]/g, '')
		// Split by spaces, hyphens, and other separators
		.split(/[\s\-_/]+/)
		// Filter out empty strings
		.filter(word => word.length > 0)
		// Capitalize first letter of each word
		.map(word => {
			// Keep acronyms uppercase
			if (word === word.toUpperCase() && word.length > 1) {
				return word;
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		// Join without spaces
		.join('');
}

/**
 * Generates a TV Tropes URL for a given trope name
 * @param tropeName The human-readable trope name
 * @returns The full TV Tropes URL
 */
export function getTvTropesUrl(tropeName: string): string {
	const pascalCaseName = tropeToPascalCase(tropeName);
	return `https://tvtropes.org/pmwiki/pmwiki.php/Main/${pascalCaseName}`;
}

/**
 * Checks if a string appears to be a trope name (not empty, not just punctuation)
 * @param tropeName The trope name to validate
 * @returns True if it's a valid trope name
 */
export function isValidTropeName(tropeName: string): boolean {
	if (!tropeName || typeof tropeName !== 'string') {
		return false;
	}
	// Check if it has at least some alphanumeric characters
	return /[a-zA-Z0-9]/.test(tropeName.trim());
}
