import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ClimacticTropeTable} from "./climacticTrope";

export class AdventureClimaxTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new ClimacticTropeTable()));
        super(entries, TableTitles.AdventureClimax);
        this.tableType = TableType.Other;
    }
}