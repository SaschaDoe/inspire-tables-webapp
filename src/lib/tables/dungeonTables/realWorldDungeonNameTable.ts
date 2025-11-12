import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const realWorldDungeonNames: string[] = [
	'castle',
	'prison',
	'space station',
	'monastery',
	'underground bunker',
	'abandoned amusement park',
	'deep-sea research facility',
	'museum',
	'jungle ruins',
	'ghost town',
	'abandoned factory',
	'haunted house',
	'ancient temple',
	'secret laboratory',
	'military base',
	'catacombs',
	'old library',
	'shipwreck',
	'lighthouse',
	'mountain summit',
	'pyramid',
	'colosseum',
	'ancient city',
	'ziggurat',
	'stone circle',
	'roman villa',
	'pharaoh\'s tomb',
	'hanging gardens',
	'sphinx monument',
	'ancient observatory',
	'supermarket',
	'house',
	'cinema',
	'shopping mall',
	'skyscraper',
	'school',
	'hospital',
	'library',
	'train station',
	'airport',
	'office building',
	'hotel',
	'stadium',
	'museum',
	'park',
	'zoo',
	'subway station',
	'cafe',
	'gym',
	'art gallery'
];

export class RealWorldDungeonNameTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let name of realWorldDungeonNames) {
			entries.push(new TableEntry(name));
		}
		super(entries, TableTitles.RealWorldDungeonName, TableType.Name);
	}
}
