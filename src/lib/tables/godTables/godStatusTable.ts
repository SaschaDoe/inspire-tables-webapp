import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class GodStatusTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('alive'));
		entries.push(new TableEntry('slumbering'));
		entries.push(new TableEntry('imprisoned'));
		entries.push(new TableEntry('fading'));
		entries.push(new TableEntry('dead'));
		entries.push(new TableEntry('ascended'));
		entries.push(new TableEntry('fractured'));
		entries.push(new TableEntry('reincarnating'));
		entries.push(new TableEntry('exiled'));
		entries.push(new TableEntry('dormant'));
		entries.push(new TableEntry('sealed'));
		entries.push(new TableEntry('transcended'));
		entries.push(new TableEntry('waning'));
		entries.push(new TableEntry('fragmented'));
		entries.push(new TableEntry('veiled'));
		entries.push(new TableEntry('inverted'));
		entries.push(new TableEntry('displaced'));
		entries.push(new TableEntry('recovering'));
		entries.push(new TableEntry('manifesting'));
		entries.push(new TableEntry('retreating'));
		entries.push(new TableEntry('echoing'));
		entries.push(new TableEntry('evoking'));
		entries.push(new TableEntry('transforming'));
		entries.push(new TableEntry('intersecting'));
		entries.push(new TableEntry('cycling'));
		super(entries, TableTitles.GodStatus);
		this.tableType = TableType.Other;
	}
}
