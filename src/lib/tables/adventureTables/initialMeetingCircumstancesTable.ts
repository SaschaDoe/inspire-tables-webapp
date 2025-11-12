import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class InitialMeetingCircumstancesTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('during a storm'));
		entries.push(new TableEntry('at night'));
		entries.push(new TableEntry('in disguise'));
		entries.push(new TableEntry('under duress'));
		entries.push(new TableEntry('by accident'));
		entries.push(new TableEntry('as planned'));
		entries.push(new TableEntry('while fleeing danger'));
		entries.push(new TableEntry('during a battle'));
		entries.push(new TableEntry('in secret'));
		entries.push(new TableEntry('publicly'));
		entries.push(new TableEntry('unexpectedly'));
		entries.push(new TableEntry('after a long search'));
		entries.push(new TableEntry('through betrayal'));
		entries.push(new TableEntry('through coincidence'));
		entries.push(new TableEntry('through destiny'));
		entries.push(new TableEntry('while imprisoned'));
		entries.push(new TableEntry('while traveling'));
		entries.push(new TableEntry('at a crossroads'));
		entries.push(new TableEntry('in enemy territory'));
		entries.push(new TableEntry('in neutral ground'));
		entries.push(new TableEntry('through magical means'));
		entries.push(new TableEntry('through technology'));
		entries.push(new TableEntry('in dire circumstances'));
		entries.push(new TableEntry('in celebration'));
		entries.push(new TableEntry('through investigation'));
		entries.push(new TableEntry('by invitation'));
		entries.push(new TableEntry('by force'));
		entries.push(new TableEntry('through necessity'));
		entries.push(new TableEntry('through curiosity'));
		entries.push(new TableEntry('through duty'));

		super(entries, TableTitles.InitialMeetingCircumstances);
	}
}
