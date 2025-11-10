import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class SeasonTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("spring"))
        entries.push(new TableEntry("fall"))
        entries.push(new TableEntry("summer"))
        entries.push(new TableEntry("winter"))
        super(entries, TableTitles.Season, TableType.Other);
    }
}