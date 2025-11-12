import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const magicSystemEntityDifferences: string[] = [
	'caste system',
	'culture',
	'psychology',
	'physiology',
	'religion',
	'politics',
	'geography',
	'history',
	'economics',
	'race',
	'heritage',
	'language',
	'technology'
];

export class MagicDifferentiationTable extends Table {
	constructor() {
		const entries = magicSystemEntityDifferences.map((diff) => new TableEntry(diff));
		super(entries, TableTitles.MagicDifferentiation);
	}
}
