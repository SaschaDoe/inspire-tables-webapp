import {TableEntry} from "../tableEntry";
import {Table} from "../table";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class AthleticsTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("riding"));
        entries.push(new TableEntry("hunting"));
        entries.push(new TableEntry("athletics"));
        entries.push(new TableEntry("climbing"));
        entries.push(new TableEntry("swimming"));
        entries.push(new TableEntry("drinking"));
        entries.push(new TableEntry("steer wagon"));
        super(entries, TableTitles.AthleticsTalent);
        this.tableType = TableType.Other;
    }
}