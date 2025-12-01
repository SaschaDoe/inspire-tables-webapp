/**
 * AI Controller Interface - Abstraction for AI decision making
 *
 * Follows the Strategy pattern - different AI implementations can be swapped
 */

import type { Nation } from '$lib/entities/location/nation';
import type { IEntityStore } from './IEntityStore';
import type { WorldMap } from '$lib/entities/location/worldMap';

export interface CityFoundingLocation {
	hexTileId: string;
	coordinates: { x: number; y: number };
}

export interface AIDecision {
	type: 'found_city' | 'build_unit' | 'build_building' | 'research_tech' | 'choose_policy' | 'declare_war' | 'make_peace';
	nationId: string;
	data?: any;
}

export interface IAIController {
	/**
	 * Make all AI decisions for a nation this turn
	 */
	makeDecisions(nation: Nation, currentTurn: number, currentYear: number, store: IEntityStore): AIDecision[];

	/**
	 * Check if AI should found a new city
	 */
	shouldFoundCity(nation: Nation, currentTurn: number): boolean;

	/**
	 * Find the best location to found a city
	 */
	findCityFoundingLocation(nation: Nation, worldMap: WorldMap, store: IEntityStore, planetId: string): CityFoundingLocation | null;
}
