import { Entity } from '../base/entity';

export class Quest extends Entity {
	name = '';
	type = '';
	objective = '';
	reward = '';
	difficulty = '';
	giver = '';
	location = '';
	description = '';
}
