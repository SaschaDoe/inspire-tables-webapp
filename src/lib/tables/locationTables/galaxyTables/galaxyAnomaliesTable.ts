import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

export const GalaxyAnomalies = [
	'unusual star formation',
	'unusual radio waves',
	'unusual infrared waves',
	'unusual gamma waves',
	'artificial shape',
	'strange messages',
	'just emerged but is older than it should be',
	'unusual gravitational waves',
	'unusual magnetic waves',
	'two galaxies clashed long ago',
	'rift in space-time',
	'unusual dark matter',
	'unusual dark energy',
	'more mass than it should have',
	'lesser mass than it should have',
	'far away',
	'suns are fading',
	'suns are growing'
];

export class GalaxyAnomaliesTable extends Table {
	constructor() {
		const entries = GalaxyAnomalies.map((anomaly) => new TableEntry(anomaly));
		super(entries, TableTitles.GalaxyAnomalies);
		this.tableType = TableType.Location;
		this.subcategory = 'Galaxy';
	}
}
