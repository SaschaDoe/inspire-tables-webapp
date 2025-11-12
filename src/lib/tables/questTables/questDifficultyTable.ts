import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class QuestDifficultyTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('trivial'));
		entries.push(new TableEntry('easy'));
		entries.push(new TableEntry('moderate'));
		entries.push(new TableEntry('challenging'));
		entries.push(new TableEntry('difficult'));
		entries.push(new TableEntry('deadly'));
		entries.push(new TableEntry('legendary'));
		super(entries, TableTitles.QuestDifficulty);
		this.tableType = TableType.Other;
	}
}
