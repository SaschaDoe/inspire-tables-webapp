import { Entity } from '../base/entity';
import type { HexTile } from './hexTile';

export class Continent extends Entity {
	name = '';
	description = '';
	size = '';
	climate = '';
	dominantLandscape = '';
	primaryWeather = '';
	parentId = ''; // Reference to parent Planet
	hexTiles: HexTile[] = []; // Hex tiles that belong to this continent (legacy, for RPG mode)

	// Regional map links (Phase 4: Planet Workflow Integration)
	regionalMapIds: string[] = []; // IDs of RegionalMap entities generated from this continent's tiles
}
