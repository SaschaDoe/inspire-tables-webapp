/**
 * Dungeon Story Descriptors Table (Mythic Magazine Volume 3)
 * Generate the "why" behind a dungeon - its story and background
 */

export interface DungeonStoryDescriptor {
	roll: number;
	cavern: string;
	ancient: string;
	palatial: string;
}

const DUNGEON_STORY_DESCRIPTORS: DungeonStoryDescriptor[] = [
	{
		roll: 1,
		cavern: 'Home to something powerful and evil',
		ancient: 'Home to something powerful and evil',
		palatial: 'Home to something powerful and evil'
	},
	{
		roll: 6,
		cavern: 'Overrun by underground creatures',
		ancient: 'Originally built for evil purposes',
		palatial: 'Once a vibrant and important place, like the seat of a government'
	},
	{
		roll: 11,
		cavern: 'Appeared suddenly, like an earthquake opening a fissure or a landslide revealing a cave',
		ancient: 'Originally built for good purposes, such as a mining colony or underground city',
		palatial: 'The location has been appropriated for evil purposes'
	},
	{
		roll: 16,
		cavern: 'Known to be unstable inside',
		ancient: 'The place was brought to ruin by a calamity',
		palatial: 'The place was brought to ruin by a calamity'
	},
	{
		roll: 21,
		cavern: 'The source of monsters plaguing nearby towns',
		ancient: 'The source of monsters plaguing nearby towns',
		palatial: 'The source of monsters plaguing nearby towns'
	},
	{
		roll: 26,
		cavern: 'The place is associated with a particular group',
		ancient: 'The place is cursed',
		palatial: 'The place is cursed'
	},
	{
		roll: 31,
		cavern: 'Associated with a war or large scale conflict',
		ancient: 'The place is associated with a particular group',
		palatial: 'The place is associated with a particular group'
	},
	{
		roll: 36,
		cavern: 'Associated with magic',
		ancient: 'Associated with magic',
		palatial: 'Associated with decadence or corruption'
	},
	{
		roll: 41,
		cavern: 'The source of a mystery',
		ancient: 'The source of a mystery',
		palatial: 'Associated with magic'
	},
	{
		roll: 46,
		cavern: 'Associated with the undead',
		ancient: 'Associated with the undead',
		palatial: 'The source of a mystery'
	},
	{
		roll: 51,
		cavern: 'Home to a group or community of some kind',
		ancient: 'Known to be full of puzzles',
		palatial: 'Associated with the undead'
	},
	{
		roll: 56,
		cavern: 'Associated with a religion or cult',
		ancient: 'Home to a group or community of some kind',
		palatial: 'Associated with a ruler'
	},
	{
		roll: 61,
		cavern: 'A powerful object is housed within',
		ancient: 'Associated with a religion or cult',
		palatial: 'Home to a group or community of some kind'
	},
	{
		roll: 66,
		cavern: 'No one who has gone in has come out',
		ancient: 'A powerful object is housed within',
		palatial: 'Associated with a religion or cult'
	},
	{
		roll: 71,
		cavern: 'Related to stories going back centuries',
		ancient: 'No one who has gone in has come out',
		palatial: 'A powerful object is housed within'
	},
	{
		roll: 76,
		cavern: 'Known to be full of traps',
		ancient: 'Known to be full of traps',
		palatial: 'A great tragedy happened here once'
	},
	{
		roll: 81,
		cavern: 'Roll on Ancient column',
		ancient: 'Roll on Cavern column',
		palatial: 'Haunted'
	},
	{
		roll: 86,
		cavern: 'Roll on Palatial column',
		ancient: 'Roll on Palatial column',
		palatial: 'Roll on Ancient column'
	},
	{
		roll: 91,
		cavern: 'Exotic',
		ancient: 'Exotic',
		palatial: 'Exotic'
	},
	{
		roll: 96,
		cavern: 'Roll on Actions Meaning Tables',
		ancient: 'Roll on Actions Meaning Tables',
		palatial: 'Roll on Actions Meaning Tables'
	}
];

export function rollDungeonStoryDescriptor(
	dungeonType: 'Cavern Dungeon' | 'Ancient Dungeon' | 'Palatial Dungeon',
	roll: number = Math.floor(Math.random() * 100) + 1
): string {
	// Find the appropriate descriptor based on roll
	for (let i = 0; i < DUNGEON_STORY_DESCRIPTORS.length; i++) {
		const descriptor = DUNGEON_STORY_DESCRIPTORS[i];
		const nextRoll = DUNGEON_STORY_DESCRIPTORS[i + 1]?.roll || 101;

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
					return rollDungeonStoryDescriptor('Ancient Dungeon', newRoll);
				} else if (result.includes('Cavern')) {
					return rollDungeonStoryDescriptor('Cavern Dungeon', newRoll);
				} else if (result.includes('Palatial')) {
					return rollDungeonStoryDescriptor('Palatial Dungeon', newRoll);
				}
			}

			return result;
		}
	}

	return 'Mysterious origins';
}

export { DUNGEON_STORY_DESCRIPTORS };
