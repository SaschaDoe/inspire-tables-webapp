import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class SpellAreaOfEffectTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('self'));
		entries.push(new TableEntry('single target'));
		entries.push(new TableEntry('multiple targets'));
		entries.push(new TableEntry('small area'));
		entries.push(new TableEntry('medium area'));
		entries.push(new TableEntry('large area'));
		entries.push(new TableEntry('everywhere'));
		super(entries, TableTitles.SpellAreaOfEffect);
		this.tableType = TableType.Other;
	}
}
