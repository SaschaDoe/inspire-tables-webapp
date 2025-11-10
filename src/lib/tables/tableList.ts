import {RaceTable} from "./charTables/raceTable";
import {GenderTable} from "./charTables/genderTable";
import {AnimalTable} from "./charTables/animalTable";
import {FantasyCreatureTable} from "./charTables/fantasyCreatureTable";
import {NobilityTable} from "./charTables/nobilityTable";
import {AlignmentTable} from "./charTables/alignmentTable";
import {AttitudeTable} from "./charTables/attitudeTable";
import {AdvantageTable} from "./charTables/advantageTable";
import {DisadvantageTable} from "./charTables/disadvantageTable";
import {CurseTable} from "./charTables/curseTable";
import {ProfessionTable} from "./charTables/professionTable";
import {MotivationTable} from "./charTables/motivationTable";
import {GermanMaleNameTable} from "./nameTables/germanMaleNameTable";
import {GermanFemaleNameTable} from "./nameTables/germanFemaleNameTable";
import {RelationshipTypeTable} from "./charTables/relationshipTypeTable";
import {ContinentTable} from "./locationTables/continentTable";
import {SphereTable} from "./locationTables/sphereTable";
import {WeaponTable} from "./artefactTables/weaponTable";
import {ArmorTable} from "./artefactTables/armorTable";
import {JewelryTable} from "./artefactTables/jewelryTable";
import {GemstoneTable} from "./artefactTables/gemstoneTable";
import {MaterialsTable} from "./artefactTables/materialsTable";
import {AttributeTable} from "./charTables/attributeTable";
import {SenseTable} from "./otherTables/senseTable";
import {SizeTable} from "./otherTables/sizeTable";
import {LocationTable} from "./otherTables/locationTable";
import {WeatherAdjectiveTable} from "./otherTables/weatherAdjectiveTable";
import {VocalTable} from "./otherTables/vocalTable";
import {RarityTable} from "./otherTables/rarityTable";
import {QualityTable} from "./otherTables/qualityTable";
import {BodyPartsTable} from "./otherTables/bodyPartsTable";
import {ElementTable} from "./otherTables/elementTable";
import {StructureTable} from "./dungeonTables/structureTable";
import {BuildingTable} from "./locationTables/buildingTable";
import {BuildingAdjectiveTable} from "./locationTables/buildingAdjectiveTable";
import {DungeonEntriesTable} from "./dungeonTables/dungeonEntriesTable";
import {DungeonNameTable} from "./nameTables/dungeonNameTable";
import {EpicSubstantiveTable} from "./nameTables/epicSubstantiveTable";
import {TalentTable} from "./talentTables/talentTable";
import {TalentCategoryTable} from "./talentTables/talentCategoryTable";
import {ElementalTalentTable} from "./talentTables/elementalTalentTable";
import {FromAnotherHigherPowerTalent} from "./talentTables/fromAnotherHigherPowerTalent";
import {TargetTalentTable} from "./talentTables/targetTalentTable";
import {ChangeTalentTable} from "./talentTables/changeTalentTable";
import {ArtefactTable} from "./artefactTables/artefactTable";
import {MagicalTalentTable} from "./talentTables/magicalTalentTable";
import {MagicalArtefactTable} from "./artefactTables/magicalArtefactTable";
import {SummonTalentTable} from "./talentTables/summonTalentTable";
import {MetaMagicTalentTable} from "./talentTables/metaMagicTalentTable";
import {ProphecyTalentTable} from "./talentTables/prophecyTalentTable";
import {LimitationTable} from "./talentTables/limitationTable";
import {EmotionTable} from "./otherTables/emotionTable";
import {PsyTalentTable} from "./talentTables/psyTalentTable";
import {HealingTalentTable} from "./talentTables/healingTalentTable";
import {ObjectEnchantmentTable} from "./talentTables/objectEnchantmentTable";
import {ArtefactAdjectiveTable} from "./artefactTables/artefactAdjectiveTable";
import {TreasureTable} from "./artefactTables/treasureTable";
import {FurnishingTable} from "./dungeonTables/furnishingTable";
import {WeatherTable} from "./otherTables/weatherTable";
import {ObstacleTable} from "./dungeonTables/obstacleTable";
import {TrapTriggerTable} from "./dungeonTables/trapTriggerTable";
import {NaturalObstacleTable} from "./dungeonTables/naturalObstacleTable";
import {TrapFunctionTable} from "./dungeonTables/trapFunctionTable";
import {TrapTable} from "./dungeonTables/trapTable";
import {MonsterAdjectiveTable} from "./monsterTables/monsterAdjectiveTable";
import {MonsterNumberTable} from "./monsterTables/monsterNumberTable";
import {MonsterReproductionTable} from "./monsterTables/monsterReproductionTable";
import {MonsterMealTable} from "./monsterTables/monsterMealTable";
import {MonsterEncounterTypeTable} from "./monsterTables/monsterEncounterTypeTable";
import {SpecialFeaturesTable} from "./charTables/specialFeaturesTable";
import {MonsterTable} from "./monsterTables/monsterTable";
import {NaturalEvents} from "./otherTables/naturalEvents";
import {TownEventTable} from "./townTables/townEventTable";
import {TimeTalentTable} from "./talentTables/timeTalentTable";
import {TravelTalentTable} from "./talentTables/travelTalentTable";
import {HistoricalEventTable} from "./otherTables/historicalEventTable";
import {TownSizeTable} from "./townTables/townSizeTable";
import {TownFameTable} from "./townTables/townFameTable";
import {ColourTable} from "./otherTables/colourTable";
import {ProfaneArtefactTable} from "./artefactTables/profaneArtefactTable";
import {ArtworkTable} from "./artefactTables/artworkTable";
import {LandscapeTable} from "./locationTables/landscapeTable";
import {PositionTable} from "./otherTables/positionTable";
import {FractionNameTable} from "./otherTables/fractionNameTable";
import {FractionWealthTable} from "./otherTables/fractionWealthTable";
import {FractionQuestTable} from "./otherTables/fractionQuestTable";
import {CraftTable} from "./talentTables/craftTable";
import {AthleticsTalentTable} from "./talentTables/athleticsTalentTable";
import {ArtistTalentTable} from "./talentTables/artistTalentTable";
import {ProfaneTalentTable} from "./talentTables/profaneTalentTable";
import {AdventureEventTable} from "./adventureTables/adventureEventTable";
import {BeginningTropeTable} from "./adventureTables/beginningTropeTable";
import {CharacterAsDeviceTable} from "./charTables/characterAsDeviceTable";
import {CharacterIntroductionTable} from "./adventureTables/characterIntroductionTable";
import {ClimacticTropeTable} from "./adventureTables/climacticTrope";
import {ConflictTropeTable} from "./adventureTables/conflictTropeTable";
import {CharacterShadowArchetypeTable} from "./charTables/characterShadowArchetypeTable";
import {EndingTropeTable} from "./adventureTables/endingTropeTable";
import {PlotTropeTable} from "./adventureTables/plotTropeTable";
import {NarrationTable} from "./adventureTables/narrationTable";
import {AdventureBeginningTable} from "./adventureTables/adventureBeginningTable";
import {AdventureFinalTable} from "./adventureTables/adventureFinalTable";
import {AdventureRisingTable} from "./adventureTables/adventureRisingTable";
import {PlanTable} from "./adventureTables/planTable";
import {SeasonTable} from "./otherTables/seasonTable";
import {VillainAdjectiveTable} from "./adventureTables/villainAdjectiveTable";
import {NationAdjectiveTable} from "./nationTables/nationAdjectiveTable";
import {TechnologyTable} from "./otherTables/technologyTable";
import {NationTable} from "./nationTables/nationTable";
import {NationRelationshipTable} from "./nationTables/nationRelationshipTable";
import {RulerNicknamesTable} from "./nationTables/rulerNicknamesTable";
import {RealCultureTable} from "./cultureTables/realCultureTable";
import {SouthAmericanFemaleNameTable} from "./nameTables/southAmericanFemaleNameTable";
import {SouthAmericanMaleNameTable} from "./nameTables/southAmericanMaleNameTable";
import {SouthAmericanLastNameTable} from "./nameTables/southAmericanLastNameTable";
import {RussianFemaleNameTable} from "./nameTables/russianFemaleNameTable";
import {RussianMaleNameTable} from "./nameTables/russianMaleNameTable";
import {RussianLastNameTable} from "./nameTables/russianLastNameTable";
import {GreekFemaleNameTable} from "./nameTables/greekFemaleNameTable";
import {GreekMaleNameTable} from "./nameTables/greekMaleNameTable";
import {GreekLastNameTable} from "./nameTables/greekLastNameTable";
import {GreekPlaceName} from "./nameTables/greekPlaceName";
import {AfricanNameTable} from "./nameTables/africanNameTable";
import {BarbaricFemaleNameTable} from "./nameTables/barbaricFemaleNameTable";
import {BarbaricMaleNameTable} from "./nameTables/barbaricMaleNameTable";
import {BarbaricLastNameTable} from "./nameTables/barbaricLastNameTable";
import {FrenchFemaleNameTable} from "./nameTables/frenchFemaleNameTable";
import {FrenchMaleNameTable} from "./nameTables/frenchMaleNameTable";
import {FrenchPlaceNameTable} from "./nameTables/frenchPlaceNameTable";
import {FrenchLastNameTable} from "./nameTables/frenchLastNameTable";
import {IndianMaleNameTable} from "./nameTables/indianMaleNameTable";
import {IndianFemaleNameTable} from "./nameTables/indianFemaleNameTable";
import {NordicFemaleNameTable} from "./nameTables/nordicFemaleNameTable";
import {NordicMaleNameTable} from "./nameTables/nordicMaleNameTable";
import {ArabicMaleNameTable} from "./nameTables/arabicMaleNameTable";
import {ArabicFemaleNameTable} from "./nameTables/arabicFemaleNameTable";
import {ArabicMaleLastNameTable} from "./nameTables/arabicMaleLastNameTable";
import {NordicMaleLastNameTable} from "./nameTables/nordicMaleLastNameTable";
import {NordicFemaleLastNameTable} from "./nameTables/nordicFemaleLastNameTable";
import {ArabicFemaleLastNameTable} from "./nameTables/arabicFemaleLastNameTable";
import {ArabicFemaleNameAdditionTable} from "./nameTables/arabicFemaleNameAdditionTable";
import {ArabicMaleNameAdditionTable} from "./nameTables/arabicMaleNameAdditionTable";
import {BarbaricNicknameTable} from "./nameTables/barbaricNicknameTable";
import {ElfenFemaleNameTable} from "./nameTables/elfenFemaleNameTable";
import {ElfenMaleNameTable} from "./nameTables/elfenMaleNameTable";
import {ElfenLastName} from "./nameTables/elfenLastName";
import {VerbTable} from "./nameTables/verbTable";
import {TransitionTable} from "./dungeonTables/transitionTable";
import {TransitionAdjectiveTable} from "./dungeonTables/transitionAdjectiveTable";

