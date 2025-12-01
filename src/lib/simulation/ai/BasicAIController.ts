/**
 * BasicAIController - Default AI implementation
 *
 * Implements simple but functional AI decision making for nations.
 */

import type { IAIController, AIDecision, CityFoundingLocation } from '../interfaces/IAIController';
import type { IEntityStore } from '../interfaces/IEntityStore';
import type { Nation } from '$lib/entities/location/nation';
import type { City } from '$lib/entities/location/city';
import type { WorldMap } from '$lib/entities/location/worldMap';
import type { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
import { TerrainType } from '$lib/entities/location/terrainType';

export class BasicAIController implements IAIController {
	/**
	 * Make all AI decisions for a nation this turn
	 */
	makeDecisions(nation: Nation, currentTurn: number, currentYear: number, store: IEntityStore): AIDecision[] {
		const decisions: AIDecision[] = [];

		// Decision 1: Should we found a new city?
		if (this.shouldFoundCity(nation, currentTurn)) {
			decisions.push({
				type: 'found_city',
				nationId: nation.id
			});
		}

		// TODO: Add more decisions
		// - Build units
		// - Build buildings
		// - Research tech
		// - Choose policy
		// - Declare war / make peace

		return decisions;
	}

	/**
	 * Check if AI should found a new city
	 */
	shouldFoundCity(nation: Nation, currentTurn: number): boolean {
		const cityCount = nation.cityIds.length;
		const expansionDesire = nation.cultureTraits.expansionist;

		// Don't exceed 5 cities for now
		if (cityCount >= 5) return false;

		// More expansionist cultures found cities more frequently
		const turnsPerCity = Math.max(5, 15 - Math.floor(expansionDesire / 10));

		return currentTurn % turnsPerCity === 0;
	}

	/**
	 * Find the best location to found a city
	 */
	findCityFoundingLocation(
		nation: Nation,
		worldMap: WorldMap,
		store: IEntityStore,
		planetId: string
	): CityFoundingLocation | null {
		if (!worldMap) return null;

		// Score all tiles
		const scoredTiles: Array<{
			hexTileId: string;
			score: number;
			coordinates: { x: number; y: number };
		}> = [];

		for (const tile of worldMap.detailedHexTiles.values()) {
			// Check if tile is valid for city founding
			if (!this.isValidCityLocation(tile, store, planetId)) continue;

			// Score the tile
			const score = this.scoreCityLocation(tile, nation);
			scoredTiles.push({
				hexTileId: tile.id,
				score,
				coordinates: { x: tile.globalX, y: tile.globalY }
			});
		}

		// Sort by score (highest first)
		scoredTiles.sort((a, b) => b.score - a.score);

		// Return best location
		if (scoredTiles.length > 0) {
			return {
				hexTileId: scoredTiles[0].hexTileId,
				coordinates: scoredTiles[0].coordinates
			};
		}

		return null;
	}

	/**
	 * Check if a tile is valid for city founding
	 */
	private isValidCityLocation(tile: DetailedHexTile, store: IEntityStore, planetId: string): boolean {
		// Can't found on mountains, ocean, or impassable terrain
		if (tile.terrainType === TerrainType.Mountain ||
			tile.terrainType === TerrainType.HighMountain ||
			tile.terrainType === TerrainType.SnowMountain ||
			tile.terrainType === TerrainType.Ocean ||
			tile.terrainType === TerrainType.Water ||
			tile.isImpassable) {
			return false;
		}

		// Can't found if tile is already owned
		if (tile.ownerNationId || tile.isCityCenter) {
			return false;
		}

		// Check minimum distance from other cities (at least 4 tiles)
		const allCities = this.getAllCities(store);
		for (const city of allCities) {
			if (city.parentPlanetId !== planetId) continue;

			const distance = Math.abs(city.coordinates.x - tile.globalX) + Math.abs(city.coordinates.y - tile.globalY);
			if (distance < 4) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Score a tile for city founding
	 */
	private scoreCityLocation(tile: DetailedHexTile, nation: Nation): number {
		let score = 0;

		// Prefer terrain matching nation's preference
		if (nation.preferredTerrainTypes.includes(tile.terrainType)) {
			score += 15;
		}

		// Prefer grassland and plains
		if (tile.terrainType === TerrainType.Grass) score += 10;
		if (tile.terrainType === TerrainType.Plains) score += 8;

		// Coast is good for seafaring nations
		if (tile.terrainType === TerrainType.Coast) {
			score += nation.cultureTraits.seafaring / 10;
		}

		// Rivers are very valuable
		if (tile.hasRiver) {
			score += 15;
		}

		// Strategic resources are valuable
		if (tile.strategicResource && tile.strategicResource !== 'None') score += 12;

		// Luxury resources are valuable
		if (tile.luxuryResource && tile.luxuryResource !== 'None') score += 10;

		// Bonus resources are nice
		if (tile.bonusResource && tile.bonusResource !== '') score += 5;

		// Food yield is important
		score += tile.yields.food * 3;

		// Production is important
		score += tile.yields.production * 2;

		return score;
	}

	/**
	 * Get all cities from store (helper method)
	 */
	private getAllCities(store: IEntityStore): City[] {
		const cities: City[] = [];

		// If store has getAllEntityIds, we could filter for cities
		if (store.getAllEntityIds) {
			const ids = store.getAllEntityIds();
			for (const id of ids) {
				const entity = store.getEntity(id);
				// Check if entity is a City (duck typing)
				if (entity && 'hexTileId' in entity && 'ownerNationId' in entity && 'population' in entity) {
					cities.push(entity as City);
				}
			}
		}

		return cities;
	}
}
