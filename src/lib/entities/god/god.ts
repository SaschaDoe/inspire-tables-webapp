import { Entity } from '../base/entity';
import type { Character } from '../character/character';

export class God extends Entity {
	name = '';
	description = '';
	byname = '';
	character: Character | null = null;
	domains: string[] = [];
	sacredAnimal = '';
	temple = '';
	quoteDisciple = '';
	quoteCautionary = '';
	status = '';
	habitat = '';
}
