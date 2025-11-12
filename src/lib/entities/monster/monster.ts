import { Entity } from '../base/entity';
import { Attributes } from '../character/attributes';

export class Monster extends Entity {
	races: string[] = [];
	talents: string[] = []; // Later: Talent[]
	attributes: Attributes = new Attributes();
	name = '';
	gender = '';
	number = '';
	eaterType = '';
	reproduction = '';
	age = '';
	encounterType = '';
	movementType = '';
	tracks = '';
	curse = '';
}
