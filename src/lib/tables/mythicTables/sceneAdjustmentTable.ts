import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

/**
 * Mythic GME Scene Adjustment Table
 * Used to determine how to modify an Altered Scene
 */
export class SceneAdjustmentTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('Remove A Character').withRoleInterval(1, 1),
			new TableEntry('Add A Character').withRoleInterval(2, 2),
			new TableEntry('Reduce/Remove An Activity').withRoleInterval(3, 3),
			new TableEntry('Increase An Activity').withRoleInterval(4, 4),
			new TableEntry('Remove An Object').withRoleInterval(5, 5),
			new TableEntry('Add An Object').withRoleInterval(6, 6),
			new TableEntry('Make 2 Adjustments').withRoleInterval(7, 10)
		];

		super(entries, TableTitles.MythicSceneAdjustment, TableType.SoloRPG, new DiceRole(1, 10));
	}
}
