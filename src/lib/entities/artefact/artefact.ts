import { Entity } from '../base/entity';

export class Artefact extends Entity {
	name = '';
	type = '';
	quality = '';
	age = '';
	material = '';
	rarity = '';
	talents: string[] = []; // Simplified for now
}
