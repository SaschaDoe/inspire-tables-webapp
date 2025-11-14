import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const powerScales: string[] = [
	'Street Level',
	'City-wide',
	'Regional',
	'National',
	'Continental',
	'World-Threatening',
	'Planetary',
	'Cosmic',
	'Multiversal',
	'Divine'
];

export class CampaignPowerScaleTable extends Table {
	constructor() {
		const entries = powerScales.map((scale) => new TableEntry(scale));
		super(entries, TableTitles.CampaignPowerScale);
		this.tableType = TableType.Other;
	}
}
