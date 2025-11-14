import { Entity } from './base/entity';
import type { GenreMix } from './genreMix';

export enum NarrativeMediumType {
	RPG = 'RPG',
	Book = 'Book',
	Movie = 'Movie',
	Game = 'Video Game'
}

export class Campaign extends Entity {
	// Genre information
	genreMix: GenreMix | null = null;
	narrativeMediumType: NarrativeMediumType = NarrativeMediumType.RPG;

	// Roll results and creation log
	creationLog: string[] = [];
}
