import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ArabicFemaleNameAdditionTable} from "./arabicFemaleNameAdditionTable";
import {ArabicFemaleNameTable} from "./arabicFemaleNameTable";

export class ArabicFemaleLastNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new ArabicFemaleNameAdditionTable())
            .withCascadingRole(new ArabicFemaleNameTable()))
        super(entries, TableTitles.ArabicFemaleLastName);
        this.tableType = TableType.Other;
    }
}