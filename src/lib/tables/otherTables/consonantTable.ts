import {TableType} from "../tableType";
import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";

export class ConsonantTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("b"))
        entries.push(new TableEntry("c"))
        entries.push(new TableEntry("d"))
        entries.push(new TableEntry("f"))
        entries.push(new TableEntry("g"))
        entries.push(new TableEntry("h"))
        entries.push(new TableEntry("k"))
        entries.push(new TableEntry("l"))
        entries.push(new TableEntry("m"))
        entries.push(new TableEntry("n"))
        entries.push(new TableEntry("p"))
        entries.push(new TableEntry("q"))
        entries.push(new TableEntry("r"))
        entries.push(new TableEntry("s"))
        entries.push(new TableEntry("t"))
        entries.push(new TableEntry("v"))
        entries.push(new TableEntry("w"))
        entries.push(new TableEntry("x"))
        entries.push(new TableEntry("z"))
        entries.push(new TableEntry("sch"))
        entries.push(new TableEntry("ch"))
        entries.push(new TableEntry("chr"))
        super(entries, TableTitles.Consonant);
        this.tableType = TableType.Other;
    }
}