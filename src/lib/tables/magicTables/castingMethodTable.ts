import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class CastingMethodTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('saying spell name'),
			new TableEntry('gesture'),
			new TableEntry('emotional state'),
			new TableEntry('focusing energy'),
			new TableEntry('eye contact'),
			new TableEntry('breathing techniques'),
			new TableEntry('only with rituals'),
			new TableEntry('only with specific item'),
			new TableEntry('create item and use it sometimes'),
			new TableEntry('create item and use it once'),
			new TableEntry('cursing'),
			new TableEntry('profane talent method')
		];
		super(entries, TableTitles.CastingMethod, TableType.Other);
	}
}
