import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const rpgTypicallyMagic: string[] = [
	'fireball',
	'lightning bolt',
	'healing',
	'teleportation',
	'invisibility',
	'summoning',
	'mind control',
	'illusion',
	'frost nova',
	'earthquake',
	'wind blast',
	'shadow cloak',
	'time stop',
	'charm person',
	'levitation',
	'magic missile',
	'chain lightning',
	'water breathing',
	'shape shift',
	'arcane blast',
	'barrier',
	'regeneration',
	'mana drain',
	'divination',
	'necromancy',
	'enchant weapon',
	'ward protection',
	'astral projection',
	'curse removal',
	'elemental summoning',
	'portal creation',
	'light shield',
	'poison cloud',
	'energy bolt',
	'sleep',
	'polymorph'
];

export class MagicAbilityTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('magic talent'),
			new TableEntry('all abilities from magic school'),
			new TableEntry('all magic talents'),
			new TableEntry('a set of magic talents'),
			new TableEntry('rpg typically magic'),
			new TableEntry('any professions and profane talents'),
			new TableEntry('certain professions and profane talents')
		];
		super(entries, TableTitles.MagicAbility);
	}
}
