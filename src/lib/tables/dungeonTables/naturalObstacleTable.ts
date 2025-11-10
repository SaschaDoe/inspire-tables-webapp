import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {ElementTable} from "../otherTables/elementTable";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class NaturalObstacleTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("quicksand"))
        entries.push(new TableEntry("swamp"))
        entries.push(new TableEntry("pit of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("spider web"))
        entries.push(new TableEntry("huge amount of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("slippery underground"))
        entries.push(new TableEntry("high fall"))
        super(entries, TableTitles.NaturalObstacle);
        this.tableType = TableType.Location;
    }
}