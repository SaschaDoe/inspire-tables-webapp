import type { HexTile } from './hexTile';
import type { ContinentInfo } from '$lib/utils/continentDetector';
import { DetailedHexTile } from './detailedHexTile';

export class WorldMap {
	// General hex tiles (Layer 1 - overview)
	hexTiles: HexTile[][] = []; // 2D grid of hex tiles (will be renamed to generalHexTiles)
	width = 0;  // General hex count X
	height = 0; // General hex count Y

	// Detailed hex tiles (Layer 2 - simulation) - flat indexed storage
	// Note: This is stored as a Map internally but serialized as an object
	private _detailedHexTiles: Map<string, DetailedHexTile> = new Map(); // key: "globalX,globalY"
	detailedWidth = 0;  // Total detailed hex count X
	detailedHeight = 0; // Total detailed hex count Y
	gridSize = 10; // Detailed hexes per General hex (default 10x10)

	// Map metadata
	seed = 0;
	continents: ContinentInfo[] = []; // Detected continents
	planetId = ''; // Reference to parent planet

	// Simulation state
	simulationEnabled = false;
	currentTurn = 0;

	/**
	 * Get the detailedHexTiles Map (handles deserialized plain objects)
	 */
	get detailedHexTiles(): Map<string, DetailedHexTile> {
		// If it's already a Map, return it
		if (this._detailedHexTiles instanceof Map) {
			return this._detailedHexTiles;
		}

		// If it's a plain object (from deserialization), convert to Map
		if (this._detailedHexTiles && typeof this._detailedHexTiles === 'object') {
			const obj = this._detailedHexTiles as unknown as Record<string, DetailedHexTile>;
			this._detailedHexTiles = new Map(Object.entries(obj));
		} else {
			this._detailedHexTiles = new Map();
		}

		return this._detailedHexTiles;
	}

	/**
	 * Set the detailedHexTiles
	 */
	set detailedHexTiles(value: Map<string, DetailedHexTile>) {
		this._detailedHexTiles = value;
	}

	/**
	 * Get a detailed hex tile by global coordinates
	 */
	getDetailedHex(globalX: number, globalY: number): DetailedHexTile | undefined {
		return this.detailedHexTiles.get(`${globalX},${globalY}`);
	}

	/**
	 * Get a detailed hex tile by general hex coordinates and local coordinates
	 */
	getDetailedHexByLocal(generalX: number, generalY: number, localX: number, localY: number): DetailedHexTile | undefined {
		const globalX = generalX * this.gridSize + localX;
		const globalY = generalY * this.gridSize + localY;
		return this.getDetailedHex(globalX, globalY);
	}

	/**
	 * Get all detailed hex tiles belonging to a general hex
	 */
	getDetailedHexesForGeneral(generalX: number, generalY: number): DetailedHexTile[] {
		const tiles: DetailedHexTile[] = [];
		const baseX = generalX * this.gridSize;
		const baseY = generalY * this.gridSize;

		for (let ly = 0; ly < this.gridSize; ly++) {
			for (let lx = 0; lx < this.gridSize; lx++) {
				const tile = this.getDetailedHex(baseX + lx, baseY + ly);
				if (tile) tiles.push(tile);
			}
		}

		return tiles;
	}

	/**
	 * Get all detailed hex tiles owned by a nation
	 */
	getTilesByNation(nationId: string): DetailedHexTile[] {
		const tiles: DetailedHexTile[] = [];
		for (const tile of this.detailedHexTiles.values()) {
			if (tile.ownerNationId === nationId) {
				tiles.push(tile);
			}
		}
		return tiles;
	}

	/**
	 * Get all detailed hex tiles owned by a city
	 */
	getTilesByCity(cityId: string): DetailedHexTile[] {
		const tiles: DetailedHexTile[] = [];
		for (const tile of this.detailedHexTiles.values()) {
			if (tile.ownerCityId === cityId) {
				tiles.push(tile);
			}
		}
		return tiles;
	}

	/**
	 * Custom JSON serialization - converts Map to plain object for storage
	 * WARNING: This can produce VERY large output for maps with many detailed tiles.
	 * Consider using toLightweightJSON() for entity store persistence.
	 */
	toJSON(): Record<string, unknown> {
		// Convert Map to plain object for JSON serialization
		const detailedTilesObj: Record<string, DetailedHexTile> = {};
		for (const [key, value] of this.detailedHexTiles.entries()) {
			detailedTilesObj[key] = value;
		}

		return {
			hexTiles: this.hexTiles,
			width: this.width,
			height: this.height,
			detailedHexTiles: detailedTilesObj,
			detailedWidth: this.detailedWidth,
			detailedHeight: this.detailedHeight,
			gridSize: this.gridSize,
			seed: this.seed,
			continents: this.continents,
			planetId: this.planetId,
			simulationEnabled: this.simulationEnabled,
			currentTurn: this.currentTurn
		};
	}

	/**
	 * Lightweight JSON serialization - excludes detailed tiles to save space.
	 * Detailed tiles can be regenerated from the general hex tiles using WorldMapCreator.
	 * Use this for entity store persistence.
	 */
	toLightweightJSON(): Record<string, unknown> {
		return {
			hexTiles: this.hexTiles,
			width: this.width,
			height: this.height,
			// Exclude detailedHexTiles - they can be regenerated
			detailedWidth: this.detailedWidth,
			detailedHeight: this.detailedHeight,
			gridSize: this.gridSize,
			seed: this.seed,
			continents: this.continents,
			planetId: this.planetId,
			simulationEnabled: this.simulationEnabled,
			currentTurn: this.currentTurn,
			hasDetailedTiles: this.detailedHexTiles.size > 0 // Flag to indicate tiles exist
		};
	}

	/**
	 * Hydrate a WorldMap from deserialized data (plain object)
	 * Note: If the data was saved using toLightweightJSON(), detailed tiles
	 * will need to be regenerated separately using WorldMapCreator.
	 */
	static fromJSON(data: Record<string, unknown>): WorldMap {
		const worldMap = new WorldMap();

		worldMap.hexTiles = (data.hexTiles as HexTile[][]) || [];
		worldMap.width = (data.width as number) || 0;
		worldMap.height = (data.height as number) || 0;
		worldMap.detailedWidth = (data.detailedWidth as number) || 0;
		worldMap.detailedHeight = (data.detailedHeight as number) || 0;
		worldMap.gridSize = (data.gridSize as number) || 10;
		worldMap.seed = (data.seed as number) || 0;
		worldMap.continents = (data.continents as ContinentInfo[]) || [];
		worldMap.planetId = (data.planetId as string) || '';
		worldMap.simulationEnabled = (data.simulationEnabled as boolean) || false;
		worldMap.currentTurn = (data.currentTurn as number) || 0;

		// Convert plain object back to Map
		const tilesData = data.detailedHexTiles;
		if (tilesData && typeof tilesData === 'object') {
			if (tilesData instanceof Map) {
				worldMap.detailedHexTiles = tilesData;
			} else {
				worldMap.detailedHexTiles = new Map(
					Object.entries(tilesData as Record<string, DetailedHexTile>)
				);
			}
		}

		return worldMap;
	}

	/**
	 * Check if detailed tiles need to be regenerated
	 * (e.g., when loaded from lightweight JSON)
	 */
	needsDetailedTilesRegeneration(): boolean {
		return this.hexTiles.length > 0 && this.detailedHexTiles.size === 0;
	}
}
