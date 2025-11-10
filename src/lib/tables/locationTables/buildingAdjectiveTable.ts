import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ElementTable} from "../otherTables/elementTable";

export class BuildingAdjectiveTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("ancient"))
        entries.push(new TableEntry("confusing"))
        entries.push(new TableEntry("unnatural"))
        entries.push(new TableEntry("natural"))
        entries.push(new TableEntry("enlivened"))
        entries.push(new TableEntry("hidden"))
        entries.push(new TableEntry("never finished"))
        entries.push(new TableEntry("deadly"))
        entries.push(new TableEntry("secret"))
        entries.push(new TableEntry("repulsive"))
        entries.push(new TableEntry("closed"))
        entries.push(new TableEntry("bizarre"))
        entries.push(new TableEntry("fantastic"))
        entries.push(new TableEntry("cursed"))
        entries.push(new TableEntry("abandoned"))
        entries.push(new TableEntry("supernatural"))
        entries.push(new TableEntry("spilled"))
        entries.push(new TableEntry("forgotten"))
        entries.push(new TableEntry("shunned"))
        entries.push(new TableEntry("shunned"))
        entries.push(new TableEntry("holy"))
        entries.push(new TableEntry("unholy"))
        entries.push(new TableEntry("departed"))
        entries.push(new TableEntry("twilight"))
        entries.push(new TableEntry("soiled"))
        entries.push(new TableEntry("inverted"))
        entries.push(new TableEntry("defiled"))
        entries.push(new TableEntry("destroyed"))
        entries.push(new TableEntry("dream"))
        entries.push(new TableEntry("").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("flying"))
        entries.push(new TableEntry("overgrown"))
        entries.push(new TableEntry("fortified"))
        entries.push(new TableEntry("magical"))
        entries.push(new TableEntry("storm-tossed"))
        super(entries,
            TableTitles.BuildingAdjective,
            TableType.Location);
    }
}