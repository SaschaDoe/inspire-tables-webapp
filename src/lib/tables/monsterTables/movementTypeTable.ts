import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class MovementTypeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('patrol along a fixed route'));
		entries.push(new TableEntry('random walk'));
		entries.push(new TableEntry('stationary guard'));
		entries.push(new TableEntry('follow the player at a distance'));
		entries.push(new TableEntry('ambush predator'));
		entries.push(new TableEntry('roam in a specific area'));
		entries.push(new TableEntry('flee on sight'));
		entries.push(new TableEntry('teleport randomly'));
		entries.push(new TableEntry('invisible stalker'));
		entries.push(new TableEntry('mimic objects or environment'));
		entries.push(new TableEntry('move between shadows'));
		entries.push(new TableEntry('climb on ceilings or walls'));
		entries.push(new TableEntry('dig or burrow underground'));
		entries.push(new TableEntry('chase the player aggressively'));
		entries.push(new TableEntry('move toward sounds or disturbances'));
		entries.push(new TableEntry('hibernate until disturbed'));
		super(entries, TableTitles.MovementType);
		this.tableType = TableType.Monster;
	}
}
