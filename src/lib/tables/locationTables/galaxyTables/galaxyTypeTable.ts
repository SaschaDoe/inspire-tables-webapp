import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

export const GalaxyTypes = ['spiral', 'nebular', 'irregularity', 'ecliptic'];

export class GalaxyTypeTable extends Table {
	constructor() {
		const entries = GalaxyTypes.map((type) => new TableEntry(type));
		super(entries, TableTitles.GalaxyType);
		this.tableType = TableType.Location;
		this.subcategory = 'Galaxy';
	}
}
