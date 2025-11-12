import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const blackBodyColors: string[] = [
	'red', // 0 - 999K
	'orange-red', // 1000 - 2999K
	'yellow', // 3000 - 4999K
	'white', // 5000 - 6499K
	'blue-white', // 6500 - 9999K
	'blue' // 10000K and above
];

export class BlackBodyColorTable extends Table {
	constructor() {
		const entries = blackBodyColors.map((color) => new TableEntry(color));
		super(entries, TableTitles.BlackBodyColor);
		this.tableType = TableType.Other;
	}
}
