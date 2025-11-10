import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class RealCultureTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("german"))
        entries.push(new TableEntry("french"))
        entries.push(new TableEntry("nordic"))
        entries.push(new TableEntry("african"))
        entries.push(new TableEntry("indian"))
        entries.push(new TableEntry("arabic"))
        entries.push(new TableEntry("barbaric"))
        entries.push(new TableEntry("greek"))
        entries.push(new TableEntry("southAmerican"))
        super(entries,
            TableTitles.RealCulture,
            TableType.Other);
    }
}