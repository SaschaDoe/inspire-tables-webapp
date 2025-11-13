import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const universePrefixes: string[] = [
	'omni',
	'prima',
	'proto',
	'arch',
	'meta',
	'hyper',
	'ultra',
	'macro',
	'cosmic',
	'eternal',
	'infinite',
	'prime',
	'nexus',
	'void',
	'quantum',
	'stellar',
	'astral',
	'celestial',
	'universal',
	'genesis'
];

export class UniverseNamePrefixesTable extends Table {
	constructor() {
		const entries = universePrefixes.map((prefix) => new TableEntry(prefix));
		super(entries, TableTitles.UniverseNamePrefixes);
		this.tableType = TableType.Name;
	}
}
