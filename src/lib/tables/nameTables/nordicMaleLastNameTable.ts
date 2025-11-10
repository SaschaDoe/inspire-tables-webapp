import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {NordicMaleNameTable} from "./nordicMaleNameTable";

export class NordicMaleLastNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new NordicMaleNameTable())
            .with("son"))
        super(entries, TableTitles.NordicMaleLastName);
        this.tableType = TableType.Other;
    }
}