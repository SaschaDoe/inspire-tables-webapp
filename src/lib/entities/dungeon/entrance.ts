import { Entity } from '../base/entity';
import type { Trap } from './trap';

export class Entrance extends Entity {
	type = 'entrance' as const;
	name = '';
	description = '';
	entranceType = '';
	adjective = '';
	traps: Trap[] = [];
	/** IDs of rooms this entrance connects to */
	connectedRoomIds: string[] = [];
}
