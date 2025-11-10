import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class NationRelationshipTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("much trading"))
        entries.push(new TableEntry("friends"))
        entries.push(new TableEntry("long lasting treaty"))
        entries.push(new TableEntry("unstable treaty"))
        entries.push(new TableEntry("attacking"))
        entries.push(new TableEntry("ignoring"))
        entries.push(new TableEntry("wall off"))
        entries.push(new TableEntry("hating"))
        entries.push(new TableEntry("admiring"))
        entries.push(new TableEntry("just met"))
        super(entries, TableTitles.NationRelationship);
        this.tableType = TableType.Other;
    }
}