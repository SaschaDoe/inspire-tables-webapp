import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class ClueObjectTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Written
		entries.push(new TableEntry('small written like a note'));
		entries.push(new TableEntry('long written like a diary or website or a confession'));
		entries.push(new TableEntry('long and sealed like a computer with password or a diary with a lock'));
		entries.push(new TableEntry('small and sealed like a letter'));
		entries.push(new TableEntry('inconsistent or altered documents, like forged papers'));
		entries.push(new TableEntry('symbols or coded messages'));
		// Direct traces
		entries.push(new TableEntry('footprint'));
		entries.push(new TableEntry('hair'));
		entries.push(new TableEntry('blood'));
		entries.push(new TableEntry('fingerprints'));
		entries.push(new TableEntry('scratch marks'));
		entries.push(new TableEntry('dead body'));
		entries.push(new TableEntry('body part'));
		entries.push(new TableEntry('part of clothing'));
		entries.push(new TableEntry('symptoms of illness, drug use or magic'));
		entries.push(new TableEntry('symptoms of violence or struggle'));
		// Indirect traces
		entries.push(new TableEntry('something broken like glass or a door'));
		entries.push(new TableEntry('something missing like a body or a computer'));
		entries.push(new TableEntry('something out of place like a knife in a drawer'));
		entries.push(new TableEntry('something unusual like a strange smell or sound'));
		// Spoken
		entries.push(new TableEntry('eye witness accounts'));
		entries.push(new TableEntry('recording of a conversation'));
		entries.push(new TableEntry('rumor'));
		entries.push(new TableEntry('witness statements or overheard conversations'));
		// Other
		entries.push(new TableEntry('animal'));
		entries.push(new TableEntry('photograph'));
		entries.push(new TableEntry('video recording'));
		entries.push(new TableEntry('something purposefully hidden'));
		entries.push(new TableEntry('something obvious but leading to a conclusion'));
		entries.push(new TableEntry('personal belongings left behind'));
		entries.push(new TableEntry('digital traces like GPS data or browser history'));
		entries.push(new TableEntry('surveillance footage'));
		entries.push(new TableEntry('unusual purchases or transactions'));
		entries.push(new TableEntry('a sudden change in routine or behavior'));
		entries.push(new TableEntry('environmental evidence like soil or plant matter'));
		entries.push(new TableEntry('chemical residues or traces of substances'));
		entries.push(new TableEntry('an anomaly in timing'));
		entries.push(new TableEntry('changes in light or temperature'));
		entries.push(new TableEntry('unexplained power usage'));
		entries.push(new TableEntry('social media activity or lack thereof'));
		entries.push(new TableEntry('unusual behavior or mood change'));
		super(entries, TableTitles.ClueObject);
		this.tableType = TableType.Other;
	}
}
