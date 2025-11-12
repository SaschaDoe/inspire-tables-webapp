import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class ImprovementTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('training method'),
			new TableEntry('time'),
			new TableEntry('experience points per adventure'),
			new TableEntry('experience points per challenge'),
			new TableEntry('experience points per meta gaming'),
			new TableEntry('given from external source')
		];
		super(entries, TableTitles.Default);
	}
}
