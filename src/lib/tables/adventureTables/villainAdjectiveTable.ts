import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class VillainAdjectiveTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("good but actually bad"))
        entries.push(new TableEntry("apparently powerless puppetmaster"))
        entries.push(new TableEntry("evil mentors sidekick"))
        entries.push(new TableEntry("evil overlord"))
        entries.push(new TableEntry("young conqueror"))
        entries.push(new TableEntry("chessmaster"))
        entries.push(new TableEntry("gentleman thief"))
        entries.push(new TableEntry("mary tzu"))
        entries.push(new TableEntry("opportunistic bastard"))
        entries.push(new TableEntry("rich bastard"))
        entries.push(new TableEntry("bad but actually good"))
        super(entries, TableTitles.VillainAdjective);
        this.tableType = TableType.Other;
    }
}