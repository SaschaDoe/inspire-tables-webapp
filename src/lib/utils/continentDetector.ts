import type { HexTile } from '$lib/entities/location/hexTile';
import { TerrainType } from '$lib/entities/location/terrainType';

export interface ContinentInfo {
	id: number;
	tiles: HexTile[];
	centerX: number;
	centerY: number;
	isIsland: boolean;
	size: number;
	entityId?: string; // ID of the corresponding Continent entity
}

export class ContinentDetector {
	private static readonly MOUNTAIN_TYPES = [
		TerrainType.Mountain,
		TerrainType.HighMountain,
		TerrainType.SnowMountain
	];

	private static readonly WATER_TYPES = [
		TerrainType.Water,
		TerrainType.IceFloe,
		TerrainType.SaltLake
	];

	/**
	 * Detect and tag continents in a hex grid
	 * Returns continent information and modifies tiles in-place
	 */
	static detectContinents(hexTiles: HexTile[][]): ContinentInfo[] {
		const height = hexTiles.length;
		const width = height > 0 ? hexTiles[0].length : 0;

		if (height === 0 || width === 0) return [];

		// Initialize all tiles with no continent
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				hexTiles[y][x].continentId = undefined;
			}
		}

		// Step 1: Find connected land regions
		const landRegions = this.findConnectedLandRegions(hexTiles);

		// Step 2: Split large regions by major mountain ridges
		const splitRegions = this.splitByMountainRidges(landRegions, hexTiles);

		// Step 3: Group small islands with nearby continents
		const finalRegions = this.groupIslandsWithContinents(splitRegions, hexTiles);

		// Step 4: Assign continent IDs and create continent info
		const continents: ContinentInfo[] = [];
		let continentId = 1;

		for (const region of finalRegions) {
			const tiles = region.tiles;
			const size = tiles.length;

			// Calculate center
			let sumX = 0;
			let sumY = 0;
			for (const tile of tiles) {
				tile.continentId = continentId;
				sumX += tile.x;
				sumY += tile.y;
			}

			continents.push({
				id: continentId,
				tiles,
				centerX: sumX / size,
				centerY: sumY / size,
				isIsland: region.isIsland,
				size
			});

			continentId++;
		}

		return continents;
	}

	/**
	 * Find connected land regions using flood fill
	 */
	private static findConnectedLandRegions(
		hexTiles: HexTile[][]
	): Array<{ tiles: HexTile[]; isIsland: boolean }> {
		const height = hexTiles.length;
		const width = hexTiles[0].length;
		const visited = new Set<string>();
		const regions: Array<{ tiles: HexTile[]; isIsland: boolean }> = [];

		const getTileKey = (x: number, y: number) => `${x},${y}`;
		const isLand = (tile: HexTile) => !this.WATER_TYPES.includes(tile.terrainType);

		// Get neighbors (hexagonal grid - offset column layout)
		const getNeighbors = (x: number, y: number): Array<{ x: number; y: number }> => {
			const neighbors: Array<{ x: number; y: number }> = [];
			const isOddColumn = x % 2 === 1;

			// Hexagonal neighbors depend on whether column is odd or even
			const neighborOffsets = isOddColumn
				? [
						{ dx: 1, dy: 0 }, // E
						{ dx: 0, dy: 1 }, // SE
						{ dx: -1, dy: 1 }, // SW
						{ dx: -1, dy: 0 }, // W
						{ dx: -1, dy: -1 }, // NW
						{ dx: 0, dy: -1 } // NE
					]
				: [
						{ dx: 1, dy: 0 }, // E
						{ dx: 1, dy: 1 }, // SE
						{ dx: 0, dy: 1 }, // SW
						{ dx: -1, dy: 0 }, // W
						{ dx: 0, dy: -1 }, // NW
						{ dx: 1, dy: -1 } // NE
					];

			for (const { dx, dy } of neighborOffsets) {
				const nx = x + dx;
				const ny = y + dy;
				if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
					neighbors.push({ x: nx, y: ny });
				}
			}

			return neighbors;
		};

		// Flood fill to find connected region
		const floodFill = (startX: number, startY: number): HexTile[] => {
			const region: HexTile[] = [];
			const queue: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
			visited.add(getTileKey(startX, startY));

			while (queue.length > 0) {
				const { x, y } = queue.shift()!;
				const tile = hexTiles[y][x];
				region.push(tile);

				for (const neighbor of getNeighbors(x, y)) {
					const key = getTileKey(neighbor.x, neighbor.y);
					if (!visited.has(key)) {
						const neighborTile = hexTiles[neighbor.y][neighbor.x];
						if (isLand(neighborTile)) {
							visited.add(key);
							queue.push(neighbor);
						}
					}
				}
			}

			return region;
		};

		// Find all land regions
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const key = getTileKey(x, y);
				if (!visited.has(key) && isLand(hexTiles[y][x])) {
					const tiles = floodFill(x, y);
					// Mark as island initially, will be updated later
					regions.push({ tiles, isIsland: false });
				}
			}
		}

		return regions;
	}

	/**
	 * Split large landmasses by major continuous mountain ridges
	 * This simulates geographical features like the Ural Mountains separating Europe/Asia
	 */
	private static splitByMountainRidges(
		regions: Array<{ tiles: HexTile[]; isIsland: boolean }>,
		hexTiles: HexTile[][]
	): Array<{ tiles: HexTile[]; isIsland: boolean }> {
		const newRegions: Array<{ tiles: HexTile[]; isIsland: boolean }> = [];
		const LARGE_LANDMASS_THRESHOLD = hexTiles.length * hexTiles[0].length * 0.15; // 15% of map

		for (const region of regions) {
			// Only consider splitting large landmasses
			if (region.tiles.length < LARGE_LANDMASS_THRESHOLD) {
				newRegions.push(region);
				continue;
			}

			// Find major mountain ridges (continuous mountain chains)
			const mountainRidges = this.findMajorMountainRidges(region.tiles);

			// If no significant mountain ridges, keep as one region
			if (mountainRidges.length === 0) {
				newRegions.push(region);
				continue;
			}

			// Try to split by removing mountain ridge tiles
			const splitResult = this.trySplitByMountains(region.tiles, mountainRidges, hexTiles);
			newRegions.push(...splitResult);
		}

		return newRegions;
	}

	/**
	 * Find major continuous mountain chains within a region
	 */
	private static findMajorMountainRidges(tiles: HexTile[]): HexTile[][] {
		const mountainTiles = tiles.filter((t) => this.MOUNTAIN_TYPES.includes(t.terrainType));

		if (mountainTiles.length < 5) return []; // Too few mountains

		// Find connected mountain groups using flood fill
		const visited = new Set<string>();
		const ridges: HexTile[][] = [];

		for (const mountain of mountainTiles) {
			const key = `${mountain.x},${mountain.y}`;
			if (visited.has(key)) continue;

			const ridge = this.findConnectedMountains(mountain, mountainTiles, visited);

			// Only consider it a major ridge if it's long enough
			if (ridge.length >= 5) {
				ridges.push(ridge);
			}
		}

		return ridges;
	}

	/**
	 * Find connected mountain tiles (forming a ridge)
	 */
	private static findConnectedMountains(
		start: HexTile,
		allMountains: HexTile[],
		visited: Set<string>
	): HexTile[] {
		const ridge: HexTile[] = [];
		const queue: HexTile[] = [start];
		visited.add(`${start.x},${start.y}`);

		const mountainSet = new Set(allMountains.map((m) => `${m.x},${m.y}`));

		while (queue.length > 0) {
			const current = queue.shift()!;
			ridge.push(current);

			// Check all adjacent positions
			const neighbors = this.getAdjacentPositions(current.x, current.y);
			for (const { x, y } of neighbors) {
				const key = `${x},${y}`;
				if (!visited.has(key) && mountainSet.has(key)) {
					visited.add(key);
					const neighbor = allMountains.find((m) => m.x === x && m.y === y)!;
					queue.push(neighbor);
				}
			}
		}

		return ridge;
	}

	/**
	 * Try to split a region by mountain ridges
	 */
	private static trySplitByMountains(
		tiles: HexTile[],
		mountainRidges: HexTile[][],
		hexTiles: HexTile[][]
	): Array<{ tiles: HexTile[]; isIsland: boolean }> {
		// Create a set of tiles excluding mountains
		const tileSet = new Set(tiles.map((t) => `${t.x},${t.y}`));
		const mountainSet = new Set(
			mountainRidges.flat().map((m) => `${m.x},${m.y}`)
		);

		const nonMountainTiles = tiles.filter((t) => !mountainSet.has(`${t.x},${t.y}`));

		// Find connected regions without crossing mountains
		const regions = this.findConnectedRegionsAvoidingMountains(
			nonMountainTiles,
			mountainSet
		);

		// If we got 2+ regions, split was successful
		if (regions.length >= 2) {
			// Assign mountain tiles to nearest region
			for (const ridge of mountainRidges) {
				for (const mountain of ridge) {
					// Find nearest region
					let nearestRegion = regions[0];
					let nearestDistance = Infinity;

					for (const region of regions) {
						for (const tile of region.tiles) {
							const dist = Math.abs(tile.x - mountain.x) + Math.abs(tile.y - mountain.y);
							if (dist < nearestDistance) {
								nearestDistance = dist;
								nearestRegion = region;
							}
						}
					}

					nearestRegion.tiles.push(mountain);
				}
			}

			return regions;
		}

		// Split failed, return original region
		return [{ tiles, isIsland: false }];
	}

	/**
	 * Find connected regions while avoiding mountain tiles
	 */
	private static findConnectedRegionsAvoidingMountains(
		tiles: HexTile[],
		mountainSet: Set<string>
	): Array<{ tiles: HexTile[]; isIsland: boolean }> {
		const visited = new Set<string>();
		const regions: Array<{ tiles: HexTile[]; isIsland: boolean }> = [];
		const tileMap = new Map(tiles.map((t) => [`${t.x},${t.y}`, t]));

		for (const tile of tiles) {
			const key = `${tile.x},${tile.y}`;
			if (visited.has(key)) continue;

			const region: HexTile[] = [];
			const queue: HexTile[] = [tile];
			visited.add(key);

			while (queue.length > 0) {
				const current = queue.shift()!;
				region.push(current);

				const neighbors = this.getAdjacentPositions(current.x, current.y);
				for (const { x, y } of neighbors) {
					const nKey = `${x},${y}`;
					if (
						!visited.has(nKey) &&
						!mountainSet.has(nKey) &&
						tileMap.has(nKey)
					) {
						visited.add(nKey);
						queue.push(tileMap.get(nKey)!);
					}
				}
			}

			regions.push({ tiles: region, isIsland: false });
		}

		return regions;
	}

	/**
	 * Group small islands with nearby larger continents
	 */
	private static groupIslandsWithContinents(
		regions: Array<{ tiles: HexTile[]; isIsland: boolean }>,
		hexTiles: HexTile[][]
	): Array<{ tiles: HexTile[]; isIsland: boolean }> {
		const mapSize = hexTiles.length * hexTiles[0].length;
		const ISLAND_THRESHOLD = Math.max(5, mapSize * 0.02); // 2% of map or min 5 tiles
		const MAX_ISLAND_DISTANCE = Math.min(10, Math.sqrt(mapSize) * 0.2); // 20% of map dimension

		// Separate islands from continents
		const islands: Array<{ tiles: HexTile[]; center: { x: number; y: number } }> = [];
		const continents: Array<{
			tiles: HexTile[];
			center: { x: number; y: number };
			isIsland: boolean;
		}> = [];

		for (const region of regions) {
			const size = region.tiles.length;
			let sumX = 0;
			let sumY = 0;
			for (const tile of region.tiles) {
				sumX += tile.x;
				sumY += tile.y;
			}
			const center = { x: sumX / size, y: sumY / size };

			if (size <= ISLAND_THRESHOLD) {
				islands.push({ tiles: region.tiles, center });
			} else {
				continents.push({ tiles: region.tiles, center, isIsland: false });
			}
		}

		// Assign each island to nearest continent or keep as separate
		for (const island of islands) {
			let nearestContinent = continents[0];
			let nearestDistance = Infinity;

			for (const continent of continents) {
				const dist = Math.sqrt(
					Math.pow(island.center.x - continent.center.x, 2) +
						Math.pow(island.center.y - continent.center.y, 2)
				);

				if (dist < nearestDistance) {
					nearestDistance = dist;
					nearestContinent = continent;
				}
			}

			// If close enough, merge with continent
			if (nearestContinent && nearestDistance <= MAX_ISLAND_DISTANCE) {
				nearestContinent.tiles.push(...island.tiles);
			} else {
				// Too far, keep as separate continent (island)
				continents.push({
					tiles: island.tiles,
					center: island.center,
					isIsland: true
				});
			}
		}

		return continents;
	}

	/**
	 * Get adjacent hexagonal positions
	 */
	private static getAdjacentPositions(
		x: number,
		y: number
	): Array<{ x: number; y: number }> {
		const isOddColumn = x % 2 === 1;

		const neighborOffsets = isOddColumn
			? [
					{ dx: 1, dy: 0 },
					{ dx: 0, dy: 1 },
					{ dx: -1, dy: 1 },
					{ dx: -1, dy: 0 },
					{ dx: -1, dy: -1 },
					{ dx: 0, dy: -1 }
				]
			: [
					{ dx: 1, dy: 0 },
					{ dx: 1, dy: 1 },
					{ dx: 0, dy: 1 },
					{ dx: -1, dy: 0 },
					{ dx: 0, dy: -1 },
					{ dx: 1, dy: -1 }
				];

		return neighborOffsets.map(({ dx, dy }) => ({ x: x + dx, y: y + dy }));
	}
}
