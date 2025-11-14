import { Entity } from '../base/entity';
import type { Entrance } from './entrance';
import type { Monster } from '../monster/monster';
import type { RoomConnector } from './roomConnector';

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
	roomConnectors: RoomConnector[] = [];
	monsters: Monster[] = [];
	locationChangeEvents: string[] = [];
	realWorldEnemies: string[] = [];
}

export class Room extends Entity {
	type = 'room' as const;
	furnishing = '';
	obstacle = '';
	treasure = '';
	trap = '';
	/** IDs of other rooms this room connects to */
	connectedRoomIds: string[] = [];
	parentId = ''; // Reference to parent Dungeon
}
