import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class AmountTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('all'));
		entries.push(new TableEntry('huge'));
		entries.push(new TableEntry('large'));
		entries.push(new TableEntry('medium'));
		entries.push(new TableEntry('small'));
		entries.push(new TableEntry('tiny'));
		entries.push(new TableEntry('nothing'));
		super(entries, TableTitles.Amount);
		this.tableType = TableType.Other;
	}
}
