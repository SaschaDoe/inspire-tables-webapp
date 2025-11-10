import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {BarbaricFemaleNameTable} from "./barbaricFemaleNameTable";
import {BarbaricNicknameTable} from "./barbaricNicknameTable";

export class BarbaricLastNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("").withCascadingRole(new BarbaricNicknameTable()))
        entries.push(new TableEntry("bren").withCascadingRole(new BarbaricFemaleNameTable()))
        super(entries, TableTitles.BarbaricLastName);
        this.tableType = TableType.Other;
    }
}