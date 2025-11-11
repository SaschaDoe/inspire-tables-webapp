import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class DungeonDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Ancient','Abandoned','Active','Dark','Lit','Damp','Dry','Cold','Warm','Natural','Constructed','Labyrinthine','Linear','Multi-Level','Single-Level','Trapped','Safe','Guarded','Unguarded','Inhabited','Empty','Dangerous','Benign','Magical','Mundane','Cursed','Blessed','Hidden','Obvious','Underground','Above-Ground','Ruined','Intact','Crumbling','Solid','Stone','Metal','Wood','Crystal','Bone','Ice','Lava','Water-Filled','Air-Filled','Smoke-Filled','Mist-Filled','Echo-y','Silent','Narrow','Wide','High-Ceilinged','Low-Ceilinged','Decorated','Plain','Carved','Natural','Furnished','Empty','Treasure-Filled','Barren','Monster-Infested','Peaceful','Hostile','Neutral','Sacred','Profane','Temple','Prison','Tomb','Fortress','Mine','Sewer','Catacombs','Vault','Laboratory','Library','Armory','Barracks','Treasury','Throne-Room','Ritual-Chamber','Storage','Living-Quarters','Kitchen','Workshop','Gallery','Museum','Archive','Sanctuary','Torture-Chamber','Arena','Garden','Observatory','Stable','Forge','Chapel','Infirmary'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicDungeonDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
