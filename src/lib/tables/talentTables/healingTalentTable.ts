import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class HealingTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("heal wounds"))
        entries.push(new TableEntry("heal fractures"))
        entries.push(new TableEntry("heal poison"))
        entries.push(new TableEntry("heal death"))
        entries.push(new TableEntry("heal confusion"))
        entries.push(new TableEntry("regeneration"))
        entries.push(new TableEntry("no pain"))
        entries.push(new TableEntry("natural sleep"))
        entries.push(new TableEntry("cure illness"))
        super(entries, TableTitles.HealingTalent);
        this.tableType = TableType.Talent;
    }
}