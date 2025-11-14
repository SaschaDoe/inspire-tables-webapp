import type { Planet } from '../celestial/planet';
import { WorldMap } from './worldMap';
import { HexTile } from './hexTile';
import { TerrainType } from './terrainType';
import { makeNoise2D } from 'open-simplex-noise';

export class WorldMapCreator {
	private static readonly NOISE_SCALE = 4.0;

	/**
	 * Create a world map for a planet
	 */
	static create(planet: Planet): WorldMap {
		// Skip world map generation for gas giants
		if (planet.type === 'gas giant') {
			throw new Error('Gas giants cannot have surface maps');
		}

		const worldMap = new WorldMap();

		// Determine map size based on planet size
		const { width, height } = this.getMapDimensions(planet.size);
		worldMap.width = width;
		worldMap.height = height;
		worldMap.seed = planet.seed;

		// Generate hex grid
		worldMap.hexTiles = this.generateHexGrid(planet, width, height);

		return worldMap;
	}

	/**
	 * Get map dimensions based on planet size
	 */
	private static getMapDimensions(size: string): { width: number; height: number } {
		switch (size) {
			case 'tiny':
				return { width: 20, height: 20 };
			case 'small':
				return { width: 30, height: 30 };
			case 'medium':
				return { width: 50, height: 50 };
			case 'large':
				return { width: 70, height: 70 };
			case 'gigantic':
				return { width: 100, height: 100 };
			default:
				return { width: 50, height: 50 };
		}
	}

	/**
	 * Get elevation scale based on planet size
	 * Smaller planets have more extreme terrain (higher variance)
	 */
	private static getElevationScale(size: string): number {
		switch (size) {
			case 'tiny':
				return 10; // Most extreme terrain
			case 'small':
				return 8;
			case 'medium':
				return 6;
			case 'large':
				return 4;
			case 'gigantic':
				return 3; // Smoothest terrain
			default:
				return 6;
		}
	}

	/**
	 * Get base temperature range based on planet type
	 */
	private static getBaseTemperature(planetType: string): { min: number; max: number } {
		switch (planetType) {
			case 'ice':
				return { min: 0, max: 30 };
			case 'earth-like':
				return { min: 30, max: 70 };
			case 'desert':
				return { min: 50, max: 80 };
			case 'volcanic':
				return { min: 70, max: 100 };
			default:
				return { min: 30, max: 70 };
		}
	}

	/**
	 * Get water coverage threshold based on planet type with variation
	 * Returns the elevation threshold below which terrain becomes water
	 * Uses seed for variation to create unique worlds
	 */
	private static getWaterThreshold(planetType: string, seed: number): number {
		// Base thresholds for each planet type
		let baseThreshold: number;
		let variationRange: number;

		switch (planetType) {
			case 'ice':
				baseThreshold = 0.5; // Base ~50% water
				variationRange = 0.2; // Can vary from 30-70% water
				break;
			case 'earth-like':
				baseThreshold = 0.35; // Base ~70% water
				variationRange = 0.25; // Can vary from 45-95% water (oceanic to continental)
				break;
			case 'desert':
				baseThreshold = 0.15; // Base ~15% water
				variationRange = 0.15; // Can vary from 0-30% water
				break;
			case 'volcanic':
				baseThreshold = 0.1; // Base ~10% water
				variationRange = 0.1; // Can vary from 0-20% water
				break;
			default:
				baseThreshold = 0.35;
				variationRange = 0.25;
		}

		// Use seed to generate consistent random variation
		// Simple pseudo-random based on seed
		const seedVariation = ((seed * 9301 + 49297) % 233280) / 233280; // 0-1
		const variation = (seedVariation - 0.5) * variationRange; // Center around base

		return Math.max(0, Math.min(0.8, baseThreshold + variation));
	}

