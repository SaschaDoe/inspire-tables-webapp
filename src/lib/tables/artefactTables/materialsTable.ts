import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {GemstoneTable} from "./gemstoneTable";

export class MaterialsTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("silver"))
        entries.push(new TableEntry("gold"))
        entries.push(new TableEntry("platinum"))
        entries.push(new TableEntry("steel"))
        entries.push(new TableEntry("bronze"))
        entries.push(new TableEntry("lead"))
        entries.push(new TableEntry("").withCascadingRole(new GemstoneTable()))
        entries.push(new TableEntry("bone"))
        entries.push(new TableEntry("wood"))
        entries.push(new TableEntry("stone"))
        entries.push(new TableEntry("glass"))
        super(entries, TableTitles.Materials);
        this.tableType = TableType.Artefact;
    }
}