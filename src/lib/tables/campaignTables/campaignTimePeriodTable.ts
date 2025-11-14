import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const timePeriods: string[] = [
	'Prehistoric',
	'Ancient',
	'Classical',
	'Medieval',
	'Renaissance',
	'Age of Exploration',
	'Industrial Revolution',
	'Victorian',
	'WWI Era',
	'WWII Era',
	'Cold War',
	'Modern',
	'Near Future',
	'Far Future',
	'Post-Apocalyptic',
	'Timeless'
];

export class CampaignTimePeriodTable extends Table {
	constructor() {
		const entries = timePeriods.map((period) => new TableEntry(period));
		super(entries, TableTitles.CampaignTimePeriod);
		this.tableType = TableType.Other;
	}
}
