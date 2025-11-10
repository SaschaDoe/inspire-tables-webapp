import {TableEntry} from "../tableEntry";
import {Table} from "../table";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ArtistTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("persuading"));
        entries.push(new TableEntry("understand people"));
        entries.push(new TableEntry("stir up the crowd"));
        entries.push(new TableEntry("writing"));
        entries.push(new TableEntry("singing"));
        entries.push(new TableEntry("sculpting"))
        entries.push(new TableEntry("poem composing"));
        super(entries, TableTitles.ArtistTalent);
        this.tableType = TableType.Other;
    }
}