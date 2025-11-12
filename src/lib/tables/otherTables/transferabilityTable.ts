import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export function transferToNumber(transfer: string): number {
	switch (transfer) {
		case 'transferable':
			return 10;
		case 'in certain situations transferable':
			return 5;
		case 'never transferable':
			return 0;
		default:
			return 0;
	}
}

export const transferabilities = [
	'transferable',
	'in certain situations transferable',
	'never transferable'
];

export class TransferabilityTable extends Table {
	constructor() {
		const entries = transferabilities.map((t) => new TableEntry(t));
		super(entries, TableTitles.Transferability);
	}
}
