import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class MonsterAdjectiveTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("sleeping often"))
        entries.push(new TableEntry("deadly"))
        entries.push(new TableEntry("mad"))
        entries.push(new TableEntry("dying"))
        entries.push(new TableEntry("restless"))
        entries.push(new TableEntry("holy"))
        entries.push(new TableEntry("magical"))
        entries.push(new TableEntry("thoughtful"))
        entries.push(new TableEntry("scary"))
        entries.push(new TableEntry("creeping"))
        entries.push(new TableEntry("crawling"))
        entries.push(new TableEntry("curious"))
        entries.push(new TableEntry("bright"))
        entries.push(new TableEntry("mysterious"))
        entries.push(new TableEntry("strange"))
        entries.push(new TableEntry("unnatural"))
        super(entries, TableTitles.MonsterAdjective,TableType.Character);
    }
}