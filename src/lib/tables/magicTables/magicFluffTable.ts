import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const magicSystemFluff: string[] = [
	'sparks of light dance around the fingertips of the caster',
	'a soft hum accompanies the casting of spells',
	"casters' eyes briefly glow when they invoke magic",
	'magic leaves a faint, sweet scent in the air',
	'a gentle breeze seems to emanate from the point of spellcasting',
	'magical effects are accompanied by ephemeral, ghostly echoes',
	"small, harmless sparks emit from the caster's hair",
	'the shadow of the caster flickers with different colors during spellcasting',
	"spellcasting temporarily leaves intricate, glowing runes on the caster's arms",
	"a caster's voice resonates with a slight echo when invoking a spell",
	'magical energy manifests as tiny floating orbs of light',
	'the ground around the caster briefly shimmers with each spell',
	'a soft musical chime sounds when a spell is successfully cast',
	'casting a spell leaves a trail of phosphorescent glitter in the air',
	"the caster's clothes ripple as if in a breeze when they use magic",
	'small, symbolic visions appear in the air while casting',
	'the temperature subtly changes in the vicinity of a spell',
	'casters leave glowing footprints immediately after spellcasting',
	'whispers in an ancient language can be faintly heard during spellcasting',
	"a spell's completion is marked by a brief, starry twinkle in the air"
];

export class MagicFluffTable extends Table {
	constructor() {
		const entries = magicSystemFluff.map((fluff) => new TableEntry(fluff));
		super(entries, TableTitles.MagicFluff, TableType.Other);
	}
}
