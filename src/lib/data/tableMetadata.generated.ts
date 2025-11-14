// THIS FILE IS AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run 'npm run generate:metadata' to regenerate this file
// Generated on: 2025-11-14T03:42:03.541Z

import { TableType } from '$lib/tables/tableType';

export interface TableMetadata {
	title: string;
	type: TableType;
	importPath: string;
	className: string;
	subcategory?: string;
}

export interface TableCategory {
	type: TableType;
	tables: TableMetadata[];
	subcategories?: Map<string, TableMetadata[]>;
}

// Lightweight metadata - no actual table imports
export const tableMetadata: TableCategory[] = [
	{
		type: TableType.Character,
		"tables": [
			{
				"title": "Advantages",
				type: TableType.Character,
				"importPath": "charTables/advantageTable",
				"className": "AdvantageTable"
			},
			{
				"title": "Alignment",
				type: TableType.Character,
				"importPath": "charTables/alignmentTable",
				"className": "AlignmentTable"
			},
			{
				"title": "Animal",
				type: TableType.Character,
				"importPath": "charTables/animalTable",
				"className": "AnimalTable"
			},
			{
				"title": "Attitude",
				type: TableType.Character,
				"importPath": "charTables/attitudeTable",
				"className": "AttitudeTable"
			},
			{
				"title": "Attributes",
				type: TableType.Character,
				"importPath": "charTables/attributeTable",
				"className": "AttributeTable"
			},
			{
				"title": "Character as Device",
				type: TableType.Character,
				"importPath": "charTables/characterAsDeviceTable",
				"className": "CharacterAsDeviceTable"
			},
			{
				"title": "Character Shadow Archetype",
				type: TableType.Character,
				"importPath": "charTables/characterShadowArchetypeTable",
				"className": "CharacterShadowArchetypeTable"
			},
			{
				"title": "Curse",
				type: TableType.Character,
				"importPath": "charTables/curseTable",
				"className": "CurseTable"
			},
			{
				"title": "Disadvantages",
				type: TableType.Character,
				"importPath": "charTables/disadvantageTable",
				"className": "DisadvantageTable"
			},
			{
				"title": "Dungeon Name",
				type: TableType.Character,
				"importPath": "nameTables/dungeonNameTable",
				"className": "DungeonNameTable"
			},
			{
				"title": "Elfen Female Name",
				type: TableType.Character,
				"importPath": "nameTables/elfenFemaleNameTable",
				"className": "ElfenFemaleNameTable"
			},
			{
				"title": "Elfen Male Name",
				type: TableType.Character,
				"importPath": "nameTables/elfenMaleNameTable",
				"className": "ElfenMaleNameTable"
			},
			{
				"title": "Epic Substantive",
				type: TableType.Character,
				"importPath": "nameTables/epicSubstantiveTable",
				"className": "EpicSubstantiveTable"
			},
			{
				"title": "Fantasy Creatures",
				type: TableType.Character,
				"importPath": "charTables/fantasyCreatureTable",
				"className": "FantasyCreatureTable"
			},
			{
				"title": "French Female Name",
				type: TableType.Character,
				"importPath": "nameTables/frenchFemaleNameTable",
				"className": "FrenchFemaleNameTable"
			},
			{
				"title": "French Last Name",
				type: TableType.Character,
				"importPath": "nameTables/frenchLastNameTable",
				"className": "FrenchLastNameTable"
			},
			{
				"title": "French Male Name",
				type: TableType.Character,
				"importPath": "nameTables/frenchMaleNameTable",
				"className": "FrenchMaleNameTable"
			},
			{
				"title": "French Place Name Table",
				type: TableType.Character,
				"importPath": "nameTables/frenchPlaceNameTable",
				"className": "FrenchPlaceNameTable"
			},
			{
				"title": "Gender",
				type: TableType.Character,
				"importPath": "charTables/genderTable",
				"className": "GenderTable"
			},
			{
				"title": "German Female Names",
				type: TableType.Character,
				"importPath": "nameTables/germanFemaleNameTable",
				"className": "GermanFemaleNameTable"
			},
			{
				"title": "German Male Names",
				type: TableType.Character,
				"importPath": "nameTables/germanMaleNameTable",
				"className": "GermanMaleNameTable"
			},
			{
				"title": "Knowledge",
				type: TableType.Character,
				"importPath": "otherTables/knowledgeTable",
				"className": "KnowledgeTable"
			},
			{
				"title": "Monster Adjective",
				type: TableType.Character,
				"importPath": "monsterTables/monsterAdjectiveTable",
				"className": "MonsterAdjectiveTable"
			},
			{
				"title": "Monster Encounter Type",
				type: TableType.Character,
				"importPath": "monsterTables/monsterEncounterTypeTable",
				"className": "MonsterEncounterTypeTable"
			},
			{
				"title": "Monster Meal",
				type: TableType.Character,
				"importPath": "monsterTables/monsterMealTable",
				"className": "MonsterMealTable"
			},
			{
				"title": "Monster Number",
				type: TableType.Character,
				"importPath": "monsterTables/monsterNumberTable",
				"className": "MonsterNumberTable"
			},
			{
				"title": "Monster Reproduction",
				type: TableType.Character,
				"importPath": "monsterTables/monsterReproductionTable",
				"className": "MonsterReproductionTable"
			},
			{
				"title": "Motivation",
				type: TableType.Character,
				"importPath": "charTables/motivationTable",
				"className": "MotivationTable"
			},
			{
				"title": "Nobility",
				type: TableType.Character,
				"importPath": "charTables/nobilityTable",
				"className": "NobilityTable"
			},
			{
				"title": "Power Arc",
				type: TableType.Character,
				"importPath": "otherTables/powerArcTable",
				"className": "PowerArcTable"
			},
			{
				"title": "Prevalence",
				type: TableType.Character,
				"importPath": "otherTables/prevalenceTable",
				"className": "PrevalenceTable"
			},
			{
				"title": "Profession",
				type: TableType.Character,
				"importPath": "charTables/professionTable",
				"className": "ProfessionTable"
			},
			{
				"title": "Quantity",
				type: TableType.Character,
				"importPath": "otherTables/quantityTable",
				"className": "QuantityTable"
			},
			{
				"title": "Race",
				type: TableType.Character,
				"importPath": "charTables/raceTable",
				"className": "RaceTable"
			},
			{
				"title": "Relationship Type",
				type: TableType.Character,
				"importPath": "charTables/relationshipTypeTable",
				"className": "RelationshipTypeTable"
			},
			{
				"title": "Sign Form",
				type: TableType.Character,
				"importPath": "otherTables/signFormTable",
				"className": "SignFormTable"
			},
			{
				"title": "Sign Meaning",
				type: TableType.Character,
				"importPath": "otherTables/signMeaningTable",
				"className": "SignMeaningTable"
			},
			{
				"title": "Sign Symbol",
				type: TableType.Character,
				"importPath": "otherTables/signSymbolTable",
				"className": "SignSymbolTable"
			},
			{
				"title": "Special Features",
				type: TableType.Character,
				"importPath": "charTables/specialFeaturesTable",
				"className": "SpecialFeaturesTable"
			},
			{
				"title": "Transferability",
				type: TableType.Character,
				"importPath": "otherTables/transferabilityTable",
				"className": "TransferabilityTable"
			},
			{
				"title": "Verb",
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
				"title": "Building",
				type: TableType.Location,
				"importPath": "locationTables/buildingTable",
				"className": "BuildingTable"
			},
			{
				"title": "Building Adjectives",
				type: TableType.Location,
				"importPath": "locationTables/buildingAdjectiveTable",
				"className": "BuildingAdjectiveTable"
			},
			{
				"title": "Continent",
				type: TableType.Location,
				"importPath": "locationTables/continentTable",
				"className": "ContinentTable"
			},
			{
				"title": "Continent Name",
				type: TableType.Location,
				"importPath": "locationTables/continentNameTable",
				"className": "ContinentNameTable"
			},
			{
				"title": "Dungeon Entry",
				type: TableType.Location,
				"importPath": "dungeonTables/dungeonEntriesTable",
				"className": "DungeonEntriesTable"
			},
			{
				"title": "Ecliptic Galaxy Images",
				type: TableType.Location,
				"importPath": "locationTables/galaxyTables/eclipticGalaxyImagesTable",
				"className": "EclipticGalaxyImagesTable",
				"subcategory": "Galaxy"
			},
			{
				"title": "Galaxy Anomalies",
				type: TableType.Location,
				"importPath": "locationTables/galaxyTables/galaxyAnomaliesTable",
				"className": "GalaxyAnomaliesTable",
				"subcategory": "Galaxy"
			},
			{
				"title": "Galaxy Images",
				type: TableType.Location,
				"importPath": "locationTables/galaxyTables/galaxyImagesTable",
				"className": "GalaxyImagesTable",
				"subcategory": "Galaxy"
			},
			{
				"title": "Galaxy Type",
				type: TableType.Location,
				"importPath": "locationTables/galaxyTables/galaxyTypeTable",
				"className": "GalaxyTypeTable",
				"subcategory": "Galaxy"
			},
			{
				"title": "Hex Feature",
				type: TableType.Location,
				"importPath": "locationTables/hexFeatureTable",
				"className": "HexFeatureTable"
			},
			{
				"title": "Hex Tile Hazards",
				type: TableType.Location,
				"importPath": "locationTables/hexTileHazardTable",
				"className": "HexTileHazardTable"
			},
			{
				"title": "Hex Type",
				type: TableType.Location,
				"importPath": "locationTables/hexTypeTable",
				"className": "HexTypeTable"
			},
			{
				"title": "Landscape",
				type: TableType.Location,
				"importPath": "locationTables/landscapeTable",
				"className": "LandscapeTable"
			},
			{
				"title": "Nation Adjective",
				type: TableType.Location,
				"importPath": "locationTables/nationAdjectiveTable",
				"className": "NationAdjectiveTable"
			},
			{
				"title": "Nation Name",
				type: TableType.Location,
				"importPath": "locationTables/nationNameTable",
				"className": "NationNameTable"
			},
			{
				"title": "Other Galaxy Images",
				type: TableType.Location,
				"importPath": "locationTables/galaxyTables/otherGalaxyImagesTable",
				"className": "OtherGalaxyImagesTable",
				"subcategory": "Galaxy"
			},
			{
				"title": "Ritual Location",
				type: TableType.Location,
				"importPath": "ritualTables/ritualLocationTable",
				"className": "RitualLocationTable"
			},
			{
				"title": "Sphere",
				type: TableType.Location,
				"importPath": "locationTables/sphereTable",
				"className": "SphereTable"
			},
			{
				"title": "Spiral Galaxy Images",
				type: TableType.Location,
				"importPath": "locationTables/galaxyTables/spiralGalaxyImagesTable",
				"className": "SpiralGalaxyImagesTable",
				"subcategory": "Galaxy"
			},
			{
				"title": "Structure",
				type: TableType.Location,
				"importPath": "dungeonTables/structureTable",
				"className": "StructureTable"
			},
			{
				"title": "Temple Type",
				type: TableType.Location,
				"importPath": "locationTables/templeTypeTable",
				"className": "TempleTypeTable"
			},
			{
				"title": "Terrain Feature",
				type: TableType.Location,
				"importPath": "locationTables/terrainFeatureTable",
				"className": "TerrainFeatureTable"
			},
			{
				"title": "Transition",
				type: TableType.Location,
				"importPath": "dungeonTables/transitionTable",
				"className": "TransitionTable"
			}
		]
	},
	{
		type: TableType.Dungeon,
		"tables": [
			{
				"title": "Dungeon Adjective",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/dungeonAdjectiveTable",
				"className": "DungeonAdjectiveTable"
			},
			{
				"title": "Dungeon Purpose",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/dungeonPurposeTable",
				"className": "DungeonPurposeTable"
			},
			{
				"title": "Dungeon Room Arrangement",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/dungeonArrangementsTable",
				"className": "DungeonRoomArrangementsTable"
			},
			{
				"title": "Dungeon State",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/dungeonStateTable",
				"className": "DungeonStateTable"
			},
			{
				"title": "Dungeon Type",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/dungeonTypeTable",
				"className": "DungeonTypeTable"
			},
			{
				"title": "Entrance Adjective",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/entranceAdjectiveTable",
				"className": "EntranceAdjectiveTable"
			},
			{
				"title": "Entrance Type",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/entranceTypeTable",
				"className": "EntranceTypeTable"
			},
			{
				"title": "Furnishing",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/furnishingTable",
				"className": "FurnishingTable"
			},
			{
				"title": "Hidden Description",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/hiddenDescriptionTable",
				"className": "HiddenDescriptionTable"
			},
			{
				"title": "Location Change Event",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/locationChangeEventTable",
				"className": "LocationChangeEventTable"
			},
			{
				"title": "Natural Obstacle",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/naturalObstacleTable",
				"className": "NaturalObstacleTable"
			},
			{
				"title": "Obstacle",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/obstacleTable",
				"className": "ObstacleTable"
			},
			{
				"title": "Real World Enemy",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/realWorldEnemyTable",
				"className": "RealWorldEnemyTable"
			},
			{
				"title": "Transition Adjective",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/transitionAdjectiveTable",
				"className": "TransitionAdjectiveTable"
			},
			{
				"title": "Trap",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/trapTable",
				"className": "TrapTable"
			},
			{
				"title": "Trap Function",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/trapFunctionTable",
				"className": "TrapFunctionTable"
			},
			{
				"title": "Trap Trigger",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/trapTriggerTable",
				"className": "TrapTriggerTable"
			},
			{
				"title": "Treasure Content",
				type: TableType.Dungeon,
				"importPath": "dungeonTables/treasureContentTable",
				"className": "TreasureContentTable"
			}
		]
	},
	{
		type: TableType.Artefact,
		"tables": [
			{
				"title": "Armor",
				type: TableType.Artefact,
				"importPath": "artefactTables/armorTable",
				"className": "ArmorTable"
			},
			{
				"title": "Artefact",
				type: TableType.Artefact,
				"importPath": "artefactTables/artefactTable",
				"className": "ArtefactTable"
			},
			{
				"title": "Artefact Adjective",
				type: TableType.Artefact,
				"importPath": "artefactTables/artefactAdjectiveTable",
				"className": "ArtefactAdjectiveTable"
			},
			{
				"title": "Artwork",
				type: TableType.Artefact,
				"importPath": "artefactTables/artworkTable",
				"className": "ArtworkTable"
			},
			{
				"title": "Gemstone",
				type: TableType.Artefact,
				"importPath": "artefactTables/gemstoneTable",
				"className": "GemstoneTable"
			},
			{
				"title": "Jewelry",
				type: TableType.Artefact,
				"importPath": "artefactTables/jewelryTable",
				"className": "JewelryTable"
			},
			{
				"title": "Magical Artefact",
				type: TableType.Artefact,
				"importPath": "artefactTables/magicalArtefactTable",
				"className": "MagicalArtefactTable"
			},
			{
				"title": "Materials",
				type: TableType.Artefact,
				"importPath": "artefactTables/materialsTable",
				"className": "MaterialsTable"
			},
			{
				"title": "Profane Artefact",
				type: TableType.Artefact,
				"importPath": "artefactTables/profaneArtefactTable",
				"className": "ProfaneArtefactTable"
			},
			{
				"title": "Treasure",
				type: TableType.Artefact,
				"importPath": "artefactTables/treasureTable",
				"className": "TreasureTable"
			},
			{
				"title": "Weapon",
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
				"title": "Artistic Talent",
				type: TableType.Talent,
				"importPath": "talentTables/artistTalentTable",
				"className": "ArtistTalentTable"
			},
			{
				"title": "Athletics Talent",
				type: TableType.Talent,
				"importPath": "talentTables/athleticsTalentTable",
				"className": "AthleticsTalentTable"
			},
			{
				"title": "Balancing For Talent",
				type: TableType.Talent,
				"importPath": "talentTables/balancingForTalentTable",
				"className": "BalancingForTalentTable"
			},
			{
				"title": "Change Talent",
				type: TableType.Talent,
				"importPath": "talentTables/changeTalentTable",
				"className": "ChangeTalentTable"
			},
			{
				"title": "Craft Talent",
				type: TableType.Talent,
				"importPath": "talentTables/craftTable",
				"className": "CraftTable"
			},
			{
				"title": "Elemental Talent",
				type: TableType.Talent,
				"importPath": "talentTables/elementalTalentTable",
				"className": "ElementalTalentTable"
			},
			{
				"title": "Healing Talent",
				type: TableType.Talent,
				"importPath": "talentTables/healingTalentTable",
				"className": "HealingTalentTable"
			},
			{
				"title": "Improvement",
				type: TableType.Talent,
				"importPath": "talentTables/improvementTable",
				"className": "ImprovementTable"
			},
			{
				"title": "Limitation",
				type: TableType.Talent,
				"importPath": "talentTables/limitationTable",
				"className": "LimitationTable"
			},
			{
				"title": "Limitation",
				type: TableType.Talent,
				"importPath": "talentTables/limitationForTalentTable",
				"className": "LimitationForTalentTable"
			},
			{
				"title": "Magical Talent",
				type: TableType.Talent,
				"importPath": "talentTables/magicalTalentTable",
				"className": "MagicalTalentTable"
			},
			{
				"title": "Meta Magic Talent",
				type: TableType.Talent,
				"importPath": "talentTables/metaMagicTalentTable",
				"className": "MetaMagicTalentTable"
			},
			{
				"title": "Object Enchantment",
				type: TableType.Talent,
				"importPath": "talentTables/objectEnchantmentTable",
				"className": "ObjectEnchantmentTable"
			},
			{
				"title": "Profane Talent",
				type: TableType.Talent,
				"importPath": "talentTables/profaneTalentTable",
				"className": "ProfaneTalentTable"
			},
			{
				"title": "Prophecy Talent",
				type: TableType.Talent,
				"importPath": "talentTables/prophecyTalentTable",
				"className": "ProphecyTalentTable"
			},
			{
				"title": "Psy Talent",
				type: TableType.Talent,
				"importPath": "talentTables/psyTalentTable",
				"className": "PsyTalentTable"
			},
			{
				"title": "Side Effect",
				type: TableType.Talent,
				"importPath": "talentTables/sideEffectTable",
				"className": "SideEffectTable"
			},
			{
				"title": "Summon Talent",
				type: TableType.Talent,
				"importPath": "talentTables/summonTalentTable",
				"className": "SummonTalentTable"
			},
			{
				"title": "Talent",
				type: TableType.Talent,
				"importPath": "talentTables/talentTable",
				"className": "TalentTable"
			},
			{
				"title": "Talent Category",
				type: TableType.Talent,
				"importPath": "talentTables/talentCategoryTable",
				"className": "TalentCategoryTable"
			},
			{
				"title": "Which Target of Talent",
				type: TableType.Talent,
				"importPath": "talentTables/targetTalentTable",
				"className": "TargetTalentTable"
			},
			{
				"title": "Time Talent",
				type: TableType.Talent,
				"importPath": "talentTables/timeTalentTable",
				"className": "TimeTalentTable"
			},
			{
				"title": "Travel Talent",
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
				"title": "Enemy",
				type: TableType.Monster,
				"importPath": "monsterTables/enemyTable",
				"className": "EnemyTable"
			},
			{
				"title": "Monster",
				type: TableType.Monster,
				"importPath": "monsterTables/monsterTable",
				"className": "MonsterTable"
			},
			{
				"title": "Movement Type",
				type: TableType.Monster,
				"importPath": "monsterTables/movementTypeTable",
				"className": "MovementTypeTable"
			},
			{
				"title": "Mythical Creature",
				type: TableType.Monster,
				"importPath": "monsterTables/mythicalCreatureTable",
				"className": "MythicalCreatureTable"
			},
			{
				"title": "Tracks",
				type: TableType.Monster,
				"importPath": "monsterTables/tracksTable",
				"className": "TracksTable"
			}
		]
	},
	{
		type: TableType.Adventure,
		"tables": [
			{
				"title": "Adventure Climax",
				type: TableType.Adventure,
				"importPath": "adventureTables/adventureClimaxTable",
				"className": "AdventureClimaxTable"
			},
			{
				"title": "Adventure Final",
				type: TableType.Adventure,
				"importPath": "adventureTables/adventureFinalTable",
				"className": "AdventureFinalTable"
			},
			{
				"title": "Adventure Rising",
				type: TableType.Adventure,
				"importPath": "adventureTables/adventureRisingTable",
				"className": "AdventureRisingTable"
			},
			{
				"title": "Beginning Trope",
				type: TableType.Adventure,
				"importPath": "adventureTables/beginningTropeTable",
				"className": "BeginningTropeTable"
			},
			{
				"title": "Character Introduction",
				type: TableType.Adventure,
				"importPath": "adventureTables/characterIntroductionTable",
				"className": "CharacterIntroductionTable"
			},
			{
				"title": "Conflict Trope",
				type: TableType.Adventure,
				"importPath": "adventureTables/conflictTropeTable",
				"className": "ConflictTropeTable"
			},
			{
				"title": "Ending Trope",
				type: TableType.Adventure,
				"importPath": "adventureTables/endingTropeTable",
				"className": "EndingTropeTable"
			},
			{
				"title": "Initial Meeting Circumstances",
				type: TableType.Adventure,
				"importPath": "adventureTables/initialMeetingCircumstancesTable",
				"className": "InitialMeetingCircumstancesTable"
			},
			{
				"title": "Initial Meeting Tone",
				type: TableType.Adventure,
				"importPath": "adventureTables/initialMeetingToneTable",
				"className": "InitialMeetingToneTable"
			},
			{
				"title": "Initial Meeting Type",
				type: TableType.Adventure,
				"importPath": "adventureTables/initialMeetingTypeTable",
				"className": "InitialMeetingTypeTable"
			},
			{
				"title": "Narration",
				type: TableType.Adventure,
				"importPath": "adventureTables/narrationTable",
				"className": "NarrationTable"
			},
			{
				"title": "Plan",
				type: TableType.Adventure,
				"importPath": "adventureTables/planTable",
				"className": "PlanTable"
			},
			{
				"title": "Plot Trope",
				type: TableType.Adventure,
				"importPath": "adventureTables/plotTropeTable",
				"className": "PlotTropeTable"
			},
			{
				"title": "Villain Adjective",
				type: TableType.Adventure,
				"importPath": "adventureTables/villainAdjectiveTable",
				"className": "VillainAdjectiveTable"
			}
		]
	},
	{
		type: TableType.Town,
		"tables": [
			{
				"title": "Town Event",
				type: TableType.Town,
				"importPath": "townTables/townEventTable",
				"className": "TownEventTable"
			},
			{
				"title": "Town Fame",
				type: TableType.Town,
				"importPath": "townTables/townFameTable",
				"className": "TownFameTable"
			},
			{
				"title": "Town Size",
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
				"title": "Campaign Statement",
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
				"title": "Adventure Beginning",
				type: TableType.Other,
				"importPath": "adventureTables/adventureBeginningTable",
				"className": "AdventureBeginningTable"
			},
			{
				"title": "Adventure Event",
				type: TableType.Other,
				"importPath": "adventureTables/adventureEventTable",
				"className": "AdventureEventTable"
			},
			{
				"title": "Age",
				type: TableType.Other,
				"importPath": "otherTables/ageTable",
				"className": "AgeTable"
			},
			{
				"title": "Amount",
				type: TableType.Other,
				"importPath": "otherTables/amountTable",
				"className": "AmountTable"
			},
			{
				"title": "Basic Resource",
				type: TableType.Other,
				"importPath": "otherTables/basicResourceTable",
				"className": "BasicResourceTable"
			},
			{
				"title": "Black Body Color",
				type: TableType.Other,
				"importPath": "otherTables/blackBodyColorTable",
				"className": "BlackBodyColorTable"
			},
			{
				"title": "Blank",
				type: TableType.Other,
				"importPath": "otherTables/blankTable",
				"className": "BlankTable"
			},
			{
				"title": "Body Parts",
				type: TableType.Other,
				"importPath": "otherTables/bodyPartsTable",
				"className": "BodyPartsTable"
			},
			{
				"title": "Casting Method",
				type: TableType.Other,
				"importPath": "magicTables/castingMethodTable",
				"className": "CastingMethodTable"
			},
			{
				"title": "Clue Conclusion",
				type: TableType.Other,
				"importPath": "otherTables/clueConclusionTable",
				"className": "ClueConclusionTable"
			},
			{
				"title": "Clue Object",
				type: TableType.Other,
				"importPath": "otherTables/clueObjectTable",
				"className": "ClueObjectTable"
			},
			{
				"title": "Clue Source",
				type: TableType.Other,
				"importPath": "otherTables/clueSourceTable",
				"className": "ClueSourceTable"
			},
			{
				"title": "Colour",
				type: TableType.Other,
				"importPath": "otherTables/colourTable",
				"className": "ColourTable"
			},
			{
				"title": "Consonant",
				type: TableType.Other,
				"importPath": "otherTables/consonantTable",
				"className": "ConsonantTable"
			},
			{
				"title": "Difficulty",
				type: TableType.Other,
				"importPath": "otherTables/difficultyTable",
				"className": "DifficultyTable"
			},
			{
				"title": "Dimensional Structure",
				type: TableType.Other,
				"importPath": "celestialTables/universe/dimensionalStructureTable",
				"className": "DimensionalStructureTable"
			},
			{
				"title": "Distance",
				type: TableType.Other,
				"importPath": "otherTables/distanceTable",
				"className": "DistanceTable"
			},
			{
				"title": "Element",
				type: TableType.Other,
				"importPath": "otherTables/elementTable",
				"className": "ElementTable"
			},
			{
				"title": "Emotion",
				type: TableType.Other,
				"importPath": "otherTables/emotionTable",
				"className": "EmotionTable"
			},
			{
				"title": "Enum Size",
				type: TableType.Other,
				"importPath": "otherTables/enumSizeTable",
				"className": "EnumSizeTable"
			},
			{
				"title": "Event Type",
				type: TableType.Other,
				"importPath": "otherTables/eventTypeTable",
				"className": "EventTypeTable"
			},
			{
				"title": "Fantasy Sub-Genre",
				type: TableType.Other,
				"importPath": "genreTables/fantasySubGenreTable",
				"className": "FantasySubGenreTable"
			},
			{
				"title": "Fraction Quest",
				type: TableType.Other,
				"importPath": "otherTables/fractionQuestTable",
				"className": "FractionQuestTable"
			},
			{
				"title": "Fundamental Laws",
				type: TableType.Other,
				"importPath": "celestialTables/universe/fundamentalLawsTable",
				"className": "FundamentalLawsTable"
			},
			{
				"title": "God Domain",
				type: TableType.Other,
				"importPath": "godTables/godDomainTable",
				"className": "GodDomainTable"
			},
			{
				"title": "God Status",
				type: TableType.Other,
				"importPath": "godTables/godStatusTable",
				"className": "GodStatusTable"
			},
			{
				"title": "Greek Letters",
				type: TableType.Other,
				"importPath": "otherTables/greekLetterTable",
				"className": "GreekLetterTable"
			},
			{
				"title": "Historical Event",
				type: TableType.Other,
				"importPath": "otherTables/historicalEventTable",
				"className": "HistoricalEventTable"
			},
			{
				"title": "Illness Adjective",
				type: TableType.Other,
				"importPath": "illnessTables/illnessAdjectiveTable",
				"className": "IllnessAdjectiveTable"
			},
			{
				"title": "Illness Cure",
				type: TableType.Other,
				"importPath": "illnessTables/illnessCureTable",
				"className": "IllnessCureTable"
			},
			{
				"title": "Illness Lore",
				type: TableType.Other,
				"importPath": "illnessTables/illnessLoreTable",
				"className": "IllnessLoreTable"
			},
			{
				"title": "Illness Origin",
				type: TableType.Other,
				"importPath": "illnessTables/illnessOriginTable",
				"className": "IllnessOriginTable"
			},
			{
				"title": "Illness Symptom",
				type: TableType.Other,
				"importPath": "illnessTables/illnessSymptomTable",
				"className": "IllnessSymptomTable"
			},
			{
				"title": "Illness Transmission",
				type: TableType.Other,
				"importPath": "illnessTables/illnessTransmissionTable",
				"className": "IllnessTransmissionTable"
			},
			{
				"title": "Illness Type",
				type: TableType.Other,
				"importPath": "illnessTables/illnessTypeTable",
				"className": "IllnessTypeTable"
			},
			{
				"title": "Illness World Effect",
				type: TableType.Other,
				"importPath": "illnessTables/illnessWorldEffectTable",
				"className": "IllnessWorldEffectTable"
			},
			{
				"title": "Livable Planet Type",
				type: TableType.Other,
				"importPath": "celestialTables/planet/planetTypeTable",
				"className": "LivablePlanetTypeTable"
			},
			{
				"title": "Location",
				type: TableType.Other,
				"importPath": "otherTables/locationTable",
				"className": "LocationTable"
			},
			{
				"title": "Magic Ability",
				type: TableType.Other,
				"importPath": "magicTables/magicAbilityTable",
				"className": "MagicAbilityTable"
			},
			{
				"title": "Magic Attribute",
				type: TableType.Other,
				"importPath": "magicTables/magicAttributeTable",
				"className": "MagicAttributeTable"
			},
			{
				"title": "Magic Channel",
				type: TableType.Other,
				"importPath": "magicTables/magicChannelTable",
				"className": "MagicChannelTable"
			},
			{
				"title": "Magic Cost",
				type: TableType.Other,
				"importPath": "magicTables/magicCostTable",
				"className": "MagicCostTable"
			},
			{
				"title": "Magic Differentiation",
				type: TableType.Other,
				"importPath": "magicTables/magicDifferentiationTable",
				"className": "MagicDifferentiationTable"
			},
			{
				"title": "Magic Event",
				type: TableType.Other,
				"importPath": "magicTables/magicEventTable",
				"className": "MagicEventTable"
			},
			{
				"title": "Magic Fail Consequence",
				type: TableType.Other,
				"importPath": "magicTables/magicFailConsequenceTable",
				"className": "MagicFailConsequenceTable"
			},
			{
				"title": "Magic Fluff",
				type: TableType.Other,
				"importPath": "magicTables/magicFluffTable",
				"className": "MagicFluffTable"
			},
			{
				"title": "Magic Origin",
				type: TableType.Other,
				"importPath": "magicTables/magicOriginTable",
				"className": "MagicOriginTable"
			},
			{
				"title": "Magic Rule",
				type: TableType.Other,
				"importPath": "magicTables/magicRuleTable",
				"className": "MagicRuleTable"
			},
			{
				"title": "Magic Second Level Use",
				type: TableType.Other,
				"importPath": "magicTables/magicSecondLevelUseTable",
				"className": "MagicSecondLevelUseTable"
			},
			{
				"title": "Magic Source",
				type: TableType.Other,
				"importPath": "magicTables/magicSourceTable",
				"className": "MagicSourceTable"
			},
			{
				"title": "Magic Spell Modifier",
				type: TableType.Other,
				"importPath": "magicTables/magicSpellModifierTable",
				"className": "MagicSpellModifierTable"
			},
			{
				"title": "Magic System Wording",
				type: TableType.Other,
				"importPath": "magicTables/magicSystemWordingTable",
				"className": "MagicSystemWordingTable"
			},
			{
				"title": "Magic Visual",
				type: TableType.Other,
				"importPath": "magicTables/magicVisualTable",
				"className": "MagicVisualTable"
			},
			{
				"title": "Magic Weakness",
				type: TableType.Other,
				"importPath": "magicTables/magicWeaknessTable",
				"className": "MagicWeaknessTable"
			},
			{
				"title": "Main Genre",
				type: TableType.Other,
				"importPath": "genreTables/mainGenreTable",
				"className": "MainGenreTable"
			},
			{
				"title": "Mood",
				type: TableType.Other,
				"importPath": "otherTables/moodTable",
				"className": "MoodTable"
			},
			{
				"title": "Moon Phases",
				type: TableType.Other,
				"importPath": "otherTables/moonPhasesTable",
				"className": "MoonPhasesTable"
			},
			{
				"title": "Number of Suns",
				type: TableType.Other,
				"importPath": "celestialTables/solarSystem/numberOfSunsTable",
				"className": "NumberOfSunsTable"
			},
			{
				"title": "Power Level",
				type: TableType.Other,
				"importPath": "otherTables/powerLevelTable",
				"className": "PowerLevelTable"
			},
			{
				"title": "Prophecy Text",
				type: TableType.Other,
				"importPath": "otherTables/prophecyTextTable",
				"className": "ProphecyTextTable"
			},
			{
				"title": "Quality",
				type: TableType.Other,
				"importPath": "otherTables/qualityTable",
				"className": "QualityTable"
			},
			{
				"title": "Quality",
				type: TableType.Other,
				"importPath": "otherTables/positionTable",
				"className": "PositionTable"
			},
			{
				"title": "Quest Difficulty",
				type: TableType.Other,
				"importPath": "questTables/questDifficultyTable",
				"className": "QuestDifficultyTable"
			},
			{
				"title": "Quest Reward",
				type: TableType.Other,
				"importPath": "questTables/questRewardTable",
				"className": "QuestRewardTable"
			},
			{
				"title": "Quest Type",
				type: TableType.Other,
				"importPath": "questTables/questTypeTable",
				"className": "QuestTypeTable"
			},
			{
				"title": "Cautionary Quote",
				type: TableType.Other,
				"importPath": "godTables/quoteCautionaryTable",
				"className": "QuoteCautionaryTable"
			},
			{
				"title": "Disciple Quote",
				type: TableType.Other,
				"importPath": "godTables/quoteDiscipleTable",
				"className": "QuoteDiscipleTable"
			},
			{
				"title": "Rarity",
				type: TableType.Other,
				"importPath": "otherTables/rarityTable",
				"className": "RarityTable"
			},
			{
				"title": "Real Culture",
				type: TableType.Other,
				"importPath": "cultureTables/realCultureTable",
				"className": "RealCultureTable"
			},
			{
				"title": "Ritual Action",
				type: TableType.Other,
				"importPath": "ritualTables/ritualActionTable",
				"className": "RitualActionTable"
			},
			{
				"title": "Ritual Culmination",
				type: TableType.Other,
				"importPath": "ritualTables/ritualCulminationTable",
				"className": "RitualCulminationTable"
			},
			{
				"title": "Ritual Exclusiveness",
				type: TableType.Other,
				"importPath": "ritualTables/ritualExclusivenessTable",
				"className": "RitualExclusivenessTable"
			},
			{
				"title": "Ritual Feast",
				type: TableType.Other,
				"importPath": "ritualTables/ritualFeastTable",
				"className": "RitualFeastTable"
			},
			{
				"title": "Ritual Invocation",
				type: TableType.Other,
				"importPath": "ritualTables/ritualInvocationTable",
				"className": "RitualInvocationTable"
			},
			{
				"title": "Ritual Offering",
				type: TableType.Other,
				"importPath": "ritualTables/ritualOfferingTable",
				"className": "RitualOfferingTable"
			},
			{
				"title": "Ritual Preparation",
				type: TableType.Other,
				"importPath": "ritualTables/ritualPreparationTable",
				"className": "RitualPreparationTable"
			},
			{
				"title": "Ritual Time",
				type: TableType.Other,
				"importPath": "ritualTables/ritualTimeTable",
				"className": "RitualTimeTable"
			},
			{
				"title": "Rumor Content",
				type: TableType.Other,
				"importPath": "otherTables/rumorContentTable",
				"className": "RumorContentTable"
			},
			{
				"title": "Sci-Fi Sub-Genre",
				type: TableType.Other,
				"importPath": "genreTables/sciFiSubGenreTable",
				"className": "SciFiSubGenreTable"
			},
			{
				"title": "Season",
				type: TableType.Other,
				"importPath": "otherTables/seasonTable",
				"className": "SeasonTable"
			},
			{
				"title": "Sector Synonyms",
				type: TableType.Other,
				"importPath": "celestialTables/sectorSynonymsTable",
				"className": "SectorSynonymsTable"
			},
			{
				"title": "Senses",
				type: TableType.Other,
				"importPath": "otherTables/senseTable",
				"className": "SenseTable"
			},
			{
				"title": "Senses",
				type: TableType.Other,
				"importPath": "magicTables/magicSensesTable",
				"className": "MagicSensesTable"
			},
			{
				"title": "Sensory Detail",
				type: TableType.Other,
				"importPath": "otherTables/sensoryDetailTable",
				"className": "SensoryDetailTable"
			},
			{
				"title": "Size",
				type: TableType.Other,
				"importPath": "otherTables/sizeTable",
				"className": "SizeTable"
			},
			{
				"title": "Spell Area of Effect",
				type: TableType.Other,
				"importPath": "spellTables/spellAreaOfEffectTable",
				"className": "SpellAreaOfEffectTable"
			},
			{
				"title": "Spell Cooldown",
				type: TableType.Other,
				"importPath": "spellTables/spellCooldownTable",
				"className": "SpellCooldownTable"
			},
			{
				"title": "Spell Counter",
				type: TableType.Other,
				"importPath": "spellTables/spellCounterTable",
				"className": "SpellCounterTable"
			},
			{
				"title": "Spell Lore",
				type: TableType.Other,
				"importPath": "spellTables/spellLoreTable",
				"className": "SpellLoreTable"
			},
			{
				"title": "Spell Preparation",
				type: TableType.Other,
				"importPath": "spellTables/spellPreparationTable",
				"className": "SpellPreparationTable"
			},
			{
				"title": "Spell Preparation",
				type: TableType.Other,
				"importPath": "magicTables/magicPreparationTable",
				"className": "MagicPreparationTable"
			},
			{
				"title": "Sphere Rules",
				type: TableType.Other,
				"importPath": "celestialTables/sphere/sphereRuleTable",
				"className": "SphereRuleTable"
			},
			{
				"title": "Technology",
				type: TableType.Other,
				"importPath": "otherTables/technologyTable",
				"className": "TechnologyTable"
			},
			{
				"title": "Time",
				type: TableType.Other,
				"importPath": "otherTables/timeTable",
				"className": "TimeTable"
			},
			{
				"title": "Truth Level",
				type: TableType.Other,
				"importPath": "otherTables/truthLevelTable",
				"className": "TruthLevelTable"
			},
			{
				"title": "Universe Age",
				type: TableType.Other,
				"importPath": "celestialTables/universe/universeAgeTable",
				"className": "UniverseAgeTable"
			},
			{
				"title": "Vocal",
				type: TableType.Other,
				"importPath": "otherTables/vocalTable",
				"className": "VocalTable"
			},
			{
				"title": "Weather",
				type: TableType.Other,
				"importPath": "otherTables/weatherTable",
				"className": "WeatherTable"
			},
			{
				"title": "Weather Adjective",
				type: TableType.Other,
				"importPath": "otherTables/weatherAdjectiveTable",
				"className": "WeatherAdjectiveTable"
			},
			{
				"title": "World Creation Method",
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
				"title": "Faction Beginning Motivation",
				type: TableType.Fraction,
				"importPath": "factionTables/factionBeginningMotivationTable",
				"className": "FactionBeginningMotivationTable"
			},
			{
				"title": "Faction Quote",
				type: TableType.Fraction,
				"importPath": "factionTables/factionQuoteTable",
				"className": "FactionQuoteTable"
			},
			{
				"title": "Fraction Wealth",
				type: TableType.Fraction,
				"importPath": "otherTables/fractionWealthTable",
				"className": "FractionWealthTable"
			}
		]
	},
	{
		type: TableType.Name,
		"tables": [
			{
				"title": "African Name",
				type: TableType.Name,
				"importPath": "nameTables/africanNameTable",
				"className": "AfricanNameTable"
			},
			{
				"title": "Arabic Female Last Name",
				type: TableType.Name,
				"importPath": "nameTables/arabicFemaleLastNameTable",
				"className": "ArabicFemaleLastNameTable"
			},
			{
				"title": "Arabic Female Name",
				type: TableType.Name,
				"importPath": "nameTables/arabicFemaleNameTable",
				"className": "ArabicFemaleNameTable"
			},
			{
				"title": "Arabic Female Name Addition",
				type: TableType.Name,
				"importPath": "nameTables/arabicFemaleNameAdditionTable",
				"className": "ArabicFemaleNameAdditionTable"
			},
			{
				"title": "Arabic Male Last Name",
				type: TableType.Name,
				"importPath": "nameTables/arabicMaleLastNameTable",
				"className": "ArabicMaleLastNameTable"
			},
			{
				"title": "Arabic Male Name",
				type: TableType.Name,
				"importPath": "nameTables/arabicMaleNameTable",
				"className": "ArabicMaleNameTable"
			},
			{
				"title": "Arabic Male Name Addition",
				type: TableType.Name,
				"importPath": "nameTables/arabicMaleNameAdditionTable",
				"className": "ArabicMaleNameAdditionTable"
			},
			{
				"title": "Barbaric Female Name",
				type: TableType.Name,
				"importPath": "nameTables/barbaricFemaleNameTable",
				"className": "BarbaricFemaleNameTable"
			},
			{
				"title": "Barbaric Last Name",
				type: TableType.Name,
				"importPath": "nameTables/barbaricLastNameTable",
				"className": "BarbaricLastNameTable"
			},
			{
				"title": "Barbaric Male Name",
				type: TableType.Name,
				"importPath": "nameTables/barbaricMaleNameTable",
				"className": "BarbaricMaleNameTable"
			},
			{
				"title": "Barbaric Nick Name",
				type: TableType.Name,
				"importPath": "nameTables/barbaricNicknameTable",
				"className": "BarbaricNicknameTable"
			},
			{
				"title": "Faction First Name",
				type: TableType.Name,
				"importPath": "factionTables/factionFirstNameTable",
				"className": "FactionFirstNameTable"
			},
			{
				"title": "Faction Second Name",
				type: TableType.Name,
				"importPath": "factionTables/factionSecondNameTable",
				"className": "FactionSecondNameTable"
			},
			{
				"title": "Fraction Name",
				type: TableType.Name,
				"importPath": "otherTables/fractionNameTable",
				"className": "FractionNameTable"
			},
			{
				"title": "Galaxy Name",
				type: TableType.Name,
				"importPath": "celestialTables/galaxyNameTable",
				"className": "GalaxyNameTable",
				"subcategory": "Galaxy"
			},
			{
				"title": "God Byname",
				type: TableType.Name,
				"importPath": "godTables/godBynameTable",
				"className": "GodBynameTable"
			},
			{
				"title": "Greek Female Name",
				type: TableType.Name,
				"importPath": "nameTables/greekFemaleNameTable",
				"className": "GreekFemaleNameTable"
			},
			{
				"title": "Greek Last Name",
				type: TableType.Name,
				"importPath": "nameTables/greekLastNameTable",
				"className": "GreekLastNameTable"
			},
			{
				"title": "Greek Male Name",
				type: TableType.Name,
				"importPath": "nameTables/greekMaleNameTable",
				"className": "GreekMaleNameTable"
			},
			{
				"title": "Indian Female Name",
				type: TableType.Name,
				"importPath": "nameTables/indianFemaleNameTable",
				"className": "IndianFemaleNameTable"
			},
			{
				"title": "Indian Male Name",
				type: TableType.Name,
				"importPath": "nameTables/indianMaleNameTable",
				"className": "IndianMaleNameTable"
			},
			{
				"title": "Magic System Fantasy Name First",
				type: TableType.Name,
				"importPath": "magicTables/magicSystemFantasyNameFirstTable",
				"className": "MagicSystemFantasyNameFirstTable"
			},
			{
				"title": "Magic System Fantasy Name Second",
				type: TableType.Name,
				"importPath": "magicTables/magicSystemFantasyNameSecondTable",
				"className": "MagicSystemFantasyNameSecondTable"
			},
			{
				"title": "Magic System Religion Name First",
				type: TableType.Name,
				"importPath": "magicTables/magicSystemReligionNameFirstTable",
				"className": "MagicSystemReligionNameFirstTable"
			},
			{
				"title": "Magic System Religion Name Second",
				type: TableType.Name,
				"importPath": "magicTables/magicSystemReligionNameSecondTable",
				"className": "MagicSystemReligionNameSecondTable"
			},
			{
				"title": "Magic System Sci Fi Name First",
				type: TableType.Name,
				"importPath": "magicTables/magicSystemSciFiNameFirstTable",
				"className": "MagicSystemSciFiNameFirstTable"
			},
			{
				"title": "Magic System Sci Fi Name Second",
				type: TableType.Name,
				"importPath": "magicTables/magicSystemSciFiNameSecondTable",
				"className": "MagicSystemSciFiNameSecondTable"
			},
			{
				"title": "Nordic Female Last Name",
				type: TableType.Name,
				"importPath": "nameTables/nordicFemaleLastNameTable",
				"className": "NordicFemaleLastNameTable"
			},
			{
				"title": "Nordic Female Name",
				type: TableType.Name,
				"importPath": "nameTables/nordicFemaleNameTable",
				"className": "NordicFemaleNameTable"
			},
			{
				"title": "Nordic Male Last Name",
				type: TableType.Name,
				"importPath": "nameTables/nordicMaleLastNameTable",
				"className": "NordicMaleLastNameTable"
			},
			{
				"title": "Nordic Male Name",
				type: TableType.Name,
				"importPath": "nameTables/nordicMaleNameTable",
				"className": "NordicMaleNameTable"
			},
			{
				"title": "Planet Name",
				type: TableType.Name,
				"importPath": "celestialTables/planet/planetNameTable",
				"className": "PlanetNameTable"
			},
			{
				"title": "Real World Dungeon Name",
				type: TableType.Name,
				"importPath": "dungeonTables/realWorldDungeonNameTable",
				"className": "RealWorldDungeonNameTable"
			},
			{
				"title": "Russian Female Name",
				type: TableType.Name,
				"importPath": "nameTables/russianFemaleNameTable",
				"className": "RussianFemaleNameTable"
			},
			{
				"title": "Russian Last Name",
				type: TableType.Name,
				"importPath": "nameTables/russianLastNameTable",
				"className": "RussianLastNameTable"
			},
			{
				"title": "Russian Male Name",
				type: TableType.Name,
				"importPath": "nameTables/russianMaleNameTable",
				"className": "RussianMaleNameTable"
			},
			{
				"title": "Solar System Name",
				type: TableType.Name,
				"importPath": "celestialTables/solarSystem/solarSystemNameTable",
				"className": "SolarSystemNameTable"
			},
			{
				"title": "South American Female Name",
				type: TableType.Name,
				"importPath": "nameTables/southAmericanFemaleNameTable",
				"className": "SouthAmericanFemaleNameTable"
			},
			{
				"title": "South American Last Name",
				type: TableType.Name,
				"importPath": "nameTables/southAmericanLastNameTable",
				"className": "SouthAmericanLastNameTable"
			},
			{
				"title": "South American Male Name",
				type: TableType.Name,
				"importPath": "nameTables/southAmericanMaleNameTable",
				"className": "SouthAmericanMaleNameTable"
			},
			{
				"title": "Sphere Connection Name",
				type: TableType.Name,
				"importPath": "celestialTables/sphereConnection/sphereConnectionNameTable",
				"className": "SphereConnectionNameTable"
			},
			{
				"title": "Sphere Name",
				type: TableType.Name,
				"importPath": "celestialTables/sphere/sphereNameTable",
				"className": "SphereNameTable"
			},
			{
				"title": "Sphere Name Prefixes",
				type: TableType.Name,
				"importPath": "celestialTables/sphere/sphereNamePrefixesTable",
				"className": "SphereNamePrefixesTable"
			},
			{
				"title": "Sphere Name Suffixes",
				type: TableType.Name,
				"importPath": "celestialTables/sphere/sphereNameSuffixesTable",
				"className": "SphereNameSuffixesTable"
			},
			{
				"title": "Universe Name",
				type: TableType.Name,
				"importPath": "celestialTables/universe/universeNameTable",
				"className": "UniverseNameTable"
			},
			{
				"title": "Universe Name Prefixes",
				type: TableType.Name,
				"importPath": "celestialTables/universe/universeNamePrefixesTable",
				"className": "UniverseNamePrefixesTable"
			},
			{
				"title": "Universe Name Suffixes",
				type: TableType.Name,
				"importPath": "celestialTables/universe/universeNameSuffixesTable",
				"className": "UniverseNameSuffixesTable"
			}
		]
	},
	{
		type: TableType.Nation,
		"tables": [
			{
				"title": "Nation",
				type: TableType.Nation,
				"importPath": "nationTables/nationTable",
				"className": "NationTable"
			},
			{
				"title": "Nation Adjective",
				type: TableType.Nation,
				"importPath": "nationTables/nationAdjectiveTable",
				"className": "NationAdjectiveTable"
			},
			{
				"title": "Nation Relationship",
				type: TableType.Nation,
				"importPath": "nationTables/nationRelationshipTable",
				"className": "NationRelationshipTable"
			},
			{
				"title": "Ruler Nicknames",
				type: TableType.Nation,
				"importPath": "nationTables/rulerNicknamesTable",
				"className": "RulerNicknamesTable"
			}
		]
	},
	{
		type: TableType.SoloRPG,
		"tables": [
			{
				"title": "Adventure Tone",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/adventureToneTable",
				"className": "AdventureToneTable"
			},
			{
				"title": "Alien Species Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/alienSpeciesDescriptorsTable",
				"className": "AlienSpeciesDescriptorsTable"
			},
			{
				"title": "Animal Actions",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/animalActionsTable",
				"className": "AnimalActionsTable"
			},
			{
				"title": "Army Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/armyDescriptorsTable",
				"className": "ArmyDescriptorsTable"
			},
			{
				"title": "Cavern Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/cavernDescriptorsTable",
				"className": "CavernDescriptorsTable"
			},
			{
				"title": "Character Actions (Combat)",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterActionsCombatTable",
				"className": "CharacterActionsCombatTable"
			},
			{
				"title": "Character Actions (General)",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterActionsGeneralTable",
				"className": "CharacterActionsGeneralTable"
			},
			{
				"title": "Character Appearance",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterAppearanceTable",
				"className": "CharacterAppearanceTable"
			},
			{
				"title": "Character Background",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterBackgroundTable",
				"className": "CharacterBackgroundTable"
			},
			{
				"title": "Character Conversations",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterConversationsTable",
				"className": "CharacterConversationsTable"
			},
			{
				"title": "Character Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterDescriptorsTable",
				"className": "CharacterDescriptorsTable"
			},
			{
				"title": "Character Identity",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterIdentityTable",
				"className": "CharacterIdentityTable"
			},
			{
				"title": "Character Motivations",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterMotivationsTable",
				"className": "CharacterMotivationsTable"
			},
			{
				"title": "Character Personality",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterPersonalityTable",
				"className": "CharacterPersonalityTable"
			},
			{
				"title": "Characters Elements",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/charactersElementsTable",
				"className": "CharactersElementsTable"
			},
			{
				"title": "Character Skills",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterSkillsTable",
				"className": "CharacterSkillsTable"
			},
			{
				"title": "Character Traits & Flaws",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/characterTraitsFlawsTable",
				"className": "CharacterTraitsFlawsTable"
			},
			{
				"title": "City Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/cityDescriptorsTable",
				"className": "CityDescriptorsTable"
			},
			{
				"title": "Civilization Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/civilizationDescriptorsTable",
				"className": "CivilizationDescriptorsTable"
			},
			{
				"title": "Creature Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/creatureDescriptorsTable",
				"className": "CreatureDescriptorsTable"
			},
			{
				"title": "Domicile Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/domicileDescriptorsTable",
				"className": "DomicileDescriptorsTable"
			},
			{
				"title": "Dungeon Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/dungeonDescriptorsTable",
				"className": "DungeonDescriptorsTable"
			},
			{
				"title": "Event Focus",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/eventFocusTable",
				"className": "EventFocusTable"
			},
			{
				"title": "Fate Chart",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/fateChartTable",
				"className": "FateChartTable"
			},
			{
				"title": "Forest Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/forestDescriptorsTable",
				"className": "ForestDescriptorsTable"
			},
			{
				"title": "Locations Elements",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/locationsElementsTable",
				"className": "LocationsElementsTable"
			},
			{
				"title": "Magic Item Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/magicItemDescriptorsTable",
				"className": "MagicItemDescriptorsTable"
			},
			{
				"title": "Mutation Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/mutationDescriptorsTable",
				"className": "MutationDescriptorsTable"
			},
			{
				"title": "Objects Elements",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/objectsElementsTable",
				"className": "ObjectsElementsTable"
			},
			{
				"title": "Plot Twists",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/plotTwistsTable",
				"className": "PlotTwistsTable"
			},
			{
				"title": "Scene Adjustment",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/sceneAdjustmentTable",
				"className": "SceneAdjustmentTable"
			},
			{
				"title": "Starship Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/starshipDescriptorsTable",
				"className": "StarshipDescriptorsTable"
			},
			{
				"title": "Terrain Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/terrainDescriptorsTable",
				"className": "TerrainDescriptorsTable"
			},
			{
				"title": "Undead Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/undeadDescriptorsTable",
				"className": "UndeadDescriptorsTable"
			},
			{
				"title": "Urban Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/urbanDescriptorsTable",
				"className": "UrbanDescriptorsTable"
			},
			{
				"title": "Wasteland Descriptors",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/wastelandDescriptorsTable",
				"className": "WastelandDescriptorsTable"
			},
			{
				"title": "Simplified Npc Action",
				type: TableType.SoloRPG,
				"importPath": "mythicTables/simplifiedNpcActionTable",
				"className": "SimplifiedNpcActionTable"
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
