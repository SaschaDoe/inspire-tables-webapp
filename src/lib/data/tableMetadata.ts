import { TableType } from '$lib/tables/tableType';
import { TableTitles } from '$lib/tables/tableTitles';

export interface TableMetadata {
	title: string;
	type: TableType;
	importPath: string;
	className: string;
}

export interface TableCategory {
	type: TableType;
	tables: TableMetadata[];
}

// Lightweight metadata - no actual table imports
export const tableMetadata: TableCategory[] = [
	{
		type: TableType.Character,
		tables: [
			{ title: TableTitles.Gender, type: TableType.Character, importPath: 'charTables/genderTable', className: 'GenderTable' },
			{ title: TableTitles.Race, type: TableType.Character, importPath: 'charTables/raceTable', className: 'RaceTable' },
			{ title: TableTitles.Profession, type: TableType.Character, importPath: 'charTables/professionTable', className: 'ProfessionTable' },
			{ title: TableTitles.Alignment, type: TableType.Character, importPath: 'charTables/alignmentTable', className: 'AlignmentTable' },
			{ title: TableTitles.Motivation, type: TableType.Character, importPath: 'charTables/motivationTable', className: 'MotivationTable' },
			{ title: TableTitles.Advantage, type: TableType.Character, importPath: 'charTables/advantageTable', className: 'AdvantageTable' },
			{ title: TableTitles.Disadvantage, type: TableType.Character, importPath: 'charTables/disadvantageTable', className: 'DisadvantageTable' },
			{ title: TableTitles.SpecialFeatures, type: TableType.Character, importPath: 'charTables/specialFeaturesTable', className: 'SpecialFeaturesTable' },
			{ title: TableTitles.Curse, type: TableType.Character, importPath: 'charTables/curseTable', className: 'CurseTable' },
			{ title: TableTitles.Nobility, type: TableType.Character, importPath: 'charTables/nobilityTable', className: 'NobilityTable' },
			{ title: TableTitles.CharacterAsDevice, type: TableType.Character, importPath: 'charTables/characterAsDeviceTable', className: 'CharacterAsDeviceTable' },
		]
	},
	{
		type: TableType.Location,
		tables: [
			{ title: TableTitles.Continent, type: TableType.Location, importPath: 'locationTables/continentTable', className: 'ContinentTable' },
			{ title: TableTitles.Landscape, type: TableType.Location, importPath: 'locationTables/landscapeTable', className: 'LandscapeTable' },
			{ title: TableTitles.Building, type: TableType.Location, importPath: 'locationTables/buildingTable', className: 'BuildingTable' },
			{ title: TableTitles.Sphere, type: TableType.Location, importPath: 'locationTables/sphereTable', className: 'SphereTable' },
		]
	},
	{
		type: TableType.Dungeon,
		tables: [
			{ title: TableTitles.Structure, type: TableType.Dungeon, importPath: 'dungeonTables/structureTable', className: 'StructureTable' },
			{ title: TableTitles.DungeonEntries, type: TableType.Dungeon, importPath: 'dungeonTables/dungeonEntriesTable', className: 'DungeonEntriesTable' },
			{ title: TableTitles.Furnishing, type: TableType.Dungeon, importPath: 'dungeonTables/furnishingTable', className: 'FurnishingTable' },
			{ title: TableTitles.Obstacle, type: TableType.Dungeon, importPath: 'dungeonTables/obstacleTable', className: 'ObstacleTable' },
			{ title: TableTitles.Trap, type: TableType.Dungeon, importPath: 'dungeonTables/trapTable', className: 'TrapTable' },
			{ title: TableTitles.Transition, type: TableType.Dungeon, importPath: 'dungeonTables/transitionTable', className: 'TransitionTable' },
		]
	},
	{
		type: TableType.Artefact,
		tables: [
			{ title: TableTitles.Artefact, type: TableType.Artefact, importPath: 'artefactTables/artefactTable', className: 'ArtefactTable' },
			{ title: TableTitles.ProfaneArtefact, type: TableType.Artefact, importPath: 'artefactTables/profaneArtefactTable', className: 'ProfaneArtefactTable' },
			{ title: TableTitles.Treasure, type: TableType.Artefact, importPath: 'artefactTables/treasureTable', className: 'TreasureTable' },
			{ title: TableTitles.Materials, type: TableType.Artefact, importPath: 'artefactTables/materialsTable', className: 'MaterialsTable' },
			{ title: TableTitles.Artwork, type: TableType.Artefact, importPath: 'artefactTables/artworkTable', className: 'ArtworkTable' },
		]
	},
	{
		type: TableType.Talent,
		tables: [
			{ title: TableTitles.Talent, type: TableType.Talent, importPath: 'talentTables/talentTable', className: 'TalentTable' },
			{ title: TableTitles.MagicalTalent, type: TableType.Talent, importPath: 'talentTables/magicalTalentTable', className: 'MagicalTalentTable' },
			{ title: TableTitles.ProfaneTalent, type: TableType.Talent, importPath: 'talentTables/profaneTalentTable', className: 'ProfaneTalentTable' },
			{ title: TableTitles.Craft, type: TableType.Talent, importPath: 'talentTables/craftTable', className: 'CraftTable' },
			{ title: TableTitles.AthleticsTalent, type: TableType.Talent, importPath: 'talentTables/athleticsTalentTable', className: 'AthleticsTalentTable' },
			{ title: TableTitles.ArtistTalent, type: TableType.Talent, importPath: 'talentTables/artistTalentTable', className: 'ArtistTalentTable' },
		]
	},
	{
		type: TableType.Monster,
		tables: [
			{ title: TableTitles.MonsterEncounterType, type: TableType.Monster, importPath: 'monsterTables/monsterEncounterTypeTable', className: 'MonsterEncounterTypeTable' },
		]
	},
	{
		type: TableType.Adventure,
		tables: [
			{ title: TableTitles.AdventureEvent, type: TableType.Adventure, importPath: 'adventureTables/adventureEventTable', className: 'AdventureEventTable' },
		]
	},
	{
		type: TableType.Town,
		tables: [
			{ title: TableTitles.TownEvent, type: TableType.Town, importPath: 'townTables/townEventTable', className: 'TownEventTable' },
			{ title: TableTitles.TownFame, type: TableType.Town, importPath: 'townTables/townFameTable', className: 'TownFameTable' },
		]
	},
	{
		type: TableType.Other,
		tables: [
			{ title: TableTitles.Rarity, type: TableType.Other, importPath: 'otherTables/rarityTable', className: 'RarityTable' },
			{ title: TableTitles.Quality, type: TableType.Other, importPath: 'otherTables/qualityTable', className: 'QualityTable' },
			{ title: TableTitles.Colour, type: TableType.Other, importPath: 'otherTables/colourTable', className: 'ColourTable' },
		]
	}
];

// Use Vite's glob import to create a map of all table modules
// This allows Vite to know all possible imports at build time
const tableModules = import.meta.glob('$lib/tables/**/*.ts');

// Helper function to lazy load a table
export async function loadTable(metadata: TableMetadata) {
	// Construct the full path that matches the glob pattern
	const modulePath = `/src/lib/tables/${metadata.importPath}.ts`;

	// Find the matching module
	const moduleLoader = tableModules[modulePath];

	if (!moduleLoader) {
		console.error('Available modules:', Object.keys(tableModules));
		throw new Error(`Could not find module for: ${modulePath}`);
	}

	const module = await moduleLoader();
	const TableClass = (module as any)[metadata.className];
	return new TableClass();
}
