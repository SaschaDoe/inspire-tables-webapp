import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class TimeTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("freeze time"))
        entries.push(new TableEntry("turn back time"))
        entries.push(new TableEntry("travel to the future"))
        entries.push(new TableEntry("look into the future"))
        entries.push(new TableEntry("look into the past"))
        entries.push(new TableEntry("time portal to the past"))
        entries.push(new TableEntry("time portal to the future"))
        entries.push(new TableEntry("discover time anomalies"))
        entries.push(new TableEntry("slow down time"))
        super(entries, TableTitles.TimeTalent);
        this.tableType = TableType.Talent;
    }
}