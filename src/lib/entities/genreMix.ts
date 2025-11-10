import type { Genre } from './genre';

export interface GenreWeights {
	[genre: string]: number;
}

export class GenreMix {
	id: string = '';
	primaryGenre: Genre | null = null;
	subGenres: Genre[] = [];
	genreWeights: GenreWeights = {};
	techList: [string, number][] = [];
	themes: string[] = [];
	themeStatements: string[] = [];
	blendIntensity: number = 0; // 0-10 scale
	genreTransitions: string = '';

	// Description for display
	description: string = '';
}
