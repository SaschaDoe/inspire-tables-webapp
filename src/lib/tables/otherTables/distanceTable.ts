import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class DistanceTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('touch'));
		entries.push(new TableEntry('close'));
		entries.push(new TableEntry('short'));
		entries.push(new TableEntry('medium'));
		entries.push(new TableEntry('long'));
		entries.push(new TableEntry('extreme'));
		entries.push(new TableEntry('planetary'));
		entries.push(new TableEntry('interstellar'));
		entries.push(new TableEntry('interdimensional'));
		super(entries, TableTitles.Distance);
		this.tableType = TableType.Other;
	}
}
