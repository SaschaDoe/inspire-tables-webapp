import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class BlankTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry(""))
        super(entries, TableTitles.Blank);
        this.tableType = TableType.Other;
    }
}