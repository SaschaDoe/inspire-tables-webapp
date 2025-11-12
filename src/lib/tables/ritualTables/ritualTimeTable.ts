import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualTimeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('solstices'));
		entries.push(new TableEntry('equinoxes'));
		entries.push(new TableEntry('full moon'));
		entries.push(new TableEntry('new moon'));
		entries.push(new TableEntry('specific moon phases'));
		entries.push(new TableEntry('eclipses'));
		entries.push(new TableEntry('planetary alignments'));
		entries.push(new TableEntry('first day of seasons'));
		entries.push(new TableEntry('harvest time'));
		entries.push(new TableEntry('planting season'));
		entries.push(new TableEntry('first frost'));
		entries.push(new TableEntry('last snow'));
		entries.push(new TableEntry('births'));
		entries.push(new TableEntry('naming ceremonies'));
		entries.push(new TableEntry('coming-of-age rites'));
		entries.push(new TableEntry('deaths'));
		entries.push(new TableEntry('remembrance services'));
		entries.push(new TableEntry('foundation anniversaries'));
		entries.push(new TableEntry('significant battles'));
		entries.push(new TableEntry('notable historical events'));
		entries.push(new TableEntry('death or birth of a key figure'));
		entries.push(new TableEntry('weekly ceremonies'));
		entries.push(new TableEntry('monthly ceremonies'));
		entries.push(new TableEntry('annual ceremonies'));
		entries.push(new TableEntry('end-of-cycle events'));
		entries.push(new TableEntry('every few years'));
		entries.push(new TableEntry('dawn'));
		entries.push(new TableEntry('sunrise'));
		entries.push(new TableEntry('midday'));
		entries.push(new TableEntry('noon'));
		entries.push(new TableEntry('dusk'));
		entries.push(new TableEntry('sunset'));
		entries.push(new TableEntry('midnight'));
		entries.push(new TableEntry('nighttime under the stars'));
		entries.push(new TableEntry('after rare occurrences'));
		entries.push(new TableEntry('chosen by divination'));
		entries.push(new TableEntry('prompted by omens'));
		super(entries, TableTitles.RitualTime);
		this.tableType = TableType.Other;
	}
}
