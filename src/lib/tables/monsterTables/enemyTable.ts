import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { AnimalTable } from '../charTables/animalTable';
import { RaceTable } from '../charTables/raceTable';
import { MythicalCreatureTable } from './mythicalCreatureTable';

export class EnemyTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Mix of animals, races, and mythical creatures
		entries.push(new TableEntry('').withCascadingRole(new AnimalTable()));
		entries.push(new TableEntry('').withCascadingRole(new RaceTable()));
		entries.push(new TableEntry('').withCascadingRole(new MythicalCreatureTable()));
		super(entries, TableTitles.Enemy);
		this.tableType = TableType.Monster;
	}
}