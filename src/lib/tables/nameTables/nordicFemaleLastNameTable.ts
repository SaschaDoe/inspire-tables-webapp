import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {NordicFemaleNameTable} from "./nordicFemaleNameTable";

export class NordicFemaleLastNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new NordicFemaleNameTable())
            .with("dottier"))
        super(entries, TableTitles.NordicFemaleLastName);
        this.tableType = TableType.Other;
    }
}