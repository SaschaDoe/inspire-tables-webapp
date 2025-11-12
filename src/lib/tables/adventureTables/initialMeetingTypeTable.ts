import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class InitialMeetingTypeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('chance encounter'));
		entries.push(new TableEntry('arranged meeting'));
		entries.push(new TableEntry('rescue situation'));
		entries.push(new TableEntry('business transaction'));
		entries.push(new TableEntry('social gathering'));
		entries.push(new TableEntry('accidental collision'));
		entries.push(new TableEntry('mutual friend introduction'));
		entries.push(new TableEntry('workplace encounter'));
		entries.push(new TableEntry('emergency situation'));
		entries.push(new TableEntry('competitive event'));
		entries.push(new TableEntry('shared transportation'));
		entries.push(new TableEntry('mistaken identity'));
		entries.push(new TableEntry('helping stranger'));
		entries.push(new TableEntry('confrontation'));
		entries.push(new TableEntry('shared mission'));
		entries.push(new TableEntry('reunion'));
		entries.push(new TableEntry('inheritance matter'));
		entries.push(new TableEntry('mysterious summons'));
		entries.push(new TableEntry('mutual acquaintance'));
		entries.push(new TableEntry('shared danger'));
		entries.push(new TableEntry('festival or celebration'));
		entries.push(new TableEntry('educational setting'));
		entries.push(new TableEntry('religious gathering'));
		entries.push(new TableEntry('political event'));
		entries.push(new TableEntry('criminal activity'));
		entries.push(new TableEntry('magical incident'));
		entries.push(new TableEntry('prophecy fulfillment'));
		entries.push(new TableEntry('quest beginning'));
		entries.push(new TableEntry('sanctuary seeking'));
		entries.push(new TableEntry('information exchange'));

		super(entries, TableTitles.InitialMeetingType, TableType.Adventure);
	}
}
