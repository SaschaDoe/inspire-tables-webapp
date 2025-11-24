import type { RegionalHexTile } from '$lib/entities/location/regionalHexTile';

/**
 * River segment - represents a river flowing between two hexes
 */
interface RiverSegment {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	hexSide: number; // Which side of the hex (0-5) the river flows on
}

/**
 * RiverGenerator - Creates Civilization 5-style rivers on regional maps
 *
 * Rivers in Civ 5:
 * - Flow from high elevation (mountains, hills) to low elevation (ocean, lakes)
 * - Provide +1 gold to adjacent tiles
 * - Allow farms to be built on desert tiles
 * - Provide defensive bonuses when attacking across them
 * - Cannot be crossed without using movement points
 *
 * This generator uses a flow-based algorithm:
 * 1. Find high-elevation source points (peaks, highlands)
 * 2. For each source, trace downhill path to ocean/lake
 * 3. Mark hex edges where rivers flow
 * 4. Prevent rivers from crossing each other or making impossible flows
 *
 * Usage:
 * ```typescript
 * RiverGenerator.generateRivers(regionalHexTiles, width, height, seed);
 * ```
 */
export class RiverGenerator {
	private static readonly MIN_RIVER_LENGTH = 5; // Minimum tiles for a valid river
	private static readonly MAX_RIVERS_PER_MAP = 7; // Maximum number of river systems
	private static readonly SOURCE_ELEVATION_THRESHOLD = 6; // Minimum elevation to spawn rivers (0-10 scale)

	/**
	 * Generate rivers on a regional map
	 *
	 * @param tiles - Array of all regional hex tiles
	 * @param width - Map width
	 * @param height - Map height
	 * @param seed - Random seed for deterministic generation
	 */
	static generateRivers(
		tiles: RegionalHexTile[],
		width: number,
		height: number,
		seed: number
	): void {
		// Find potential river source points (high elevation)
		const sources = this.findRiverSources(tiles, width, height);

		// Sort by elevation (highest first)
		sources.sort((a, b) => b.elevation - a.elevation);

		// Track which hex edges already have rivers (prevent crossings)
		const occupiedEdges = new Set<string>();

		// Generate rivers from highest sources
		let riversCreated = 0;
		for (const source of sources) {
			if (riversCreated >= this.MAX_RIVERS_PER_MAP) break;

			// Try to trace a river from this source
			const riverPath = this.traceRiverPath(
				source,
				tiles,
				width,
				height,
				occupiedEdges,
				seed + riversCreated
			);

			if (riverPath && riverPath.length >= this.MIN_RIVER_LENGTH) {
				// Apply river to tiles
				this.applyRiverToTiles(riverPath, tiles, width, occupiedEdges);
				riversCreated++;
			}
		}
	}

	/**
	 * Find potential river source hexes (high elevation, not ocean)
	 */
	private static findRiverSources(
		tiles: RegionalHexTile[],
		width: number,
		height: number
	): RegionalHexTile[] {
		const sources: RegionalHexTile[] = [];

		for (const tile of tiles) {
			// Must be high elevation and not impassable
			if (tile.elevation >= this.SOURCE_ELEVATION_THRESHOLD && !tile.isImpassable) {
				// Prefer tiles that are local peaks (higher than neighbors)
				const neighbors = this.getNeighborTiles(tile.x, tile.y, tiles, width, height);
				const isLocalPeak = neighbors.every(n => n.elevation <= tile.elevation);

				if (isLocalPeak || tile.elevation >= 8) {
					sources.push(tile);
				}
			}
		}

		return sources;
	}

	/**
	 * Trace a river path from source to ocean/lake using downhill flow
	 */
	private static traceRiverPath(
		source: RegionalHexTile,
		tiles: RegionalHexTile[],
		width: number,
		height: number,
		occupiedEdges: Set<string>,
		seed: number
	): RiverSegment[] | null {
		const path: RiverSegment[] = [];
		const visited = new Set<string>();
		let current = source;
		let prevX = source.x;
		let prevY = source.y;
		let attempts = 0;
		const maxAttempts = 100; // Prevent infinite loops

		// Simple random number generator for deterministic river paths
		let rng = seed;
		const random = () => {
			rng = (rng * 9301 + 49297) % 233280;
			return rng / 233280;
		};

		while (attempts < maxAttempts) {
			attempts++;
			visited.add(`${current.x},${current.y}`);

			// Check if we've reached the end (ocean or lake)
			if (this.isRiverEndpoint(current)) {
				// Valid river path found
				return path.length >= this.MIN_RIVER_LENGTH ? path : null;
			}

			// Find downhill neighbors
			const neighbors = this.getNeighborTiles(current.x, current.y, tiles, width, height);
			const downhillNeighbors = neighbors.filter(
				n =>
					n.elevation < current.elevation &&
					!visited.has(`${n.x},${n.y}`) &&
					!n.isImpassable
			);

			if (downhillNeighbors.length === 0) {
				// Dead end - river can't continue
				return path.length >= this.MIN_RIVER_LENGTH ? path : null;
			}

			// Pick the lowest neighbor (with some randomness for variety)
			let next: RegionalHexTile;
			if (random() < 0.7) {
				// 70% of time: pick steepest downhill
				downhillNeighbors.sort((a, b) => a.elevation - b.elevation);
				next = downhillNeighbors[0];
			} else {
				// 30% of time: pick random downhill neighbor for meandering
				const randomIndex = Math.floor(random() * downhillNeighbors.length);
				next = downhillNeighbors[randomIndex];
			}

			// Determine which hex side the river flows on
			const hexSide = this.getHexSideBetween(current.x, current.y, next.x, next.y);

			// Create river segment
			const segment: RiverSegment = {
				fromX: current.x,
				fromY: current.y,
				toX: next.x,
				toY: next.y,
				hexSide
			};

			path.push(segment);

			// Move to next tile
			prevX = current.x;
			prevY = current.y;
			current = next;
		}

		// If we hit max attempts, return path if it's long enough
		return path.length >= this.MIN_RIVER_LENGTH ? path : null;
	}

