import type { PlanetaryHexTile } from '$lib/entities/location/planetaryHexTile';
import type { Planet } from '$lib/entities/celestial/planet';
import type { Continent } from '$lib/entities/location/continent';
import { RegionalMapCreator } from '$lib/entities/location/regionalMapCreator';
import { entityStore } from '$lib/stores/entityStore';

/**
 * PlanetWorkflow - Handles the three-level hex system workflow
 *
 * Level 1: Planet (worldMap with HexTile[])
 * Level 2: PlanetaryHexTile (continental scale, 500-1000km)
 * Level 3: RegionalMap (simulation scale, 10-50km with RegionalHexTile[])
 *
 * This utility provides functions to:
 * - Expand a PlanetaryHexTile into a detailed RegionalMap
 * - Link RegionalMaps to their parent entities
 * - Navigate between hierarchy levels
 */
export class PlanetWorkflow {
	/**
	 * Expand a planetary hex tile into a detailed regional map
	 *
	 * @param planetaryHex - The planetary hex tile to expand
	 * @param planet - The parent planet entity
	 * @param continent - Optional parent continent entity
	 * @param planetType - Type of planet (earth-like, desert, ice, etc.)
	 * @param width - Regional map width in hexes (default: 50)
	 * @param height - Regional map height in hexes (default: 50)
	 * @returns The generated RegionalMap entity
	 */
	static expandPlanetaryHexToRegionalMap(
		planetaryHex: PlanetaryHexTile,
		planet: Planet,
		continent: Continent | null,
		planetType: 'earth-like' | 'desert' | 'ice' | 'volcanic' | 'jungle' | 'water' | 'barren' = 'earth-like',
		width: number = 50,
		height: number = 50
	): string {
		// Check if already expanded
		if (planetaryHex.hasRegionalMap && planetaryHex.regionalMapId) {
			console.log(`Planetary hex (${planetaryHex.x}, ${planetaryHex.y}) already has a regional map: ${planetaryHex.regionalMapId}`);
			return planetaryHex.regionalMapId;
		}

		// Generate seed from planetary hex coordinates for consistent generation
		const seed = planet.seed + planetaryHex.x * 1000 + planetaryHex.y;

		// Create the regional map using RegionalMapCreator
		const { regionalMap, hexTiles } = RegionalMapCreator.create(
			planetaryHex,
			planetType,
			seed,
			width,
			height
		);

		// Set parent continent reference if provided
		if (continent) {
			regionalMap.parentContinentId = continent.id;
		}

		// Save the regional map entity
		entityStore.addEntity(regionalMap);

		// Save all regional hex tiles
		hexTiles.forEach(tile => {
			entityStore.addEntity(tile);
		});

		// Update planetary hex with regional map reference
		planetaryHex.hasRegionalMap = true;
		planetaryHex.regionalMapId = regionalMap.id;
		entityStore.updateEntity(planetaryHex.id, planetaryHex);

		// Update continent with regional map reference
		if (continent && !continent.regionalMapIds.includes(regionalMap.id)) {
			continent.regionalMapIds.push(regionalMap.id);
			entityStore.updateEntity(continent.id, continent);
		}

		// Update planet entity (save changes)
		entityStore.updateEntity(planet.id, planet);

		console.log(`Created regional map ${regionalMap.id} for planetary hex (${planetaryHex.x}, ${planetaryHex.y})`);
		console.log(`- Map size: ${width}x${height} (${regionalMap.hexTileIds.length} hexes)`);
		console.log(`- Planet type: ${planetType}`);

		return regionalMap.id;
	}

	/**
	 * Get all regional maps for a continent
	 */
	static getContinentRegionalMaps(continent: Continent): any[] {
		return continent.regionalMapIds
			.map(id => entityStore.getEntity(id))
			.filter(map => map !== null);
	}

	/**
	 * Get the regional map for a planetary hex tile (if it exists)
	 */
	static getPlanetaryHexRegionalMap(planetaryHex: PlanetaryHexTile): any | null {
		if (!planetaryHex.hasRegionalMap || !planetaryHex.regionalMapId) {
			return null;
		}
		return entityStore.getEntity(planetaryHex.regionalMapId);
	}

	/**
	 * Check if a planetary hex can be expanded
	 */
	static canExpandPlanetaryHex(planetaryHex: PlanetaryHexTile): boolean {
		// Can't expand if already has a regional map
		if (planetaryHex.hasRegionalMap && planetaryHex.regionalMapId) {
			return false;
		}

		// Can't expand water tiles (ocean/coast)
		// Actually, water tiles CAN be expanded for naval civilizations
		// So let's allow all tiles to be expanded
		return true;
	}

	/**
	 * Get planet type from planetary hex characteristics
	 * This is a simple heuristic based on terrain and climate
	 */
	static inferPlanetTypeFromHex(planetaryHex: PlanetaryHexTile): 'earth-like' | 'desert' | 'ice' | 'volcanic' | 'jungle' | 'water' | 'barren' {
		const temp = planetaryHex.temperature;
		const dry = planetaryHex.dryness;

		// Very cold
		if (temp < 20) return 'ice';

		// Very hot and dry
		if (temp > 75 && dry > 70) return 'desert';

		// Hot and wet
		if (temp > 70 && dry < 30) return 'jungle';

		// Very wet
		if (dry < 20) return 'water';

		// Volcanic indicators (high elevation, extreme temperature)
		if (planetaryHex.elevation > 7 && temp > 60) return 'volcanic';

		// Default to earth-like
		return 'earth-like';
	}
}
