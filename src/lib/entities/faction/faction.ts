import { Entity } from '../base/entity';
import type { Sign } from '../other/sign';
import type { Character } from '../character/character';
import type { Ritual } from '../ritual/ritual';

export class Faction extends Entity {
	name = '';
	alignment = '';
	sign: Sign | null = null;
	size = '';
	influence = '';
	wealth = '';
	motivation = '';
	beginningMotivation = '';
	leader: Character | null = null;
	rituals: Ritual[] = [];
	quote = '';
	description = '';
}
