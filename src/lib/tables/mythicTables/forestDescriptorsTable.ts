import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class ForestDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Dense','Sparse','Ancient','Young','Dark','Bright','Quiet','Noisy','Peaceful','Dangerous','Enchanted','Mundane','Primeval','Managed','Wild','Cultivated','Deep','Shallow','Vast','Small','Temperate','Tropical','Coniferous','Deciduous','Mixed','Pure','Overgrown','Cleared','Tangled','Open','Misty','Clear','Rainy','Dry','Humid','Arid','Lush','Barren','Verdant','Withered','Living','Dead','Healthy','Diseased','Natural','Corrupted','Sacred','Cursed','Hidden','Exposed','Remote','Accessible','Unexplored','Mapped','Mysterious','Familiar','Magical','Non-Magical','Inhabited','Uninhabited','Monster-Filled','Safe','Haunted','Normal','Twisted','Straight','Gnarled','Elegant','Brambled','Thorny','Flowering','Fruiting','Dormant','Active','Hibernating','Awakening','Sleeping','Vibrant','Dull','Colorful','Monochrome','Sunlit','Shadowy','Moonlit','Starlit','Foggy','Hazy','Smoky','Fresh','Stagnant','Flowing','Still','Serene','Turbulent','Calm','Stormy','Windswept','Sheltered','Protected','Vulnerable'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicForestDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
