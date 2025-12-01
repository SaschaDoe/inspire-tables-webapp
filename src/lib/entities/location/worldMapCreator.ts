import type { Planet } from '../celestial/planet';
import { WorldMap } from './worldMap';
import { HexTile } from './hexTile';
import { TerrainType } from './terrainType';
import { makeNoise2D } from 'open-simplex-noise';
import { ContinentDetector } from '$lib/utils/continentDetector';
import { ContinentCreator } from './continentCreator';
import type { Continent } from './continent';
import { StrategicResource, LuxuryResource } from './regionalHexTile';
import {
	type RegionalHexData,
	createRegionalHexData,
	calculateRegionalYields,
	calculateRegionalDefense
} from './regionalHexData';
import {
	DetailedHexTile,
	StrategicResource as DetailedStrategicResource,
	LuxuryResource as DetailedLuxuryResource
} from './detailedHexTile';

export interface WorldMapProgress {
	phase: 'terrain' | 'regional' | 'continents' | 'entities' | 'complete';
	phaseLabel: string;
	current: number;
	total: number;
	percent: number;
}

export type ProgressCallback = (progress: WorldMapProgress) => void;

export class WorldMapCreator {
	private static readonly NOISE_SCALE = 4.0;
	private static readonly REGIONAL_GRID_SIZE = 10; // 10x10 regional hexes per planetary hex

	/**
	 * Create a world map for a planet (synchronous - may freeze UI for large maps)
	 * @deprecated Use createAsync() instead for better UI responsiveness
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
		worldMap.planetId = planet.id;
		worldMap.gridSize = this.REGIONAL_GRID_SIZE;
		worldMap.detailedWidth = width * this.REGIONAL_GRID_SIZE;
		worldMap.detailedHeight = height * this.REGIONAL_GRID_SIZE;

		// Generate hex grid
		worldMap.hexTiles = this.generateHexGrid(planet, width, height);

		// Generate regional hexes for each planetary hex (Level 2 - for seamless zoom)
		this.generateRegionalHexes(worldMap, planet);

		// Detect and tag continents
		worldMap.continents = ContinentDetector.detectContinents(worldMap.hexTiles);

		// Create Continent entities from detected continents and add to planet
		this.createContinentEntities(planet, worldMap);

		return worldMap;
	}

	/**
	 * Create a world map for a planet (async with progress updates)
	 * This version yields to the UI periodically to prevent freezing
	 */
	static async createAsync(
		planet: Planet,
		onProgress?: ProgressCallback
	): Promise<WorldMap> {
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
		worldMap.planetId = planet.id;
		worldMap.gridSize = this.REGIONAL_GRID_SIZE;
		worldMap.detailedWidth = width * this.REGIONAL_GRID_SIZE;
		worldMap.detailedHeight = height * this.REGIONAL_GRID_SIZE;

		// Phase 1: Generate hex grid (terrain)
		onProgress?.({
			phase: 'terrain',
			phaseLabel: 'Generating terrain...',
			current: 0,
			total: height,
			percent: 0
		});

		worldMap.hexTiles = await this.generateHexGridAsync(planet, width, height, onProgress);

		// Phase 2: Generate regional hexes (the slow part)
		onProgress?.({
			phase: 'regional',
			phaseLabel: 'Generating detailed tiles...',
			current: 0,
			total: width * height,
			percent: 25
		});

		await this.generateRegionalHexesAsync(worldMap, planet, onProgress);

		// Phase 3: Detect continents
		onProgress?.({
			phase: 'continents',
			phaseLabel: 'Detecting continents...',
			current: 0,
			total: 1,
			percent: 85
		});

		await this.yieldToUI();
		worldMap.continents = ContinentDetector.detectContinents(worldMap.hexTiles);

		// Phase 4: Create continent entities
		onProgress?.({
			phase: 'entities',
			phaseLabel: 'Creating entities...',
			current: 0,
			total: 1,
			percent: 95
		});

		await this.yieldToUI();
		this.createContinentEntities(planet, worldMap);

		// Complete
		onProgress?.({
			phase: 'complete',
			phaseLabel: 'Complete!',
			current: 1,
			total: 1,
			percent: 100
		});

		return worldMap;
	}

