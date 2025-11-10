import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class NationTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("family"))
        entries.push(new TableEntry("band"))
        entries.push(new TableEntry("clan"))
        entries.push(new TableEntry("union"))
        entries.push(new TableEntry("nation"))
        entries.push(new TableEntry("kingdom"))
        entries.push(new TableEntry("republic"))
        entries.push(new TableEntry("federation"))
        entries.push(new TableEntry("united nations of"))
        super(entries, TableTitles.Nation);
        this.tableType = TableType.Other;
    }
}