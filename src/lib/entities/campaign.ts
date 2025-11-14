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
	blendIntensity: number = 5; // 0-10 scale, how deeply genres are mixed
}
