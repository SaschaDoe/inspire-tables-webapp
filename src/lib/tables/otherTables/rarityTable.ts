import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class RarityTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("unique"))
        entries.push(new TableEntry("rare"))
        entries.push(new TableEntry("uncommon"))
        entries.push(new TableEntry("common"))
        super(entries, TableTitles.Rarity);
        this.tableType = TableType.Other;
    }
}