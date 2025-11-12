import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class AgeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('young'));
		entries.push(new TableEntry('juvenile'));
		entries.push(new TableEntry('mature'));
		entries.push(new TableEntry('old'));
		entries.push(new TableEntry('ancient'));
		super(entries, TableTitles.Age);
		this.tableType = TableType.Other;
	}
}
