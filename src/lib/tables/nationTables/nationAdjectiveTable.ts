import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class NationAdjectiveTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("aggressive"))
        entries.push(new TableEntry("stagnating"))
        entries.push(new TableEntry("flourishing"))
        entries.push(new TableEntry("friendly"))
        entries.push(new TableEntry("pacifistic"))
        entries.push(new TableEntry("despotic"))
        entries.push(new TableEntry("racist"))
        entries.push(new TableEntry("theocratic"))
        entries.push(new TableEntry("mystic"))
        entries.push(new TableEntry("old"))
        entries.push(new TableEntry("ancient"))
        entries.push(new TableEntry("foreign ruled").withFunctionString(chooseNationReturnUniqueName))
        super(entries, TableTitles.NationAdjective);
        this.tableType = TableType.Nation;
    }
}