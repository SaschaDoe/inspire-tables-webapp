import { Entity } from '../base/entity';

export class Trap extends Entity {
	name = '';
	trigger = '';
	function = '';
	description = '';
	parentId = ''; // Reference to parent Entrance
}
