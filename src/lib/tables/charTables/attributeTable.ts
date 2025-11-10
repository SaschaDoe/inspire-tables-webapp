import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";

export class AttributeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("courage"))
        entries.push(new TableEntry("charisma"))
        entries.push(new TableEntry("wisdom"))
        entries.push(new TableEntry("intuition"))
        entries.push(new TableEntry("dexterity"))
        entries.push(new TableEntry("manual dexterity"))
        entries.push(new TableEntry("constitution"))
        entries.push(new TableEntry("strength"))
        super(entries, TableTitles.Attributes);
    }
}