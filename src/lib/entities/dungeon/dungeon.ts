import { Entity } from '../base/entity';
import type { Entrance } from './entrance';
import type { Monster } from '../monster/monster';

export class Dungeon extends Entity {
	name = '';
	type = '';
	adjective = '';
	size = '';
	state = '';
	entrances: Entrance[] = [];
	purposes: string[] = [];
	arrangements: string[] = [];
	rooms: Room[] = [];
	monsters: Monster[] = [];
	locationChangeEvents: string[] = [];
	realWorldEnemies: string[] = [];
}

export class Room {
	id: string;
	name = '';
	furnishing = '';
	obstacle = '';
	treasure = '';
	trap = '';

	constructor() {
		this.id = crypto.randomUUID();
	}
}
