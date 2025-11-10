import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class TargetTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("self"))
        entries.push(new TableEntry("other"))
        entries.push(new TableEntry("many"))
        super(entries, TableTitles.TargetTalent);
        this.tableType = TableType.Talent;
    }
}