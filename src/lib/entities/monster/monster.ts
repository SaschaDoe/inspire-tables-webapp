import { Entity } from '../base/entity';
import { Attributes } from '../character/attributes';
import { Talent } from '../talent/talent';

export class Monster extends Entity {
	races: string[] = [];
	talents: Talent[] = [];
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
	parentId = ''; // Reference to parent Dungeon
}
