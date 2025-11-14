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
			case 'water':
			case 'earth-like':
				return { min: 30, max: 70 };
			case 'jungle':
				return { min: 60, max: 85 }; // Hot and humid
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
			case 'water':
				baseThreshold = 0.08; // Base ~95% water (waterworld)
				variationRange = 0.05; // Can vary from 92-98% water (tiny islands only)
				break;
			case 'ice':
				baseThreshold = 0.45; // Base ~55% frozen water
				variationRange = 0.15; // Can vary from 40-60% water (rest is ice/tundra)
				break;
			case 'earth-like':
				baseThreshold = 0.35; // Base ~70% water
				variationRange = 0.12; // Can vary from 60-80% water (more realistic range)
				break;
			case 'jungle':
				baseThreshold = 0.42; // Base ~60% land (rivers/lakes but mostly land)
				variationRange = 0.14; // Can vary from 55-65% land
				break;
			case 'desert':
				baseThreshold = 0.08; // Base ~5% water (very dry)
				variationRange = 0.08; // Can vary from 0-15% water
				break;
			case 'volcanic':
				baseThreshold = 0.12; // Base ~10% lava/water
				variationRange = 0.12; // Can vary from 0-25% liquid
				break;
			default:
				baseThreshold = 0.35;
				variationRange = 0.12;
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

				hexTile.elevation = elevation;

				// Calculate temperature (base + noise variation + latitude)
				const tempNoise = temperatureNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);
				const tempVariation = tempNoise * 20; // ±20 variation
				const baseTemp = tempRange.min + (tempRange.max - tempRange.min) / 2;

				// Apply latitude effect (colder at poles) - varies by planet type
				const latitudeFactor = Math.abs(ny); // 0 at equator, 1 at poles
				let latitudePenalty = 0;

				switch (planet.type) {
					case 'ice':
						// Ice planets are cold everywhere, slight variation
						latitudePenalty = latitudeFactor * 5; // Minimal effect, already cold
						break;
					case 'desert':
					case 'jungle':
					case 'volcanic':
						// Hot planets stay hot, minimal pole cooling
						latitudePenalty = latitudeFactor * 10; // Small penalty
						break;
					case 'earth-like':
					case 'water':
						// Realistic latitude gradient
						latitudePenalty = latitudeFactor * 40; // Strong gradient
						break;
					default:
						latitudePenalty = latitudeFactor * 30; // Moderate gradient
				}

				hexTile.temperature = Math.max(0, Math.min(100, baseTemp + tempVariation - latitudePenalty));

				// Calculate dryness (inverse of water proximity, plus noise)
				const dryNoise = drynessNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);

				// Base dryness varies by planet type
				let baseDryness: number;
				switch (planet.type) {
					case 'desert':
						baseDryness = elevation > 0 ? 90 : 80; // Very dry everywhere
						break;
					case 'ice':
						baseDryness = elevation > 0 ? 75 : 60; // Dry (frozen water)
						break;
					case 'jungle':
					case 'water':
						baseDryness = elevation > 0 ? 30 : 10; // Very humid/wet
						break;
					case 'volcanic':
						baseDryness = elevation > 0 ? 70 : 50; // Dry with steam
						break;
					default: // earth-like, etc
						baseDryness = elevation > 0 ? 60 : 20; // Moderate
				}

				hexTile.dryness = Math.max(0, Math.min(100, baseDryness + dryNoise * 30));

				// Determine terrain type from elevation, temperature, and dryness
				hexTile.terrainType = this.determineTerrainType(
					elevation,
					hexTile.temperature,
					hexTile.dryness,
					planet.type,
					y,
					height
				);

				grid[y][x] = hexTile;
			}
		}

		return grid;
	}

	/**
	 * Determine terrain type based on elevation, temperature, dryness, and position
	 */
	private static determineTerrainType(
		elevation: number,
		temperature: number,
		dryness: number,
		planetType: string,
		y: number,
		height: number
	): TerrainType {
		// Polar regions (top and bottom 10% of map)
		const polarThreshold = height * 0.1;
		const isPolar = y < polarThreshold || y > height - polarThreshold;

		// Apply ice caps at poles when cold enough
		if (isPolar && temperature < 15 && elevation > 0) {
			return TerrainType.Snow;
		}

		// Water bodies (elevation 0)
		if (elevation === 0) {
			if (temperature < 10 || isPolar) return TerrainType.IceFloe;
			if (dryness > 80) return TerrainType.SaltLake;
			return TerrainType.Water;
		}

		// Planet-specific biases
		const isJunglePlanet = planetType === 'jungle';
		const isDesertPlanet = planetType === 'desert';
		const isIcePlanet = planetType === 'ice';

		// Low elevation (elevation 1-2)
		if (elevation <= 2) {
			if (temperature < 20 || isIcePlanet) return TerrainType.Tundra;
			if (isDesertPlanet || (temperature > 70 && dryness > 60)) return TerrainType.Desert;
			if (isJunglePlanet || (temperature > 60 && dryness < 40)) return TerrainType.Jungle;
			if (dryness > 60) return TerrainType.Plains;
			return TerrainType.Grass;
		}

		// Medium elevation (elevation 3-5) - Hills
		if (elevation <= 5) {
			if (planetType === 'volcanic' && temperature > 80) return TerrainType.AshHills;
			if (isJunglePlanet || (temperature > 60 && dryness < 40)) return TerrainType.JungleHills;
			if (temperature < 25 || isIcePlanet) return TerrainType.Snow;
			if (dryness > 60 || isDesertPlanet) return TerrainType.Hills;
			return TerrainType.GrassHills;
		}

		// High elevation (elevation 6+) - Mountains
		if (temperature < 20 || isIcePlanet) return TerrainType.SnowMountain;
		if (elevation >= 8) return TerrainType.HighMountain;
		if (planetType === 'volcanic' && temperature > 80) {
			return elevation > 7 ? TerrainType.Lava : TerrainType.AshPlains;
		}
		return TerrainType.Mountain;
	}
}
