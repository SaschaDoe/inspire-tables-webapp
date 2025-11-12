import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualInvocationTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('calling upon ancestral spirits'));
		entries.push(new TableEntry('chanting of sacred verses'));
		entries.push(new TableEntry('lighting ritual fires'));
		entries.push(new TableEntry('burning incense'));
		entries.push(new TableEntry('ringing temple bells'));
		entries.push(new TableEntry('pouring libations'));
		entries.push(new TableEntry('singing hymns of power'));
		entries.push(new TableEntry('reciting ancient spells'));
		entries.push(new TableEntry('dancing in sacred patterns'));
		entries.push(new TableEntry('drawing power symbols in the air'));
		entries.push(new TableEntry('summoning elemental forces'));
		entries.push(new TableEntry('invoking the four directions'));
		entries.push(new TableEntry('projecting prayers'));
		entries.push(new TableEntry('repeating mantras'));
		entries.push(new TableEntry('offering blessings'));
		entries.push(new TableEntry('binding spirits to artifacts'));
		entries.push(new TableEntry('consecrating tools'));
		entries.push(new TableEntry('uniting hands in a circle'));
		entries.push(new TableEntry('visualizing deities'));
		entries.push(new TableEntry('echoing the primordial sound'));
		super(entries, TableTitles.RitualInvocation);
		this.tableType = TableType.Other;
	}
}
