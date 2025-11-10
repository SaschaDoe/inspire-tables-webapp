import type { GenreMix } from './genreMix';

export enum NarrativeMediumType {
	RPG = 'RPG',
	Book = 'Book',
	Movie = 'Movie',
	Game = 'Video Game'
}

export class Campaign {
	id: string = '';
	name: string = '';
	description: string = '';
	genreMix: GenreMix | null = null;
	narrativeMediumType: NarrativeMediumType = NarrativeMediumType.RPG;
	createdAt: Date = new Date();
	updatedAt: Date = new Date();

	// Roll results and creation log
	creationLog: string[] = [];
}
