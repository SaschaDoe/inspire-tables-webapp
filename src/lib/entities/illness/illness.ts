import { Entity } from '../base/entity';

export class Illness extends Entity {
	name = '';
	description = '';
	time = '';
	type = '';
	beginningSymptoms: string[] = [];
	symptoms: string[] = [];
	cure = '';
	origin = '';
	worldEffect = '';
	lore = '';
	age = '';
	transmission = '';
	adjective = '';
}
