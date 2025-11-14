import type { HexTile } from './hexTile';

export class WorldMap {
	hexTiles: HexTile[][] = []; // 2D grid of hex tiles
	width = 0;
	height = 0;
	seed = 0;
}
