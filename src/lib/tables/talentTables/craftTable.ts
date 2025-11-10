import {TableEntry} from "../tableEntry";
import {AnimalTable} from "../charTables/animalTable";
import {Table} from "../table";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class CraftTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("fishing"))
        entries.push(new TableEntry("perl diving"))
        entries.push(new TableEntry("ship building"))
        entries.push(new TableEntry("weaving"))
        entries.push(new TableEntry("stone processing"))
        entries.push(new TableEntry("rope making"))
        entries.push(new TableEntry("cooking"))
        entries.push(new TableEntry("armor making"))
        entries.push(new TableEntry("weapon smithing"))
        entries.push(new TableEntry("smithing"))
        entries.push(new TableEntry("wood cutting"))
        entries.push(new TableEntry("lock-smithing"))
        entries.push(new TableEntry("barrel binding"))
        entries.push(new TableEntry("fur processing"))
        entries.push(new TableEntry("mechanic working"))
        entries.push(new TableEntry("hair-dressing"))
        entries.push(new TableEntry("brewing"))
        entries.push(new TableEntry("metal casting"))
        entries.push(new TableEntry("butcher work"))
        entries.push(new TableEntry("goldshmithing"))
        entries.push(new TableEntry("making clocks"))
        entries.push(new TableEntry("making shoes"))
        entries.push(new TableEntry("gun-forging"))
        entries.push(new TableEntry("carpentering"))
        entries.push(new TableEntry("sailing"))
        entries.push(new TableEntry("gardener"))
        entries.push(new TableEntry("breeding of (")
            .withCascadingRole(new AnimalTable())
            .with(")"))
        entries.push(new TableEntry("laundry making"))
        super(entries, TableTitles.CraftTalent);
        this.tableType = TableType.Other;
    }
}