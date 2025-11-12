import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class EntranceAdjectiveTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('open'));
		entries.push(new TableEntry('locked'));
		entries.push(new TableEntry('blocked'));
		entries.push(new TableEntry('hidden'));
		entries.push(new TableEntry('sealed'));
		entries.push(new TableEntry('crumbling'));
		entries.push(new TableEntry('narrow'));
		entries.push(new TableEntry('vast'));
		entries.push(new TableEntry('enchanted'));
		entries.push(new TableEntry('guarded'));
		entries.push(new TableEntry('forbidden'));
		entries.push(new TableEntry('secret'));
		entries.push(new TableEntry('mystical'));
		entries.push(new TableEntry('invisible'));
		entries.push(new TableEntry('ancient'));
		entries.push(new TableEntry('decaying'));
		entries.push(new TableEntry('overgrown'));
		entries.push(new TableEntry('fortified'));
		entries.push(new TableEntry('collapsing'));
		entries.push(new TableEntry('shrouded'));
		entries.push(new TableEntry('concealed'));

		super(entries, TableTitles.EntranceAdjective, TableType.Dungeon);
	}
}
