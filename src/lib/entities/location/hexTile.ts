import { Entity } from '../base/entity';
import type { Dungeon } from '../dungeon/dungeon';
import type { Settlement } from './settlement';

export class HexTile extends Entity {
	type = '';
	feature = '';
	weather = '';
	dungeons: Dungeon[] = [];
	hazards: string[] = [];
	settlements: Settlement[] = [];
	techLevel = '';
	coordinates = { x: 0, y: 0, z: 0 };
	discovered = false;
	description = '';
}
