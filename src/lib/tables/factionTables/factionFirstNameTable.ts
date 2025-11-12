import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const secretSocietyPrefixes: string[] = [
	'Order',
	'Brotherhood',
	'Sisterhood',
	'Keepers',
	'Circle',
	'Guild',
	'Cult',
	'Sect',
	'Cabal',
	'Conclave',
	'Enclave',
	'Fellowship',
	'Society',
	'Assembly',
	'Legion',
	'Syndicate',
	'Collective',
	'Covenant',
	'Chorus',
	'Fraternity',
	'Sorority',
	'Alliance',
	'Union',
	'Confederation',
	'Coalition',
	'Conservatory',
	'Academy',
	'Council',
	'Foundation',
	'Institute'
];

export class FactionFirstNameTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let prefix of secretSocietyPrefixes) {
			entries.push(new TableEntry(prefix));
		}
		super(entries, TableTitles.FractionName);
	}
}

export { secretSocietyPrefixes };
