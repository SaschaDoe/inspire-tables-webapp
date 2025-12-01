/**
 * Event Factory Interface - Abstraction for event creation
 *
 * Follows the Factory pattern - centralizes event creation logic
 */

import type { HistoricalEvent, HistoricalEventType, EventSignificance, EventParticipant } from '$lib/entities/simulation/historicalEvent';
import type { Nation } from '$lib/entities/location/nation';
import type { City } from '$lib/entities/location/city';

export interface EventData {
	type: HistoricalEventType;
	year: number;
	turn: number;
	title: string;
	description: string;
	significance: EventSignificance;
	participants: EventParticipant[];
	hexTileId?: string;
	stateChanges?: any[];
}

export interface IEventFactory {
	/**
	 * Create a historical event
	 */
	createEvent(data: EventData): HistoricalEvent;

	/**
	 * Create a city founded event
	 */
	createCityFoundedEvent(nation: Nation, city: City, hexTileId: string, year: number, turn: number): HistoricalEvent;

	/**
	 * Create a city growth event
	 */
	createCityGrowthEvent(city: City, nation: Nation, year: number, turn: number): HistoricalEvent;

	/**
	 * Create a city starvation event
	 */
	createCityStarvationEvent(city: City, nation: Nation, year: number, turn: number): HistoricalEvent;

	/**
	 * Create a tech discovered event
	 */
	createTechDiscoveredEvent(nation: Nation, techId: string, year: number, turn: number): HistoricalEvent;

	/**
	 * Create a border expansion event
	 */
	createBorderExpansionEvent(city: City, nation: Nation, acquiredHexId: string, year: number, turn: number): HistoricalEvent;
}
