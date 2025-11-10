import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ArtefactTable} from "../artefactTables/artefactTable";
import {TownEventTable} from "./townEventTable";
import {BuildingTable} from "../locationTables/buildingTable";

// Note: External dependency removed - stub implementation
const addNewNSCToCharacterStoreReturnDescription = () => "NPC Character";
const addNewFractionToStoreReturnDescription = () => "Faction";

export class TownFameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("quality of product").withCascadingRole(new ArtefactTable()));
        entries.push(new TableEntry("home town of").withFunctionString(addNewNSCToCharacterStoreReturnDescription));
        entries.push(new TableEntry("way back there happened").withCascadingRole(new TownEventTable()));
        entries.push(new TableEntry("unknown"));
        entries.push(new TableEntry("sleepy nest"));
        entries.push(new TableEntry("very clean"));
        entries.push(new TableEntry("good inns"));
        entries.push(new TableEntry("very dirty"));
        entries.push(new TableEntry("beautiful decorated"));
        entries.push(new TableEntry("fraction house of").withFunctionString(addNewFractionToStoreReturnDescription));
        entries.push(new TableEntry("bad inns"));
        entries.push(new TableEntry("way is dangerous because of ").withFunctionString(addNewFractionToStoreReturnDescription));
        entries.push(new TableEntry("way is dangerous because of nature"));
        entries.push(new TableEntry("building").withCascadingRole(new BuildingTable()));
        super(entries, TableTitles.TownFame);
        this.tableType = TableType.Town;
    }
}