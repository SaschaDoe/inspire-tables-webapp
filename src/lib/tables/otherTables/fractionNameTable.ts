import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class FractionNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("brothers"))
        entries.push(new TableEntry("sisters"))
        entries.push(new TableEntry("association"))
        entries.push(new TableEntry("inc"))
        entries.push(new TableEntry("community"))
        entries.push(new TableEntry("horde"))
        entries.push(new TableEntry("alliance"))
        entries.push(new TableEntry("band"))
        entries.push(new TableEntry("unit"))
        entries.push(new TableEntry("loge"))
        super(entries, TableTitles.FractionName);
        this.tableType = TableType.Other;
    }
}