	/**
	 * Yield to UI to prevent freezing
	 */
	private static yieldToUI(): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, 0));
	}

	/**
	 * Generate hex grid async with progress updates
	 */
	private static async generateHexGridAsync(
		planet: Planet,
		width: number,
		height: number,
		onProgress?: ProgressCallback
	): Promise<HexTile[][]> {
		const grid: HexTile[][] = [];
		const elevationScale = this.getElevationScale(planet.size);
		const tempRange = this.getBaseTemperature(planet.type);
		const waterThreshold = this.getWaterThreshold(planet.type, planet.seed);

		// Create noise functions
		const elevationNoise = makeNoise2D(planet.seed);
		const temperatureNoise = makeNoise2D(planet.seed + 1);
		const drynessNoise = makeNoise2D(planet.seed + 2);
		const continentNoise = makeNoise2D(planet.seed + 3);

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

				// Calculate elevation based on planet type
				let elevation = elevationNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);
				elevation = (elevation + 1) / 2;
				elevation = this.applyContinentFactor(elevation, nx, ny, planet.type, continentNoise);

				if (elevation < waterThreshold) {
					elevation = 0;
				} else {
					elevation = ((elevation - waterThreshold) / (1 - waterThreshold)) * elevationScale;
					elevation = Math.floor(elevation) + 1;
				}

				if (x === 0 || x === width - 1) {
					if (planet.type !== 'desert' && planet.type !== 'volcanic') {
						elevation = 0;
					}
				}

				hexTile.elevation = elevation;

				const tempNoise = temperatureNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);
				const tempVariation = tempNoise * 20;
				const baseTemp = tempRange.min + (tempRange.max - tempRange.min) / 2;
				const latitudeFactor = Math.abs(ny);
				let latitudePenalty = this.getLatitudePenalty(planet.type, latitudeFactor);

				hexTile.temperature = Math.max(0, Math.min(100, baseTemp + tempVariation - latitudePenalty));

				const dryNoise = drynessNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);
				const baseDryness = this.getBaseDryness(planet.type, elevation);
				hexTile.dryness = Math.max(0, Math.min(100, baseDryness + dryNoise * 30));

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

			// Yield to UI every 10 rows
			if (y % 10 === 0) {
				onProgress?.({
					phase: 'terrain',
					phaseLabel: 'Generating terrain...',
					current: y,
					total: height,
					percent: Math.floor((y / height) * 25)
				});
				await this.yieldToUI();
			}
		}

		return grid;
	}

	/**
	 * Get latitude penalty based on planet type
	 */
	private static getLatitudePenalty(planetType: string, latitudeFactor: number): number {
		switch (planetType) {
			case 'ice':
				return latitudeFactor * 5;
			case 'desert':
			case 'volcanic':
				return latitudeFactor * 5;
			case 'jungle':
				return latitudeFactor * 8;
			case 'earth-like':
			case 'water':
				return latitudeFactor * 40;
			default:
				return latitudeFactor * 30;
		}
	}

	/**
	 * Get base dryness based on planet type and elevation
	 */
	private static getBaseDryness(planetType: string, elevation: number): number {
		switch (planetType) {
			case 'desert':
				return elevation > 0 ? 90 : 80;
			case 'ice':
				return elevation > 0 ? 75 : 60;
			case 'jungle':
			case 'water':
				return elevation > 0 ? 30 : 10;
			case 'volcanic':
				return elevation > 0 ? 70 : 50;
			default:
				return elevation > 0 ? 60 : 20;
		}
	}

	/**
	 * Generate regional hexes async with progress updates
	 */
	private static async generateRegionalHexesAsync(
		worldMap: WorldMap,
		planet: Planet,
		onProgress?: ProgressCallback
	): Promise<void> {
		const gridSize = this.REGIONAL_GRID_SIZE;

		const regionalSeed = planet.seed + 10000;
		const featureNoise = makeNoise2D(regionalSeed);
		const resourceNoise = makeNoise2D(regionalSeed + 1);
		const riverNoise = makeNoise2D(regionalSeed + 2);
		const blendNoise = makeNoise2D(regionalSeed + 3);

		worldMap.detailedHexTiles.clear();

		const totalHexes = worldMap.width * worldMap.height;
		let processedHexes = 0;

		for (let py = 0; py < worldMap.height; py++) {
			for (let px = 0; px < worldMap.width; px++) {
				const planetaryHex = worldMap.hexTiles[py][px];
				planetaryHex.regionalGridSize = gridSize;
				planetaryHex.regionalHexes = [];

				const neighbors = this.getPlanetaryNeighbors(worldMap, px, py);

				for (let ry = 0; ry < gridSize; ry++) {
					planetaryHex.regionalHexes[ry] = [];
					for (let rx = 0; rx < gridSize; rx++) {
						const regionalHex = this.createRegionalHex(
							planetaryHex,
							rx,
							ry,
							px,
							py,
							gridSize,
							featureNoise,
							resourceNoise,
							riverNoise,
							blendNoise,
							neighbors,
							planet
						);
						planetaryHex.regionalHexes[ry][rx] = regionalHex;

						const detailedTile = this.createDetailedHexTile(
							worldMap.planetId,
							planetaryHex.id,
							px,
							py,
							rx,
							ry,
							gridSize,
							regionalHex
						);
						worldMap.detailedHexTiles.set(detailedTile.getKey(), detailedTile);
					}
				}

				this.connectRiversInRegion(planetaryHex.regionalHexes, riverNoise, px, py);

				processedHexes++;

				// Yield to UI every 25 planetary hexes
				if (processedHexes % 25 === 0) {
					const percent = 25 + Math.floor((processedHexes / totalHexes) * 60);
					onProgress?.({
						phase: 'regional',
						phaseLabel: `Generating detailed tiles... (${processedHexes}/${totalHexes})`,
						current: processedHexes,
						total: totalHexes,
						percent
					});
					await this.yieldToUI();
				}
			}
		}

		// Sync rivers after all regional hexes are generated
		this.syncRiversToDetailedTiles(worldMap);
	}

	/**
	 * Create Continent entities from detected continents
	 */
	private static createContinentEntities(planet: Planet, worldMap: WorldMap): void {
		// Clear existing continents
		planet.continents = [];

		const continentCreator = new ContinentCreator();
		continentCreator.withParent(planet.id);

		for (const continentInfo of worldMap.continents) {
			const continent = continentCreator.create();

			// Override generated size with actual detected size
			if (continentInfo.size < 50) {
				continent.size = 'tiny';
			} else if (continentInfo.size < 200) {
				continent.size = 'small';
			} else if (continentInfo.size < 500) {
				continent.size = 'medium';
			} else if (continentInfo.size < 1000) {
				continent.size = 'large';
			} else {
				continent.size = 'gigantic';
			}

			// Store continent ID for navigation
			continent.id = `continent-${continentInfo.id}`;

			// Store hex tiles that belong to this continent
			continent.hexTiles = continentInfo.tiles;

			// Override description with location info
			if (continentInfo.isIsland) {
				continent.description = `${continent.name} is a ${continent.size} island with ${continent.dominantLandscape}. The climate is ${continent.climate} with ${continent.primaryWeather} weather patterns.`;
			}

			planet.continents.push(continent);

			// Store mapping from continent info ID to entity ID
			continentInfo.entityId = continent.id;
		}
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
				return { min: 60, max: 90 }; // Very hot, even at poles
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
				baseThreshold = 0.95; // Base ~95% water (waterworld) - HIGH threshold for water
				variationRange = 0.03; // Can vary from 92-98% water (tiny islands only)
				break;
			case 'ice':
				baseThreshold = 0.45; // Base ~55% frozen water
				variationRange = 0.15; // Can vary from 40-60% water (rest is ice/tundra)
				break;
			case 'earth-like':
				baseThreshold = 0.38; // Base ~65% water
				variationRange = 0.08; // Can vary from 60-72% water (Earth-like continents)
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
			case 'barren':
				baseThreshold = 0.0; // No water - completely dry
				variationRange = 0.0; // No variation - always dry
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
	 * Apply continent formation factor based on planet type
	 * Different planet types have different landmass distribution patterns
	 */
	private static applyContinentFactor(
		elevation: number,
		nx: number,
		ny: number,
		planetType: string,
		continentNoise: (x: number, y: number) => number
	): number {
		switch (planetType) {
			case 'water': {
				// Water planets: Scattered tiny islands only
				// Use pure noise without continent factor - threshold is high (0.92-0.98) so most becomes water
				// Just return raw elevation to create scattered islands where noise peaks
				return elevation;
			}

			case 'earth-like': {
				// Earth-like: Multiple distributed continents
				// Use multi-scale noise to create continent patterns
				const largeContinentNoise = continentNoise(nx * 0.8, ny * 0.8); // Large continental plates
				const mediumContinentNoise = continentNoise(nx * 2.0, ny * 2.0); // Medium features

				// Normalize to 0-1
				const largeFeatures = (largeContinentNoise + 1) / 2;
				const mediumFeatures = (mediumContinentNoise + 1) / 2;

				// Combine noise layers: base elevation + large continental structure + medium variation
				const continentPattern = elevation * 0.4 + largeFeatures * 0.4 + mediumFeatures * 0.2;

				// Only slight edge dampening to prevent harsh map borders, but allow continents near edges
				const distanceFromCenter = Math.sqrt(nx * nx + ny * ny);
				const edgeDampening = Math.max(0.7, 1 - Math.pow(distanceFromCenter, 3)); // Very gentle

				return continentPattern * edgeDampening;
			}

			case 'jungle':
			case 'desert':
			case 'ice': {
				// Land-dominant planets: Moderate continent factor
				// Less extreme than old system, allows more varied terrain
				const distanceFromCenter = Math.sqrt(nx * nx + ny * ny);
				const continentFactor = Math.pow(Math.max(0, 1 - distanceFromCenter), 1.0); // Moderate falloff
				return elevation * continentFactor;
			}

			case 'volcanic':
			case 'barren':
			default: {
				// Other planets: Original system (strong central focus)
				const distanceFromCenter = Math.sqrt(nx * nx + ny * ny);
				const continentFactor = Math.pow(Math.max(0, 1 - distanceFromCenter), 1.5);
				return elevation * continentFactor;
			}
		}
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
		const continentNoise = makeNoise2D(planet.seed + 3); // For multi-continent generation

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

				// Calculate elevation based on planet type
				let elevation = elevationNoise(nx * this.NOISE_SCALE, ny * this.NOISE_SCALE);
				elevation = (elevation + 1) / 2; // Normalize to 0-1

				// Apply planet-specific landmass distribution
				elevation = this.applyContinentFactor(elevation, nx, ny, planet.type, continentNoise);

				// Determine if this should be water or land based on threshold
				if (elevation < waterThreshold) {
					elevation = 0; // Water
				} else {
					// Scale remaining elevation to land heights (1 to elevationScale)
					elevation = ((elevation - waterThreshold) / (1 - waterThreshold)) * elevationScale;
					elevation = Math.floor(elevation) + 1; // +1 to avoid 0 (which is water)
				}

				// Force borders to water for water-rich planets only
				// Desert and volcanic planets shouldn't have forced water
				if (x === 0 || x === width - 1) {
					if (planet.type !== 'desert' && planet.type !== 'volcanic') {
						elevation = 0; // Water at left/right edges
					}
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
					case 'volcanic':
						// Extremely hot planets - almost no cooling at poles
						latitudePenalty = latitudeFactor * 5; // Tiny penalty
						break;
					case 'jungle':
						// Tropical - stays warm
						latitudePenalty = latitudeFactor * 8; // Small penalty
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
		// Water bodies (elevation 0)
		if (elevation === 0) {
			const polarThreshold = height * 0.1;
			const isPolar = y < polarThreshold || y > height - polarThreshold;
			if (temperature < 10 || isPolar) return TerrainType.IceFloe;
			if (dryness > 80) return TerrainType.SaltLake;
			return TerrainType.Water;
		}

		// PLANET-TYPE FIRST: Themed planets override temperature/dryness
		// Ice planets: Everything is frozen
		if (planetType === 'ice') {
			if (elevation <= 2) return TerrainType.Tundra;
			if (elevation <= 5) return TerrainType.Snow;
			return TerrainType.SnowMountain;
		}

		// Desert planets: Everything is desert/barren
		if (planetType === 'desert') {
			if (elevation <= 2) return TerrainType.Desert;
			if (elevation <= 5) return TerrainType.Hills;
			if (elevation >= 8) return TerrainType.HighMountain;
			return TerrainType.Mountain;
		}

		// Jungle planets: Everything is jungle/forest
		if (planetType === 'jungle') {
			if (elevation <= 2) return TerrainType.Jungle;
			if (elevation <= 5) return TerrainType.JungleHills;
			// High mountains can be grass-covered peaks
			if (elevation >= 8) return TerrainType.HighMountain;
			return TerrainType.GrassHills; // Forest-covered mountains
		}

		// Volcanic planets: Lava and ash everywhere
		if (planetType === 'volcanic') {
			if (elevation <= 2) return TerrainType.AshPlains;
			if (elevation <= 5) return TerrainType.AshHills;
			if (elevation >= 8) return TerrainType.Lava;
			return TerrainType.Mountain;
		}

		// Barren planets: Lifeless rocky desert, no water, no vegetation
		if (planetType === 'barren') {
			if (elevation <= 2) return TerrainType.Desert;
			if (elevation <= 5) return TerrainType.Hills;
			if (elevation >= 8) return TerrainType.HighMountain;
			return TerrainType.Mountain;
		}

		// Earth-like and Water planets: Use temperature/dryness for variety
		const polarThreshold = height * 0.1;
		const isPolar = y < polarThreshold || y > height - polarThreshold;

		// Apply ice caps at poles when cold enough
		if (isPolar && temperature < 15 && elevation > 0) {
			return TerrainType.Snow;
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
			if (temperature > 60 && dryness < 40) return TerrainType.JungleHills;
			if (temperature < 25) return TerrainType.Snow;
			if (dryness > 60) return TerrainType.Hills;
			return TerrainType.GrassHills;
		}

		// High elevation (elevation 6+) - Mountains
		if (temperature < 20) return TerrainType.SnowMountain;
		if (elevation >= 8) return TerrainType.HighMountain;
		return TerrainType.Mountain;
	}

	/**
	 * Generate regional hexes for all planetary hexes (Level 2 - seamless zoom)
	 * Also creates DetailedHexTile entities for simulation
	 */
	private static generateRegionalHexes(worldMap: WorldMap, planet: Planet): void {
		const gridSize = this.REGIONAL_GRID_SIZE;

		// Create noise functions for regional detail (offset from planetary to get different patterns)
		const regionalSeed = planet.seed + 10000;
		const featureNoise = makeNoise2D(regionalSeed);
		const resourceNoise = makeNoise2D(regionalSeed + 1);
		const riverNoise = makeNoise2D(regionalSeed + 2);
		const blendNoise = makeNoise2D(regionalSeed + 3); // For terrain blending at edges

		// Clear existing detailed hex tiles
		worldMap.detailedHexTiles.clear();

		for (let py = 0; py < worldMap.height; py++) {
			for (let px = 0; px < worldMap.width; px++) {
				const planetaryHex = worldMap.hexTiles[py][px];
				planetaryHex.regionalGridSize = gridSize;
				planetaryHex.regionalHexes = [];

				// Get neighboring planetary hexes for blending
				const neighbors = this.getPlanetaryNeighbors(worldMap, px, py);

				// Generate regional grid for this planetary hex
				for (let ry = 0; ry < gridSize; ry++) {
					planetaryHex.regionalHexes[ry] = [];
					for (let rx = 0; rx < gridSize; rx++) {
						const regionalHex = this.createRegionalHex(
							planetaryHex,
							rx,
							ry,
							px,
							py,
							gridSize,
							featureNoise,
							resourceNoise,
							riverNoise,
							blendNoise,
							neighbors,
							planet
						);
						planetaryHex.regionalHexes[ry][rx] = regionalHex;

						// Also create DetailedHexTile entity for simulation
						const detailedTile = this.createDetailedHexTile(
							worldMap.planetId,
							planetaryHex.id,
							px,
							py,
							rx,
							ry,
							gridSize,
							regionalHex
						);
						worldMap.detailedHexTiles.set(detailedTile.getKey(), detailedTile);
					}
				}

				// Connect rivers within the regional grid
				this.connectRiversInRegion(planetaryHex.regionalHexes, riverNoise, px, py);
			}
		}

		// Update DetailedHexTiles with connected river data
		this.syncRiversToDetailedTiles(worldMap);
	}

	/**
	 * Create a DetailedHexTile entity from RegionalHexData
	 */
	private static createDetailedHexTile(
		planetId: string,
		parentHexId: string,
		generalX: number,
		generalY: number,
		localX: number,
		localY: number,
		gridSize: number,
		regionalData: RegionalHexData
	): DetailedHexTile {
		const globalX = generalX * gridSize + localX;
		const globalY = generalY * gridSize + localY;

		const tile = new DetailedHexTile(
			planetId,
			parentHexId,
			globalX,
			globalY,
			localX,
			localY
		);

		// Copy terrain data from RegionalHexData
		tile.terrainType = regionalData.terrainType;
		tile.elevation = regionalData.elevation;
		tile.feature = regionalData.feature;
		tile.hasRiver = regionalData.hasRiver;
		tile.riverSides = [...regionalData.riverSides];

		// Map resources (need to convert between enum types)
		tile.strategicResource = this.mapStrategicResource(regionalData.strategicResource);
		tile.luxuryResource = this.mapLuxuryResource(regionalData.luxuryResource);
		tile.bonusResource = regionalData.bonusResource;

		// Copy yields
		tile.yields = {
			food: regionalData.yields.food,
			production: regionalData.yields.production,
			gold: regionalData.yields.gold,
			science: regionalData.yields.science,
			culture: regionalData.yields.culture,
			faith: 0
		};

		// Copy defense/movement
		tile.defensiveBonus = regionalData.defensiveBonus;
		tile.movementCost = regionalData.movementCost;
		tile.isImpassable = regionalData.isImpassable;
		tile.isCoastal = regionalData.isCoastal;

		return tile;
	}

	/**
	 * Map legacy StrategicResource to DetailedHexTile StrategicResource
	 */
	private static mapStrategicResource(resource: StrategicResource): DetailedStrategicResource {
		switch (resource) {
			case StrategicResource.Iron: return DetailedStrategicResource.Iron;
			case StrategicResource.Horses: return DetailedStrategicResource.Horses;
			case StrategicResource.Coal: return DetailedStrategicResource.Coal;
			case StrategicResource.Oil: return DetailedStrategicResource.Oil;
			case StrategicResource.Aluminum: return DetailedStrategicResource.Aluminum;
			case StrategicResource.Uranium: return DetailedStrategicResource.Uranium;
			default: return DetailedStrategicResource.None;
		}
	}

	/**
	 * Map legacy LuxuryResource to DetailedHexTile LuxuryResource
	 */
	private static mapLuxuryResource(resource: LuxuryResource): DetailedLuxuryResource {
		switch (resource) {
			case LuxuryResource.Gold: return DetailedLuxuryResource.Gold;
			case LuxuryResource.Silver: return DetailedLuxuryResource.Silver;
			case LuxuryResource.Gems: return DetailedLuxuryResource.Gems;
			case LuxuryResource.Marble: return DetailedLuxuryResource.Marble;
			case LuxuryResource.Ivory: return DetailedLuxuryResource.Ivory;
			case LuxuryResource.Furs: return DetailedLuxuryResource.Furs;
			case LuxuryResource.Dyes: return DetailedLuxuryResource.Dyes;
			case LuxuryResource.Spices: return DetailedLuxuryResource.Spices;
			case LuxuryResource.Silk: return DetailedLuxuryResource.Silk;
			case LuxuryResource.Sugar: return DetailedLuxuryResource.Sugar;
			case LuxuryResource.Cotton: return DetailedLuxuryResource.Cotton;
			case LuxuryResource.Wine: return DetailedLuxuryResource.Wine;
			case LuxuryResource.Incense: return DetailedLuxuryResource.Incense;
			default: return DetailedLuxuryResource.None;
		}
	}

	/**
	 * Sync river data from RegionalHexData to DetailedHexTiles after river connection
	 */
	private static syncRiversToDetailedTiles(worldMap: WorldMap): void {
		for (let py = 0; py < worldMap.height; py++) {
			for (let px = 0; px < worldMap.width; px++) {
				const planetaryHex = worldMap.hexTiles[py][px];
				if (!planetaryHex.regionalHexes) continue;

				for (let ry = 0; ry < planetaryHex.regionalHexes.length; ry++) {
					const row = planetaryHex.regionalHexes[ry];
					if (!row) continue;

					for (let rx = 0; rx < row.length; rx++) {
						const regionalHex = row[rx];
						if (!regionalHex) continue;

						const globalX = px * worldMap.gridSize + rx;
						const globalY = py * worldMap.gridSize + ry;
						const detailedTile = worldMap.getDetailedHex(globalX, globalY);

						if (detailedTile) {
							// Sync river data after connectRiversInRegion has processed
							detailedTile.hasRiver = regionalHex.hasRiver;
							detailedTile.riverSides = [...regionalHex.riverSides];
						}
					}
				}
			}
		}
	}

	/**
	 * Get neighboring planetary hexes (for terrain blending)
	 */
	private static getPlanetaryNeighbors(
		worldMap: WorldMap,
		px: number,
		py: number
	): Map<string, HexTile | null> {
		const neighbors = new Map<string, HexTile | null>();

		// Offset coordinates for hex neighbors (odd-q vertical layout)
		const isOddCol = px % 2 === 1;
		const offsets = isOddCol
			? [
					{ dir: 'NE', dx: 1, dy: 0 },
					{ dir: 'E', dx: 1, dy: 1 },
					{ dir: 'SE', dx: 0, dy: 1 },
					{ dir: 'SW', dx: -1, dy: 1 },
					{ dir: 'W', dx: -1, dy: 0 },
					{ dir: 'NW', dx: 0, dy: -1 }
			  ]
			: [
					{ dir: 'NE', dx: 1, dy: -1 },
					{ dir: 'E', dx: 1, dy: 0 },
					{ dir: 'SE', dx: 0, dy: 1 },
					{ dir: 'SW', dx: -1, dy: 0 },
					{ dir: 'W', dx: -1, dy: -1 },
					{ dir: 'NW', dx: 0, dy: -1 }
			  ];

		for (const { dir, dx, dy } of offsets) {
			const nx = px + dx;
			const ny = py + dy;
			if (nx >= 0 && nx < worldMap.width && ny >= 0 && ny < worldMap.height) {
				neighbors.set(dir, worldMap.hexTiles[ny][nx]);
			} else {
				neighbors.set(dir, null);
			}
		}

		return neighbors;
	}

	/**
	 * Create a single regional hex tile (lightweight data, not Entity)
	 */
	private static createRegionalHex(
		parentHex: HexTile,
		rx: number,
		ry: number,
		px: number,
		py: number,
		gridSize: number,
		featureNoise: (x: number, y: number) => number,
		resourceNoise: (x: number, y: number) => number,
		riverNoise: (x: number, y: number) => number,
		blendNoise: (x: number, y: number) => number,
		neighbors: Map<string, HexTile | null>,
		planet: Planet
	): RegionalHexData {
		const regional = createRegionalHexData(rx, ry);

		// Calculate global position for noise sampling
		const globalX = px * gridSize + rx;
		const globalY = py * gridSize + ry;
		const noiseScale = 0.1;

		// Determine terrain with blending at edges
		const blendedTerrain = this.getBlendedTerrain(
			parentHex,
			rx,
			ry,
			gridSize,
			neighbors,
			blendNoise,
			globalX,
			globalY
		);
		regional.terrainType = blendedTerrain.terrain;
		regional.elevation = blendedTerrain.elevation;

		// Add features based on terrain type (use blended terrain)
		const featureValue = featureNoise(globalX * noiseScale, globalY * noiseScale);
		regional.feature = this.determineFeature(regional.terrainType, featureValue, parentHex.dryness);

		// Add resources (rare)
		const resourceValue = resourceNoise(globalX * noiseScale * 2, globalY * noiseScale * 2);
		this.assignResources(regional, resourceValue, regional.terrainType, planet.type);

		// Determine river potential
		const riverValue = riverNoise(globalX * noiseScale * 0.5, globalY * noiseScale * 0.5);
		regional.hasRiver = this.shouldHaveRiver(parentHex, riverValue);

		// Calculate yields and defense
		calculateRegionalYields(regional);
		calculateRegionalDefense(regional);

		return regional;
	}

	/**
	 * Get blended terrain based on position within hex and neighboring hexes
	 * Creates natural-looking coastlines and terrain transitions
	 */
	private static getBlendedTerrain(
		parentHex: HexTile,
		rx: number,
		ry: number,
		gridSize: number,
		neighbors: Map<string, HexTile | null>,
		blendNoise: (x: number, y: number) => number,
		globalX: number,
		globalY: number
	): { terrain: TerrainType; elevation: number } {
		// Normalize position within hex (0-1)
		const normX = rx / (gridSize - 1);
		const normY = ry / (gridSize - 1);

		// Center of hex is (0.5, 0.5)
		const centerX = 0.5;
		const centerY = 0.5;

		// Calculate distance from center (0 at center, ~0.7 at corners)
		const distFromCenter = Math.sqrt(
			Math.pow(normX - centerX, 2) + Math.pow(normY - centerY, 2)
		);

		// If close to center, use parent terrain
		const blendThreshold = 0.25; // Start blending at 25% from center
		if (distFromCenter < blendThreshold) {
			return { terrain: parentHex.terrainType, elevation: parentHex.elevation };
		}

		// Find which edge/corner we're closest to and get the neighbor
		const edgeInfo = this.getClosestEdgeNeighbor(normX, normY, neighbors);
		if (!edgeInfo.neighbor) {
			return { terrain: parentHex.terrainType, elevation: parentHex.elevation };
		}

		const neighborHex = edgeInfo.neighbor;

		// Don't blend similar terrains
		if (this.areTerrainsSimilar(parentHex.terrainType, neighborHex.terrainType)) {
			return { terrain: parentHex.terrainType, elevation: parentHex.elevation };
		}

		// Calculate blend factor based on distance from center + noise
		const noiseValue = blendNoise(globalX * 0.3, globalY * 0.3); // Noise for irregular edges
		const normalizedDist = (distFromCenter - blendThreshold) / (0.7 - blendThreshold);

		// Add noise to make irregular coastlines (-0.3 to +0.3 variation)
		const noisyBlendFactor = normalizedDist + noiseValue * 0.35;

		// Determine which terrain to use based on blend factor
		// Higher blend factor = more likely to use neighbor terrain
		const blendChance = Math.max(0, Math.min(1, noisyBlendFactor));

		// Check if this is a coastline (water/land boundary)
		const isCoastline = this.isWaterTerrain(parentHex.terrainType) !== this.isWaterTerrain(neighborHex.terrainType);

		// Use noise for irregular boundaries - same approach for all terrain transitions
		const transitionNoise = blendNoise(globalX * 0.5, globalY * 0.5);
		const blendFactor = normalizedDist * 1.5 + transitionNoise * 0.5;

		if (isCoastline) {
			// For coastlines, create irregular edges with Coast as transition
			if (blendFactor > 0.5) {
				if (this.isWaterTerrain(neighborHex.terrainType) && !this.isWaterTerrain(parentHex.terrainType)) {
					// Land hex near water - might become coast or water
					if (blendFactor > 0.75) {
						return { terrain: TerrainType.Water, elevation: 0 };
					} else if (blendFactor > 0.55) {
						return { terrain: TerrainType.Coast, elevation: 1 };
					}
				} else if (!this.isWaterTerrain(neighborHex.terrainType) && this.isWaterTerrain(parentHex.terrainType)) {
					// Water hex near land - might become coast or land
					if (blendFactor > 0.75) {
						return { terrain: neighborHex.terrainType, elevation: neighborHex.elevation };
					} else if (blendFactor > 0.55) {
						return { terrain: TerrainType.Coast, elevation: 1 };
					}
				}
			}
		} else {
			// Land-to-land terrain transitions (grass/tundra, plains/desert, etc.)
			// Use the same noise-based irregular blending as coastlines
			if (blendFactor > 0.5) {
				return { terrain: neighborHex.terrainType, elevation: neighborHex.elevation };
			}
		}

		return { terrain: parentHex.terrainType, elevation: parentHex.elevation };
	}

	/**
	 * Find which neighbor hex is closest based on position within the hex
	 */
	private static getClosestEdgeNeighbor(
		normX: number,
		normY: number,
		neighbors: Map<string, HexTile | null>
	): { direction: string; neighbor: HexTile | null } {
		// Calculate angle from center to determine which edge we're closest to
		const dx = normX - 0.5;
		const dy = normY - 0.5;
		const angle = Math.atan2(dy, dx) * (180 / Math.PI);

		// Map angle to hex directions (6 directions, 60 degrees each)
		// Adjusted for our hex orientation
		let direction: string;
		if (angle >= -30 && angle < 30) {
			direction = 'E';
		} else if (angle >= 30 && angle < 90) {
			direction = 'SE';
		} else if (angle >= 90 && angle < 150) {
			direction = 'SW';
		} else if (angle >= 150 || angle < -150) {
			direction = 'W';
		} else if (angle >= -150 && angle < -90) {
			direction = 'NW';
		} else {
			direction = 'NE';
		}

		return { direction, neighbor: neighbors.get(direction) || null };
	}

	/**
	 * Check if terrain is water-based
	 */
	private static isWaterTerrain(terrain: TerrainType): boolean {
		return (
			terrain === TerrainType.Water ||
			terrain === TerrainType.Ocean ||
			terrain === TerrainType.Coast ||
			terrain === TerrainType.SaltLake ||
			terrain === TerrainType.IceFloe
		);
	}

	/**
	 * Check if two terrain types are similar (shouldn't blend)
	 */
	private static areTerrainsSimilar(t1: TerrainType, t2: TerrainType): boolean {
		// Group similar terrains - these won't have noise-based blending between them
		const waterTypes = [TerrainType.Water, TerrainType.Ocean, TerrainType.Coast, TerrainType.SaltLake];
		const grassTypes = [TerrainType.Grass, TerrainType.GrassHills];
		const jungleTypes = [TerrainType.Jungle, TerrainType.JungleHills];
		const desertTypes = [TerrainType.Desert, TerrainType.AshPlains];
		// Note: Snow and Tundra are NOT grouped together - they should blend with noise
		// IceFloe is water-like and handled separately
		const mountainTypes = [TerrainType.Mountain, TerrainType.HighMountain, TerrainType.SnowMountain];

		const groups = [waterTypes, grassTypes, jungleTypes, desertTypes, mountainTypes];

		for (const group of groups) {
			if (group.includes(t1) && group.includes(t2)) {
				return true;
			}
		}

		return t1 === t2;
	}

	/**
	 * Determine feature (forest, jungle, marsh, etc.) based on terrain and noise
	 */
	private static determineFeature(
		terrainType: TerrainType,
		noiseValue: number,
		dryness: number
	): string {
		// No features on water, mountains, or extreme terrain
		if (
			terrainType === TerrainType.Water ||
			terrainType === TerrainType.SaltLake ||
			terrainType === TerrainType.Mountain ||
			terrainType === TerrainType.HighMountain ||
			terrainType === TerrainType.SnowMountain ||
			terrainType === TerrainType.Lava ||
			terrainType === TerrainType.IceFloe
		) {
			return '';
		}

		// Normalize noise to 0-1
		const normalizedNoise = (noiseValue + 1) / 2;

		// Feature probability based on terrain
		switch (terrainType) {
			case TerrainType.Grass:
			case TerrainType.GrassHills:
				if (normalizedNoise > 0.6 && dryness < 50) return 'Forest';
				if (normalizedNoise > 0.85 && dryness < 30) return 'Marsh';
				break;
			case TerrainType.Plains:
				if (normalizedNoise > 0.7 && dryness < 45) return 'Forest';
				break;
			case TerrainType.Jungle:
			case TerrainType.JungleHills:
				if (normalizedNoise > 0.3) return 'Jungle';
				break;
			case TerrainType.Tundra:
				if (normalizedNoise > 0.75) return 'Forest';
				break;
			case TerrainType.Snow:
				if (normalizedNoise > 0.9) return 'Ice';
				break;
		}

		return '';
	}

	/**
	 * Assign resources to a regional hex
	 */
	private static assignResources(
		regional: RegionalHexData,
		noiseValue: number,
		terrainType: TerrainType,
		planetType: string
	): void {
		// Normalize noise to 0-1
		const normalizedNoise = (noiseValue + 1) / 2;

		// Resources are rare - only spawn above high threshold
		if (normalizedNoise < 0.85) return;

		// Strategic resources based on terrain
		if (normalizedNoise > 0.95) {
			switch (terrainType) {
				case TerrainType.Hills:
				case TerrainType.GrassHills:
					regional.strategicResource = StrategicResource.Iron;
					break;
				case TerrainType.Plains:
				case TerrainType.Grass:
					regional.strategicResource = StrategicResource.Horses;
					break;
				case TerrainType.Desert:
					regional.strategicResource = StrategicResource.Oil;
					break;
				case TerrainType.Mountain:
					regional.strategicResource = StrategicResource.Aluminum;
					break;
				case TerrainType.Tundra:
					regional.strategicResource = StrategicResource.Uranium;
					break;
			}
		}
		// Luxury resources
		else if (normalizedNoise > 0.88) {
			const luxuryOptions = this.getLuxuryOptionsForTerrain(terrainType);
			if (luxuryOptions.length > 0) {
				const index = Math.floor(normalizedNoise * 100) % luxuryOptions.length;
				regional.luxuryResource = luxuryOptions[index];
			}
		}
		// Bonus resources
		else if (normalizedNoise > 0.85) {
			regional.bonusResource = this.getBonusResourceForTerrain(terrainType);
		}
	}

	/**
	 * Get luxury resource options for terrain type
	 */
	private static getLuxuryOptionsForTerrain(terrainType: TerrainType): LuxuryResource[] {
		switch (terrainType) {
			case TerrainType.Grass:
			case TerrainType.Plains:
				return [LuxuryResource.Cotton, LuxuryResource.Wine, LuxuryResource.Dyes];
			case TerrainType.Desert:
				return [LuxuryResource.Incense, LuxuryResource.Gold];
			case TerrainType.Jungle:
				return [LuxuryResource.Gems, LuxuryResource.Spices, LuxuryResource.Dyes];
			case TerrainType.Tundra:
				return [LuxuryResource.Furs, LuxuryResource.Silver];
			case TerrainType.Hills:
			case TerrainType.GrassHills:
				return [LuxuryResource.Gold, LuxuryResource.Silver, LuxuryResource.Gems];
			case TerrainType.Water:
				return [LuxuryResource.Pearls];
			default:
				return [];
		}
	}

	/**
	 * Get bonus resource for terrain type
	 */
	private static getBonusResourceForTerrain(terrainType: TerrainType): string {
		switch (terrainType) {
			case TerrainType.Grass:
				return 'Cattle';
			case TerrainType.Plains:
				return 'Wheat';
			case TerrainType.Tundra:
				return 'Deer';
			case TerrainType.Desert:
				return 'Oasis';
			case TerrainType.Water:
				return 'Fish';
			case TerrainType.Jungle:
				return 'Bananas';
			default:
				return '';
		}
	}

	/**
	 * Determine if a regional hex should have a river
	 */
	private static shouldHaveRiver(parentHex: HexTile, riverNoise: number): boolean {
		// No rivers in water or extreme terrain
		if (
			parentHex.elevation === 0 ||
			parentHex.terrainType === TerrainType.Desert ||
			parentHex.terrainType === TerrainType.Snow ||
			parentHex.terrainType === TerrainType.Lava
		) {
			return false;
		}

		// Rivers more common in wet areas
		const riverThreshold = parentHex.dryness > 50 ? 0.85 : 0.7;
		return riverNoise > riverThreshold;
	}

	/**
	 * Connect rivers within a regional grid to form coherent river systems
	 */
	private static connectRiversInRegion(
		regionalHexes: RegionalHexData[][],
		riverNoise: (x: number, y: number) => number,
		px: number,
		py: number
	): void {
		const gridSize = regionalHexes.length;
		if (gridSize === 0) return;

		// Find hexes with rivers and connect them
		for (let ry = 0; ry < gridSize; ry++) {
			for (let rx = 0; rx < gridSize; rx++) {
				const hex = regionalHexes[ry][rx];
				if (!hex.hasRiver) continue;

				// Determine which sides have river based on neighbors
				hex.riverSides = [];

				// Check each of the 6 hex neighbors
				const neighbors = this.getRegionalNeighbors(rx, ry, gridSize);
				for (let side = 0; side < 6; side++) {
					const neighbor = neighbors[side];
					if (neighbor) {
						const neighborHex = regionalHexes[neighbor.y]?.[neighbor.x];
						if (neighborHex?.hasRiver) {
							// River flows between these two hexes
							hex.riverSides.push(side);
						}
					}
				}

				// If no connections found, this hex shouldn't have a visible river
				// (isolated river points look like artifacts)
				if (hex.riverSides.length === 0) {
					hex.hasRiver = false;
				}
			}
		}
	}

	/**
	 * Get neighbors of a regional hex (within the 5x5 grid)
	 */
	private static getRegionalNeighbors(
		rx: number,
		ry: number,
		gridSize: number
	): ({ x: number; y: number } | null)[] {
		// Hex neighbor offsets (even/odd column offset layout)
		const isOddCol = rx % 2 === 1;
		const offsets = isOddCol
			? [
					{ x: 1, y: 0 }, // NE
					{ x: 1, y: 1 }, // SE
					{ x: 0, y: 1 }, // S
					{ x: -1, y: 1 }, // SW
					{ x: -1, y: 0 }, // NW
					{ x: 0, y: -1 } // N
				]
			: [
					{ x: 1, y: -1 }, // NE
					{ x: 1, y: 0 }, // SE
					{ x: 0, y: 1 }, // S
					{ x: -1, y: 0 }, // SW
					{ x: -1, y: -1 }, // NW
					{ x: 0, y: -1 } // N
				];

		return offsets.map((offset) => {
			const nx = rx + offset.x;
			const ny = ry + offset.y;
			if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
				return { x: nx, y: ny };
			}
			return null;
		});
	}
}
