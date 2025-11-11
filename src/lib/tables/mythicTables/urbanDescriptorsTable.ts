import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class UrbanDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Busy','Quiet','Crowded','Empty','Rich','Poor','Safe','Dangerous','Clean','Dirty','Modern','Historic','Industrial','Residential','Commercial','Mixed','Planned','Organic','Grid','Maze-Like','Wide-Streets','Narrow-Streets','Paved','Unpaved','Lit','Dark','Vibrant','Dull','Colorful','Gray','Diverse','Homogeneous','Multicultural','Isolated','Noisy','Silent','Polluted','Clean-Air','Smoggy','Clear','Foggy','Bright','Sunny','Rainy','Snowy','Hot','Cold','Temperate','Extreme','Friendly','Hostile','Welcoming','Unwelcoming','Open','Closed','Bustling','Sleepy','Active','Dormant','Thriving','Declining','Growing','Shrinking','Gentrified','Decaying','Renovated','Crumbling','New','Old','Ancient','Contemporary','Traditional','Progressive','Conservative','Liberal','Artistic','Utilitarian','Beautiful','Ugly','Elegant','Crude','Sophisticated','Simple','Complex','Confusing','Navigable','Difficult','Easy','Accessible','Remote','Central','Peripheral','Downtown','Uptown','Suburb','Slum','District','Neighborhood','Block','Plaza','Square','Market','Park','Garden'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicUrbanDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
