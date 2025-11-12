import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class TracksTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('footprints'));
		entries.push(new TableEntry('broken twigs'));
		entries.push(new TableEntry('scattered leaves'));
		entries.push(new TableEntry('muddy trails'));
		entries.push(new TableEntry('drag marks'));
		entries.push(new TableEntry('blood drops'));
		entries.push(new TableEntry('scratches on trees'));
		entries.push(new TableEntry('disturbed dust'));
		entries.push(new TableEntry('torn fabric pieces'));
		entries.push(new TableEntry('dropped items'));
		entries.push(new TableEntry('creature droppings'));
		entries.push(new TableEntry('flattened grass'));
		entries.push(new TableEntry('etched symbols'));
		entries.push(new TableEntry('charred remains'));
		entries.push(new TableEntry('nesting areas'));
		entries.push(new TableEntry('abandoned campsites'));
		entries.push(new TableEntry('animal carcasses'));
		entries.push(new TableEntry('unusual odors'));
		entries.push(new TableEntry('faint sounds'));
		entries.push(new TableEntry('glowing footprints'));
		entries.push(new TableEntry('ethereal wisps'));
		entries.push(new TableEntry('frozen shadows'));
		entries.push(new TableEntry('illusory images'));
		entries.push(new TableEntry('sulfurous ash trails'));
		entries.push(new TableEntry('magical sparkles'));
		entries.push(new TableEntry('teleportation residues'));
		super(entries, TableTitles.Tracks);
		this.tableType = TableType.Monster;
	}
}
