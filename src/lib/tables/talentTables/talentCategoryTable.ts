import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class TalentCategoryTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("divine"))
        entries.push(new TableEntry("unholy"))
        entries.push(new TableEntry("magical"))
        entries.push(new TableEntry("profane"))
        super(entries, TableTitles.TalentCategory);
        this.tableType = TableType.Talent;
    }
}