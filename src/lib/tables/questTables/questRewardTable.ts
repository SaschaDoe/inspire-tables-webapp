import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class QuestRewardTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('gold and treasure'));
		entries.push(new TableEntry('magical artefact'));
		entries.push(new TableEntry('rare weapon'));
		entries.push(new TableEntry('land or property'));
		entries.push(new TableEntry('title or rank'));
		entries.push(new TableEntry('knowledge or secrets'));
		entries.push(new TableEntry('political favor'));
		entries.push(new TableEntry('safe passage'));
		entries.push(new TableEntry('training or skills'));
		entries.push(new TableEntry('powerful ally'));
		entries.push(new TableEntry('information'));
		entries.push(new TableEntry('freedom or pardon'));
		entries.push(new TableEntry('magical blessing'));
		entries.push(new TableEntry('rare resources'));
		entries.push(new TableEntry('reputation'));
		super(entries, TableTitles.QuestReward);
		this.tableType = TableType.Other;
	}
}
