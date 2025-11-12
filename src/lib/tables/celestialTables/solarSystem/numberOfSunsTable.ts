import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

export class NumberOfSunsTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('1').withRoleInterval(1, 7),
			new TableEntry('2').withRoleInterval(8, 8),
			new TableEntry('3').withRoleInterval(9, 9),
			new TableEntry('4').withRoleInterval(10, 10),
			new TableEntry('5').withRoleInterval(11, 11)
		];
		super(entries, TableTitles.NumberOfSuns);
		this.tableType = TableType.Other;
	}
}
