import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const religiousMagicSecondPartNames: string[] = [
	'conduit',
	'bond',
	'pact',
	'unity',
	'weave',
	'link',
	'accord',
	'harmony',
	'matrix',
	'resonance',
	'geometry',
	'stream',
	'flame',
	'infusion',
	'chorus',
	'nexus',
	'flux',
	'cycle',
	// Added darker, evil-sounding names
	'ritual',
	'seal',
	'gate',
	'void',
	'chain',
	'thrall',
	'curse',
	'sign',
	'veil',
	'pyre'
];

export class MagicSystemReligionNameSecondTable extends Table {
	constructor() {
		const entries = religiousMagicSecondPartNames.map((name) => new TableEntry(name));
		super(entries, TableTitles.Default);
	}
}
