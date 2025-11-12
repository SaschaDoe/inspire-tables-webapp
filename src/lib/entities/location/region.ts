import { Entity } from '../base/entity';

export class Region extends Entity {
	name = '';
	landscape = '';
	weather = '';
	resources: string[] = [];
	description = '';
}
