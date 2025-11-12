import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const secondPartNames: string[] = [
	'weaving',
	'flux',
	'urgy',
	'mancy',
	'forge',
	'echoes',
	'aetherics',
	'craft',
	'binding',
	'warding'
];

export class MagicSystemFantasyNameSecondTable extends Table {
	constructor() {
		const entries = secondPartNames.map((name) => new TableEntry(name));
		super(entries, TableTitles.Default);
	}
}
