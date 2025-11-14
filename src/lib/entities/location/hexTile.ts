import { Entity } from '../base/entity';
import type { Dungeon } from '../dungeon/dungeon';
import type { Settlement } from './settlement';
import { TerrainType } from './terrainType';

export class HexTile extends Entity {
	// Grid coordinates
	x = 0; // Grid x coordinate
	y = 0; // Grid y coordinate

	// World map properties (for planet-level maps)
	terrainType: TerrainType = TerrainType.Grass;
	elevation = 0; // Height (0-10 scale)
	temperature = 50; // Temperature value (0-100)
	dryness = 50; // Moisture/dryness (0-100, higher = drier)

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
