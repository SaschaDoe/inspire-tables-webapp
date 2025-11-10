import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ObjectEnchantmentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("purify object"))
        entries.push(new TableEntry("lapse object"))
        entries.push(new TableEntry("improve structural integrity"))
        entries.push(new TableEntry("worsen structural integrity"))
        entries.push(new TableEntry("fixate object"))
        entries.push(new TableEntry("talk with object"))
        entries.push(new TableEntry("power to object"))
        entries.push(new TableEntry("enlive object"))
        entries.push(new TableEntry("give object talent"))
        entries.push(new TableEntry("grow object"))
        entries.push(new TableEntry("shrink object"))
        super(entries, TableTitles.ObjectEnchantment);
        this.tableType = TableType.Talent;
    }
}