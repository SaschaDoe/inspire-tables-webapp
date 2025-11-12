import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class PowerLevelTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('weak'));
		entries.push(new TableEntry('average'));
		entries.push(new TableEntry('strong'));
		entries.push(new TableEntry('mighty'));
		super(entries, TableTitles.PowerLevel);
		this.tableType = TableType.Other;
	}
}
