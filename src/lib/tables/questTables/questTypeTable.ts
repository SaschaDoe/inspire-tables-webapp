import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class QuestTypeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('assassination'));
		entries.push(new TableEntry('retrieval'));
		entries.push(new TableEntry('escort'));
		entries.push(new TableEntry('investigation'));
		entries.push(new TableEntry('exploration'));
		entries.push(new TableEntry('delivery'));
		entries.push(new TableEntry('rescue'));
		entries.push(new TableEntry('defense'));
		entries.push(new TableEntry('conquest'));
		entries.push(new TableEntry('diplomacy'));
		entries.push(new TableEntry('sabotage'));
		entries.push(new TableEntry('infiltration'));
		entries.push(new TableEntry('hunting'));
		entries.push(new TableEntry('gathering'));
		entries.push(new TableEntry('protection'));
		entries.push(new TableEntry('negotiation'));
		entries.push(new TableEntry('heist'));
		entries.push(new TableEntry('cleansing'));
		super(entries, TableTitles.QuestType);
		this.tableType = TableType.Other;
	}
}
