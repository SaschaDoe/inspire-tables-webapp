import { Entity } from '../base/entity';

export class Dungeon extends Entity {
	name = '';
	structure = '';
	entries = '';
	numberOfRooms = 0;
	rooms: Room[] = [];
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
