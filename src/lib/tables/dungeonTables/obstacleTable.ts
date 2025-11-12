import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {ElementTable} from "../otherTables/elementTable";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

// Note: External dependency removed - stub implementation
const addNewMonsterToStoreReturnUniqueName = () => "Monster";

export class ObstacleTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("wall"))
        entries.push(new TableEntry("pit"))
        entries.push(new TableEntry("pit with").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("pit with").withFunctionString(addNewMonsterToStoreReturnUniqueName))
        entries.push(new TableEntry("pile"))
        entries.push(new TableEntry("stream of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("cadaver of").withFunctionString(addNewMonsterToStoreReturnUniqueName))
        super(entries, TableTitles.Obstacle);
        this.tableType = TableType.Dungeon;
    }
}