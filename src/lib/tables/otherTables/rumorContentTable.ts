import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RumorContentTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('a hidden treasure is buried nearby'));
		entries.push(new TableEntry('a powerful person is planning something'));
		entries.push(new TableEntry('a monster has been sighted'));
		entries.push(new TableEntry('a stranger arrived in town'));
		entries.push(new TableEntry('someone disappeared mysteriously'));
		entries.push(new TableEntry('a curse has befallen the land'));
		entries.push(new TableEntry('an ancient prophecy is coming true'));
		entries.push(new TableEntry('a conspiracy is afoot'));
		entries.push(new TableEntry('a war is approaching'));
		entries.push(new TableEntry('a plague is spreading'));
		entries.push(new TableEntry('a ghost haunts the old ruins'));
		entries.push(new TableEntry('a secret passage exists'));
		entries.push(new TableEntry('a forbidden romance is happening'));
		entries.push(new TableEntry('a rival faction is gathering strength'));
		entries.push(new TableEntry('a magical artefact was discovered'));
		entries.push(new TableEntry('an assassination is being planned'));
		entries.push(new TableEntry('a powerful ally seeks partnership'));
		entries.push(new TableEntry('a traitor lives among us'));
		entries.push(new TableEntry('a dark ritual was performed'));
		entries.push(new TableEntry('a hero will soon arrive'));
		super(entries, TableTitles.RumorContent);
		this.tableType = TableType.Other;
	}
}
