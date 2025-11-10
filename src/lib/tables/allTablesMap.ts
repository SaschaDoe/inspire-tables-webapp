import {TableTitles} from "./tableTitles";
import type {Table} from "./table";
import {GenderTable} from "./charTables/genderTable";
import {GermanFemaleNameTable} from "./nameTables/germanFemaleNameTable";
import {GermanMaleNameTable} from "./nameTables/germanMaleNameTable";
import {SpecialFeaturesTable} from "./charTables/specialFeaturesTable";
import {MotivationTable} from "./charTables/motivationTable";
import {CurseTable} from "./charTables/curseTable";
import {NobilityTable} from "./charTables/nobilityTable";
import {AlignmentTable} from "./charTables/alignmentTable";
import {ProfessionTable} from "./charTables/professionTable";
import {RaceTable} from "./charTables/raceTable";
import {AdvantageTable} from "./charTables/advantageTable";
import {DisadvantageTable} from "./charTables/disadvantageTable";
import {TalentTable} from "./talentTables/talentTable";
import {RarityTable} from "./otherTables/rarityTable";
import {MagicalTalentTable} from "./talentTables/magicalTalentTable";
import {ContinentTable} from "./locationTables/continentTable";
import {StructureTable} from "./dungeonTables/structureTable";
import {DungeonEntriesTable} from "./dungeonTables/dungeonEntriesTable";
import {TreasureTable} from "./artefactTables/treasureTable";
import {FurnishingTable} from "./dungeonTables/furnishingTable";
import {ObstacleTable} from "./dungeonTables/obstacleTable";
import {TrapTable} from "./dungeonTables/trapTable";
import {MonsterEncounterTypeTable} from "./monsterTables/monsterEncounterTypeTable";
import {QualityTable} from "./otherTables/qualityTable";
import {MaterialsTable} from "./artefactTables/materialsTable";
import {ArtefactTable} from "./artefactTables/artefactTable";
import {ProfaneTalentTable} from "./talentTables/profaneTalentTable";
import {SphereTable} from "./locationTables/sphereTable";
import {ProfaneArtefactTable} from "./artefactTables/profaneArtefactTable";
import {ColourTable} from "./otherTables/colourTable";
import {ArtworkTable} from "./artefactTables/artworkTable";
import {LandscapeTable} from "./locationTables/landscapeTable";
import {PositionTable} from "./otherTables/positionTable";
import {HistoricalEventTable} from "./otherTables/historicalEventTable";
import {BuildingTable} from "./locationTables/buildingTable";
import {FractionNameTable} from "./otherTables/fractionNameTable";
import {FractionWealthTable} from "./otherTables/fractionWealthTable";
import {FractionQuestTable} from "./otherTables/fractionQuestTable";
import {CraftTable} from "./talentTables/craftTable";
import {AthleticsTalentTable} from "./talentTables/athleticsTalentTable";
import {ArtistTalentTable} from "./talentTables/artistTalentTable";
import {AdventureEventTable} from "./adventureTables/adventureEventTable";
import {CharacterAsDeviceTable} from "./charTables/characterAsDeviceTable";
import {RealCultureTable} from "./cultureTables/realCultureTable";
import {TransitionTable} from "./dungeonTables/transitionTable";

export class AllTablesMap{
    private readonly allTablesMap: Map<TableTitles, Table>;

    constructor(allTablesMap = new Map<TableTitles, Table>()) {
        this.allTablesMap = allTablesMap;
        if(this.allTablesMap.size === 0){
            this.initializeAllTablesMap()
        }
    }

    getTableOf(tableTitle: TableTitles){
        let table = this.allTablesMap.get(tableTitle);
        if(table === undefined){
            throw new Error(`Table title: ${tableTitle} is not in all tables map`);
        }
        return table;
    }

    private initializeAllTablesMap() {
        this.allTablesMap.set(TableTitles.Gender, new GenderTable());
        this.allTablesMap.set(TableTitles.GermanFemaleNames, new GermanFemaleNameTable());
        this.allTablesMap.set(TableTitles.GermanMaleName, new GermanMaleNameTable());
        this.allTablesMap.set(TableTitles.SpecialFeatures, new SpecialFeaturesTable());
        this.allTablesMap.set(TableTitles.Motivation, new MotivationTable());
        this.allTablesMap.set(TableTitles.Curse, new CurseTable());
        this.allTablesMap.set(TableTitles.Nobility, new NobilityTable());
        this.allTablesMap.set(TableTitles.Alignment, new AlignmentTable());
        this.allTablesMap.set(TableTitles.Profession, new ProfessionTable());
        this.allTablesMap.set(TableTitles.Race, new RaceTable());
        this.allTablesMap.set(TableTitles.Advantages, new AdvantageTable());
        this.allTablesMap.set(TableTitles.Disadvantages, new DisadvantageTable());
        this.allTablesMap.set(TableTitles.Talent, new TalentTable());
        this.allTablesMap.set(TableTitles.Rarity, new RarityTable());
        this.allTablesMap.set(TableTitles.MagicalTalent, new MagicalTalentTable());
        this.allTablesMap.set(TableTitles.Continent, new ContinentTable());
        this.allTablesMap.set(TableTitles.Structure, new StructureTable());
        this.allTablesMap.set(TableTitles.DungeonEntry, new DungeonEntriesTable());
        this.allTablesMap.set(TableTitles.Treasure, new TreasureTable());
        this.allTablesMap.set(TableTitles.Furnishing, new FurnishingTable());
        this.allTablesMap.set(TableTitles.Obstacle, new ObstacleTable());
        this.allTablesMap.set(TableTitles.Trap, new TrapTable());
        this.allTablesMap.set(TableTitles.MonsterEncounterType, new MonsterEncounterTypeTable());
        this.allTablesMap.set(TableTitles.Quality, new QualityTable());
        this.allTablesMap.set(TableTitles.Materials, new MaterialsTable());
        this.allTablesMap.set(TableTitles.Artefact, new ArtefactTable());
        this.allTablesMap.set(TableTitles.ProfaneTalent, new ProfaneTalentTable());
        this.allTablesMap.set(TableTitles.Sphere, new SphereTable());
        this.allTablesMap.set(TableTitles.ProfaneArtefact, new ProfaneArtefactTable());
        this.allTablesMap.set(TableTitles.Artwork, new ArtworkTable());
        this.allTablesMap.set(TableTitles.Colour, new ColourTable());
        this.allTablesMap.set(TableTitles.Landscape, new LandscapeTable());
        this.allTablesMap.set(TableTitles.Position, new PositionTable());
        this.allTablesMap.set(TableTitles.HistoricalEvent, new HistoricalEventTable());
        this.allTablesMap.set(TableTitles.Building, new BuildingTable());
        this.allTablesMap.set(TableTitles.FractionName, new FractionNameTable());
        this.allTablesMap.set(TableTitles.FractionWealth, new FractionWealthTable());
        this.allTablesMap.set(TableTitles.FractionQuest, new FractionQuestTable());
        this.allTablesMap.set(TableTitles.CraftTalent, new CraftTable());
        this.allTablesMap.set(TableTitles.AthleticsTalent, new AthleticsTalentTable());
        this.allTablesMap.set(TableTitles.ArtistTalent, new ArtistTalentTable());
        this.allTablesMap.set(TableTitles.AdventureEvent, new AdventureEventTable());
        this.allTablesMap.set(TableTitles.CharacterAsDevice, new CharacterAsDeviceTable());
        this.allTablesMap.set(TableTitles.RealCulture, new RealCultureTable());
        this.allTablesMap.set(TableTitles.Transition, new TransitionTable());
    }
}


