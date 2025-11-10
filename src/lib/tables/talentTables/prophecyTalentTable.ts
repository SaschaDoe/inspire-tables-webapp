import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ProphecyTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("find someone"))
        entries.push(new TableEntry("find something"))
        entries.push(new TableEntry("see in the present"))
        entries.push(new TableEntry("see in the past"))
        entries.push(new TableEntry("see in the future"))
        entries.push(new TableEntry("see other dimension"))
        entries.push(new TableEntry("see other sphere"))
        entries.push(new TableEntry("see other reality"))
        entries.push(new TableEntry("see fate"))
        entries.push(new TableEntry("analyse probability"))
        entries.push(new TableEntry("translate"))
        entries.push(new TableEntry("encrypt"))
        entries.push(new TableEntry("change fate"))
        super(entries, TableTitles.ProphecyTalent);
        this.tableType = TableType.Talent;
    }
}