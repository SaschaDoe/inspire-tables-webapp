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
	hexTiles: HexTile[] = []; // Hex tiles that belong to this continent
}
