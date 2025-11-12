import { Entity } from '../base/entity';
import type { Trap } from './trap';

export type RoomConnectorType = 'door' | 'tunnel' | 'obstacle';

export class RoomConnector extends Entity {
	type = 'roomConnector' as const;
	name = '';
	connectorType: RoomConnectorType = 'door';
	description = '';
	/** ID of the room this connector leads from */
	fromRoomId = '';
	/** ID of the room this connector leads to (or entrance ID) */
	toRoomId = '';
	/** Optional trap in the connector */
	trap?: Trap;
	/** Whether the connector is passable */
	isPassable = true;
	/** Difficulty to pass through (if obstacle) */
	difficulty = '';
}
