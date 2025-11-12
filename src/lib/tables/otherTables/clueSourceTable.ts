import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class ClueSourceTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('eyewitness testimony'));
		entries.push(new TableEntry('found personal item'));
		entries.push(new TableEntry('overheard conversation'));
		entries.push(new TableEntry('coded message'));
		entries.push(new TableEntry('ancient manuscript'));
		entries.push(new TableEntry('crime scene investigation'));
		entries.push(new TableEntry('local rumor or legend'));
		entries.push(new TableEntry('secret correspondence'));
		entries.push(new TableEntry('hidden compartment or safe'));
		entries.push(new TableEntry('found in a location'));
		entries.push(new TableEntry('forensic analysis'));
		entries.push(new TableEntry('cctv footage or magical equivalent'));
		entries.push(new TableEntry("informant's tip"));
		entries.push(new TableEntry('library or archive research'));
		entries.push(new TableEntry('interrogation of a suspect'));
		entries.push(new TableEntry('divination or magical insight'));
		entries.push(new TableEntry('tracking a person or creature'));
		entries.push(new TableEntry('analyzing a spell residue'));
		entries.push(new TableEntry('deciphering a cryptic map'));
		entries.push(new TableEntry('exploring an abandoned location'));
		entries.push(new TableEntry('studying a pattern of events'));
		super(entries, TableTitles.ClueSource);
		this.tableType = TableType.Other;
	}
}
