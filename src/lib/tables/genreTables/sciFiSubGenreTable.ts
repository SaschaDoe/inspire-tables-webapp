import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const sciFiSubGenres: string[] = [
	'space opera',
	'cyberpunk',
	'hard sci-fi',
	'soft sci-fi',
	'steampunk',
	'biopunk',
	'post-apocalyptic',
	'dystopian',
	'time travel',
	'alien invasion',
	'military sci-fi',
	'cli-fi (climate fiction)'
];

export class SciFiSubGenreTable extends Table {
	constructor() {
		const entries = sciFiSubGenres.map((genre) => new TableEntry(genre));
		super(entries, TableTitles.SciFiSubGenre);
		this.tableType = TableType.Other;
	}
}
