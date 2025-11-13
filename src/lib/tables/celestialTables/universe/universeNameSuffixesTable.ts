import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const universeSuffixes: string[] = [
	'verse',
	'realm',
	'cosmos',
	'expanse',
	'continuum',
	'matrix',
	'domain',
	'dimension',
	'totality',
	'infinity',
	'manifold',
	'plenum',
	'fabric',
	'lattice',
	'weave',
	'tapestry',
	'field',
	'void',
	'nexus',
	'core'
];

export class UniverseNameSuffixesTable extends Table {
	constructor() {
		const entries = universeSuffixes.map((suffix) => new TableEntry(suffix));
		super(entries, TableTitles.UniverseNameSuffixes);
		this.tableType = TableType.Name;
	}
}
