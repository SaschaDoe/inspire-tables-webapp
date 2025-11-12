import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class IllnessCureTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('rest and time'));
		entries.push(new TableEntry('herbal remedy'));
		entries.push(new TableEntry('magical healing'));
		entries.push(new TableEntry('rare potion'));
		entries.push(new TableEntry('divine intervention'));
		entries.push(new TableEntry('specific ritual'));
		entries.push(new TableEntry('antidote from rare creature'));
		entries.push(new TableEntry('pilgrimage to sacred site'));
		entries.push(new TableEntry('ancient knowledge'));
		entries.push(new TableEntry('cleansing ceremony'));
		entries.push(new TableEntry('specialized treatment'));
		entries.push(new TableEntry('removal of curse'));
		entries.push(new TableEntry('no known cure'));
		entries.push(new TableEntry('quarantine and isolation'));
		entries.push(new TableEntry('alchemical solution'));
		super(entries, TableTitles.IllnessCure);
		this.tableType = TableType.Other;
	}
}