	/**
	 * Check if a tile is a valid river endpoint (ocean, coast, lake)
	 */
	private static isRiverEndpoint(tile: RegionalHexTile): boolean {
		const terrainName = tile.terrainType.toString();
		return (
			terrainName.includes('Ocean') ||
			terrainName.includes('Coast') ||
			terrainName.includes('Lake')
		);
	}

	/**
	 * Apply river path to tiles by marking river sides
	 */
	private static applyRiverToTiles(
		path: RiverSegment[],
		tiles: RegionalHexTile[],
		width: number,
		occupiedEdges: Set<string>
	): void {
		for (const segment of path) {
			// Get the two tiles this river segment flows between
			const fromTile = this.getTileAt(tiles, segment.fromX, segment.fromY, width);
			const toTile = this.getTileAt(tiles, segment.toX, segment.toY, width);

			if (fromTile && toTile) {
				// Mark both tiles as having a river
				fromTile.hasRiver = true;
				toTile.hasRiver = true;

				// Add hex side to both tiles
				if (!fromTile.riverSides.includes(segment.hexSide)) {
					fromTile.riverSides.push(segment.hexSide);
				}

				// The opposite side on the neighboring hex
				const oppositeSide = (segment.hexSide + 3) % 6;
				if (!toTile.riverSides.includes(oppositeSide)) {
					toTile.riverSides.push(oppositeSide);
				}

				// Mark edge as occupied
				const edgeKey = this.getEdgeKey(segment.fromX, segment.fromY, segment.hexSide);
				occupiedEdges.add(edgeKey);

				// Recalculate yields (rivers add +1 gold)
				fromTile.calculateYields();
				toTile.calculateYields();
			}
		}
	}

	/**
	 * Get hex side (0-5) between two adjacent hexes
	 * Hex sides in axial coordinates (pointy-top hexes):
	 * 0: East, 1: Southeast, 2: Southwest, 3: West, 4: Northwest, 5: Northeast
	 */
	private static getHexSideBetween(x1: number, y1: number, x2: number, y2: number): number {
		const dx = x2 - x1;
		const dy = y2 - y1;

		// Map direction to hex side
		if (dx === 1 && dy === 0) return 0; // East
		if (dx === 0 && dy === 1) return 1; // Southeast
		if (dx === -1 && dy === 1) return 2; // Southwest
		if (dx === -1 && dy === 0) return 3; // West
		if (dx === 0 && dy === -1) return 4; // Northwest
		if (dx === 1 && dy === -1) return 5; // Northeast

		// Default fallback (should not happen with adjacent hexes)
		return 0;
	}

	/**
	 * Get unique key for a hex edge (for tracking occupied edges)
	 */
	private static getEdgeKey(x: number, y: number, side: number): string {
		return `${x},${y}:${side}`;
	}

	/**
	 * Get neighboring tiles (axial hex coordinates)
	 */
	private static getNeighborTiles(
		x: number,
		y: number,
		tiles: RegionalHexTile[],
		width: number,
		height: number
	): RegionalHexTile[] {
		const neighbors: RegionalHexTile[] = [];

		// Axial coordinate neighbors (pointy-top hexes)
		const offsets = [
			{ dx: 1, dy: 0 }, // East
			{ dx: -1, dy: 0 }, // West
			{ dx: 0, dy: 1 }, // Southeast
			{ dx: 0, dy: -1 }, // Northwest
			{ dx: 1, dy: -1 }, // Northeast
			{ dx: -1, dy: 1 } // Southwest
		];

		for (const offset of offsets) {
			const nx = x + offset.dx;
			const ny = y + offset.dy;

			if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
				const tile = this.getTileAt(tiles, nx, ny, width);
				if (tile) neighbors.push(tile);
			}
		}

		return neighbors;
	}

	/**
	 * Get tile at specific coordinates
	 */
	private static getTileAt(
		tiles: RegionalHexTile[],
		x: number,
		y: number,
		width: number
	): RegionalHexTile | undefined {
		const index = y * width + x;
		return tiles[index];
	}
}
