import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class EventTypeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('festival'));
		entries.push(new TableEntry('disaster'));
		entries.push(new TableEntry('battle'));
		entries.push(new TableEntry('discovery'));
		entries.push(new TableEntry('birth'));
		entries.push(new TableEntry('death'));
		entries.push(new TableEntry('coronation'));
		entries.push(new TableEntry('rebellion'));
		entries.push(new TableEntry('plague'));
		entries.push(new TableEntry('invasion'));
		entries.push(new TableEntry('treaty'));
		entries.push(new TableEntry('miracle'));
		entries.push(new TableEntry('curse'));
		entries.push(new TableEntry('prophecy'));
		entries.push(new TableEntry('earthquake'));
		entries.push(new TableEntry('flood'));
		entries.push(new TableEntry('drought'));
		entries.push(new TableEntry('famine'));
		entries.push(new TableEntry('celebration'));
		entries.push(new TableEntry('assassination'));
		entries.push(new TableEntry('revolution'));
		entries.push(new TableEntry('eclipse'));
		entries.push(new TableEntry('meteor strike'));
		entries.push(new TableEntry('magical anomaly'));
		super(entries, TableTitles.EventType);
		this.tableType = TableType.Other;
	}
}
