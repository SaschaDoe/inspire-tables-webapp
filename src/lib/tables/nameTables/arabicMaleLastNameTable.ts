import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ArabicMaleNameTable} from "./arabicMaleNameTable";
import {ArabicMaleNameAdditionTable} from "./arabicMaleNameAdditionTable";

export class ArabicMaleLastNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new ArabicMaleNameAdditionTable())
            .withCascadingRole(new ArabicMaleNameTable()))
        super(entries, TableTitles.ArabicMaleLastName);
        this.tableType = TableType.Other;
    }
}