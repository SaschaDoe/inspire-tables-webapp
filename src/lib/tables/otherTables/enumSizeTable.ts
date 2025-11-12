import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class EnumSizeTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('0'),
			new TableEntry('1'),
			new TableEntry('2'),
			new TableEntry('3'),
			new TableEntry('4')
		];
		super(entries, TableTitles.EnumSize);
		this.tableType = TableType.Other;
	}
}
