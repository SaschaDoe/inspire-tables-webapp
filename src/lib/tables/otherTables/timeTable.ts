import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class TimeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('short'));
		entries.push(new TableEntry('mid'));
		entries.push(new TableEntry('long'));
		entries.push(new TableEntry('infinite'));
		super(entries, TableTitles.Time);
		this.tableType = TableType.Other;
	}
}
