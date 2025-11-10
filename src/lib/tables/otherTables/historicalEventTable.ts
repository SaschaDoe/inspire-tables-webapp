import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {NaturalEvents} from "./naturalEvents";

// Note: External dependencies removed - stub implementations
const chooseHigherPowerReturnUniqueName = () => "Higher Power";

export class HistoricalEventTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("battle between fractions"))
        entries.push(new TableEntry("contract between fractions"))
        entries.push(new TableEntry("new ruler"))
        entries.push(new TableEntry("").withCascadingRole(new NaturalEvents()))
        entries.push(new TableEntry("scientific discovery"))
        entries.push(new TableEntry("destruction town"))
        entries.push(new TableEntry("destruction fraction"))
        entries.push(new TableEntry("new fraction"))
        entries.push(new TableEntry("conquest of town"))
        entries.push(new TableEntry("supernatural intervention").withFunctionString(chooseHigherPowerReturnUniqueName))
        entries.push(new TableEntry("illness"))
        super(entries, TableTitles.HistoricalEvent);
        this.tableType = TableType.Other;
    }
}