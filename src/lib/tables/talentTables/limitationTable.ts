import {TableEntry} from "../tableEntry";
import {TalentCategoryTable} from "./talentCategoryTable";
import {SummonTalentTable} from "./summonTalentTable";
import {Table} from "../table";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {MoonPhasesTable} from "../otherTables/moonPhasesTable";

export class LimitationTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("forever"))
        entries.push(new TableEntry("touch"))
        entries.push(new TableEntry("no control"))
        entries.push(new TableEntry("certain time"))
        entries.push(new TableEntry("long ritual"))
        entries.push(new TableEntry("very loud"))
        entries.push(new TableEntry("concentration"))
        entries.push(new TableEntry("eye contact"))
        entries.push(new TableEntry("with consent"))
        entries.push(new TableEntry("only self"))
        entries.push(new TableEntry("one time"))
        entries.push(new TableEntry("when the stars are right"))
        entries.push(new TableEntry("only when there is a ").withCascadingRole(new MoonPhasesTable()))
        super(entries, TableTitles.Limitation);
        this.tableType = TableType.Talent;
    }
}