import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const livablePlanetTypes = ['earth-like', 'desert', 'ice', 'water', 'jungle'];

export class LivablePlanetTypeTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('earth-like').withRoleInterval(1, 7),
			new TableEntry('desert').withRoleInterval(8, 8),
			new TableEntry('water').withRoleInterval(9, 9),
			new TableEntry('jungle').withRoleInterval(10, 10),
			new TableEntry('ice').withRoleInterval(11, 11)
		];
		super(entries, TableTitles.LivablePlanetType);
		this.tableType = TableType.Other;
	}
}
