import { Entity } from '../base/entity';

export class Talent extends Entity {
	name = '';
	category = '';
	type = '';
	description = '';
	parentId = ''; // Reference to parent Character/Monster/Villain
}
