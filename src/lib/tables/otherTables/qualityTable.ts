import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class QualityTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("perfect"))
        entries.push(new TableEntry("masterpiece"))
        entries.push(new TableEntry("high quality"))
        entries.push(new TableEntry("well processed"))
        entries.push(new TableEntry("robust"))
        entries.push(new TableEntry("bad quality"))
        entries.push(new TableEntry("broken"))
        entries.push(new TableEntry("decayed"))
        super(entries, TableTitles.Quality);
        this.tableType = TableType.Other;
    }
}