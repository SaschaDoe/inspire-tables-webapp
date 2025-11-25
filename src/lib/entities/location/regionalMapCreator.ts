import type { PlanetaryHexTile } from './planetaryHexTile';
import { RegionalMap } from './regionalMap';
import { RegionalHexTile } from './regionalHexTile';
import { TerrainType } from './terrainType';
import { makeNoise2D } from 'open-simplex-noise';
import { RiverGenerator } from '$lib/utils/riverGenerator';
import { ResourcePlacer } from '$lib/utils/resourcePlacer';

/**
 * RegionalMapCreator - Generates detailed regional hex maps from planetary hexes
 *
 * This class bridges the planetary level (PlanetaryHexTile) to the regional simulation level (RegionalHexTile).
 * It creates Civilization 5-style terrain with rivers, resources, and features while respecting the
 * planetary theme (desert planets are mostly desert, ice planets are mostly snow/tundra, etc.).
 *
 * Key features:
 * - Generates 50x50 regional hex grids (2,500 hexes per map)
 * - Inherits climate and terrain from parent planetary hex
 * - Uses multi-octave simplex noise for natural-looking terrain variation
 * - Respects planetary constraints (ice planets won't have jungles, desert planets won't have snow)
 * - Produces Civ 5-compliant terrain types, yields, and movement costs
 *
 * Usage:
 * ```typescript
 * const regionalMap = RegionalMapCreator.create(planetaryHex, planetType, seed);
 * ```
 */
export class RegionalMapCreator {
	// Map generation constants
	private static readonly DEFAULT_WIDTH = 50;
	private static readonly DEFAULT_HEIGHT = 50;
	private static readonly NOISE_SCALE = 0.08; // Controls terrain feature size (lower = larger features)
	private static readonly ELEVATION_SCALE = 0.12; // Controls mountain/hill distribution
	private static readonly MOISTURE_SCALE = 0.06; // Controls wet/dry areas

