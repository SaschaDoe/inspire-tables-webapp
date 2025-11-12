import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

// Note: External dependency removed - stub implementation
const addArtefactToStoreReturnDescription = () => "Artefact";

export class PlanTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("take over the world"))
        entries.push(new TableEntry("absolute power I need no plan"))
        entries.push(new TableEntry("use MacGuffin to rule them all ").withFunctionString(addArtefactToStoreReturnDescription))
        entries.push(new TableEntry("unspoken plan guarantee"))
        entries.push(new TableEntry("xanatos plan"))
        entries.push(new TableEntry("speed gambit"))
        entries.push(new TableEntry("luck plan"))
        entries.push(new TableEntry("batman gambit"))
        entries.push(new TableEntry("kansas city shuffle"))
        entries.push(new TableEntry("failure gambit"))
        entries.push(new TableEntry("playing both sides"))
        entries.push(new TableEntry("shape shifter gambit"))
        entries.push(new TableEntry("trojan prisoner"))
        super(entries, TableTitles.Plan);
        this.tableType = TableType.Adventure;
    }
}