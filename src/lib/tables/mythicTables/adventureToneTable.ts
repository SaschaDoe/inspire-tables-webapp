import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class AdventureToneTable extends Table {
	constructor() {
		const descriptors = ['Action-Packed','Mysterious','Dark','Light-Hearted','Serious','Comic','Tragic','Triumphant','Desperate','Hopeful','Grim','Cheerful','Tense','Relaxed','Fast-Paced','Slow-Burn','Intense','Mellow','Dramatic','Mundane','Epic','Intimate','Grand','Personal','Political','Apolitical','Romantic','Platonic','Heroic','Anti-Heroic','Noble','Cynical','Idealistic','Realistic','Fantastical','Grounded','Magical','Mundane','Supernatural','Natural','Horror','Adventure','Mystery','Romance','Comedy','Drama','Thriller','Suspense','Investigation','Exploration','Combat-Heavy','Roleplay-Heavy','Dungeon-Crawl','Wilderness-Trek','Urban-Adventure','Naval','Aerial','Underground','Planar','Time-Travel','Dimensional','Intrigue','Conspiracy','War','Peace','Survival','Prosperity','Poverty','Wealth','Social','Isolated','Community','Individualistic','Heroism','Villainy','Morally-Gray','Black-And-White','Nuanced','Simple','Complex','Straightforward','Twisted','Predictable','Surprising','Traditional','Innovative','Classic','Modern','Retro','Futuristic','Historical','Contemporary','Timeless','Period','Genre-Bending','Pure-Genre'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicAdventureTone, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