	/**
	 * Create a regional map from a planetary hex tile
	 *
	 * @param planetaryHex - The parent planetary hex tile
	 * @param planetType - Type of planet (earth-like, desert, ice, jungle, etc.)
	 * @param seed - Random seed for consistent generation
	 * @param width - Map width in hexes (default: 50)
	 * @param height - Map height in hexes (default: 50)
	 * @returns Object with regionalMap and hexTiles array
	 */
	static create(
		planetaryHex: PlanetaryHexTile,
		planetType: 'earth-like' | 'desert' | 'ice' | 'volcanic' | 'jungle' | 'water' | 'barren',
		seed: number,
		width: number = this.DEFAULT_WIDTH,
		height: number = this.DEFAULT_HEIGHT
	): { regionalMap: RegionalMap; hexTiles: RegionalHexTile[] } {
		const regionalMap = new RegionalMap();
		regionalMap.width = width;
		regionalMap.height = height;
		regionalMap.parentPlanetaryHexId = planetaryHex.id;
		regionalMap.parentPlanetId = planetaryHex.parentPlanetId;
		regionalMap.name = `Regional Map at (${planetaryHex.x}, ${planetaryHex.y})`;

		// Initialize noise generators with seed
		const elevationNoise = makeNoise2D(seed);
		const moistureNoise = makeNoise2D(seed + 1000);
		const temperatureNoise = makeNoise2D(seed + 2000);
		const variationNoise = makeNoise2D(seed + 3000); // For micro-variations

		// Generate all regional hex tiles
		const hexTiles: RegionalHexTile[] = [];

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const tile = this.generateRegionalHex(
					x,
					y,
					planetaryHex,
					planetType,
					elevationNoise,
					moistureNoise,
					temperatureNoise,
					variationNoise
				);

				tile.parentRegionalMapId = regionalMap.id;
				tile.parentPlanetaryHexId = planetaryHex.id;

				hexTiles.push(tile);
				regionalMap.hexTileIds.push(tile.id);
			}
		}

		// Post-processing: Mark coastal tiles
		this.markCoastalTiles(hexTiles, width, height);

		// Generate rivers (must be before resources so rivers affect placement)
		RiverGenerator.generateRivers(hexTiles, width, height, seed + 5000);

		// Place resources (strategic, luxury, bonus)
		ResourcePlacer.placeResources(hexTiles, width, height, planetType, seed + 6000);

		// Calculate final yields for all tiles (after rivers and resources)
		hexTiles.forEach(tile => {
			tile.calculateYields();
			tile.calculateDefenseAndMovement();
		});

		return { regionalMap, hexTiles };
	}

	/**
	 * Generate a single regional hex tile
	 */
	private static generateRegionalHex(
		x: number,
		y: number,
		planetaryHex: PlanetaryHexTile,
		planetType: string,
		elevationNoise: (x: number, y: number) => number,
		moistureNoise: (x: number, y: number) => number,
		temperatureNoise: (x: number, y: number) => number,
		variationNoise: (x: number, y: number) => number
	): RegionalHexTile {
		const tile = new RegionalHexTile();
		tile.x = x;
		tile.y = y;
		tile.name = `Regional Hex (${x}, ${y})`;

		// Sample noise values (multi-octave for natural variation)
		const elevation = this.sampleMultiOctaveNoise(elevationNoise, x, y, this.ELEVATION_SCALE, 3);
		const moisture = this.sampleMultiOctaveNoise(moistureNoise, x, y, this.MOISTURE_SCALE, 2);
		const temperature = this.sampleMultiOctaveNoise(temperatureNoise, x, y, this.NOISE_SCALE, 2);
		const variation = variationNoise(x * this.NOISE_SCALE, y * this.NOISE_SCALE);

		// Inherit base values from planetary hex and add local variation
		const localElevation = this.blendValues(planetaryHex.elevation / 10, elevation, 0.6); // 60% planetary, 40% local
		const localMoisture = this.blendValues((100 - planetaryHex.dryness) / 100, moisture, 0.5);
		const localTemperature = this.blendValues(planetaryHex.temperature / 100, temperature, 0.5);

		// Store elevation for later use (river generation, etc.)
		tile.elevation = Math.floor(localElevation * 10);

		// Determine terrain type based on planetary theme and local conditions
		tile.terrainType = this.determineTerrainType(
			localElevation,
			localMoisture,
			localTemperature,
			planetType,
			variation
		);

		// Add features based on terrain and planet type
		tile.feature = this.determineFeature(
			tile.terrainType,
			localMoisture,
			localTemperature,
			planetType,
			variation
		);

		return tile;
	}

	/**
	 * Determine terrain type based on planetary theme and local noise values
	 * This is where we enforce planetary constraints while adding Civ 5 variety
	 */
	private static determineTerrainType(
		elevation: number,
		moisture: number,
		temperature: number,
		planetType: string,
		variation: number
	): TerrainType {
		// Mountains at very high elevation (universal across planet types)
		if (elevation > 0.85) {
			return TerrainType.Mountain;
		}

		// Planet type determines base terrain distribution
		switch (planetType) {
			case 'ice':
				// Ice planets: Mostly Snow and Tundra
				if (elevation > 0.7) return TerrainType.Mountain;
				if (temperature > 0.3) return TerrainType.Tundra;
				if (elevation < 0.2) return TerrainType.Ocean; // Frozen seas
				return TerrainType.Snow;

			case 'desert':
				// Desert planets: Mostly Desert with some Plains
				if (elevation > 0.7) return TerrainType.Mountain;
				if (elevation < 0.25) {
					// Low areas might have some moisture
					return moisture > 0.6 ? TerrainType.Plains : TerrainType.Desert;
				}
				if (moisture > 0.7) return TerrainType.Plains;
				return TerrainType.Desert;

			case 'water':
				// Water planets: Mostly Ocean with small islands
				if (elevation > 0.7) return TerrainType.Mountain; // Rare mountain islands
				if (elevation > 0.55) return TerrainType.Hills;
				if (elevation > 0.45) return TerrainType.Grass; // Small islands
				if (elevation > 0.35) return TerrainType.Coast;
				return TerrainType.Ocean;

			case 'jungle':
				// Jungle planets: Warm, wet, lots of Grass (jungles added as features)
				if (elevation > 0.7) return TerrainType.Mountain;
				if (elevation > 0.6) return TerrainType.Hills;
				if (elevation < 0.2) return TerrainType.Ocean;
				if (elevation < 0.3) return TerrainType.Coast;
				if (moisture < 0.3) return TerrainType.Plains; // Rare dry areas
				return TerrainType.Grass;

			case 'volcanic':
				// Volcanic planets: Mountains, Hills, Lava, high production
				if (elevation > 0.65) return TerrainType.Mountain;
				if (elevation > 0.5) return TerrainType.Hills;
				if (temperature > 0.7 && variation > 0) return TerrainType.Lava;
				if (elevation < 0.2) return TerrainType.Ocean;
				return variation > 0 ? TerrainType.AshPlains : TerrainType.Desert;

			case 'barren':
				// Barren planets: Desert, Snow, minimal life
				if (elevation > 0.7) return TerrainType.Mountain;
				if (temperature < 0.3) return TerrainType.Snow;
				if (temperature < 0.5) return TerrainType.Tundra;
				if (elevation < 0.15) return TerrainType.SaltLake; // Dead seas
				return TerrainType.Desert;

			case 'earth-like':
			default:
				// Earth-like: Full variety based on temperature, moisture, elevation
				// This is the most complex case with realistic terrain distribution

				// Water bodies
				if (elevation < 0.3) return TerrainType.Ocean;
				if (elevation < 0.38) return TerrainType.Coast;

				// High elevation
				if (elevation > 0.7) return TerrainType.Mountain;
				if (elevation > 0.58) return TerrainType.Hills;

				// Temperature zones
				if (temperature < 0.25) {
					// Cold zones
					if (elevation < 0.3) return TerrainType.Ocean;
					return moisture > 0.5 ? TerrainType.Tundra : TerrainType.Snow;
				} else if (temperature > 0.75) {
					// Hot zones
					if (moisture < 0.4) return TerrainType.Desert;
					if (moisture > 0.7) return TerrainType.Grass; // Tropical
					return TerrainType.Plains;
				} else {
					// Temperate zones
					if (moisture < 0.3) return TerrainType.Plains;
					if (moisture < 0.6) return TerrainType.Plains;
					return TerrainType.Grass;
				}
		}
	}

	/**
	 * Determine natural features (Forest, Jungle, Marsh, Ice, etc.)
	 */
	private static determineFeature(
		terrainType: TerrainType,
		moisture: number,
		temperature: number,
		planetType: string,
		variation: number
	): string {
		// Features can only appear on certain terrain types
		const canHaveForest =
			terrainType === TerrainType.Grass ||
			terrainType === TerrainType.Plains ||
			terrainType === TerrainType.Tundra;

		const canHaveJungle = terrainType === TerrainType.Grass;

		const canHaveMarsh =
			terrainType === TerrainType.Grass || terrainType === TerrainType.Plains;

		const canHaveIce =
			terrainType === TerrainType.Ocean ||
			terrainType === TerrainType.Coast ||
			terrainType === TerrainType.Tundra;

		// Planet-specific feature distribution
		switch (planetType) {
			case 'ice':
				// Ice planets: Ice features on cold terrain
				if (canHaveIce && variation > -0.3) return 'Ice';
				if (canHaveForest && temperature > 0.3 && moisture > 0.5) return 'Forest'; // Rare
				return '';

			case 'desert':
				// Desert planets: Minimal features, occasional oasis
				if (terrainType === TerrainType.Plains && moisture > 0.7) return 'Oasis';
				return '';

			case 'jungle':
				// Jungle planets: Dense jungles
				if (canHaveJungle && variation > -0.4) return 'Jungle'; // 70% of grassland
				if (canHaveForest && moisture > 0.4) return 'Forest';
				if (canHaveMarsh && moisture > 0.8) return 'Marsh';
				return '';

			case 'volcanic':
				// Volcanic planets: Minimal vegetation
				return '';

			case 'water':
				// Water planets: Ice on cold ocean
				if (canHaveIce && temperature < 0.4) return 'Ice';
				if (canHaveForest && variation > 0.5) return 'Forest'; // Rare island forests
				return '';

			case 'barren':
				// Barren planets: No features
				return '';

			case 'earth-like':
			default:
				// Earth-like: Natural feature distribution

				// Jungles in hot, wet areas
				if (canHaveJungle && temperature > 0.7 && moisture > 0.65 && variation > -0.2) {
					return 'Jungle';
				}

				// Forests in temperate/cold areas with decent moisture
				if (canHaveForest && moisture > 0.5 && variation > 0) {
					if (temperature < 0.5 || moisture > 0.7) {
						return 'Forest';
					}
				}

				// Marshes in very wet lowlands
				if (canHaveMarsh && moisture > 0.8 && variation > 0.3) {
					return 'Marsh';
				}

				// Ice in cold water
				if (canHaveIce && temperature < 0.3) {
					return 'Ice';
				}

				return '';
		}
	}

	/**
	 * Sample multi-octave noise for more natural variation
	 * Uses multiple noise frequencies combined for richer terrain
	 */
	private static sampleMultiOctaveNoise(
		noiseFn: (x: number, y: number) => number,
		x: number,
		y: number,
		scale: number,
		octaves: number
	): number {
		let value = 0;
		let amplitude = 1;
		let frequency = 1;
		let maxValue = 0;

		for (let i = 0; i < octaves; i++) {
			value += noiseFn(x * scale * frequency, y * scale * frequency) * amplitude;
			maxValue += amplitude;
			amplitude *= 0.5; // Each octave has half the amplitude
			frequency *= 2; // Each octave has double the frequency
		}

		// Normalize to 0-1 range
		return (value / maxValue + 1) / 2;
	}

	/**
	 * Blend two values with a weight (0-1, higher = more weight on local value)
	 */
	private static blendValues(global: number, local: number, localWeight: number): number {
		return global * (1 - localWeight) + local * localWeight;
	}

	/**
	 * Mark tiles adjacent to water as coastal
	 */
	private static markCoastalTiles(tiles: RegionalHexTile[], width: number, height: number): void {
		for (const tile of tiles) {
			// Skip water tiles
			if (tile.terrainType === TerrainType.Ocean || tile.terrainType === TerrainType.Coast) {
				continue;
			}

			// Check neighbors for water
			const neighbors = this.getNeighborTiles(tile.x, tile.y, tiles, width, height);
			const hasWaterNeighbor = neighbors.some(
				n => n.terrainType === TerrainType.Ocean || n.terrainType === TerrainType.Coast
			);

			if (hasWaterNeighbor) {
				tile.isCoastal = true;
			}
		}
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

			// Check bounds
			if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
				const index = ny * width + nx;
				if (index >= 0 && index < tiles.length) {
					neighbors.push(tiles[index]);
				}
			}
		}

		return neighbors;
	}

	/**
	 * Get tile at specific coordinates
	 */
	static getTileAt(
		tiles: RegionalHexTile[],
		x: number,
		y: number,
		width: number
	): RegionalHexTile | undefined {
		const index = y * width + x;
		return tiles[index];
	}
}
