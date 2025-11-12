import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const dungeonTypes: string[] = [
	'crypt',
	'cavern',
	'catacombs',
	'fortress',
	'labyrinth',
	'tomb',
	'temple',
	'vault',
	'undercity',
	'stronghold',
	'castle',
	'palace',
	'underworld',
	'sanctum',
	'keep',
	'grotto',
	'mine',
	'ruins',
	'barrow',
	'hideout',
	'tower',
	'pit',
	'den',
	'lair',
	'maze',
	'cellar',
	'bastion',
	'hall',
	'chamber',
	'arena',
	'prison',
	'gallery',
	'library',
	'archive',
	'monastery',
	'alcove',
	'dome',
	'atrium',
	'pantheon',
	'observatory',
	'sepulcher',
	'reliquary',
	'shrine',
	'abbey',
	'bunker',
	'arcology',
	'citadel',
	'forest',
	'crystal',
	'fungi',
	'ice',
	'metropolis',
	'galleon',
	'volcano',
	'treetop',
	'mirror',
	'spaceship'
];

export class DungeonTypeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let type of dungeonTypes) {
			entries.push(new TableEntry(type));
		}
		super(entries, TableTitles.DungeonType, TableType.Dungeon);
	}
}
