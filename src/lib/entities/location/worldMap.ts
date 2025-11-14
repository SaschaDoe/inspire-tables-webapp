import type { HexTile } from './hexTile';
import type { ContinentInfo } from '$lib/utils/continentDetector';

export class WorldMap {
	hexTiles: HexTile[][] = []; // 2D grid of hex tiles
	width = 0;
	height = 0;
	seed = 0;
	continents: ContinentInfo[] = []; // Detected continents
}
