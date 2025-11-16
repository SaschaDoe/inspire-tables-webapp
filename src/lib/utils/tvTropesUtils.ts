/**
 * Utility functions for TV Tropes integration
 */
import { getTvTropesPageName } from '$lib/data/tvTropesMapping';

/**
 * Generates a TV Tropes URL for a given trope name
 * Uses manual mapping when available, falls back to auto-generation
 * @param tropeName The human-readable trope name (may include context after colon)
 * @returns The full TV Tropes URL
 */
export function getTvTropesUrl(tropeName: string): string {
	const pageName = getTvTropesPageName(tropeName);
	return `https://tvtropes.org/pmwiki/pmwiki.php/Main/${pageName}`;
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
