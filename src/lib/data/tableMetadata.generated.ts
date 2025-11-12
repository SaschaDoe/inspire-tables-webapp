// THIS FILE IS AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run 'npm run generate:metadata' to regenerate this file
// Generated on: 2025-11-12T05:50:07.250Z

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
		"tables": [
			{
				title: TableTitles.Advantages as any as string,
				type: TableType.Character,
				"importPath": "charTables/advantageTable",
				"className": "AdvantageTable"
			},
			{
				title: TableTitles.Alignment as any as string,
				type: TableType.Character,
				"importPath": "charTables/alignmentTable",
				"className": "AlignmentTable"
			},
			{
				title: TableTitles.Animal as any as string,
				type: TableType.Character,
				"importPath": "charTables/animalTable",
				"className": "AnimalTable"
			},
			{
				title: TableTitles.Attitude as any as string,
				type: TableType.Character,
				"importPath": "charTables/attitudeTable",
				"className": "AttitudeTable"
			},
			{
				title: TableTitles.Attributes as any as string,
				type: TableType.Character,
				"importPath": "charTables/attributeTable",
				"className": "AttributeTable"
			},
			{
				title: TableTitles.BalancingForTalent as any as string,
				type: TableType.Character,
				"importPath": "talentTables/balancingForTalentTable",
				"className": "BalancingForTalentTable"
			},
			{
				title: TableTitles.CastingMethod as any as string,
				type: TableType.Character,
				"importPath": "magicTables/castingMethodTable",
				"className": "CastingMethodTable"
			},
			{
				title: TableTitles.CharacterAsDevice as any as string,
				type: TableType.Character,
				"importPath": "charTables/characterAsDeviceTable",
				"className": "CharacterAsDeviceTable"
			},
			{
				title: TableTitles.CharacterShadowArchetype as any as string,
				type: TableType.Character,
				"importPath": "charTables/characterShadowArchetypeTable",
				"className": "CharacterShadowArchetypeTable"
			},
			{
				title: TableTitles.ContinentName as any as string,
				type: TableType.Character,
				"importPath": "locationTables/continentNameTable",
				"className": "ContinentNameTable"
			},
			{
				title: TableTitles.Curse as any as string,
				type: TableType.Character,
				"importPath": "charTables/curseTable",
				"className": "CurseTable"
			},
			{
				title: TableTitles.Disadvantages as any as string,
				type: TableType.Character,
				"importPath": "charTables/disadvantageTable",
				"className": "DisadvantageTable"
			},
			{
				title: TableTitles.DungeonAdjective as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/dungeonAdjectiveTable",
				"className": "DungeonAdjectiveTable"
			},
			{
				title: TableTitles.DungeonName as any as string,
				type: TableType.Character,
				"importPath": "nameTables/dungeonNameTable",
				"className": "DungeonNameTable"
			},
			{
				title: TableTitles.DungeonPurpose as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/dungeonPurposeTable",
				"className": "DungeonPurposeTable"
			},
			{
				title: TableTitles.DungeonRoomArrangement as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/dungeonArrangementsTable",
				"className": "DungeonRoomArrangementsTable"
			},
			{
				title: TableTitles.DungeonState as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/dungeonStateTable",
				"className": "DungeonStateTable"
			},
			{
				title: TableTitles.DungeonType as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/dungeonTypeTable",
				"className": "DungeonTypeTable"
			},
			{
				title: TableTitles.ElfenFemaleName as any as string,
				type: TableType.Character,
				"importPath": "nameTables/elfenFemaleNameTable",
				"className": "ElfenFemaleNameTable"
			},
			{
				title: TableTitles.ElfenMaleName as any as string,
				type: TableType.Character,
				"importPath": "nameTables/elfenMaleNameTable",
				"className": "ElfenMaleNameTable"
			},
			{
				title: TableTitles.EntranceAdjective as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/entranceAdjectiveTable",
				"className": "EntranceAdjectiveTable"
			},
			{
				title: TableTitles.EntranceType as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/entranceTypeTable",
				"className": "EntranceTypeTable"
			},
			{
				title: TableTitles.EpicSubstantive as any as string,
				type: TableType.Character,
				"importPath": "nameTables/epicSubstantiveTable",
				"className": "EpicSubstantiveTable"
			},
			{
				title: TableTitles.FantasyCreatures as any as string,
				type: TableType.Character,
				"importPath": "charTables/fantasyCreatureTable",
				"className": "FantasyCreatureTable"
			},
			{
				title: TableTitles.FractionName as any as string,
				type: TableType.Character,
				"importPath": "factionTables/factionSecondNameTable",
				"className": "FactionSecondNameTable"
			},
			{
				title: TableTitles.FractionName as any as string,
				type: TableType.Character,
				"importPath": "factionTables/factionQuoteTable",
				"className": "FactionQuoteTable"
			},
			{
				title: TableTitles.FractionName as any as string,
				type: TableType.Character,
				"importPath": "factionTables/factionFirstNameTable",
				"className": "FactionFirstNameTable"
			},
			{
				title: TableTitles.FractionName as any as string,
				type: TableType.Character,
				"importPath": "factionTables/factionBeginningMotivationTable",
				"className": "FactionBeginningMotivationTable"
			},
			{
				title: TableTitles.FrenchFemaleName as any as string,
				type: TableType.Character,
				"importPath": "nameTables/frenchFemaleNameTable",
				"className": "FrenchFemaleNameTable"
			},
			{
				title: TableTitles.FrenchLastName as any as string,
				type: TableType.Character,
				"importPath": "nameTables/frenchLastNameTable",
				"className": "FrenchLastNameTable"
			},
			{
				title: TableTitles.FrenchMaleName as any as string,
				type: TableType.Character,
				"importPath": "nameTables/frenchMaleNameTable",
				"className": "FrenchMaleNameTable"
			},
			{
				title: TableTitles.FrenchPlaceNameTable as any as string,
				type: TableType.Character,
				"importPath": "nameTables/frenchPlaceNameTable",
				"className": "FrenchPlaceNameTable"
			},
			{
				title: TableTitles.Gender as any as string,
				type: TableType.Character,
				"importPath": "charTables/genderTable",
				"className": "GenderTable"
			},
			{
				title: TableTitles.GermanFemaleNames as any as string,
				type: TableType.Character,
				"importPath": "nameTables/germanFemaleNameTable",
				"className": "GermanFemaleNameTable"
			},
			{
				title: TableTitles.GermanMaleName as any as string,
				type: TableType.Character,
				"importPath": "nameTables/germanMaleNameTable",
				"className": "GermanMaleNameTable"
			},
			{
				title: TableTitles.HiddenDescription as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/hiddenDescriptionTable",
				"className": "HiddenDescriptionTable"
			},
			{
				title: TableTitles.Improvement as any as string,
				type: TableType.Character,
				"importPath": "talentTables/improvementTable",
				"className": "ImprovementTable"
			},
			{
				title: TableTitles.InitialMeetingCircumstances as any as string,
				type: TableType.Character,
				"importPath": "adventureTables/initialMeetingCircumstancesTable",
				"className": "InitialMeetingCircumstancesTable"
			},
			{
				title: TableTitles.InitialMeetingTone as any as string,
				type: TableType.Character,
				"importPath": "adventureTables/initialMeetingToneTable",
				"className": "InitialMeetingToneTable"
			},
			{
				title: TableTitles.InitialMeetingType as any as string,
				type: TableType.Character,
				"importPath": "adventureTables/initialMeetingTypeTable",
				"className": "InitialMeetingTypeTable"
			},
			{
				title: TableTitles.Knowledge as any as string,
				type: TableType.Character,
				"importPath": "otherTables/knowledgeTable",
				"className": "KnowledgeTable"
			},
			{
				title: TableTitles.Limitation as any as string,
				type: TableType.Character,
				"importPath": "talentTables/limitationForTalentTable",
				"className": "LimitationForTalentTable"
			},
			{
				title: TableTitles.LocationChangeEvent as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/locationChangeEventTable",
				"className": "LocationChangeEventTable"
			},
			{
				title: TableTitles.MagicAbility as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicAbilityTable",
				"className": "MagicAbilityTable"
			},
			{
				title: TableTitles.MagicAttribute as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicAttributeTable",
				"className": "MagicAttributeTable"
			},
			{
				title: TableTitles.MagicChannel as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicChannelTable",
				"className": "MagicChannelTable"
			},
			{
				title: TableTitles.MagicCost as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicCostTable",
				"className": "MagicCostTable"
			},
			{
				title: TableTitles.MagicDifferentiation as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicDifferentiationTable",
				"className": "MagicDifferentiationTable"
			},
			{
				title: TableTitles.MagicEvent as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicEventTable",
				"className": "MagicEventTable"
			},
			{
				title: TableTitles.MagicFailConsequence as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicFailConsequenceTable",
				"className": "MagicFailConsequenceTable"
			},
			{
				title: TableTitles.MagicFluff as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicFluffTable",
				"className": "MagicFluffTable"
			},
			{
				title: TableTitles.MagicOrigin as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicOriginTable",
				"className": "MagicOriginTable"
			},
			{
				title: TableTitles.MagicRule as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicRuleTable",
				"className": "MagicRuleTable"
			},
			{
				title: TableTitles.MagicSecondLevelUse as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSecondLevelUseTable",
				"className": "MagicSecondLevelUseTable"
			},
			{
				title: TableTitles.MagicSource as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSourceTable",
				"className": "MagicSourceTable"
			},
			{
				title: TableTitles.MagicSpellModifier as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSpellModifierTable",
				"className": "MagicSpellModifierTable"
			},
			{
				title: TableTitles.MagicSystemFantasyNameFirst as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSystemFantasyNameFirstTable",
				"className": "MagicSystemFantasyNameFirstTable"
			},
			{
				title: TableTitles.MagicSystemFantasyNameSecond as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSystemFantasyNameSecondTable",
				"className": "MagicSystemFantasyNameSecondTable"
			},
			{
				title: TableTitles.MagicSystemReligionNameFirst as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSystemReligionNameFirstTable",
				"className": "MagicSystemReligionNameFirstTable"
			},
			{
				title: TableTitles.MagicSystemReligionNameSecond as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSystemReligionNameSecondTable",
				"className": "MagicSystemReligionNameSecondTable"
			},
			{
				title: TableTitles.MagicSystemSciFiNameFirst as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSystemSciFiNameFirstTable",
				"className": "MagicSystemSciFiNameFirstTable"
			},
			{
				title: TableTitles.MagicSystemSciFiNameSecond as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSystemSciFiNameSecondTable",
				"className": "MagicSystemSciFiNameSecondTable"
			},
			{
				title: TableTitles.MagicSystemWording as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSystemWordingTable",
				"className": "MagicSystemWordingTable"
			},
			{
				title: TableTitles.MagicVisual as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicVisualTable",
				"className": "MagicVisualTable"
			},
			{
				title: TableTitles.MagicWeakness as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicWeaknessTable",
				"className": "MagicWeaknessTable"
			},
			{
				title: TableTitles.MonsterAdjective as any as string,
				type: TableType.Character,
				"importPath": "monsterTables/monsterAdjectiveTable",
				"className": "MonsterAdjectiveTable"
			},
			{
				title: TableTitles.MonsterEncounterType as any as string,
				type: TableType.Character,
				"importPath": "monsterTables/monsterEncounterTypeTable",
				"className": "MonsterEncounterTypeTable"
			},
			{
				title: TableTitles.MonsterMeal as any as string,
				type: TableType.Character,
				"importPath": "monsterTables/monsterMealTable",
				"className": "MonsterMealTable"
			},
			{
				title: TableTitles.MonsterNumber as any as string,
				type: TableType.Character,
				"importPath": "monsterTables/monsterNumberTable",
				"className": "MonsterNumberTable"
			},
			{
				title: TableTitles.MonsterReproduction as any as string,
				type: TableType.Character,
				"importPath": "monsterTables/monsterReproductionTable",
				"className": "MonsterReproductionTable"
			},
			{
				title: TableTitles.Motivation as any as string,
				type: TableType.Character,
				"importPath": "charTables/motivationTable",
				"className": "MotivationTable"
			},
			{
				title: TableTitles.NationAdjective as any as string,
				type: TableType.Character,
				"importPath": "locationTables/nationAdjectiveTable",
				"className": "NationAdjectiveTable"
			},
			{
				title: TableTitles.NationName as any as string,
				type: TableType.Character,
				"importPath": "locationTables/nationNameTable",
				"className": "NationNameTable"
			},
			{
				title: TableTitles.Nobility as any as string,
				type: TableType.Character,
				"importPath": "charTables/nobilityTable",
				"className": "NobilityTable"
			},
			{
				title: TableTitles.PowerArc as any as string,
				type: TableType.Character,
				"importPath": "otherTables/powerArcTable",
				"className": "PowerArcTable"
			},
			{
				title: TableTitles.Prevalence as any as string,
				type: TableType.Character,
				"importPath": "otherTables/prevalenceTable",
				"className": "PrevalenceTable"
			},
			{
				title: TableTitles.Profession as any as string,
				type: TableType.Character,
				"importPath": "charTables/professionTable",
				"className": "ProfessionTable"
			},
			{
				title: TableTitles.Quantity as any as string,
				type: TableType.Character,
				"importPath": "otherTables/quantityTable",
				"className": "QuantityTable"
			},
			{
				title: TableTitles.Race as any as string,
				type: TableType.Character,
				"importPath": "charTables/raceTable",
				"className": "RaceTable"
			},
			{
				title: TableTitles.RealWorldDungeonName as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/realWorldDungeonNameTable",
				"className": "RealWorldDungeonNameTable"
			},
			{
				title: TableTitles.RealWorldEnemy as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/realWorldEnemyTable",
				"className": "RealWorldEnemyTable"
			},
			{
				title: TableTitles.RelationshipType as any as string,
				type: TableType.Character,
				"importPath": "charTables/relationshipTypeTable",
				"className": "RelationshipTypeTable"
			},
			{
				title: TableTitles.Senses as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicSensesTable",
				"className": "MagicSensesTable"
			},
			{
				title: TableTitles.SideEffect as any as string,
				type: TableType.Character,
				"importPath": "talentTables/sideEffectTable",
				"className": "SideEffectTable"
			},
			{
				title: TableTitles.SignForm as any as string,
				type: TableType.Character,
				"importPath": "otherTables/signFormTable",
				"className": "SignFormTable"
			},
			{
				title: TableTitles.SignMeaning as any as string,
				type: TableType.Character,
				"importPath": "otherTables/signMeaningTable",
				"className": "SignMeaningTable"
			},
			{
				title: TableTitles.SignSymbol as any as string,
				type: TableType.Character,
				"importPath": "otherTables/signSymbolTable",
				"className": "SignSymbolTable"
			},
			{
				title: TableTitles.SimplifiedNpcAction as any as string,
				type: TableType.Character,
				"importPath": "mythicTables/simplifiedNpcActionTable",
				"className": "SimplifiedNpcActionTable"
			},
			{
				title: TableTitles.SpecialFeatures as any as string,
				type: TableType.Character,
				"importPath": "charTables/specialFeaturesTable",
				"className": "SpecialFeaturesTable"
			},
			{
				title: TableTitles.SpellPreparation as any as string,
				type: TableType.Character,
				"importPath": "magicTables/magicPreparationTable",
				"className": "MagicPreparationTable"
			},
			{
				title: TableTitles.Transferability as any as string,
				type: TableType.Character,
				"importPath": "otherTables/transferabilityTable",
				"className": "TransferabilityTable"
			},
			{
				title: TableTitles.TreasureContent as any as string,
				type: TableType.Character,
				"importPath": "dungeonTables/treasureContentTable",
				"className": "TreasureContentTable"
			},
			{
				title: TableTitles.Verb as any as string,
				type: TableType.Character,
				"importPath": "nameTables/verbTable",
				"className": "VerbTable"
			}
		]
	},
	{
		type: TableType.Location,
		"tables": [
			{
				title: TableTitles.Building as any as string,
				type: TableType.Location,
				"importPath": "locationTables/buildingTable",
				"className": "BuildingTable"
			},
			{
				title: TableTitles.BuildingAdjective as any as string,
				type: TableType.Location,
				"importPath": "locationTables/buildingAdjectiveTable",
				"className": "BuildingAdjectiveTable"
			},
			{
				title: TableTitles.Continent as any as string,
				type: TableType.Location,
				"importPath": "locationTables/continentTable",
				"className": "ContinentTable"
			},
			{
				title: TableTitles.DungeonEntry as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/dungeonEntriesTable",
				"className": "DungeonEntriesTable"
			},
			{
				title: TableTitles.Furnishing as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/furnishingTable",
				"className": "FurnishingTable"
			},
			{
				title: TableTitles.HexFeature as any as string,
				type: TableType.Location,
				"importPath": "locationTables/hexFeatureTable",
				"className": "HexFeatureTable"
			},
			{
				title: TableTitles.HexTileHazard as any as string,
				type: TableType.Location,
				"importPath": "locationTables/hexTileHazardTable",
				"className": "HexTileHazardTable"
			},
			{
				title: TableTitles.HexType as any as string,
				type: TableType.Location,
				"importPath": "locationTables/hexTypeTable",
				"className": "HexTypeTable"
			},
			{
				title: TableTitles.Landscape as any as string,
				type: TableType.Location,
				"importPath": "locationTables/landscapeTable",
				"className": "LandscapeTable"
			},
			{
				title: TableTitles.NaturalObstacle as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/naturalObstacleTable",
				"className": "NaturalObstacleTable"
			},
			{
				title: TableTitles.Obstacle as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/obstacleTable",
				"className": "ObstacleTable"
			},
			{
				title: TableTitles.RitualLocation as any as string,
				type: TableType.Location,
				"importPath": "ritualTables/ritualLocationTable",
				"className": "RitualLocationTable"
			},
			{
				title: TableTitles.Sphere as any as string,
				type: TableType.Location,
				"importPath": "locationTables/sphereTable",
				"className": "SphereTable"
			},
			{
				title: TableTitles.Structure as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/structureTable",
				"className": "StructureTable"
			},
			{
				title: TableTitles.TempleType as any as string,
				type: TableType.Location,
				"importPath": "locationTables/templeTypeTable",
				"className": "TempleTypeTable"
			},
			{
				title: TableTitles.TerrainFeature as any as string,
				type: TableType.Location,
				"importPath": "locationTables/terrainFeatureTable",
				"className": "TerrainFeatureTable"
			},
			{
				title: TableTitles.Transition as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/transitionTable",
				"className": "TransitionTable"
			},
			{
				title: TableTitles.TransitionAdjective as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/transitionAdjectiveTable",
				"className": "TransitionAdjectiveTable"
			},
			{
				title: TableTitles.Trap as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/trapTable",
				"className": "TrapTable"
			},
			{
				title: TableTitles.TrapFunction as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/trapFunctionTable",
				"className": "TrapFunctionTable"
			},
			{
				title: TableTitles.TrapTrigger as any as string,
				type: TableType.Location,
				"importPath": "dungeonTables/trapTriggerTable",
				"className": "TrapTriggerTable"
			}
		]
	},
	{
		type: TableType.Artefact,
		"tables": [
			{
				title: TableTitles.Armor as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/armorTable",
				"className": "ArmorTable"
			},
			{
				title: TableTitles.Artefact as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/artefactTable",
				"className": "ArtefactTable"
			},
			{
				title: TableTitles.ArtefactAdjective as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/artefactAdjectiveTable",
				"className": "ArtefactAdjectiveTable"
			},
			{
				title: TableTitles.Artwork as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/artworkTable",
				"className": "ArtworkTable"
			},
			{
				title: TableTitles.EndingTropes as any as string,
				type: TableType.Artefact,
				"importPath": "adventureTables/endingTropeTable",
				"className": "EndingTropeTable"
			},
			{
				title: TableTitles.Gemstone as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/gemstoneTable",
				"className": "GemstoneTable"
			},
			{
				title: TableTitles.Jewelry as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/jewelryTable",
				"className": "JewelryTable"
			},
			{
				title: TableTitles.MagicalArtefact as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/magicalArtefactTable",
				"className": "MagicalArtefactTable"
			},
			{
				title: TableTitles.Materials as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/materialsTable",
				"className": "MaterialsTable"
			},
			{
				title: TableTitles.Narration as any as string,
				type: TableType.Artefact,
				"importPath": "adventureTables/narrationTable",
				"className": "NarrationTable"
			},
			{
				title: TableTitles.PlotTrope as any as string,
				type: TableType.Artefact,
				"importPath": "adventureTables/plotTropeTable",
				"className": "PlotTropeTable"
			},
			{
				title: TableTitles.ProfaneArtefact as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/profaneArtefactTable",
				"className": "ProfaneArtefactTable"
			},
			{
				title: TableTitles.Treasure as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/treasureTable",
				"className": "TreasureTable"
			},
			{
				title: TableTitles.Weapon as any as string,
				type: TableType.Artefact,
				"importPath": "artefactTables/weaponTable",
				"className": "WeaponTable"
			}
		]
	},
	{
		type: TableType.Talent,
		"tables": [
			{
				title: TableTitles.ChangeTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/changeTalentTable",
				"className": "ChangeTalentTable"
			},
			{
				title: TableTitles.ElementalTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/elementalTalentTable",
				"className": "ElementalTalentTable"
			},
			{
				title: TableTitles.HealingTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/healingTalentTable",
				"className": "HealingTalentTable"
			},
			{
				title: TableTitles.Limitation as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/limitationTable",
				"className": "LimitationTable"
			},
			{
				title: TableTitles.MagicalTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/magicalTalentTable",
				"className": "MagicalTalentTable"
			},
			{
				title: TableTitles.MetaMagicTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/metaMagicTalentTable",
				"className": "MetaMagicTalentTable"
			},
			{
				title: TableTitles.ObjectEnchantment as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/objectEnchantmentTable",
				"className": "ObjectEnchantmentTable"
			},
			{
				title: TableTitles.ProfaneTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/profaneTalentTable",
				"className": "ProfaneTalentTable"
			},
			{
				title: TableTitles.ProphecyTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/prophecyTalentTable",
				"className": "ProphecyTalentTable"
			},
			{
				title: TableTitles.PsyTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/psyTalentTable",
				"className": "PsyTalentTable"
			},
			{
				title: TableTitles.SummonTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/summonTalentTable",
				"className": "SummonTalentTable"
			},
			{
				title: TableTitles.Talent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/talentTable",
				"className": "TalentTable"
			},
			{
				title: TableTitles.TalentCategory as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/talentCategoryTable",
				"className": "TalentCategoryTable"
			},
			{
				title: TableTitles.TargetTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/targetTalentTable",
				"className": "TargetTalentTable"
			},
			{
				title: TableTitles.TimeTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/timeTalentTable",
				"className": "TimeTalentTable"
			},
			{
				title: TableTitles.TravelTalent as any as string,
				type: TableType.Talent,
				"importPath": "talentTables/travelTalentTable",
				"className": "TravelTalentTable"
			}
		]
	},
	{
		type: TableType.Monster,
		"tables": [
			{
				title: TableTitles.Enemy as any as string,
				type: TableType.Monster,
				"importPath": "monsterTables/enemyTable",
				"className": "EnemyTable"
			},
			{
				title: TableTitles.Monster as any as string,
				type: TableType.Monster,
				"importPath": "monsterTables/monsterTable",
				"className": "MonsterTable"
			},
			{
				title: TableTitles.MovementType as any as string,
				type: TableType.Monster,
				"importPath": "monsterTables/movementTypeTable",
				"className": "MovementTypeTable"
			},
			{
				title: TableTitles.MythicalCreature as any as string,
				type: TableType.Monster,
				"importPath": "monsterTables/mythicalCreatureTable",
				"className": "MythicalCreatureTable"
			},
			{
				title: TableTitles.Tracks as any as string,
				type: TableType.Monster,
				"importPath": "monsterTables/tracksTable",
				"className": "TracksTable"
			}
		]
	},
	{
		type: TableType.Town,
		"tables": [
			{
				title: TableTitles.TownEvent as any as string,
				type: TableType.Town,
				"importPath": "townTables/townEventTable",
				"className": "TownEventTable"
			},
			{
				title: TableTitles.TownFame as any as string,
				type: TableType.Town,
				"importPath": "townTables/townFameTable",
				"className": "TownFameTable"
			},
			{
				title: TableTitles.TownSize as any as string,
				type: TableType.Town,
				"importPath": "townTables/townSizeTable",
				"className": "TownSizeTable"
			}
		]
	},
	{
		type: TableType.Campaign,
		"tables": [
			{
				title: TableTitles.CampaignStatement as any as string,
				type: TableType.Campaign,
				"importPath": "campaignTables/campaignStatementTable",
				"className": "CampaignStatementTable"
			}
		]
	},
	{
		type: TableType.Other,
		"tables": [
			{
				title: TableTitles.AdventureBeginning as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/adventureBeginningTable",
				"className": "AdventureBeginningTable"
			},
			{
				title: TableTitles.AdventureClimax as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/adventureClimaxTable",
				"className": "AdventureClimaxTable"
			},
			{
				title: TableTitles.AdventureEvent as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/adventureEventTable",
				"className": "AdventureEventTable"
			},
			{
				title: TableTitles.AdventureFinal as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/adventureFinalTable",
				"className": "AdventureFinalTable"
			},
			{
				title: TableTitles.AdventureRising as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/adventureRisingTable",
				"className": "AdventureRisingTable"
			},
			{
				title: TableTitles.AfricanName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/africanNameTable",
				"className": "AfricanNameTable"
			},
			{
				title: TableTitles.Age as any as string,
				type: TableType.Other,
				"importPath": "otherTables/ageTable",
				"className": "AgeTable"
			},
			{
				title: TableTitles.Amount as any as string,
				type: TableType.Other,
				"importPath": "otherTables/amountTable",
				"className": "AmountTable"
			},
			{
				title: TableTitles.ArabicFemaleLastName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/arabicFemaleLastNameTable",
				"className": "ArabicFemaleLastNameTable"
			},
			{
				title: TableTitles.ArabicFemaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/arabicFemaleNameTable",
				"className": "ArabicFemaleNameTable"
			},
			{
				title: TableTitles.ArabicFemaleNameAddition as any as string,
				type: TableType.Other,
				"importPath": "nameTables/arabicFemaleNameAdditionTable",
				"className": "ArabicFemaleNameAdditionTable"
			},
			{
				title: TableTitles.ArabicMaleLastName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/arabicMaleLastNameTable",
				"className": "ArabicMaleLastNameTable"
			},
			{
				title: TableTitles.ArabicMaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/arabicMaleNameTable",
				"className": "ArabicMaleNameTable"
			},
			{
				title: TableTitles.ArabicMaleNameAddition as any as string,
				type: TableType.Other,
				"importPath": "nameTables/arabicMaleNameAdditionTable",
				"className": "ArabicMaleNameAdditionTable"
			},
			{
				title: TableTitles.ArtistTalent as any as string,
				type: TableType.Other,
				"importPath": "talentTables/artistTalentTable",
				"className": "ArtistTalentTable"
			},
			{
				title: TableTitles.AthleticsTalent as any as string,
				type: TableType.Other,
				"importPath": "talentTables/athleticsTalentTable",
				"className": "AthleticsTalentTable"
			},
			{
				title: TableTitles.BarbaricFemaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/barbaricFemaleNameTable",
				"className": "BarbaricFemaleNameTable"
			},
			{
				title: TableTitles.BarbaricLastName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/barbaricLastNameTable",
				"className": "BarbaricLastNameTable"
			},
			{
				title: TableTitles.BarbaricMaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/barbaricMaleNameTable",
				"className": "BarbaricMaleNameTable"
			},
			{
				title: TableTitles.BarbaricNickName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/barbaricNicknameTable",
				"className": "BarbaricNicknameTable"
			},
			{
				title: TableTitles.BasicResource as any as string,
				type: TableType.Other,
				"importPath": "otherTables/basicResourceTable",
				"className": "BasicResourceTable"
			},
			{
				title: TableTitles.BeginningTrope as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/beginningTropeTable",
				"className": "BeginningTropeTable"
			},
			{
				title: TableTitles.BlackBodyColor as any as string,
				type: TableType.Other,
				"importPath": "otherTables/blackBodyColorTable",
				"className": "BlackBodyColorTable"
			},
			{
				title: TableTitles.Blank as any as string,
				type: TableType.Other,
				"importPath": "otherTables/blankTable",
				"className": "BlankTable"
			},
			{
				title: TableTitles.BodyParts as any as string,
				type: TableType.Other,
				"importPath": "otherTables/bodyPartsTable",
				"className": "BodyPartsTable"
			},
			{
				title: TableTitles.CharacterIntroduction as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/characterIntroductionTable",
				"className": "CharacterIntroductionTable"
			},
			{
				title: TableTitles.ClueConclusion as any as string,
				type: TableType.Other,
				"importPath": "otherTables/clueConclusionTable",
				"className": "ClueConclusionTable"
			},
			{
				title: TableTitles.ClueObject as any as string,
				type: TableType.Other,
				"importPath": "otherTables/clueObjectTable",
				"className": "ClueObjectTable"
			},
			{
				title: TableTitles.ClueSource as any as string,
				type: TableType.Other,
				"importPath": "otherTables/clueSourceTable",
				"className": "ClueSourceTable"
			},
			{
				title: TableTitles.Colour as any as string,
				type: TableType.Other,
				"importPath": "otherTables/colourTable",
				"className": "ColourTable"
			},
			{
				title: TableTitles.ConflictTrope as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/conflictTropeTable",
				"className": "ConflictTropeTable"
			},
			{
				title: TableTitles.Consonant as any as string,
				type: TableType.Other,
				"importPath": "otherTables/consonantTable",
				"className": "ConsonantTable"
			},
			{
				title: TableTitles.CraftTalent as any as string,
				type: TableType.Other,
				"importPath": "talentTables/craftTable",
				"className": "CraftTable"
			},
			{
				title: TableTitles.Difficulty as any as string,
				type: TableType.Other,
				"importPath": "otherTables/difficultyTable",
				"className": "DifficultyTable"
			},
			{
				title: TableTitles.Distance as any as string,
				type: TableType.Other,
				"importPath": "otherTables/distanceTable",
				"className": "DistanceTable"
			},
			{
				title: TableTitles.Element as any as string,
				type: TableType.Other,
				"importPath": "otherTables/elementTable",
				"className": "ElementTable"
			},
			{
				title: TableTitles.Emotion as any as string,
				type: TableType.Other,
				"importPath": "otherTables/emotionTable",
				"className": "EmotionTable"
			},
			{
				title: TableTitles.EnumSize as any as string,
				type: TableType.Other,
				"importPath": "otherTables/enumSizeTable",
				"className": "EnumSizeTable"
			},
			{
				title: TableTitles.EventType as any as string,
				type: TableType.Other,
				"importPath": "otherTables/eventTypeTable",
				"className": "EventTypeTable"
			},
			{
				title: TableTitles.FantasySubGenre as any as string,
				type: TableType.Other,
				"importPath": "genreTables/fantasySubGenreTable",
				"className": "FantasySubGenreTable"
			},
			{
				title: TableTitles.FractionName as any as string,
				type: TableType.Other,
				"importPath": "otherTables/fractionNameTable",
				"className": "FractionNameTable"
			},
			{
				title: TableTitles.FractionQuest as any as string,
				type: TableType.Other,
				"importPath": "otherTables/fractionQuestTable",
				"className": "FractionQuestTable"
			},
			{
				title: TableTitles.GalaxyName as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/galaxyNameTable",
				"className": "GalaxyNameTable"
			},
			{
				title: TableTitles.GodByname as any as string,
				type: TableType.Other,
				"importPath": "godTables/godBynameTable",
				"className": "GodBynameTable"
			},
			{
				title: TableTitles.GodDomain as any as string,
				type: TableType.Other,
				"importPath": "godTables/godDomainTable",
				"className": "GodDomainTable"
			},
			{
				title: TableTitles.GodStatus as any as string,
				type: TableType.Other,
				"importPath": "godTables/godStatusTable",
				"className": "GodStatusTable"
			},
			{
				title: TableTitles.GreekFemaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/greekFemaleNameTable",
				"className": "GreekFemaleNameTable"
			},
			{
				title: TableTitles.GreekLastName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/greekLastNameTable",
				"className": "GreekLastNameTable"
			},
			{
				title: TableTitles.GreekLetter as any as string,
				type: TableType.Other,
				"importPath": "otherTables/greekLetterTable",
				"className": "GreekLetterTable"
			},
			{
				title: TableTitles.GreekMaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/greekMaleNameTable",
				"className": "GreekMaleNameTable"
			},
			{
				title: TableTitles.HistoricalEvent as any as string,
				type: TableType.Other,
				"importPath": "otherTables/historicalEventTable",
				"className": "HistoricalEventTable"
			},
			{
				title: TableTitles.IllnessAdjective as any as string,
				type: TableType.Other,
				"importPath": "illnessTables/illnessAdjectiveTable",
				"className": "IllnessAdjectiveTable"
			},
			{
				title: TableTitles.IllnessCure as any as string,
				type: TableType.Other,
				"importPath": "illnessTables/illnessCureTable",
				"className": "IllnessCureTable"
			},
			{
				title: TableTitles.IllnessLore as any as string,
				type: TableType.Other,
				"importPath": "illnessTables/illnessLoreTable",
				"className": "IllnessLoreTable"
			},
			{
				title: TableTitles.IllnessOrigin as any as string,
				type: TableType.Other,
				"importPath": "illnessTables/illnessOriginTable",
				"className": "IllnessOriginTable"
			},
			{
				title: TableTitles.IllnessSymptom as any as string,
				type: TableType.Other,
				"importPath": "illnessTables/illnessSymptomTable",
				"className": "IllnessSymptomTable"
			},
			{
				title: TableTitles.IllnessTransmission as any as string,
				type: TableType.Other,
				"importPath": "illnessTables/illnessTransmissionTable",
				"className": "IllnessTransmissionTable"
			},
			{
				title: TableTitles.IllnessType as any as string,
				type: TableType.Other,
				"importPath": "illnessTables/illnessTypeTable",
				"className": "IllnessTypeTable"
			},
			{
				title: TableTitles.IllnessWorldEffect as any as string,
				type: TableType.Other,
				"importPath": "illnessTables/illnessWorldEffectTable",
				"className": "IllnessWorldEffectTable"
			},
			{
				title: TableTitles.IndianFemaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/indianFemaleNameTable",
				"className": "IndianFemaleNameTable"
			},
			{
				title: TableTitles.IndianMaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/indianMaleNameTable",
				"className": "IndianMaleNameTable"
			},
			{
				title: TableTitles.LivablePlanetType as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/planet/planetTypeTable",
				"className": "LivablePlanetTypeTable"
			},
			{
				title: TableTitles.Location as any as string,
				type: TableType.Other,
				"importPath": "otherTables/locationTable",
				"className": "LocationTable"
			},
			{
				title: TableTitles.MainGenre as any as string,
				type: TableType.Other,
				"importPath": "genreTables/mainGenreTable",
				"className": "MainGenreTable"
			},
			{
				title: TableTitles.Mood as any as string,
				type: TableType.Other,
				"importPath": "otherTables/moodTable",
				"className": "MoodTable"
			},
			{
				title: TableTitles.MoonPhases as any as string,
				type: TableType.Other,
				"importPath": "otherTables/moonPhasesTable",
				"className": "MoonPhasesTable"
			},
			{
				title: TableTitles.Nation as any as string,
				type: TableType.Other,
				"importPath": "nationTables/nationTable",
				"className": "NationTable"
			},
			{
				title: TableTitles.NationRelationship as any as string,
				type: TableType.Other,
				"importPath": "nationTables/nationRelationshipTable",
				"className": "NationRelationshipTable"
			},
			{
				title: TableTitles.NordicFemaleLastName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/nordicFemaleLastNameTable",
				"className": "NordicFemaleLastNameTable"
			},
			{
				title: TableTitles.NordicFemaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/nordicFemaleNameTable",
				"className": "NordicFemaleNameTable"
			},
			{
				title: TableTitles.NordicMaleLastName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/nordicMaleLastNameTable",
				"className": "NordicMaleLastNameTable"
			},
			{
				title: TableTitles.NordicMaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/nordicMaleNameTable",
				"className": "NordicMaleNameTable"
			},
			{
				title: TableTitles.NumberOfSuns as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/solarSystem/numberOfSunsTable",
				"className": "NumberOfSunsTable"
			},
			{
				title: TableTitles.Plan as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/planTable",
				"className": "PlanTable"
			},
			{
				title: TableTitles.PlanetName as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/planet/planetNameTable",
				"className": "PlanetNameTable"
			},
			{
				title: TableTitles.PowerLevel as any as string,
				type: TableType.Other,
				"importPath": "otherTables/powerLevelTable",
				"className": "PowerLevelTable"
			},
			{
				title: TableTitles.ProphecyText as any as string,
				type: TableType.Other,
				"importPath": "otherTables/prophecyTextTable",
				"className": "ProphecyTextTable"
			},
			{
				title: TableTitles.Quality as any as string,
				type: TableType.Other,
				"importPath": "otherTables/qualityTable",
				"className": "QualityTable"
			},
			{
				title: TableTitles.Quality as any as string,
				type: TableType.Other,
				"importPath": "otherTables/positionTable",
				"className": "PositionTable"
			},
			{
				title: TableTitles.QuestDifficulty as any as string,
				type: TableType.Other,
				"importPath": "questTables/questDifficultyTable",
				"className": "QuestDifficultyTable"
			},
			{
				title: TableTitles.QuestReward as any as string,
				type: TableType.Other,
				"importPath": "questTables/questRewardTable",
				"className": "QuestRewardTable"
			},
			{
				title: TableTitles.QuestType as any as string,
				type: TableType.Other,
				"importPath": "questTables/questTypeTable",
				"className": "QuestTypeTable"
			},
			{
				title: TableTitles.QuoteCautionary as any as string,
				type: TableType.Other,
				"importPath": "godTables/quoteCautionaryTable",
				"className": "QuoteCautionaryTable"
			},
			{
				title: TableTitles.QuoteDisciple as any as string,
				type: TableType.Other,
				"importPath": "godTables/quoteDiscipleTable",
				"className": "QuoteDiscipleTable"
			},
			{
				title: TableTitles.Rarity as any as string,
				type: TableType.Other,
				"importPath": "otherTables/rarityTable",
				"className": "RarityTable"
			},
			{
				title: TableTitles.RealCulture as any as string,
				type: TableType.Other,
				"importPath": "cultureTables/realCultureTable",
				"className": "RealCultureTable"
			},
			{
				title: TableTitles.RitualAction as any as string,
				type: TableType.Other,
				"importPath": "ritualTables/ritualActionTable",
				"className": "RitualActionTable"
			},
			{
				title: TableTitles.RitualCulmination as any as string,
				type: TableType.Other,
				"importPath": "ritualTables/ritualCulminationTable",
				"className": "RitualCulminationTable"
			},
			{
				title: TableTitles.RitualExclusiveness as any as string,
				type: TableType.Other,
				"importPath": "ritualTables/ritualExclusivenessTable",
				"className": "RitualExclusivenessTable"
			},
			{
				title: TableTitles.RitualFeast as any as string,
				type: TableType.Other,
				"importPath": "ritualTables/ritualFeastTable",
				"className": "RitualFeastTable"
			},
			{
				title: TableTitles.RitualInvocation as any as string,
				type: TableType.Other,
				"importPath": "ritualTables/ritualInvocationTable",
				"className": "RitualInvocationTable"
			},
			{
				title: TableTitles.RitualOffering as any as string,
				type: TableType.Other,
				"importPath": "ritualTables/ritualOfferingTable",
				"className": "RitualOfferingTable"
			},
			{
				title: TableTitles.RitualPreparation as any as string,
				type: TableType.Other,
				"importPath": "ritualTables/ritualPreparationTable",
				"className": "RitualPreparationTable"
			},
			{
				title: TableTitles.RitualTime as any as string,
				type: TableType.Other,
				"importPath": "ritualTables/ritualTimeTable",
				"className": "RitualTimeTable"
			},
			{
				title: TableTitles.RulerNicknames as any as string,
				type: TableType.Other,
				"importPath": "nationTables/rulerNicknamesTable",
				"className": "RulerNicknamesTable"
			},
			{
				title: TableTitles.RumorContent as any as string,
				type: TableType.Other,
				"importPath": "otherTables/rumorContentTable",
				"className": "RumorContentTable"
			},
			{
				title: TableTitles.RussianFemaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/russianFemaleNameTable",
				"className": "RussianFemaleNameTable"
			},
			{
				title: TableTitles.RussianLastName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/russianLastNameTable",
				"className": "RussianLastNameTable"
			},
			{
				title: TableTitles.RussianMaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/russianMaleNameTable",
				"className": "RussianMaleNameTable"
			},
			{
				title: TableTitles.SciFiSubGenre as any as string,
				type: TableType.Other,
				"importPath": "genreTables/sciFiSubGenreTable",
				"className": "SciFiSubGenreTable"
			},
			{
				title: TableTitles.Season as any as string,
				type: TableType.Other,
				"importPath": "otherTables/seasonTable",
				"className": "SeasonTable"
			},
			{
				title: TableTitles.SectorSynonyms as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/sectorSynonymsTable",
				"className": "SectorSynonymsTable"
			},
			{
				title: TableTitles.Senses as any as string,
				type: TableType.Other,
				"importPath": "otherTables/senseTable",
				"className": "SenseTable"
			},
			{
				title: TableTitles.SensoryDetail as any as string,
				type: TableType.Other,
				"importPath": "otherTables/sensoryDetailTable",
				"className": "SensoryDetailTable"
			},
			{
				title: TableTitles.Size as any as string,
				type: TableType.Other,
				"importPath": "otherTables/sizeTable",
				"className": "SizeTable"
			},
			{
				title: TableTitles.SolarSystemName as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/solarSystem/solarSystemNameTable",
				"className": "SolarSystemNameTable"
			},
			{
				title: TableTitles.SouthAmericanFemaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/southAmericanFemaleNameTable",
				"className": "SouthAmericanFemaleNameTable"
			},
			{
				title: TableTitles.SouthAmericanLastName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/southAmericanLastNameTable",
				"className": "SouthAmericanLastNameTable"
			},
			{
				title: TableTitles.SouthAmericanMaleName as any as string,
				type: TableType.Other,
				"importPath": "nameTables/southAmericanMaleNameTable",
				"className": "SouthAmericanMaleNameTable"
			},
			{
				title: TableTitles.SpellAreaOfEffect as any as string,
				type: TableType.Other,
				"importPath": "spellTables/spellAreaOfEffectTable",
				"className": "SpellAreaOfEffectTable"
			},
			{
				title: TableTitles.SpellCooldown as any as string,
				type: TableType.Other,
				"importPath": "spellTables/spellCooldownTable",
				"className": "SpellCooldownTable"
			},
			{
				title: TableTitles.SpellCounter as any as string,
				type: TableType.Other,
				"importPath": "spellTables/spellCounterTable",
				"className": "SpellCounterTable"
			},
			{
				title: TableTitles.SpellLore as any as string,
				type: TableType.Other,
				"importPath": "spellTables/spellLoreTable",
				"className": "SpellLoreTable"
			},
			{
				title: TableTitles.SpellPreparation as any as string,
				type: TableType.Other,
				"importPath": "spellTables/spellPreparationTable",
				"className": "SpellPreparationTable"
			},
			{
				title: TableTitles.SphereName as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/sphere/sphereNameTable",
				"className": "SphereNameTable"
			},
			{
				title: TableTitles.SphereNamePrefixes as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/sphere/sphereNamePrefixesTable",
				"className": "SphereNamePrefixesTable"
			},
			{
				title: TableTitles.SphereNameSuffixes as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/sphere/sphereNameSuffixesTable",
				"className": "SphereNameSuffixesTable"
			},
			{
				title: TableTitles.SphereRules as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/sphere/sphereRuleTable",
				"className": "SphereRuleTable"
			},
			{
				title: TableTitles.Technology as any as string,
				type: TableType.Other,
				"importPath": "otherTables/technologyTable",
				"className": "TechnologyTable"
			},
			{
				title: TableTitles.Time as any as string,
				type: TableType.Other,
				"importPath": "otherTables/timeTable",
				"className": "TimeTable"
			},
			{
				title: TableTitles.TruthLevel as any as string,
				type: TableType.Other,
				"importPath": "otherTables/truthLevelTable",
				"className": "TruthLevelTable"
			},
			{
				title: TableTitles.VillainAdjective as any as string,
				type: TableType.Other,
				"importPath": "adventureTables/villainAdjectiveTable",
				"className": "VillainAdjectiveTable"
			},
			{
				title: TableTitles.Vocal as any as string,
				type: TableType.Other,
				"importPath": "otherTables/vocalTable",
				"className": "VocalTable"
			},
			{
				title: TableTitles.Weather as any as string,
				type: TableType.Other,
				"importPath": "otherTables/weatherTable",
				"className": "WeatherTable"
			},
			{
				title: TableTitles.WeatherAdjective as any as string,
				type: TableType.Other,
				"importPath": "otherTables/weatherAdjectiveTable",
				"className": "WeatherAdjectiveTable"
			},
			{
				title: TableTitles.WorldCreationMethod as any as string,
				type: TableType.Other,
				"importPath": "celestialTables/cosmicBirthTable",
				"className": "WorldCreationMethodTable"
			}
		]
	},
	{
		type: TableType.Fraction,
		"tables": [
			{
				title: TableTitles.FractionWealth as any as string,
				type: TableType.Fraction,
				"importPath": "otherTables/fractionWealthTable",
				"className": "FractionWealthTable"
			}
		]
	},
	{
		type: TableType.Nation,
		"tables": [
			{
				title: TableTitles.NationAdjective as any as string,
				type: TableType.Nation,
				"importPath": "nationTables/nationAdjectiveTable",
				"className": "NationAdjectiveTable"
			}
		]
	},
	{
		type: TableType.SoloRPG,
		"tables": [
			{
				title: TableTitles.MythicAdventureTone as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/adventureToneTable",
				"className": "AdventureToneTable"
			},
			{
				title: TableTitles.MythicAlienSpeciesDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/alienSpeciesDescriptorsTable",
				"className": "AlienSpeciesDescriptorsTable"
			},
			{
				title: TableTitles.MythicAnimalActions as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/animalActionsTable",
				"className": "AnimalActionsTable"
			},
			{
				title: TableTitles.MythicArmyDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/armyDescriptorsTable",
				"className": "ArmyDescriptorsTable"
			},
			{
				title: TableTitles.MythicCavernDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/cavernDescriptorsTable",
				"className": "CavernDescriptorsTable"
			},
			{
				title: TableTitles.MythicCharacterActionsCombat as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterActionsCombatTable",
				"className": "CharacterActionsCombatTable"
			},
			{
				title: TableTitles.MythicCharacterActionsGeneral as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterActionsGeneralTable",
				"className": "CharacterActionsGeneralTable"
			},
			{
				title: TableTitles.MythicCharacterAppearance as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterAppearanceTable",
				"className": "CharacterAppearanceTable"
			},
			{
				title: TableTitles.MythicCharacterBackground as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterBackgroundTable",
				"className": "CharacterBackgroundTable"
			},
			{
				title: TableTitles.MythicCharacterConversations as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterConversationsTable",
				"className": "CharacterConversationsTable"
			},
			{
				title: TableTitles.MythicCharacterDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterDescriptorsTable",
				"className": "CharacterDescriptorsTable"
			},
			{
				title: TableTitles.MythicCharacterIdentity as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterIdentityTable",
				"className": "CharacterIdentityTable"
			},
			{
				title: TableTitles.MythicCharacterMotivations as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterMotivationsTable",
				"className": "CharacterMotivationsTable"
			},
			{
				title: TableTitles.MythicCharacterPersonality as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterPersonalityTable",
				"className": "CharacterPersonalityTable"
			},
			{
				title: TableTitles.MythicCharactersElements as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/charactersElementsTable",
				"className": "CharactersElementsTable"
			},
			{
				title: TableTitles.MythicCharacterSkills as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterSkillsTable",
				"className": "CharacterSkillsTable"
			},
			{
				title: TableTitles.MythicCharacterTraitsFlaws as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterTraitsFlawsTable",
				"className": "CharacterTraitsFlawsTable"
			},
			{
				title: TableTitles.MythicCityDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/cityDescriptorsTable",
				"className": "CityDescriptorsTable"
			},
			{
				title: TableTitles.MythicCivilizationDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/civilizationDescriptorsTable",
				"className": "CivilizationDescriptorsTable"
			},
			{
				title: TableTitles.MythicCreatureDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/creatureDescriptorsTable",
				"className": "CreatureDescriptorsTable"
			},
			{
				title: TableTitles.MythicDomicileDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/domicileDescriptorsTable",
				"className": "DomicileDescriptorsTable"
			},
			{
				title: TableTitles.MythicDungeonDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/dungeonDescriptorsTable",
				"className": "DungeonDescriptorsTable"
			},
			{
				title: TableTitles.MythicEventFocus as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/eventFocusTable",
				"className": "EventFocusTable"
			},
			{
				title: TableTitles.MythicFateChart as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/fateChartTable",
				"className": "FateChartTable"
			},
			{
				title: TableTitles.MythicForestDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/forestDescriptorsTable",
				"className": "ForestDescriptorsTable"
			},
			{
				title: TableTitles.MythicLocationsElements as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/locationsElementsTable",
				"className": "LocationsElementsTable"
			},
			{
				title: TableTitles.MythicMagicItemDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/magicItemDescriptorsTable",
				"className": "MagicItemDescriptorsTable"
			},
			{
				title: TableTitles.MythicMutationDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/mutationDescriptorsTable",
				"className": "MutationDescriptorsTable"
			},
			{
				title: TableTitles.MythicObjectsElements as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/objectsElementsTable",
				"className": "ObjectsElementsTable"
			},
			{
				title: TableTitles.MythicPlotTwists as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/plotTwistsTable",
				"className": "PlotTwistsTable"
			},
			{
				title: TableTitles.MythicSceneAdjustment as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/sceneAdjustmentTable",
				"className": "SceneAdjustmentTable"
			},
			{
				title: TableTitles.MythicStarshipDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/starshipDescriptorsTable",
				"className": "StarshipDescriptorsTable"
			},
			{
				title: TableTitles.MythicTerrainDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/terrainDescriptorsTable",
				"className": "TerrainDescriptorsTable"
			},
			{
				title: TableTitles.MythicUndeadDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/undeadDescriptorsTable",
				"className": "UndeadDescriptorsTable"
			},
			{
				title: TableTitles.MythicUrbanDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/urbanDescriptorsTable",
				"className": "UrbanDescriptorsTable"
			},
			{
				title: TableTitles.MythicWastelandDescriptors as any as string,
				type: TableType.SoloRPG,
				"importPath": "mythicTables/wastelandDescriptorsTable",
				"className": "WastelandDescriptorsTable"
			}
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
