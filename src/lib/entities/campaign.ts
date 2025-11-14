import { Entity } from './base/entity';
import type { GenreMix } from './genreMix';
import type { Universe } from './celestial/universe';
import type { Adventure } from './adventure/adventure';

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

	// Setting properties
	setting: string = ''; // Name of the world/setting
	tone: string = ''; // Dark, Light-hearted, Epic, Gritty, etc.
	powerScale: string = ''; // Street Level, Regional, World-Threatening, etc.
	durationType: string = ''; // One-Shot, Short, Medium, Long, Epic
	centralConflict: string = ''; // Main threat/conflict
	mainThemes: string[] = []; // Array of themes
	timePeriod: string = ''; // Medieval, Modern, Future, etc.

	// Nested entities
	universes: Universe[] = [];
	adventures: Adventure[] = [];
}
