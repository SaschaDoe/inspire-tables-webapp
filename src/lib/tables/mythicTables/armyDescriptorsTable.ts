import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class ArmyDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Large','Small','Elite','Ragtag','Professional','Militia','Regular','Irregular','Disciplined','Undisciplined','Well-Equipped','Poorly-Equipped','Well-Trained','Untrained','Experienced','Green','Veteran','Rookie','Organized','Disorganized','Unified','Fractured','Motivated','Demoralized','Aggressive','Defensive','Offensive','Cautious','Reckless','Strategic','Tactical','Mobile','Stationary','Fast','Slow','Heavy','Light','Infantry','Cavalry','Artillery','Mixed','Specialized','General','Modern','Ancient','Medieval','Futuristic','Magical','Mundane','Armored','Unarmored','Mounted','Foot','Mechanized','Organic','Volunteer','Conscript','Mercenary','Standing','Siege','Field','Garrison','Expeditionary','Invading','Defending','Occupying','Liberating','Conquering','Retreating','Advancing','Flanking','Encircling','Besieging','Sallying','Skirmishing','Raiding','Patrolling','Marching','Camping','Resting','Fighting','Victorious','Defeated','Retreating','Rallying','Regrouping','Scattering','Routing','Holding','Charging','Withdrawing','Counterattacking','Ambushing','Pursuing','Fleeing','Surrendering'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicArmyDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
