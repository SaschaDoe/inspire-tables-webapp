import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {BuildingAdjectiveTable} from "../locationTables/buildingAdjectiveTable";
import {EpicSubstantiveTable} from "./epicSubstantiveTable";

export class DungeonNameTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new BuildingAdjectiveTable())
            .withCascadingRole(new EpicSubstantiveTable()));
        entries.push(new TableEntry("")
            .withCascadingRole(new EpicSubstantiveTable())
            .withCascadingRole(new EpicSubstantiveTable()));
        entries.push(new TableEntry("")
            .withCascadingRole(new BuildingAdjectiveTable())
            .withCascadingRole(new EpicSubstantiveTable())
            .withCascadingRole(new EpicSubstantiveTable()));
        super(entries, TableTitles.DungeonName);
    }
}