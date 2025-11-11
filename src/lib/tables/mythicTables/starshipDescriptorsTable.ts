import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class StarshipDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Advanced','Primitive','Military','Civilian','Commercial','Private','Large','Small','Fast','Slow','Powerful','Weak','Armed','Unarmed','Shielded','Unshielded','Damaged','Intact','Old','New','Clean','Dirty','Maintained','Neglected','Efficient','Inefficient','Luxurious','Spartan','Cramped','Spacious','Bright','Dark','Quiet','Noisy','Smooth-Running','Malfunctioning','Automated','Manual','Crewed','Unmanned','Passenger','Cargo','Research','Exploration','Colony','War','Scout','Fighter','Cruiser','Dreadnought','Freighter','Transport','Shuttle','Yacht','Derelict','Active','Powered','Unpowered','Drifting','Moving','Stationary','Orbiting','Landing','Taking-Off','Jumping','Warping','Sublight','FTL','Hyperspace','Normal-Space','Cloaked','Visible','Stealthy','Obvious','Alien','Human','Hybrid','Unique','Standard','Custom','Modified','Original','Sleek','Bulky','Elegant','Crude','Aerodynamic','Blocky','Organic','Mechanical','Living','Artificial','Sentient','Non-Sentient','Haunted','Normal','Cursed','Blessed','Ancient-Tech','Modern-Tech'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicStarshipDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
