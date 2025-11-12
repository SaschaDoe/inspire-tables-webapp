import { Entity } from '../base/entity';

export class Sign extends Entity {
	name = '';
	description = '';
	symbol = '';
	meaning = '';
	colors: string[] = [];
	form = '';
}
