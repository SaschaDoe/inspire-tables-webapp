import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {BuildingAdjectiveTable} from "../locationTables/buildingAdjectiveTable";
import {BuildingTable} from "../locationTables/buildingTable";

export class DungeonEntriesTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new BuildingAdjectiveTable())
            .withCascadingRole(new BuildingTable()))
        super(entries,
            TableTitles.DungeonEntry,
            TableType.Location);
    }
}