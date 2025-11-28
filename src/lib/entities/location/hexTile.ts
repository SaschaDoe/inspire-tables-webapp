import { Entity } from '../base/entity';
import type { Dungeon } from '../dungeon/dungeon';
import type { Settlement } from './settlement';
import { TerrainType } from './terrainType';
import type { RegionalHexData } from './regionalHexData';

export class HexTile extends Entity {
	// Grid coordinates
	x = 0; // Grid x coordinate
	y = 0; // Grid y coordinate

	// World map properties (for planet-level maps)
	terrainType: TerrainType = TerrainType.Grass;
	elevation = 0; // Height (0-10 scale)
	temperature = 50; // Temperature value (0-100)
	dryness = 50; // Moisture/dryness (0-100, higher = drier)
	continentId?: number; // ID of the continent this tile belongs to

	// Regional hex sub-tiles (Level 2 - for seamless zoom)
	// Each planetary hex contains a grid of regional hexes for detailed simulation
	// Using lightweight RegionalHexData instead of RegionalHexTile (Entity) for performance
	regionalHexes: RegionalHexData[][] = [];
	regionalGridSize = 5; // Default 5x5 regional hexes per planetary hex

	// Regional/overland map properties
	type = ''; // Legacy type field
	feature = '';
	weather = '';
	dungeons: Dungeon[] = [];
	hazards: string[] = [];
	settlements: Settlement[] = [];
	techLevel = '';
	coordinates = { x: 0, y: 0, z: 0 }; // 3D coordinates for legacy system
	discovered = false;

	parentId = ''; // Reference to parent Planet or Region
}
