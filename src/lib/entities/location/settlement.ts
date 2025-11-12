import { Entity } from '../base/entity';

export class Settlement extends Entity {
	name = '';
	size = '';
	fame = '';
	events: string[] = [];
	population = 0;
	description = '';
}
