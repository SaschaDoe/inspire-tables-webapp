import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const sectorSynonyms = [
	'sector',
	'quadrant',
	'zone',
	'area',
	'region',
	'territory',
	'realm',
	'domain',
	'system'
];

export class SectorSynonymsTable extends Table {
	constructor() {
		const entries = sectorSynonyms.map((synonym) => new TableEntry(synonym));
		super(entries, TableTitles.SectorSynonyms);
		this.tableType = TableType.Other;
	}
}
