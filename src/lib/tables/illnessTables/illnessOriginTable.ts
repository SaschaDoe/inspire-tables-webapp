import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class IllnessOriginTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('natural mutation'));
		entries.push(new TableEntry('laboratory accident'));
		entries.push(new TableEntry('biological warfare'));
		entries.push(new TableEntry('environmental factors'));
		entries.push(new TableEntry('zoonotic transfer'));
		entries.push(new TableEntry('mystical curse'));
		entries.push(new TableEntry('divine punishment'));
		entries.push(new TableEntry('alien organism'));
		entries.push(new TableEntry('magical experimentation'));
		entries.push(new TableEntry('ancient relic'));
		entries.push(new TableEntry('toxic exposure'));
		entries.push(new TableEntry('genetic predisposition'));
		entries.push(new TableEntry('mythical creature'));
		entries.push(new TableEntry('demonic presence'));
		entries.push(new TableEntry('planetary alignment'));
		entries.push(new TableEntry('failed alchemy'));
		entries.push(new TableEntry('vampire bite'));
		entries.push(new TableEntry('necromantic magic'));
		entries.push(new TableEntry('otherworldly portal'));
		entries.push(new TableEntry('eldritch entity'));
		entries.push(new TableEntry('divine intervention'));
		entries.push(new TableEntry('arcane contagion'));
		entries.push(new TableEntry("witch's brew"));
		entries.push(new TableEntry('pollution'));
		entries.push(new TableEntry('radiation'));
		entries.push(new TableEntry('psychosomatic response'));
		entries.push(new TableEntry('technological malfunction'));
		entries.push(new TableEntry('time travel paradox'));
		entries.push(new TableEntry('interdimensional rift'));
		super(entries, TableTitles.IllnessOrigin);
		this.tableType = TableType.Other;
	}
}
