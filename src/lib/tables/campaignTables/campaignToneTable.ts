import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const tones: string[] = [
	'Dark',
	'Light-hearted',
	'Epic',
	'Gritty',
	'Heroic',
	'Noir',
	'Comedic',
	'Serious',
	'Tragic',
	'Whimsical',
	'Gothic',
	'Pulp',
	'Mythic',
	'Cynical',
	'Hopeful'
];

export class CampaignToneTable extends Table {
	constructor() {
		const entries = tones.map((tone) => new TableEntry(tone));
		super(entries, TableTitles.CampaignTone);
		this.tableType = TableType.Other;
	}
}
