import { Entity } from '../base/entity';
import { TerrainType } from './terrainType';

/**
 * PlanetaryHexTile - Large-scale continental hex tiles
 * Used for the top-level planetary hex map (1 hex ≈ 500-1000km)
 *
 * This is the first level of the two-level hierarchical hex map system.
 * Each planetary hex can contain a RegionalMap with detailed simulation hexes.
 */
export class PlanetaryHexTile extends Entity {
	// Grid coordinates in the planetary hex map
	x = 0;
	y = 0;

	// Terrain and geography (broad continental features)
	terrainType: TerrainType = TerrainType.Grass;
	elevation = 0; // Height (0-10 scale, avg for the region)
	temperature = 50; // Average temperature (0-100)
	dryness = 50; // Average moisture/dryness (0-100, higher = drier)
	climate = ''; // e.g., "Temperate", "Tropical", "Arctic"

	// Parent references
	parentPlanetId = ''; // ID of the Planet entity this tile belongs to
	continentId?: number; // Optional continent grouping ID

	// Regional map linkage
	hasRegionalMap = false; // Whether this tile has been expanded into a regional map
	regionalMapId?: string; // ID of the associated RegionalMap entity

	// Display metadata
	borderColor?: string; // For continent visualization
	isCoastal = false; // Whether this hex borders ocean

	constructor() {
		super();
		this.name = `Planetary Hex (${this.x}, ${this.y})`;
	}

	/**
	 * Get a summary label for this planetary hex
	 */
	getSummaryLabel(): string {
		const terrainName = TerrainType[this.terrainType] || 'Unknown';
		return `${terrainName} (${this.x}, ${this.y})`;
	}

	/**
	 * Check if this planetary hex has been explored/detailed
	 */
	isDetailed(): boolean {
		return this.hasRegionalMap && !!this.regionalMapId;
	}
}
