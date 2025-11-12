import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class SpellCooldownTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('immediate'));
		entries.push(new TableEntry('fast'));
		entries.push(new TableEntry('a few minutes'));
		entries.push(new TableEntry('a few hours'));
		entries.push(new TableEntry('a day'));
		entries.push(new TableEntry('a few days'));
		entries.push(new TableEntry('a week'));
		entries.push(new TableEntry('a few weeks'));
		entries.push(new TableEntry('a month'));
		entries.push(new TableEntry('a few months'));
		entries.push(new TableEntry('a year'));
		entries.push(new TableEntry('a few years'));
		entries.push(new TableEntry('a decade'));
		entries.push(new TableEntry('a few decades'));
		super(entries, TableTitles.SpellCooldown);
		this.tableType = TableType.Other;
	}
}
