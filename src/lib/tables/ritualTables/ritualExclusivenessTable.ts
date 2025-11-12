import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualExclusivenessTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('members only'));
		entries.push(new TableEntry('initiates in training'));
		entries.push(new TableEntry('high priests and priestesses'));
		entries.push(new TableEntry('nobility and royalty'));
		entries.push(new TableEntry('chosen warriors'));
		entries.push(new TableEntry('seers and oracles'));
		entries.push(new TableEntry('those of pure heart'));
		entries.push(new TableEntry('bearers of the sacred mark'));
		entries.push(new TableEntry('elders and wise ones'));
		entries.push(new TableEntry('keepers of the ancient lore'));
		entries.push(new TableEntry('those who have passed the trials'));
		entries.push(new TableEntry('outsiders granted special permission'));
		entries.push(new TableEntry('children of the prophecy'));
		entries.push(new TableEntry('witnesses chosen by the gods'));
		entries.push(new TableEntry('sacred animals'));
		entries.push(new TableEntry('those who have given a vow of secrecy'));
		entries.push(new TableEntry('the magically adept'));
		entries.push(new TableEntry('spiritual pilgrims'));
		entries.push(new TableEntry('those who bear the sign of the covenant'));
		entries.push(new TableEntry('solemn oath-takers'));
		super(entries, TableTitles.RitualExclusiveness);
		this.tableType = TableType.Other;
	}
}
