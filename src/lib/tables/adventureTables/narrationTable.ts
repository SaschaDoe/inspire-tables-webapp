import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class NarrationTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("landscape description"))
        entries.push(new TableEntry("save spot/home base description"))
        entries.push(new TableEntry("other nsc start conversation"))
        entries.push(new TableEntry("narrator tells the problem again"))
        entries.push(new TableEntry("narrator tells possible solution devices"))
        super(entries, TableTitles.Narration);
        this.tableType = TableType.Artefact;
    }
}