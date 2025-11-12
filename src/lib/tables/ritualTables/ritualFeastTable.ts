import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualFeastTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('banqueting'));
		entries.push(new TableEntry('dancing'));
		entries.push(new TableEntry('jousting'));
		entries.push(new TableEntry('bardic performances'));
		entries.push(new TableEntry('storytelling'));
		entries.push(new TableEntry('games of skill'));
		entries.push(new TableEntry('tournaments'));
		entries.push(new TableEntry('wine tasting'));
		entries.push(new TableEntry('archery contests'));
		entries.push(new TableEntry('magic shows'));
		entries.push(new TableEntry('fireworks displays'));
		entries.push(new TableEntry('music concerts'));
		entries.push(new TableEntry('art exhibitions'));
		entries.push(new TableEntry('mask parades'));
		entries.push(new TableEntry('theatrical plays'));
		entries.push(new TableEntry('puppet shows'));
		entries.push(new TableEntry('fortune telling'));
		entries.push(new TableEntry('acrobatic acts'));
		entries.push(new TableEntry('arm-wrestling matches'));
		entries.push(new TableEntry('pie-eating competitions'));
		super(entries, TableTitles.RitualFeast);
		this.tableType = TableType.Other;
	}
}
