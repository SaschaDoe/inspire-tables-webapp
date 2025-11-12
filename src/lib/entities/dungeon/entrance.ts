import { Entity } from '../base/entity';
import type { Trap } from './trap';

export class Entrance extends Entity {
	name = '';
	description = '';
	type = '';
	adjective = '';
	traps: Trap[] = [];
}
