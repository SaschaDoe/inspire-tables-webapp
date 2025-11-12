import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class MoodTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('tense'));
		entries.push(new TableEntry('hopeful'));
		entries.push(new TableEntry('mysterious'));
		entries.push(new TableEntry('melancholic'));
		entries.push(new TableEntry('joyful'));
		entries.push(new TableEntry('ominous'));
		entries.push(new TableEntry('peaceful'));
		entries.push(new TableEntry('chaotic'));
		entries.push(new TableEntry('romantic'));
		entries.push(new TableEntry('foreboding'));
		entries.push(new TableEntry('triumphant'));
		entries.push(new TableEntry('desperate'));
		entries.push(new TableEntry('eerie'));
		entries.push(new TableEntry('intimate'));
		entries.push(new TableEntry('suspenseful'));
		entries.push(new TableEntry('nostalgic'));
		entries.push(new TableEntry('oppressive'));
		entries.push(new TableEntry('serene'));
		super(entries, TableTitles.Mood);
		this.tableType = TableType.Other;
	}
}
