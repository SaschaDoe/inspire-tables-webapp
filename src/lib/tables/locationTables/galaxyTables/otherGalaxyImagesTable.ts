import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

export const OtherGalaxyImages = [
	'CigarGalaxy.png',
	'MedusaGalaxy.png',
	'RedshiftGalaxy.png',
	'SpiralGalaxy.png',
	'HockeystickGalaxy.png',
	'nebular.png'
];

export class OtherGalaxyImagesTable extends Table {
	constructor() {
		const entries = OtherGalaxyImages.map((image) => new TableEntry(image));
		super(entries, TableTitles.OtherGalaxyImages);
		this.tableType = TableType.Location;
		this.subcategory = 'Galaxy';
	}
}
