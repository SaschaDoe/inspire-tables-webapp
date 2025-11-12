import { Entity } from '../base/entity';

export class Event extends Entity {
	name = '';
	type = '';
	location = '';
	impact = '';
	description = '';
	consequences: string[] = [];
}
