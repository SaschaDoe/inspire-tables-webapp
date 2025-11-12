import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class MagicCostTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('no cost'),
			new TableEntry('time'),
			new TableEntry('doing something like meditating'),
			new TableEntry('money'),
			new TableEntry('life force'),
			new TableEntry('sacrifice something'),
			new TableEntry('sacrifice from own body'),
			new TableEntry('sanity'),
			new TableEntry('memories'),
			new TableEntry('soul'),
			new TableEntry('potion'),
			new TableEntry('go to specific place'),
			new TableEntry('confession'),
			new TableEntry('material'),
			new TableEntry('ingredients from flora'),
			new TableEntry('ingredients from animals')
		];
		super(entries, TableTitles.MagicCost, TableType.Other);
	}
}
