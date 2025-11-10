import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

// Note: External dependency removed - stub implementation
const addNewMonsterToStoreReturnUniqueName = () => "Monster";

export class TrapTriggerTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("manuel"))
        entries.push(new TableEntry("robe"))
        entries.push(new TableEntry("button"))
        entries.push(new TableEntry("loose hatch"))
        entries.push(new TableEntry("fire"))
        entries.push(new TableEntry("robe on sleeping ").withFunctionString(addNewMonsterToStoreReturnUniqueName))
        entries.push(new TableEntry("needs no trigger"))
        super(entries, TableTitles.TrapTrigger);
        this.tableType = TableType.Location;
    }
}