import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const hexFeatures = [
	'swamp',
	'forest',
	'hills',
	'jungle',
	'marsh',
	'oasis',
	'atoll',
	'ice'
];

export class HexFeatureTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		hexFeatures.forEach((feature) => {
			entries.push(new TableEntry(feature));
		});
		super(entries, TableTitles.HexFeature);
		this.tableType = TableType.Location;
	}
}

export { hexFeatures };
