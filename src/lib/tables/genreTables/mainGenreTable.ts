import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

// Main genres with probabilities (RPG/Game focused)
const mainGenresWithProbabilities: [string, number][] = [
	['fantasy', 20],
	['action', 10],
	['sci-fi', 10],
	['myth', 9],
	['war', 8],
	['horror', 7],
	['crime', 7],
	['mystery', 10],
	['explorer', 9],
	['western', 3],
	['drama', 2],
	['thriller', 2],
	['love', 1],
	['comedy', 1]
];

export class MainGenreTable extends Table {
	constructor() {
		const entries = [] as TableEntry[];

		// Add weighted entries
		for (const [genre, weight] of mainGenresWithProbabilities) {
			// Add multiple entries based on weight to simulate probability
			for (let i = 0; i < weight; i++) {
				entries.push(new TableEntry(genre));
			}
		}

		super(entries, TableTitles.MainGenre);
		this.tableType = TableType.Other;
	}
}
