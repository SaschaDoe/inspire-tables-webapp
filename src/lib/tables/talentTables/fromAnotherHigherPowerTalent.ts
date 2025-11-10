import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";


export class FromAnotherHigherPowerTalent extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("pact with Higher Power"))
        entries.push(new TableEntry("ground of Higher Power"))
        entries.push(new TableEntry("summoning helpers of Higher Power"))
        entries.push(new TableEntry("dialogue with Higher Power"))
        entries.push(new TableEntry("transport to domain of Higher Power"))
        entries.push(new TableEntry("protection against Higher Power"))
        super(entries, TableTitles.TalentFromHigherPower);
        this.tableType = TableType.Talent;
    }
}