import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const firstPartNames: string[] = [
	'ether',
	'arcanum',
	'celest',
	'chrono',
	'soul',
	'primal',
	'elemental',
	'nether',
	'rune',
	'mystic',
	'shadow',
	'spirit',
	'arcane',
	'druidic',
	'void',
	'aether',
	'enigma',
	'force',
	'vital',
	'light',
	'weave',
	'flux',
	'mist',
	'echo',
	'essence',
	'rift',
	'tempest',
	'whisper',
	'veil'
];

export class MagicSystemFantasyNameFirstTable extends Table {
	constructor() {
		const entries = firstPartNames.map((name) => new TableEntry(name));
		super(entries, TableTitles.MagicSystemFantasyNameFirst, TableType.Name);
	}
}
