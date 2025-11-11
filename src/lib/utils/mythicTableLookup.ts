// Mythic Table Lookup Utility
// Central system for rolling on any Mythic GME table

import { Dice } from './dice';
import type { EventFocus } from './eventFocus';

// Import all Mythic tables
import {
	// Actions & Descriptions
	ActionsTable1,
	ActionsTable2,
	DescriptionsTable1,
	DescriptionsTable2,
	// Core Elements
	CharactersElementsTable,
	LocationsElementsTable,
	ObjectsElementsTable,
	// Character Specialized
	CharacterAppearanceTable,
	CharacterBackgroundTable,
	CharacterConversationsTable,
	CharacterDescriptorsTable,
	CharacterIdentityTable,
	CharacterMotivationsTable,
	CharacterPersonalityTable,
	CharacterSkillsTable,
	CharacterTraitsFlawsTable,
	CharacterActionsCombatTable,
	CharacterActionsGeneralTable,
	// Location Specialized
	CavernDescriptorsTable,
	CityDescriptorsTable,
	CivilizationDescriptorsTable,
	DomicileDescriptorsTable,
	DungeonDescriptorsTable,
	ForestDescriptorsTable,
	TerrainDescriptorsTable,
	WastelandDescriptorsTable,
	StarshipDescriptorsTable,
	UrbanDescriptorsTable,
	// Creature Specialized
	AnimalActionsTable,
	CreatureDescriptorsTable,
	UndeadDescriptorsTable,
	AlienSpeciesDescriptorsTable,
	// Military & Objects
	ArmyDescriptorsTable,
	MagicItemDescriptorsTable,
	MutationDescriptorsTable,
	// Meta/Narrative
	AdventureToneTable,
	PlotTwistsTable
} from '$lib/tables/mythicTables';

/**
 * Result from rolling on a meaning table
 */
export interface MeaningRollResult {
	roll: number;
	result: string;
}

/**
 * Result from rolling twice on a meaning table (standard Mythic pattern)
 */
export interface TwoWordMeaningResult {
	roll1: number;
	word1: string;
	roll2: number;
	word2: string;
	tableName: string;
}

/**
 * Map of table names to table instances
 * Keys are human-readable names
 */
const TABLE_MAP = new Map([
	// Actions & Descriptions
	['Actions Table 1', new ActionsTable1()],
	['Actions Table 2', new ActionsTable2()],
	['Descriptions Table 1', new DescriptionsTable1()],
	['Descriptions Table 2', new DescriptionsTable2()],

	// Core Elements
	['Characters Elements', new CharactersElementsTable()],
	['Locations Elements', new LocationsElementsTable()],
	['Objects Elements', new ObjectsElementsTable()],

	// Character Specialized
	['Character Appearance', new CharacterAppearanceTable()],
	['Character Background', new CharacterBackgroundTable()],
	['Character Conversations', new CharacterConversationsTable()],
	['Character Descriptors', new CharacterDescriptorsTable()],
	['Character Identity', new CharacterIdentityTable()],
	['Character Motivations', new CharacterMotivationsTable()],
	['Character Personality', new CharacterPersonalityTable()],
	['Character Skills', new CharacterSkillsTable()],
	['Character Traits & Flaws', new CharacterTraitsFlawsTable()],
	['Character Actions (Combat)', new CharacterActionsCombatTable()],
	['Character Actions (General)', new CharacterActionsGeneralTable()],

	// Location Specialized
	['Cavern Descriptors', new CavernDescriptorsTable()],
	['City Descriptors', new CityDescriptorsTable()],
	['Civilization Descriptors', new CivilizationDescriptorsTable()],
	['Domicile Descriptors', new DomicileDescriptorsTable()],
	['Dungeon Descriptors', new DungeonDescriptorsTable()],
	['Forest Descriptors', new ForestDescriptorsTable()],
	['Terrain Descriptors', new TerrainDescriptorsTable()],
	['Wasteland Descriptors', new WastelandDescriptorsTable()],
	['Starship Descriptors', new StarshipDescriptorsTable()],
	['Urban Descriptors', new UrbanDescriptorsTable()],

	// Creature Specialized
	['Animal Actions', new AnimalActionsTable()],
	['Creature Descriptors', new CreatureDescriptorsTable()],
	['Undead Descriptors', new UndeadDescriptorsTable()],
	['Alien Species Descriptors', new AlienSpeciesDescriptorsTable()],

	// Military & Objects
	['Army Descriptors', new ArmyDescriptorsTable()],
	['Magic Item Descriptors', new MagicItemDescriptorsTable()],
	['Mutation Descriptors', new MutationDescriptorsTable()],

	// Meta/Narrative
	['Adventure Tone', new AdventureToneTable()],
	['Plot Twists', new PlotTwistsTable()]
]);

/**
 * Get all available meaning table names
 */
export function getAllMeaningTableNames(): string[] {
	return Array.from(TABLE_MAP.keys());
}

/**
 * Roll on a specific meaning table
 * @param tableName Human-readable table name
 * @param roll Optional specific roll (1-100), otherwise random
 * @returns Roll result with number and text
 */
