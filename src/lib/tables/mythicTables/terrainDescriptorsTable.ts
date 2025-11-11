import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class TerrainDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Flat','Hilly','Mountainous','Valley','Plain','Plateau','Rocky','Sandy','Muddy','Grassy','Forested','Barren','Fertile','Arid','Wet','Dry','Coastal','Inland','Elevated','Lowland','Rugged','Smooth','Rough','Even','Uneven','Level','Sloped','Steep','Gentle','Treacherous','Safe','Difficult','Easy','Impassable','Accessible','Remote','Populated','Wild','Cultivated','Natural','Artificial','Pristine','Damaged','Eroded','Solid','Unstable','Volcanic','Sedimentary','Metamorphic','Igneous','Limestone','Granite','Sandstone','Clay','Loam','Pebbled','Boulder-Strewn','Craggy','Rolling','Undulating','Terraced','Carved','Sculpted','Windswept','Sheltered','Exposed','Protected','Open','Covered','Vegetated','Bare','Lush','Sparse','Dense','Scattered','Uniform','Varied','Diverse','Monotonous','Colorful','Drab','Bright','Dark','Sunlit','Shadowed','Misted','Clear','Foggy','Cloudy','Stormy','Calm','Active','Dormant','Changing','Static','Dynamic','Stable','Shifting','Fixed','Permanent','Temporary','Seasonal','Year-Round'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicTerrainDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
