/**
 * Dungeon Region Descriptors Table (Mythic Magazine Volume 3)
 * Generate physical appearance descriptors for dungeons
 */

export interface DungeonRegionDescriptor {
	roll: number;
	cavern: string;
	ancient: string;
	palatial: string;
}

const DUNGEON_REGION_DESCRIPTORS: DungeonRegionDescriptor[] = [
	{
		roll: 1,
		cavern: 'Dry and warm',
		ancient: 'Dry and warm',
		palatial: 'In good shape'
	},
	{
		roll: 6,
		cavern: 'Wet or moist',
		ancient: 'Wet or moist',
		palatial: 'In a jungle or wilderness'
	},
	{
		roll: 11,
		cavern: 'Mossy or fungi',
		ancient: 'Crumbling, in ruins',
		palatial: 'Crumbling, in ruins'
	},
	{
		roll: 16,
		cavern: 'Stalactites and stalagmites',
		ancient: 'Cobwebs',
		palatial: 'Cobwebs'
	},
	{
		roll: 21,
		cavern: 'Large and spacious',
		ancient: 'Large and spacious',
		palatial: 'Grand and imposing'
	},
	{
		roll: 26,
		cavern: 'Tight and cramped',
		ancient: 'Lots of stone work',
		palatial: 'Set in a desert or barren place'
	},
	{
		roll: 31,
		cavern: 'Cave-ins',
		ancient: 'Cave-ins',
		palatial: 'A once regal and opulent place'
	},
	{
		roll: 36,
		cavern: 'Active natural elements, such as flowing lava, underground river, rushing wind, etc.',
		ancient: 'Active natural elements, such as flowing lava, underground river, rushing wind, etc.',
		palatial: 'Active natural elements, such as a river flowing through it, windy, etc.'
	},
	{
		roll: 41,
		cavern: 'Thick with plant life',
		ancient: 'Thick with plant life',
		palatial: 'Thick with plant life'
	},
	{
		roll: 46,
		cavern: 'Cold',
		ancient: 'Cold',
		palatial: 'Cold'
	},
	{
		roll: 51,
		cavern: 'Set in a mountain',
		ancient: 'Set in a mountain',
		palatial: 'Set onto a mountain'
	},
	{
		roll: 56,
		cavern: 'Near a body of water',
		ancient: 'Near a body of water',
		palatial: 'Near a body of water'
	},
	{
		roll: 61,
		cavern: 'Roll on Ancient column',
		ancient: 'Roll on Cavern column',
		palatial: 'Roll on Ancient column'
	},
	{
		roll: 66,
		cavern: 'Roll on Palatial column',
		ancient: 'Roll on Palatial column',
		palatial: 'Roll on Cavern column'
	},
	{
		roll: 71,
		cavern: 'Animal noises inside',
		ancient: 'Within ancient ruins',
		palatial: 'Shrouded in mist'
	},
	{
		roll: 76,
		cavern: 'Near ancient ruins',
		ancient: 'In a jungle or wilderness',
		palatial: 'Active animal life around it'
	},
	{
		roll: 81,
		cavern: 'Difficult to travel through',
		ancient: 'Functional',
		palatial: 'Functional'
	},
	{
		roll: 86,
		cavern: 'In a jungle or wilderness',
		ancient: 'Specific purpose',
		palatial: 'Specific purpose'
	},
	{
		roll: 91,
		cavern: 'Exotic',
		ancient: 'Exotic',
		palatial: 'Exotic'
	},
	{
		roll: 96,
		cavern: 'Roll on Descriptions Meaning Tables',
		ancient: 'Roll on Descriptions Meaning Tables',
		palatial: 'Roll on Descriptions Meaning Tables'
	}
];

export function rollDungeonRegionDescriptor(
	dungeonType: 'Cavern Dungeon' | 'Ancient Dungeon' | 'Palatial Dungeon',
	roll: number = Math.floor(Math.random() * 100) + 1
): string {
	// Find the appropriate descriptor based on roll
	for (let i = 0; i < DUNGEON_REGION_DESCRIPTORS.length; i++) {
		const descriptor = DUNGEON_REGION_DESCRIPTORS[i];
		const nextRoll = DUNGEON_REGION_DESCRIPTORS[i + 1]?.roll || 101;

		if (roll >= descriptor.roll && roll < nextRoll) {
			// Determine which column to use
			let result: string;
			if (dungeonType === 'Cavern Dungeon') {
				result = descriptor.cavern;
			} else if (dungeonType === 'Ancient Dungeon') {
				result = descriptor.ancient;
			} else {
				result = descriptor.palatial;
			}

			// Handle cross-references
			if (result.startsWith('Roll on')) {
				const newRoll = Math.floor(Math.random() * 100) + 1;
				if (result.includes('Ancient')) {
					return rollDungeonRegionDescriptor('Ancient Dungeon', newRoll);
				} else if (result.includes('Cavern')) {
					return rollDungeonRegionDescriptor('Cavern Dungeon', newRoll);
				} else if (result.includes('Palatial')) {
					return rollDungeonRegionDescriptor('Palatial Dungeon', newRoll);
				}
			}

			return result;
		}
	}

	return 'Unremarkable appearance';
}

export { DUNGEON_REGION_DESCRIPTORS };
