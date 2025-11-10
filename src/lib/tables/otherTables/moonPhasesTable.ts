import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class MoonPhasesTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("full moon"))
        entries.push(new TableEntry("wet moon"))
        entries.push(new TableEntry("dry moon"))
        entries.push(new TableEntry("half moon"))
        entries.push(new TableEntry("new moon"))
        entries.push(new TableEntry("blood moon"))
        entries.push(new TableEntry("lunar eclipse"))
        super(entries, TableTitles.MoonPhases);
        this.tableType = TableType.Other;
    }
}