import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ClimacticTropeTable} from "./climacticTrope";
import {EndingTropeTable} from "./endingTropeTable";

export class AdventureFinalTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new ClimacticTropeTable()));
        entries.push(new TableEntry("")
            .withCascadingRole(new EndingTropeTable()));
        super(entries, TableTitles.AdventureFinal);
        this.tableType = TableType.Other;
    }
}