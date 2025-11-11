import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

/**
 * Mythic GME Event Focus Table
 * Used to determine what aspect of the adventure a Random Event involves
 */
export class EventFocusTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('Remote Event').withRoleInterval(1, 5),
			new TableEntry('Ambiguous Event').withRoleInterval(6, 10),
			new TableEntry('New NPC').withRoleInterval(11, 20),
			new TableEntry('NPC Action').withRoleInterval(21, 40),
			new TableEntry('NPC Negative').withRoleInterval(41, 45),
			new TableEntry('NPC Positive').withRoleInterval(46, 50),
			new TableEntry('Move Toward A Thread').withRoleInterval(51, 55),
			new TableEntry('Move Away From A Thread').withRoleInterval(56, 65),
			new TableEntry('Close A Thread').withRoleInterval(66, 70),
			new TableEntry('PC Negative').withRoleInterval(71, 80),
			new TableEntry('PC Positive').withRoleInterval(81, 85),
			new TableEntry('Current Context').withRoleInterval(86, 100)
		];

		super(entries, TableTitles.MythicEventFocus, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
