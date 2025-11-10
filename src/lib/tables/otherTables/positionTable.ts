import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class PositionTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("right"))
        entries.push(new TableEntry("top"))
        entries.push(new TableEntry("bottom"))
        entries.push(new TableEntry("left"))
        entries.push(new TableEntry("middle"))
        entries.push(new TableEntry("right top"))
        entries.push(new TableEntry("right bottom"))
        entries.push(new TableEntry("left top"))
        entries.push(new TableEntry("left bottom"))
        super(entries, TableTitles.Quality);
        this.tableType = TableType.Other;
    }
}