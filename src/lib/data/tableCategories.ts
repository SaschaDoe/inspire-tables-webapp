import { TableType } from '$lib/tables/tableType';
import type { Table } from '$lib/tables/table';

// Character tables
import { GenderTable } from '$lib/tables/charTables/genderTable';
import { RaceTable } from '$lib/tables/charTables/raceTable';
import { ProfessionTable } from '$lib/tables/charTables/professionTable';
import { AlignmentTable } from '$lib/tables/charTables/alignmentTable';
import { MotivationTable } from '$lib/tables/charTables/motivationTable';
import { AdvantageTable } from '$lib/tables/charTables/advantageTable';
import { DisadvantageTable } from '$lib/tables/charTables/disadvantageTable';
import { SpecialFeaturesTable } from '$lib/tables/charTables/specialFeaturesTable';
import { CurseTable } from '$lib/tables/charTables/curseTable';
import { NobilityTable } from '$lib/tables/charTables/nobilityTable';
import { CharacterAsDeviceTable } from '$lib/tables/charTables/characterAsDeviceTable';

// Location tables
import { ContinentTable } from '$lib/tables/locationTables/continentTable';
import { LandscapeTable } from '$lib/tables/locationTables/landscapeTable';
import { BuildingTable } from '$lib/tables/locationTables/buildingTable';
import { SphereTable } from '$lib/tables/locationTables/sphereTable';

// Dungeon tables
import { StructureTable } from '$lib/tables/dungeonTables/structureTable';
import { DungeonEntriesTable } from '$lib/tables/dungeonTables/dungeonEntriesTable';
import { FurnishingTable } from '$lib/tables/dungeonTables/furnishingTable';
import { ObstacleTable } from '$lib/tables/dungeonTables/obstacleTable';
import { TrapTable } from '$lib/tables/dungeonTables/trapTable';
import { TransitionTable } from '$lib/tables/dungeonTables/transitionTable';

// Artefact tables
import { ArtefactTable } from '$lib/tables/artefactTables/artefactTable';
import { ProfaneArtefactTable } from '$lib/tables/artefactTables/profaneArtefactTable';
import { TreasureTable } from '$lib/tables/artefactTables/treasureTable';
import { MaterialsTable } from '$lib/tables/artefactTables/materialsTable';
import { ArtworkTable } from '$lib/tables/artefactTables/artworkTable';

// Talent tables
import { TalentTable } from '$lib/tables/talentTables/talentTable';
import { MagicalTalentTable } from '$lib/tables/talentTables/magicalTalentTable';
import { ProfaneTalentTable } from '$lib/tables/talentTables/profaneTalentTable';
import { CraftTable } from '$lib/tables/talentTables/craftTable';
import { AthleticsTalentTable } from '$lib/tables/talentTables/athleticsTalentTable';
import { ArtistTalentTable } from '$lib/tables/talentTables/artistTalentTable';

// Monster tables
import { MonsterEncounterTypeTable } from '$lib/tables/monsterTables/monsterEncounterTypeTable';

// Adventure tables
import { AdventureEventTable } from '$lib/tables/adventureTables/adventureEventTable';

// Culture tables
import { RealCultureTable } from '$lib/tables/cultureTables/realCultureTable';

// Other tables
import { RarityTable } from '$lib/tables/otherTables/rarityTable';
import { QualityTable } from '$lib/tables/otherTables/qualityTable';
import { ColourTable } from '$lib/tables/otherTables/colourTable';
import { PositionTable } from '$lib/tables/otherTables/positionTable';
import { HistoricalEventTable } from '$lib/tables/otherTables/historicalEventTable';
import { FractionNameTable } from '$lib/tables/otherTables/fractionNameTable';
import { FractionWealthTable } from '$lib/tables/otherTables/fractionWealthTable';
import { FractionQuestTable } from '$lib/tables/otherTables/fractionQuestTable';

// Name tables
import { GermanMaleNameTable } from '$lib/tables/nameTables/germanMaleNameTable';
import { GermanFemaleNameTable } from '$lib/tables/nameTables/germanFemaleNameTable';

export interface TableCategory {
	type: TableType;
	name: string;
	tables: Table[];
}

export const tableCategories: TableCategory[] = [
	{
		type: TableType.Character,
		name: 'Character',
		tables: [
			new GenderTable(),
			new RaceTable(),
			new ProfessionTable(),
			new AlignmentTable(),
			new MotivationTable(),
			new AdvantageTable(),
			new DisadvantageTable(),
			new SpecialFeaturesTable(),
			new CurseTable(),
			new NobilityTable(),
			new CharacterAsDeviceTable(),
			new GermanMaleNameTable(),
			new GermanFemaleNameTable()
		]
	},
	{
		type: TableType.Location,
		name: 'Location',
		tables: [
			new ContinentTable(),
			new LandscapeTable(),
			new BuildingTable(),
			new SphereTable()
		]
	},
	{
		type: TableType.Dungeon,
		name: 'Dungeon',
		tables: [
			new StructureTable(),
			new DungeonEntriesTable(),
			new FurnishingTable(),
			new ObstacleTable(),
			new TrapTable(),
			new TransitionTable()
		]
	},
	{
		type: TableType.Artefact,
		name: 'Artefact',
		tables: [
			new ArtefactTable(),
			new ProfaneArtefactTable(),
			new TreasureTable(),
			new MaterialsTable(),
			new ArtworkTable()
		]
	},
	{
		type: TableType.Talent,
		name: 'Talent',
		tables: [
			new TalentTable(),
			new MagicalTalentTable(),
			new ProfaneTalentTable(),
			new CraftTable(),
			new AthleticsTalentTable(),
			new ArtistTalentTable()
		]
	},
	{
		type: TableType.Monster,
		name: 'Monster',
		tables: [new MonsterEncounterTypeTable()]
	},
	{
		type: TableType.Adventure,
		name: 'Adventure',
		tables: [new AdventureEventTable()]
	},
	{
		type: TableType.Culture,
		name: 'Culture',
		tables: [new RealCultureTable()]
	},
	{
		type: TableType.Other,
		name: 'Other',
		tables: [
			new RarityTable(),
			new QualityTable(),
			new ColourTable(),
			new PositionTable(),
			new HistoricalEventTable(),
			new FractionNameTable(),
			new FractionWealthTable(),
			new FractionQuestTable()
		]
	}
];
