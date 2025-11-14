import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

export const EclipticGalaxyImages = [
	'Ecliptic1.png',
	'Ecliptic2.png',
	'ObjectGalaxy.png',
	'AndromedaGalaxy.png'
];

export class EclipticGalaxyImagesTable extends Table {
	constructor() {
		const entries = EclipticGalaxyImages.map((image) => new TableEntry(image));
		super(entries, TableTitles.EclipticGalaxyImages);
		this.tableType = TableType.Location;
		this.subcategory = 'Galaxy';
	}
}
