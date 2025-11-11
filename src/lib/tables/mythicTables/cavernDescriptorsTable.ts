import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class CavernDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Dark','Damp','Narrow','Wide','Deep','Shallow','Cold','Warm','Echoing','Silent','Winding','Straight','Rough','Smooth','Jagged','Rounded','High-Ceilinged','Low-Ceilinged','Natural','Carved','Ancient','Recent','Stable','Unstable','Dry','Wet','Muddy','Rocky','Sandy','Icy','Crystal','Glowing','Luminescent','Shadowy','Pitch-Black','Twilit','Foggy','Misty','Clear','Smoky','Sulfurous','Fresh','Stagnant','Flowing','Dripping','Flooded','Collapsed','Pristine','Decayed','Ruined','Hidden','Obvious','Secret','Exposed','Vertical','Horizontal','Sloping','Level','Tight','Spacious','Cramped','Vast','Tiny','Enormous','Branching','Linear','Maze-Like','Simple','Complex','Dangerous','Safe','Treacherous','Secure','Inhabited','Abandoned','Active','Dormant','Volcanic','Limestone','Granite','Sandstone','Marble','Basalt','Quartz','Mineral-Rich','Barren','Decorated','Plain','Mystical','Mundane','Sacred','Profane','Peaceful','Menacing','Beautiful','Ugly','Strange','Normal','Eerie','Welcoming'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicCavernDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
