import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {LandscapeTable} from "../locationTables/landscapeTable";
import {HistoricalEventTable} from "../otherTables/historicalEventTable";

// Note: External dependencies removed - charStore
// Stub implementations
const addNewNSCToCharacterStoreReturnDescription = () => "NPC Character";
const chooseHigherPowerReturnDescription = () => "Higher Power";
const createHigherPowerReturnDescription = () => "Divine Entity";

export class BeginningTropeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("action prologue")) //matrix
        entries.push(new TableEntry("how we got here"))
        entries.push(new TableEntry("dealing with thread not connected to the plot"))//every james bond
        entries.push(new TableEntry("big first choice")) // pokemon, fire emblem
        entries.push(new TableEntry("villains take over the heroes lair")) //dune, hobbit3, star wars 1
        entries.push(new TableEntry("boy meets girl, lost each other"))
        entries.push(new TableEntry("evacuation"))
        entries.push(new TableEntry("business as unusual"))
        entries.push(new TableEntry("chilly reception")) //kung fu panda
        entries.push(new TableEntry("training scene"))
        entries.push(new TableEntry("exit game awakening"))
        entries.push(new TableEntry("distant prologue"))
        entries.push(new TableEntry("tragic beginning"))//batman
        entries.push(new TableEntry("dream intro"))
        entries.push(new TableEntry("easing into adventure"))
        entries.push(new TableEntry("fake opening"))
        entries.push(new TableEntry("fall in angel"))//5.Element
        entries.push(new TableEntry("from new york to nowhere"))//hot fuzz
        entries.push(new TableEntry("from zero to hero"))
        entries.push(new TableEntry("finally awake"))
        entries.push(new TableEntry("heroes birthday"))//mostly adulthood
        entries.push(new TableEntry("a hero is born"))//superman
        entries.push(new TableEntry("idols blessing"))
        entries.push(new TableEntry("in medias res"))
        entries.push(new TableEntry("inciting incident"))
        entries.push(new TableEntry("introducing credits like in gladiator arena"))
        entries.push(new TableEntry("it was a dark and stormy night"))
        entries.push(new TableEntry("describing landscape").withCascadingRole(new LandscapeTable()))
        entries.push(new TableEntry("mourning routine"))
        entries.push(new TableEntry("latecomer"))
        entries.push(new TableEntry("last day of normal then").withCascadingRole(new HistoricalEventTable()))
        entries.push(new TableEntry("minor kidroduction"))
        entries.push(new TableEntry("opening monologue"))
        entries.push(new TableEntry("opening text scroll"))
        entries.push(new TableEntry("out of job into plot"))
        entries.push(new TableEntry("cheating"))
        entries.push(new TableEntry("post-adventure adventure"))
        entries.push(new TableEntry("pre-meeting").withFunctionString(addNewNSCToCharacterStoreReturnDescription))
        entries.push(new TableEntry("pride before the fall"))
        entries.push(new TableEntry("chasing scene")) //winner is :cloverfield (21min beginning chasing scene)
        entries.push(new TableEntry("resurrected for the job"))
        entries.push(new TableEntry("start corpse"))
        entries.push(new TableEntry("story book beginning"))
        entries.push(new TableEntry("stumbled into the plot"))
        entries.push(new TableEntry("villain scene").withFunctionString(addNewNSCToCharacterStoreReturnDescription))
        entries.push(new TableEntry("you all meet in a cell"))
        entries.push(new TableEntry("you all meet near of your death"))
        entries.push(new TableEntry("wake up on a beach"))
        entries.push(new TableEntry("death bed scene"))
        entries.push(new TableEntry("eldar history lesson").withFunctionString(chooseHigherPowerReturnDescription))
        super(entries, TableTitles.BeginningTrope);
        this.tableType = TableType.Other;
    }
}