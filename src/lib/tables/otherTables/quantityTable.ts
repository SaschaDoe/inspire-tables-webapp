import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const quantities = ['none', 'few', 'some', 'many', 'all'];

export class QuantityTable extends Table {
	constructor() {
		const entries = quantities.map((q) => new TableEntry(q));
		super(entries, TableTitles.Quantity);
	}
}
