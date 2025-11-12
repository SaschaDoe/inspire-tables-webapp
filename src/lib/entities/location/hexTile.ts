import { Entity } from '../base/entity';

export class HexTile extends Entity {
	terrain = '';
	features: string[] = [];
	coordinates = { q: 0, r: 0 };
	discovered = false;
	description = '';
}
