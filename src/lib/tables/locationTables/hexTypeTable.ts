import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const hexTypes = [
	'green',
	'plain',
	'mountain',
	'water',
	'desert',
	'tundra',
	'snow'
];

export class HexTypeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		hexTypes.forEach((type) => {
			entries.push(new TableEntry(type));
		});
		super(entries, TableTitles.HexType);
		this.tableType = TableType.Location;
	}
}

export { hexTypes };
