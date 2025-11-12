import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const sphereSuffixes: string[] = [
	'dell',
	'wood',
	'glen',
	'grove',
	'meadow',
	'vale',
	'realm',
	'cove',
	'expanse',
	'sea',
	'wold',
	'forest',
	'haven',
	'nest',
	'sanctum',
	'plane',
	'mire',
	'ridge',
	'peak',
	'thicket',
	'ium',
	'domain',
	'land'
];

export class SphereNameSuffixesTable extends Table {
	constructor() {
		const entries = sphereSuffixes.map((suffix) => new TableEntry(suffix));
		super(entries, TableTitles.SphereNameSuffixes);
		this.tableType = TableType.Other;
	}
}
