import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ElementTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("fire"))
        entries.push(new TableEntry("water"))
        entries.push(new TableEntry("earth"))
        entries.push(new TableEntry("wind"))
        entries.push(new TableEntry("ice"))
        entries.push(new TableEntry("live"))
        entries.push(new TableEntry("magic"))
        entries.push(new TableEntry("light"))
        entries.push(new TableEntry("shadow"))
        entries.push(new TableEntry("electricity"))
        entries.push(new TableEntry("sound"))
        entries.push(new TableEntry("paper"))
        entries.push(new TableEntry("sand"))
        entries.push(new TableEntry("lava"))
        entries.push(new TableEntry("smoke"))
        entries.push(new TableEntry("force"))
        entries.push(new TableEntry("blood"))
        entries.push(new TableEntry("hair"))
        super(entries, TableTitles.Element);
        this.tableType = TableType.Other;
    }
}