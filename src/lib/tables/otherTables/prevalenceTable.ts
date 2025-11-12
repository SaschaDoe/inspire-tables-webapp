import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const prevalences = ['all', 'common', 'uncommon', 'rare', 'unique'];

export class PrevalenceTable extends Table {
	constructor() {
		const entries = prevalences.map((p) => new TableEntry(p));
		super(entries, TableTitles.Default);
	}
}
