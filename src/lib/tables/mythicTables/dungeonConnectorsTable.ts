/**
 * Dungeon Connectors Table (Mythic Magazine Volume 3)
 * Generate connections between dungeon areas (hallways, passages, etc.)
 */

export interface DungeonConnector {
	roll: number;
	cavern: string;
	ancient: string;
	palatial: string;
}

const DUNGEON_CONNECTORS: DungeonConnector[] = [
	{
		roll: 1,
		cavern: 'Simple cavern tunnel',
		ancient: 'Simple hallway',
		palatial: 'Simple hallway'
	},
	{
		roll: 6,
		cavern: 'Natural downward slope',
		ancient: 'Stairs going down',
		palatial: 'Stairs going down'
	},
	{
		roll: 9,
		cavern: 'Natural upward slope',
		ancient: 'Stairs going up',
		palatial: 'Stairs going up'
	},
	{
		roll: 10,
		cavern: 'Hole above you',
		ancient: 'Hole above you',
		palatial: 'Simple hallway'
	},
	{
		roll: 11,
		cavern: 'Walk space along the edge of a crevasse',
		ancient: 'Simple hallway',
		palatial: 'Balcony or gallery'
	},
	{
		roll: 12,
		cavern: 'Natural bridge',
		ancient: 'Rickety bridge',
		palatial: 'Bridge'
	},
	{
		roll: 13,
		cavern: 'Shaft going down',
		ancient: 'Well or hole in the floor',
		palatial: 'Simple hallway'
	},
	{
		roll: 16,
		cavern: 'Large cavern tunnel',
		ancient: 'Wide hallway',
		palatial: 'Grand, wide hallway'
	},
	{
		roll: 19,
		cavern: 'Cramped tunnel or crawlspace',
		ancient: 'Simple hallway',
		palatial: 'Simple hallway'
	},
	{
		roll: 21,
		cavern: 'Leads directly to another Area',
		ancient: 'Leads directly to another Area',
		palatial: 'Leads directly to another Area'
	},
	{
		roll: 31,
		cavern: 'Expected',
		ancient: 'Expected',
		palatial: 'Expected'
	},
	{
		roll: 41,
		cavern: 'Same',
		ancient: 'Same',
		palatial: 'Same'
	},
	{
		roll: 66,
		cavern: 'Same, with intersection',
		ancient: 'Same, with intersection',
		palatial: 'Same, with intersection'
	},
	{
		roll: 76,
		cavern: 'Same, with a curve or turn',
		ancient: 'Same, with a curve or turn',
		palatial: 'Same, with a curve or turn'
	},
	{
		roll: 81,
		cavern: 'Same, with a side Area',
		ancient: 'Same, with a side Area',
		palatial: 'Same, with a side Area'
	},
	{
		roll: 91,
		cavern: 'Roll on Descriptions Meaning Tables',
		ancient: 'Roll on Descriptions Meaning Tables',
		palatial: 'Roll on Descriptions Meaning Tables'
	}
];

// Track last connector for "Same" results
let lastConnectorResult: string | null = null;

export function rollDungeonConnector(
	dungeonType: 'Cavern Dungeon' | 'Ancient Dungeon' | 'Palatial Dungeon',
	roll: number = Math.floor(Math.random() * 100) + 1,
	isFirstConnector: boolean = false
): string {
	// Find the appropriate connector based on roll
	for (let i = 0; i < DUNGEON_CONNECTORS.length; i++) {
		const connector = DUNGEON_CONNECTORS[i];
		const nextRoll = DUNGEON_CONNECTORS[i + 1]?.roll || 101;

		if (roll >= connector.roll && roll < nextRoll) {
			// Determine which column to use
			let result: string;
			if (dungeonType === 'Cavern Dungeon') {
				result = connector.cavern;
			} else if (dungeonType === 'Ancient Dungeon') {
				result = connector.ancient;
			} else {
				result = connector.palatial;
			}

			// Handle special results
			if (result === 'Same') {
				// If first connector, treat as Expected
				if (isFirstConnector || !lastConnectorResult) {
					result = 'Expected';
				} else {
					result = lastConnectorResult;
				}
			} else if (result.startsWith('Same,')) {
				// Same with modification
				const modification = result.replace('Same, ', '');
				if (isFirstConnector || !lastConnectorResult) {
					result = `Expected, ${modification}`;
				} else {
					result = `${lastConnectorResult}, ${modification}`;
				}
			}

			// Store result for next "Same" roll (unless it's "Same" itself)
			if (!result.startsWith('Same')) {
				lastConnectorResult = result;
			}

			return result;
		}
	}

	return 'Simple passage';
}

// Reset connector tracking (call when starting new region/dungeon)
export function resetConnectorTracking(): void {
	lastConnectorResult = null;
}

// Helper to check if connector needs meaning table roll
export function requiresMeaningTableRoll(connector: string): boolean {
	return connector.includes('Roll on Descriptions Meaning Tables');
}

export { DUNGEON_CONNECTORS };
