import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

// Combine all galaxy images from all three tables
export const AllGalaxyImages = [
	// Spiral galaxies
	'AndromedaGalaxy.png',
	'BlackEyeGalaxy.png',
	'FireworksGalaxy.png',
	'FireworksGalaxy2.png',
	'SpinwheelGalaxy.png',
	'WhirlpoolGalaxy.png',
	'spiralGalaxy2.png',
	// Ecliptic galaxies
	'Ecliptic1.png',
	'Ecliptic2.png',
	'ObjectGalaxy.png',
	// Other galaxies
	'CigarGalaxy.png',
	'MedusaGalaxy.png',
	'RedshiftGalaxy.png',
	'SpiralGalaxy.png',
	'HockeystickGalaxy.png',
	'nebular.png'
];

export class GalaxyImagesTable extends Table {
	constructor() {
		const entries = AllGalaxyImages.map((image) => new TableEntry(image));
		super(entries, TableTitles.GalaxyImages);
		this.tableType = TableType.Location;
		this.subcategory = 'Galaxy';
	}
}
