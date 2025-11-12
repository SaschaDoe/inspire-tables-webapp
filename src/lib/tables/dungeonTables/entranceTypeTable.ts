import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class EntranceTypeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('door'));
		entries.push(new TableEntry('gate'));
		entries.push(new TableEntry('hole'));
		entries.push(new TableEntry('archway'));
		entries.push(new TableEntry('trapdoor'));
		entries.push(new TableEntry('tunnel'));
		entries.push(new TableEntry('staircase'));
		entries.push(new TableEntry('portal'));
		entries.push(new TableEntry('hatch'));
		entries.push(new TableEntry('shaft'));
		entries.push(new TableEntry('ladder'));
		entries.push(new TableEntry('chute'));
		entries.push(new TableEntry('stairwell'));
		entries.push(new TableEntry('corridor'));
		entries.push(new TableEntry('slide'));
		entries.push(new TableEntry('passageway'));
		entries.push(new TableEntry('latch'));
		entries.push(new TableEntry('crevice'));
		entries.push(new TableEntry('fissure'));
		entries.push(new TableEntry('vent'));

		super(entries, TableTitles.EntranceType, TableType.Dungeon);
	}
}
