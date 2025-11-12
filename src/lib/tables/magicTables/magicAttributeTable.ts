import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const magicAttributes = [
	'abilities',
	'power',
	'cost',
	'limitations',
	'side effect',
	'preparation',
	'source',
	'commonality',
	'rules',
	'weakness',
	'fluff',
	'channel',
	'method',
	'ease of use',
	'prevalence',
	'naturalness'
];

export class MagicAttributeTable extends Table {
	constructor() {
		const entries = magicAttributes.map((attr) => new TableEntry(attr));
		super(entries, TableTitles.MagicAttribute);
	}
}