export function rollOnMeaningTable(tableName: string, roll?: number): MeaningRollResult {
	const table = TABLE_MAP.get(tableName);

	if (!table) {
		throw new Error(`Table not found: ${tableName}`);
	}

	// Roll on the table
	const dice = new Dice();
	const result = table.role(dice);

	// For now, we'll use the Dice class's rollInterval for custom rolls
	// In the future, we could pass a specific roll to the table
	const actualRoll = roll || dice.rollInterval(1, 100);

	return {
		roll: actualRoll,
		result: result.text
	};
}

/**
 * Roll twice on a meaning table to get two words (standard Mythic pattern)
 * @param tableName Human-readable table name
 * @returns Two words from the table
 */
export function rollTwoMeaningWords(tableName: string): TwoWordMeaningResult {
	const table = TABLE_MAP.get(tableName);

	if (!table) {
		throw new Error(`Table not found: ${tableName}`);
	}

	const dice = new Dice();

	// Roll twice
	const result1 = table.role(dice);
	const result2 = table.role(dice);

	// Generate roll numbers (1-100)
	const roll1 = dice.rollInterval(1, 100);
	const roll2 = dice.rollInterval(1, 100);

	return {
		roll1,
		word1: result1.text,
		roll2,
		word2: result2.text,
		tableName
	};
}

/**
 * Get recommended meaning tables based on Event Focus
 * Returns the default suggestions from Mythic GME
 */
export function getRecommendedMeaningTables(focus: EventFocus): string[] {
	switch (focus) {
		case 'New NPC':
			return ['Character Descriptors', 'Character Identity', 'Character Appearance'];

		case 'NPC Action':
			return ['Character Actions (General)', 'Character Actions (Combat)', 'Actions Table 1'];

		case 'NPC Negative':
		case 'NPC Positive':
			return ['Character Descriptors', 'Character Personality', 'Actions Table 1'];

		case 'Move Toward A Thread':
		case 'Move Away From A Thread':
			return ['Actions Table 1', 'Descriptions Table 1', 'Locations Elements'];

		case 'Close A Thread':
			return ['Actions Table 1', 'Descriptions Table 1'];

		case 'PC Negative':
		case 'PC Positive':
			return ['Actions Table 1', 'Descriptions Table 1'];

		case 'Remote Event':
			return ['Actions Table 1', 'Locations Elements', 'Descriptions Table 1'];

		case 'Ambiguous Event':
			return ['Actions Table 2', 'Descriptions Table 2'];

		case 'Current Context':
			return ['Actions Table 1', 'Descriptions Table 1', 'Objects Elements'];

		default:
			return ['Actions Table 1', 'Descriptions Table 1'];
	}
}

/**
 * Get a description of why certain tables are recommended
 */
export function getTableRecommendationReason(focus: EventFocus): string {
	switch (focus) {
		case 'New NPC':
			return 'Use Character tables to describe the new NPC\'s appearance, identity, and traits.';

		case 'NPC Action':
			return 'Use Action tables to determine what the NPC is doing right now.';

		case 'NPC Negative':
			return 'Use Character and Action tables to describe something negative involving an NPC.';

		case 'NPC Positive':
			return 'Use Character and Action tables to describe something positive involving an NPC.';

		case 'Move Toward A Thread':
			return 'Use Action, Description, and Location tables to show progress toward a goal.';

		case 'Move Away From A Thread':
			return 'Use Action, Description, and Location tables to show a setback.';

		case 'Close A Thread':
			return 'Use Action and Description tables to resolve a story thread.';

		case 'PC Negative':
			return 'Use Action and Description tables for something bad happening to the PC.';

		case 'PC Positive':
			return 'Use Action and Description tables for something good happening to the PC.';

		case 'Remote Event':
			return 'Use Action, Location, and Description tables for an event happening elsewhere.';

		case 'Ambiguous Event':
			return 'Use Table 2 variants for mysterious or unclear events.';

		case 'Current Context':
			return 'Use Action, Description, and Objects tables to add details to the current scene.';

		default:
			return 'Use Actions and Descriptions tables for general event meaning.';
	}
}

/**
 * Check if a table name exists
 */
export function isValidTableName(tableName: string): boolean {
	return TABLE_MAP.has(tableName);
}

/**
 * Get table categories for UI organization
 */
export function getTableCategories() {
	return {
		'Actions & Descriptions': [
			'Actions Table 1',
			'Actions Table 2',
			'Descriptions Table 1',
			'Descriptions Table 2'
		],
		'Core Elements': [
			'Characters Elements',
			'Locations Elements',
			'Objects Elements'
		],
		'Character Details': [
			'Character Appearance',
			'Character Background',
			'Character Conversations',
			'Character Descriptors',
			'Character Identity',
			'Character Motivations',
			'Character Personality',
			'Character Skills',
			'Character Traits & Flaws',
			'Character Actions (Combat)',
			'Character Actions (General)'
		],
		'Location Details': [
			'Cavern Descriptors',
			'City Descriptors',
			'Civilization Descriptors',
			'Domicile Descriptors',
			'Dungeon Descriptors',
			'Forest Descriptors',
			'Terrain Descriptors',
			'Wasteland Descriptors',
			'Starship Descriptors',
			'Urban Descriptors'
		],
		'Creatures': [
			'Animal Actions',
			'Creature Descriptors',
			'Undead Descriptors',
			'Alien Species Descriptors'
		],
		'Objects & Items': [
			'Army Descriptors',
			'Magic Item Descriptors',
			'Mutation Descriptors'
		],
		'Meta & Narrative': [
			'Adventure Tone',
			'Plot Twists'
		]
	};
}
