import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {QualityTable} from "../otherTables/qualityTable";
import {TrapFunctionTable} from "./trapFunctionTable";
import {TrapTriggerTable} from "./trapTriggerTable";

export class TrapTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new QualityTable())
            .withCascadingRole(new TrapFunctionTable())
            .with("triggered by")
            .withCascadingRole(new TrapTriggerTable()))
        super(entries, TableTitles.Trap);
        this.tableType = TableType.Location;
    }
}