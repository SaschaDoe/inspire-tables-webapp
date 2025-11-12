import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const dungeonCreationEvents: string[] = [
	'mining',
	'protection',
	'grave for a king',
	'natural caves',
	'disaster shelter',
	'ancient ruins',
	'secret hideout',
	'magical experiment',
	'prison complex',
	'treasure vault',
	'forbidden rituals',
	'lost city',
	'war bunker',
	'smugglers\' den',
	'cultist temple',
	'cultist hideout',
	'bandit stronghold',
	'prison',
	'monster lair',
	'treasure cache',
	'secret laboratory',
	'magical archive',
	'refugee camp',
	'underground market',
	'rebel base',
	'forbidden library',
	'necromancer\'s sanctum',
	'ancient ruins museum',
	'subterranean farm',
	'haunted grounds',
	'alchemy workshop',
	'training grounds',
	'crypt',
	'hero\'s proving ground'
];

export class DungeonPurposeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let purpose of dungeonCreationEvents) {
			entries.push(new TableEntry(purpose));
		}
		super(entries, TableTitles.DungeonPurpose, TableType.Dungeon);
	}
}
