import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const durations: string[] = [
	'One-Shot (1 session)',
	'Short (2-5 sessions)',
	'Medium (6-15 sessions)',
	'Long (16-30 sessions)',
	'Epic (30+ sessions)',
	'Ongoing'
];

export class CampaignDurationTable extends Table {
	constructor() {
		const entries = durations.map((duration) => new TableEntry(duration));
		super(entries, TableTitles.CampaignDuration);
		this.tableType = TableType.Other;
	}
}
