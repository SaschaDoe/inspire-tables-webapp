import { Entity } from '../base/entity';

export class Vehicle extends Entity {
	name = '';
	description = '';
	type = '';
	size = '';
	quality = '';
	speed = '';
	capacity = '';
	specialFeatures: string[] = [];
	propulsion = '';
	material = '';
}
