import { Entity } from '../base/entity';
import { Attributes } from './attributes';
import { BigFive } from './bigFive';
import { Voice } from './voice';
import { Culture } from './culture';
import type { Talent } from '../talent/talent';

export class Character extends Entity {
	name = '';
	race = '';
	culture: Culture = new Culture();
	gender = '';
	byname = '';
	attributes: Attributes = new Attributes();
	talents: Talent[] = [];
	age = '';
	alignment = '';
	advantage = '';
	device = '';
	curse = '';
	disadvantage = '';
	motivation = '';
	nobility = '';
	profession = '';
	bigFive = new BigFive();
	weight = '';
	height = '';
	secret = '';
	quote = '';
	voice = new Voice();
	recognition = '';
	rpgDevice: string[] = [];
}
