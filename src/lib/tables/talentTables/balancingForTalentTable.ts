import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const balancingWays = [
	'Scissors, Paper, Stone',
	'balanced',
	'unbalanced',
	'balanced but with a twist',
	'unbalanced but with a twist'
];

export class BalancingForTalentTable extends Table {
	constructor() {
		const entries = balancingWays.map((way) => new TableEntry(way));
		super(entries, TableTitles.BalancingForTalent, TableType.Talent);
	}
}