	/**
	 * Generate 2D hex grid with procedural terrain
	 */
	private static generateHexGrid(planet: Planet, width: number, height: number): HexTile[][] {
		const grid: HexTile[][] = [];
		const elevationScale = this.getElevationScale(planet.size);
		const tempRange = this.getBaseTemperature(planet.type);
		const waterThreshold = this.getWaterThreshold(planet.type, planet.seed);

		// Create noise functions
		const elevationNoise = makeNoise2D(planet.seed);
		const temperatureNoise = makeNoise2D(planet.seed + 1);
		const drynessNoise = makeNoise2D(planet.seed + 2);

		for (let y = 0; y < height; y++) {
			grid[y] = [];
			for (let x = 0; x < width; x++) {
				const hexTile = new HexTile();
				hexTile.x = x;
				hexTile.y = y;
				hexTile.parentId = planet.id;

				// Calculate normalized coordinates (-1 to 1)
				const nx = (x / width) * 2 - 1;
				const ny = (y / height) * 2 - 1;

				// Calculate distance from center for island/continent generation
				const distanceFromCenter = Math.sqrt(nx * nx + ny * ny);

				// Calculate elevation with continent factor
				// Stronger falloff at edges to create oceans
				const continentFactor = Math.pow(Math.max(0, 1 - distanceFromCenter), 1.5);
				let elevation = elevationNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);
				elevation = (elevation + 1) / 2; // Normalize to 0-1

				// Apply continent factor and water threshold
				elevation = elevation * continentFactor;

				// Determine if this should be water or land based on threshold
				if (elevation < waterThreshold) {
					elevation = 0; // Water
				} else {
					// Scale remaining elevation to land heights (1 to elevationScale)
					elevation = ((elevation - waterThreshold) / (1 - waterThreshold)) * elevationScale;
					elevation = Math.floor(elevation) + 1; // +1 to avoid 0 (which is water)
				}

				// Force borders to specific elevations
				if (x === 0 || x === width - 1) {
					elevation = 0; // Water at left/right edges
				}
				if (y === 0 || y === height - 1) {
					elevation = 3; // Land at top/bottom edges (poles)
				} else if (y === 1 || y === height - 2) {
					// Random land/water near poles
					elevation = Math.random() > 0.5 ? 3 : 0;
				}

				hexTile.elevation = elevation;

				// Calculate temperature (base + noise variation)
				const tempNoise = temperatureNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);
				const tempVariation = tempNoise * 20; // ±20 variation
				const baseTemp = tempRange.min + (tempRange.max - tempRange.min) / 2;
				hexTile.temperature = Math.max(0, Math.min(100, baseTemp + tempVariation));

				// Calculate dryness (inverse of water proximity, plus noise)
				const dryNoise = drynessNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);
				const baseDryness = elevation > 0 ? 60 : 20; // Higher elevation = drier
				hexTile.dryness = Math.max(0, Math.min(100, baseDryness + dryNoise * 30));

				// Determine terrain type from elevation, temperature, and dryness
				hexTile.terrainType = this.determineTerrainType(
					elevation,
					hexTile.temperature,
					hexTile.dryness,
					planet.type
				);

				grid[y][x] = hexTile;
			}
		}

		return grid;
	}

	/**
	 * Determine terrain type based on elevation, temperature, and dryness
	 */
	private static determineTerrainType(
		elevation: number,
		temperature: number,
		dryness: number,
		planetType: string
	): TerrainType {
		// Water bodies (elevation 0-1)
		if (elevation === 0) {
			if (temperature < 10) return TerrainType.IceFloe;
			if (dryness > 80) return TerrainType.SaltLake;
			return TerrainType.Water;
		}

		// Low elevation (elevation 1-2)
		if (elevation <= 2) {
			if (temperature < 20) return TerrainType.Tundra;
			if (temperature > 70 && dryness > 60) return TerrainType.Desert;
			if (temperature > 60 && dryness < 40) return TerrainType.Jungle;
			if (dryness > 60) return TerrainType.Plains;
			return TerrainType.Grass;
		}

		// Medium elevation (elevation 3-5) - Hills
		if (elevation <= 5) {
			if (planetType === 'volcanic' && temperature > 80) return TerrainType.AshHills;
			if (temperature > 60 && dryness < 40) return TerrainType.JungleHills;
			if (dryness > 60) return TerrainType.Hills;
			return TerrainType.GrassHills;
		}

		// High elevation (elevation 6+) - Mountains
		if (temperature < 20) return TerrainType.SnowMountain;
		if (elevation >= 8) return TerrainType.HighMountain;
		if (planetType === 'volcanic' && temperature > 80) {
			return elevation > 7 ? TerrainType.Lava : TerrainType.AshPlains;
		}
		return TerrainType.Mountain;
	}
}
