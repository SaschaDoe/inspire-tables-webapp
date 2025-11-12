import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualOfferingTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('music'));
		entries.push(new TableEntry('slaves'));
		entries.push(new TableEntry('blood'));
		entries.push(new TableEntry('food'));
		entries.push(new TableEntry('gold'));
		entries.push(new TableEntry('gems'));
		entries.push(new TableEntry('wine'));
		entries.push(new TableEntry('silk'));
		entries.push(new TableEntry('candles'));
		entries.push(new TableEntry('incense'));
		entries.push(new TableEntry('statues'));
		entries.push(new TableEntry('books'));
		entries.push(new TableEntry('spices'));
		entries.push(new TableEntry('herbs'));
		entries.push(new TableEntry('oils'));
		entries.push(new TableEntry('cloths'));
		entries.push(new TableEntry('pelts'));
		entries.push(new TableEntry('swords'));
		entries.push(new TableEntry('shields'));
		entries.push(new TableEntry('charms'));
		super(entries, TableTitles.RitualOffering);
		this.tableType = TableType.Other;
	}
}
