import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

export const SpiralGalaxyImages = [
	'AndromedaGalaxy.png',
	'BlackEyeGalaxy.png',
	'FireworksGalaxy.png',
	'FireworksGalaxy2.png',
	'SpinwheelGalaxy.png',
	'WhirlpoolGalaxy.png',
	'spiralGalaxy2.png'
];

export class SpiralGalaxyImagesTable extends Table {
	constructor() {
		const entries = SpiralGalaxyImages.map((image) => new TableEntry(image));
		super(entries, TableTitles.SpiralGalaxyImages);
		this.tableType = TableType.Location;
		this.subcategory = 'Galaxy';
	}
}
