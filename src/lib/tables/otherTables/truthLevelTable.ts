import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class TruthLevelTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('absolute truth'));
		entries.push(new TableEntry('mostly true with minor errors'));
		entries.push(new TableEntry('partially true'));
		entries.push(new TableEntry('misleading but based on truth'));
		entries.push(new TableEntry('completely false'));
		entries.push(new TableEntry('fabricated lie'));
		super(entries, TableTitles.TruthLevel);
		this.tableType = TableType.Other;
	}
}
