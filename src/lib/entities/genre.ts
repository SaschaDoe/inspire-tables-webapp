export class Genre {
	id: string = '';
	name: string = '';
	subGenreName: string = '';

	// Settings and world elements
	settings: string[] = [];
	magicSystemTypes: string[] = [];
	technologyLevels: [string, number][] = [];
	techLevelBase: string = '';

	// Story elements
	characterTypes: string[] = [];
	plotTropes: string[] = [];
	plotStructures: string[] = [];
	narrativePerspectives: string[] = [];

	// Mood and pacing
	moodOptions: string[] = [];
	paceOptions: string[] = [];
}

export function getGenreFullName(name: string, subGenreName: string): string {
	if (subGenreName !== '') {
		return `${name} (${subGenreName})`;
	}
	return name;
}

export function getJustMainGenreName(input: string): string {
	const index = input.indexOf('(');
	if (index !== -1) {
		return input.substring(0, index).trim();
	}
	return input.trim();
}
