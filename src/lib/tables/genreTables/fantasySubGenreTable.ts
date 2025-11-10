import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const fantasySubGenres: string[] = [
	'swords and sorcery',
	'urban fantasy',
	'high fantasy',
	'grim dark',
	'historical fantasy',
	'alternate history',
	'fairytale',
	'epic fantasy',
	'sword & planet',
	'low fantasy'
];

export class FantasySubGenreTable extends Table {
	constructor() {
		const entries = fantasySubGenres.map((genre) => new TableEntry(genre));
		super(entries, TableTitles.FantasySubGenre);
		this.tableType = TableType.Other;
	}
}
