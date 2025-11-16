/**
 * Manual mapping of trope names from tables to actual TV Tropes page names
 *
 * This is necessary because our table trope names don't always match
 * the actual TV Tropes page names exactly.
 *
 * Format: { "our trope name": "ActualTvTropesPageName" }
 */
export const tvTropesMapping: Record<string, string> = {
	// Plot Tropes
	"mission from higher power": "MissionFromGod",
	"15 minutes of fame": "FifteenMinutesOfFame",
	"dragon": "OurDragonsAreDifferent", // or "DragonSlaying" or "TheHero"?
	"lost wedding ring": "LostWeddingRing",

	// Beginning Tropes
	"action prologue": "ActionPrologue",
	"how we got here": "HowWeGotHere",

	// Conflict Tropes
	"stupidity": "TooDumbToLive",
	"achievement through ignorance": "AchievementsThroughIgnorance",

	// Add more mappings as we discover the correct TV Tropes pages
	// TODO: This needs to be populated with all tropes from the tables
};

/**
 * Fallback for unmapped tropes - attempts to generate URL from trope name
 * This is the old auto-generation logic, used when no mapping exists
 */
function generateFallbackUrl(tropeName: string): string {
	return tropeName
		.replace(/'s\b/g, 's')
		.replace(/['",.!?;:()]/g, '')
		.split(/[\s\-_/]+/)
		.filter(word => word.length > 0)
		.map(word => {
			if (word === word.toUpperCase() && word.length > 1) {
				return word;
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join('');
}

/**
 * Get the TV Tropes page name for a given trope
 * Uses manual mapping if available, otherwise attempts auto-generation
 */
export function getTvTropesPageName(tropeName: string): string {
	// Remove context after colon (e.g., "mission from higher power: Higher Power" -> "mission from higher power")
	const baseTropeName = tropeName.split(':')[0].trim().toLowerCase();

	// Check if we have a manual mapping
	if (tvTropesMapping[baseTropeName]) {
		return tvTropesMapping[baseTropeName];
	}

	// Fall back to auto-generation (may not be correct)
	console.warn(`No TV Tropes mapping found for: "${baseTropeName}". Using auto-generated URL (may be incorrect).`);
	return generateFallbackUrl(baseTropeName);
}
