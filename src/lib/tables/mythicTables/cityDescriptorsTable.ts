import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class CityDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Bustling','Quiet','Crowded','Empty','Rich','Poor','Clean','Dirty','Ancient','Modern','Walled','Open','Coastal','Inland','Hilltop','Valley','Riverside','Desert','Fortified','Undefended','Prosperous','Declining','Growing','Shrinking','Diverse','Homogeneous','Orderly','Chaotic','Peaceful','Violent','Beautiful','Ugly','Grand','Humble','Industrial','Agricultural','Commercial','Residential','Religious','Secular','Democratic','Authoritarian','Free','Oppressed','Safe','Dangerous','Bright','Dark','Colorful','Gray','Artistic','Utilitarian','Historic','Contemporary','Preserved','Decaying','Renovated','Abandoned','Populated','Sparse','Dense','Sprawling','Compact','Planned','Organic','Grid-Like','Winding','Multi-Level','Flat','Underground','Elevated','Maritime','Mountain','Forest','Plains','Tropical','Arctic','Temperate','Arid','Humid','Dry','Foggy','Clear','Polluted','Pristine','Technological','Primitive','Magical','Mundane','Exotic','Familiar','Friendly','Hostile','Welcoming','Unwelcoming','Vibrant','Lifeless','Thriving','Stagnant','Innovative','Traditional'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicCityDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
