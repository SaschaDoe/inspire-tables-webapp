import { Entity } from '../base/entity';

export class Adventure extends Entity {
	name = '';
	description = '';
	beginning = '';
	risingAction: string[] = [];
	climax = '';
	ending = '';
	plotTropes: string[] = [];
}
