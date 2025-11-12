import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const enemies: string[] = [
	'security guards',
	'mercenaries',
	'robbers',
	'corporate spies',
	'hackers',
	'rival gang members',
	'corrupt officials',
	'underground fighters',
	'illegal traders',
	'assassins',
	'pirates',
	'outlaws',
	'revolutionaries',
	'soldiers',
	'agents',
	'corrupted cops',
	'gang members',
	'lunatics'
];

export class RealWorldEnemyTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let enemy of enemies) {
			entries.push(new TableEntry(enemy));
		}
		super(entries, TableTitles.RealWorldEnemy, TableType.Dungeon);
	}
}
