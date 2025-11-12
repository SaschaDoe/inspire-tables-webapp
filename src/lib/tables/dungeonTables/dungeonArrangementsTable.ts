import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const dungeonRoomArrangements: string[] = [
	'linear pathway',
	'circular layout',
	'hub and spoke',
	'grid pattern',
	'maze-like',
	'multi-level',
	'open plan',
	'segmented sections',
	'intersecting pathways',
	'hidden rooms',
	'puzzle layout',
	'trapped corridors',
	'themed areas',
	'teleport chambers',
	'shifting layout',
	'sacred sanctuaries',
	'treasure vaults',
	'monster dens',
	'natural formations',
	'ruined sections'
];

export class DungeonRoomArrangementsTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let arrangement of dungeonRoomArrangements) {
			entries.push(new TableEntry(arrangement));
		}
		super(entries, TableTitles.DungeonRoomArrangement);
	}
}