export let adventureTables = [
    new AdventureEventTable(),
    new AdventureBeginningTable(),
    new BeginningTropeTable(),
    new PlanTable(),
    new VillainAdjectiveTable(),
    new AdventureRisingTable(),
    new PlotTropeTable(),
    new CharacterIntroductionTable(),
    new ClimacticTropeTable(),
    new ConflictTropeTable(),
    new NarrationTable(),
    new EndingTropeTable(),
    new AdventureFinalTable(),
]
export let charTables = [
    new RaceTable(),
    new GenderTable(),
    new CharacterAsDeviceTable(),
    new CharacterShadowArchetypeTable(),
    new AnimalTable(),
    new FantasyCreatureTable(),
    new NobilityTable(),
    new AlignmentTable(),
    new AttitudeTable(),
    new AdvantageTable(),
    new DisadvantageTable(),
    new CurseTable(),
    new ProfessionTable(),
    new MotivationTable(),
    new RelationshipTypeTable(),
    new SpecialFeaturesTable(),
];
export let monsterTables = [
    new MonsterAdjectiveTable(),
    new MonsterNumberTable(),
    new MonsterReproductionTable(),
    new MonsterMealTable(),
    new MonsterEncounterTypeTable(),
    new MonsterTable(),
]
export let talentTables = [
    new TalentTable(),
    new MagicalTalentTable(),
    new ProfaneTalentTable(),
    new TalentCategoryTable(),
    new TargetTalentTable(),
    new ElementalTalentTable(),
    new FromAnotherHigherPowerTalent(),
    new ChangeTalentTable(),
    new SummonTalentTable(),
    new MetaMagicTalentTable(),
    new ProphecyTalentTable(),
    new LimitationTable(),
    new PsyTalentTable(),
    new HealingTalentTable(),
    new ObjectEnchantmentTable(),
    new TimeTalentTable(),
    new TravelTalentTable(),
    new CraftTable(),
    new AthleticsTalentTable(),
    new ArtistTalentTable(),
]
export let locationTables = [
    new ContinentTable(),
    new SphereTable(),
    new BuildingTable(),
    new BuildingAdjectiveTable(),
    new LandscapeTable(),
    new NationAdjectiveTable(),
]
export let dungeonTables = [
    new FurnishingTable(),
    new ObstacleTable(),
    new TrapTriggerTable(),
    new NaturalObstacleTable(),
    new TrapFunctionTable(),
    new TrapTable(),
    new StructureTable(),
    new DungeonEntriesTable(),
    new TransitionTable(),
    new TransitionAdjectiveTable(),
]
export let townTables = [
    new TownEventTable(),
    new TownSizeTable(),
    new TownFameTable(),
]
export let artefactsTables = [
    new ArtefactTable(),
    new ArtefactAdjectiveTable(),
    new MagicalArtefactTable(),
    new TreasureTable(),
    new WeaponTable(),
    new ArmorTable(),
    new JewelryTable(),
    new GemstoneTable(),
    new MaterialsTable(),
    new ProfaneArtefactTable(),
    new ArtworkTable(),
]
export let nameTables = [
    new DungeonNameTable(),
    new EpicSubstantiveTable(),
    new GermanFemaleNameTable(),
    new GermanMaleNameTable(),
    new SouthAmericanFemaleNameTable(),
    new SouthAmericanMaleNameTable(),
    new SouthAmericanLastNameTable(),
    new RussianFemaleNameTable(),
    new RussianMaleNameTable(),
    new RussianLastNameTable(),
    new GreekFemaleNameTable(),
    new GreekMaleNameTable(),
    new GreekLastNameTable(),
    new GreekPlaceName(),
    new AfricanNameTable(),
    new BarbaricFemaleNameTable(),
    new BarbaricMaleNameTable(),
    new BarbaricLastNameTable(),
    new BarbaricNicknameTable(),
    new FrenchFemaleNameTable(),
    new FrenchMaleNameTable(),
    new FrenchLastNameTable(),
    new FrenchPlaceNameTable(),
    new IndianMaleNameTable(),
    new IndianFemaleNameTable(),
    new NordicFemaleNameTable(),
    new NordicMaleNameTable(),
    new NordicMaleLastNameTable(),
    new NordicFemaleLastNameTable(),
    new ArabicMaleNameTable(),
    new ArabicFemaleNameTable(),
    new ArabicMaleLastNameTable(),
    new ArabicFemaleLastNameTable(),
    new ArabicFemaleNameAdditionTable(),
    new ArabicMaleNameAdditionTable(),
    new ElfenFemaleNameTable(),
    new ElfenMaleNameTable(),
    new ElfenLastName(),
]
export let otherTables = [
    new AttributeTable(),
    new SenseTable(),
    new SizeTable(),
    new LocationTable(),
    new WeatherTable(),
    new WeatherAdjectiveTable(),
    new VocalTable(),
    new RarityTable(),
    new QualityTable(),
    new BodyPartsTable(),
    new ElementTable(),
    new EmotionTable(),
    new NaturalEvents(),
    new PositionTable(),
    new HistoricalEventTable,
    new ColourTable(),
    new FractionNameTable(),
    new FractionWealthTable(),
    new FractionQuestTable(),
    new SeasonTable(),
    new TechnologyTable(),
    new NationTable(),
    new NationRelationshipTable(),
    new RulerNicknamesTable(),
    new RealCultureTable(),
    new VerbTable(),
]

export let allTables =
    adventureTables
        .concat(charTables)
        .concat(monsterTables)
        .concat(talentTables)
        .concat(locationTables)
        .concat(dungeonTables)
        .concat(townTables)
        .concat(artefactsTables)
        .concat(nameTables)
        .concat(otherTables);
