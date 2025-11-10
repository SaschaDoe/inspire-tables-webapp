import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class VocalTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("a"))
        entries.push(new TableEntry("e"))
        entries.push(new TableEntry("i"))
        entries.push(new TableEntry("o"))
        entries.push(new TableEntry("u"))
        entries.push(new TableEntry("ä"))
        entries.push(new TableEntry("ö"))
        entries.push(new TableEntry("ü"))
        entries.push(new TableEntry("j"))
        entries.push(new TableEntry("y"))
        super(entries, TableTitles.Vocal);
        this.tableType = TableType.Other;
    }
}