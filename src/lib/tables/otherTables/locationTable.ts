import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class LocationTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("high north "))
        entries.push(new TableEntry("northern "))
        entries.push(new TableEntry("middle land "))
        entries.push(new TableEntry("southern "))
        entries.push(new TableEntry("far south "))
        entries.push(new TableEntry("eastern "))
        entries.push(new TableEntry("far east"))
        entries.push(new TableEntry("western "))
        entries.push(new TableEntry("far west "))
        entries.push(new TableEntry("hidden "))
        super(entries, TableTitles.Location);
        this.tableType = TableType.Other;
    }
}