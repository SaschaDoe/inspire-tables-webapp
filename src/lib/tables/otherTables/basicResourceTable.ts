import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class BasicResourceTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('iron ore'));
		entries.push(new TableEntry('copper'));
		entries.push(new TableEntry('coal'));
		entries.push(new TableEntry('gold'));
		entries.push(new TableEntry('silver'));
		entries.push(new TableEntry('salt'));
		entries.push(new TableEntry('timber'));
		entries.push(new TableEntry('stone'));
		entries.push(new TableEntry('clay'));
		entries.push(new TableEntry('quartz'));
		entries.push(new TableEntry('lead'));
		entries.push(new TableEntry('zinc'));
		entries.push(new TableEntry('tin'));
		entries.push(new TableEntry('wheat'));
		entries.push(new TableEntry('rice'));
		entries.push(new TableEntry('corn'));
		entries.push(new TableEntry('cotton'));
		entries.push(new TableEntry('wool'));
		entries.push(new TableEntry('flax'));
		entries.push(new TableEntry('hemp'));
		entries.push(new TableEntry('fish'));
		entries.push(new TableEntry('livestock'));
		entries.push(new TableEntry('fruits'));
		entries.push(new TableEntry('vegetables'));
		entries.push(new TableEntry('spices'));
		entries.push(new TableEntry('herbs'));
		entries.push(new TableEntry('magic crystals'));
		entries.push(new TableEntry('mana stones'));
		entries.push(new TableEntry('rare earth elements'));
		entries.push(new TableEntry('artefacts'));
		entries.push(new TableEntry('magical herbs'));
		entries.push(new TableEntry('magical minerals'));
		super(entries, TableTitles.BasicResource);
		this.tableType = TableType.Other;
	}
}
