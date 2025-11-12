import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const secondLevelUses = [
	'hireling',
	'magic scares people',
	'magic is a profession',
	'magic is a science',
	'magic is a sport',
	'magic is a study',
	'magic is for entertainment',
	'magic is for healing',
	'magic is for military',
	'magic is forbidden',
	'magic is free'
];

export class MagicSecondLevelUseTable extends Table {
	constructor() {
		const entries = secondLevelUses.map((use) => new TableEntry(use));
		super(entries, TableTitles.Default);
	}
}
