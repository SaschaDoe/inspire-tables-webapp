import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const spherePrefixes: string[] = [
	'dream',
	'whisper',
	'starlit',
	'moonlit',
	'glimmer',
	'sylvan',
	'enchant',
	'spell',
	'fey',
	'pixie',
	'lumin',
	'mystic',
	'shadow',
	'aether',
	'ethereal',
	'twilight',
	'magic',
	'arcane',
	'spirit',
	'wonder'
];

export class SphereNamePrefixesTable extends Table {
	constructor() {
		const entries = spherePrefixes.map((prefix) => new TableEntry(prefix));
		super(entries, TableTitles.SphereNamePrefixes);
		this.tableType = TableType.Other;
	}
}
