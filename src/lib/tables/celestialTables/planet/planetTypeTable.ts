import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';
import { DiceRole } from '../../diceRole';

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
		super(entries, TableTitles.LivablePlanetType, TableType.Other, new DiceRole(1, 11, 0));
	}
}

export class AllPlanetTypeTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('earth-like').withRoleInterval(1, 3),
			new TableEntry('desert').withRoleInterval(4, 5),
			new TableEntry('water').withRoleInterval(6, 6),
			new TableEntry('jungle').withRoleInterval(7, 7),
			new TableEntry('ice').withRoleInterval(8, 9),
			new TableEntry('volcanic').withRoleInterval(10, 10),
			new TableEntry('gas giant').withRoleInterval(11, 13),
			new TableEntry('barren').withRoleInterval(14, 15)
		];
		super(entries, TableTitles.PlanetType, TableType.Other, new DiceRole(1, 15, 0));
	}
}
