import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualCulminationTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('sacrifice'));
		entries.push(new TableEntry('benediction'));
		entries.push(new TableEntry('silence'));
		entries.push(new TableEntry('proclamation'));
		entries.push(new TableEntry('toast'));
		entries.push(new TableEntry('feast'));
		entries.push(new TableEntry('burning'));
		entries.push(new TableEntry('revelation'));
		entries.push(new TableEntry('dance'));
		entries.push(new TableEntry('duel'));
		entries.push(new TableEntry('blessing'));
		entries.push(new TableEntry('oath'));
		entries.push(new TableEntry('ascension'));
		entries.push(new TableEntry('transformation'));
		entries.push(new TableEntry('awakening'));
		entries.push(new TableEntry('union'));
		entries.push(new TableEntry('pact'));
		entries.push(new TableEntry('bestowal'));
		entries.push(new TableEntry('communion'));
		entries.push(new TableEntry('release'));
		super(entries, TableTitles.RitualCulmination);
		this.tableType = TableType.Other;
	}
}
