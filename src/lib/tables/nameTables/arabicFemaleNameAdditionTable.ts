import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ArabicFemaleNameAdditionTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Al'"))
        entries.push(new TableEntry("bint"))
        entries.push(new TableEntry("umm"))
        entries.push(new TableEntry("sala"))
        super(entries, TableTitles.ArabicFemaleNameAddition);
        this.tableType = TableType.Other;
    }
}