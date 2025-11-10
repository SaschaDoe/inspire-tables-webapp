import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class TownSizeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("refuge"));
        entries.push(new TableEntry("homestead"));
        entries.push(new TableEntry("village"));
        entries.push(new TableEntry("town"));
        entries.push(new TableEntry("regional capital"));
        entries.push(new TableEntry("metropolis"));
        super(entries, TableTitles.TownSize);
        this.tableType = TableType.Town;
    }
}