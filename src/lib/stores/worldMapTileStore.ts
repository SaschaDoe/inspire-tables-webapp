/**
 * WorldMapTileStore - Manages storage of detailed hex tiles in IndexedDB
 *
 * Detailed hex tiles are stored separately from the main entity store
 * to avoid JSON string length limits when serializing large world maps.
 */

import { db, useIndexedDB, type DbWorldMapTiles } from '$lib/db/database';
import type { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
import type { WorldMap } from '$lib/entities/location/worldMap';

class WorldMapTileStore {
	/**
	 * Save detailed tiles for a planet's world map
	 */
	async saveTiles(planetId: string, worldMap: WorldMap): Promise<void> {
		if (!useIndexedDB) {
			console.warn('[WorldMapTileStore] IndexedDB not available, tiles will not be persisted');
			return;
		}

		const detailedTiles = worldMap.detailedHexTiles;
		if (!detailedTiles || detailedTiles.size === 0) {
			console.log('[WorldMapTileStore] No detailed tiles to save for planet:', planetId);
			return;
		}

		// Convert Map to plain object for storage
		const tilesObj: Record<string, unknown> = {};
		for (const [key, tile] of detailedTiles.entries()) {
			// Store a plain object copy of each tile
			tilesObj[key] = this.serializeTile(tile);
		}

		const record: DbWorldMapTiles = {
			planetId,
			tiles: tilesObj,
			updatedAt: new Date()
		};

		try {
			await db.worldMapTiles.put(record);
			console.log(`[WorldMapTileStore] Saved ${detailedTiles.size} tiles for planet:`, planetId);
		} catch (error) {
			console.error('[WorldMapTileStore] Failed to save tiles:', error);
			throw error;
		}
	}

	/**
	 * Load detailed tiles for a planet and populate the world map
	 */
	async loadTiles(planetId: string, worldMap: WorldMap): Promise<boolean> {
		if (!useIndexedDB) {
			console.warn('[WorldMapTileStore] IndexedDB not available, cannot load tiles');
			return false;
		}

		try {
			const record = await db.worldMapTiles.get(planetId);
			if (!record || !record.tiles) {
				console.log('[WorldMapTileStore] No stored tiles found for planet:', planetId);
				return false;
			}

			// Convert plain object back to Map
			const tilesMap = new Map<string, DetailedHexTile>();
			for (const [key, tileData] of Object.entries(record.tiles)) {
				const tile = this.deserializeTile(tileData as Record<string, unknown>);
				if (tile) {
					tilesMap.set(key, tile);
				}
			}

			// Set the tiles on the world map
			worldMap.detailedHexTiles = tilesMap;

			console.log(`[WorldMapTileStore] Loaded ${tilesMap.size} tiles for planet:`, planetId);
			return true;
		} catch (error) {
			console.error('[WorldMapTileStore] Failed to load tiles:', error);
			return false;
		}
	}

	/**
	 * Check if tiles exist for a planet
	 */
	async hasTiles(planetId: string): Promise<boolean> {
		if (!useIndexedDB) return false;

		try {
			const record = await db.worldMapTiles.get(planetId);
			return !!record && !!record.tiles && Object.keys(record.tiles).length > 0;
		} catch (error) {
			console.error('[WorldMapTileStore] Failed to check tiles:', error);
			return false;
		}
	}

	/**
	 * Delete tiles for a planet
	 */
	async deleteTiles(planetId: string): Promise<void> {
		if (!useIndexedDB) return;

		try {
			await db.worldMapTiles.delete(planetId);
			console.log('[WorldMapTileStore] Deleted tiles for planet:', planetId);
		} catch (error) {
			console.error('[WorldMapTileStore] Failed to delete tiles:', error);
		}
	}

	/**
	 * Get the count of stored tiles for a planet
	 */
	async getTileCount(planetId: string): Promise<number> {
		if (!useIndexedDB) return 0;

		try {
			const record = await db.worldMapTiles.get(planetId);
			if (!record || !record.tiles) return 0;
			return Object.keys(record.tiles).length;
		} catch (error) {
			console.error('[WorldMapTileStore] Failed to get tile count:', error);
			return 0;
		}
	}

	/**
	 * Serialize a DetailedHexTile for storage
	 */
	private serializeTile(tile: DetailedHexTile): Record<string, unknown> {
		return {
			id: tile.id,
			planetId: tile.planetId,
			parentGeneralHexId: tile.parentGeneralHexId,
			localX: tile.localX,
			localY: tile.localY,
			globalX: tile.globalX,
			globalY: tile.globalY,
			terrainType: tile.terrainType,
			elevation: tile.elevation,
			temperature: tile.temperature,
			dryness: tile.dryness,
			feature: tile.feature,
			resource: tile.resource,
			hasRiver: tile.hasRiver,
			riverSides: tile.riverSides,
			isImpassable: tile.isImpassable,
			movementCost: tile.movementCost,
			defensiveBonus: tile.defensiveBonus,
			yields: { ...tile.yields },
			ownerNationId: tile.ownerNationId,
			ownerCityId: tile.ownerCityId,
			isWorked: tile.isWorked,
			improvement: tile.improvement,
			improvementProgress: tile.improvementProgress,
			road: tile.road,
			pillaged: tile.pillaged
		};
	}

	/**
	 * Deserialize stored data back into a DetailedHexTile
	 */
	private deserializeTile(data: Record<string, unknown>): DetailedHexTile | null {
		try {
			// Import DetailedHexTile dynamically to avoid circular dependencies
			// For now, create a plain object that matches the interface
			// The WorldMap will handle it appropriately
			const tile = {
				id: data.id as string,
				planetId: data.planetId as string,
				parentGeneralHexId: data.parentGeneralHexId as string,
				localX: data.localX as number,
				localY: data.localY as number,
				globalX: data.globalX as number,
				globalY: data.globalY as number,
				terrainType: data.terrainType as number,
				elevation: data.elevation as number,
				temperature: data.temperature as number,
				dryness: data.dryness as number,
				feature: data.feature as string | null,
				resource: data.resource as string | null,
				hasRiver: data.hasRiver as boolean,
				riverSides: data.riverSides as number[],
				isImpassable: data.isImpassable as boolean,
				movementCost: data.movementCost as number,
				defensiveBonus: data.defensiveBonus as number,
				yields: data.yields as { food: number; production: number; gold: number; science: number; culture: number; faith: number },
				ownerNationId: data.ownerNationId as string | null,
				ownerCityId: data.ownerCityId as string | null,
				isWorked: data.isWorked as boolean,
				improvement: data.improvement as string | null,
				improvementProgress: data.improvementProgress as number,
				road: data.road as string | null,
				pillaged: data.pillaged as boolean,
				// Add the getKey method that DetailedHexTile has
				getKey(): string {
					return `${this.globalX},${this.globalY}`;
				}
			} as DetailedHexTile;

			return tile;
		} catch (error) {
			console.error('[WorldMapTileStore] Failed to deserialize tile:', error);
			return null;
		}
	}
}

// Export singleton instance
export const worldMapTileStore = new WorldMapTileStore();
