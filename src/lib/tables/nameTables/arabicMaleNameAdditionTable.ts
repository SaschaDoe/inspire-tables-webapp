import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ArabicMaleNameAdditionTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Al'"))
        entries.push(new TableEntry("ibn"))
        entries.push(new TableEntry("sal"))
        entries.push(new TableEntry("abu"))
        super(entries, TableTitles.ArabicMaleNameAddition);
        this.tableType = TableType.Other;
    }
}