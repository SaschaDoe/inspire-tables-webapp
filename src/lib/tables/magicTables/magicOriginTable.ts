import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const magicOrigins = ['born', 'chosen', 'learned', 'obtained'];

export class MagicOriginTable extends Table {
	constructor() {
		const entries = magicOrigins.map((origin) => new TableEntry(origin));
		super(entries, TableTitles.Default);
	}
}
