import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class DifficultyTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('without any difficulty'));
		entries.push(new TableEntry('easy'));
		entries.push(new TableEntry('medium'));
		entries.push(new TableEntry('hard'));
		entries.push(new TableEntry('nearly impossible'));
		super(entries, TableTitles.Difficulty);
		this.tableType = TableType.Other;
	}
}
