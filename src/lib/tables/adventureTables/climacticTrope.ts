import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ClimacticTropeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("public confession"))
        entries.push(new TableEntry("big badass battle sequence"))
        entries.push(new TableEntry("big damn heroes"))
        entries.push(new TableEntry("big kiss"))
        entries.push(new TableEntry("big reunion"))
        entries.push(new TableEntry("big game"))
        entries.push(new TableEntry("burning ships"))
        entries.push(new TableEntry("apocalypse"))
        entries.push(new TableEntry("the cavalry arrives"))
        entries.push(new TableEntry("climactic elevator ride"))
        entries.push(new TableEntry("climbing"))
        entries.push(new TableEntry("collapsing lair"))
        entries.push(new TableEntry("deus ex machina"))
        entries.push(new TableEntry("resurrected"))
        entries.push(new TableEntry("falling to death"))
        entries.push(new TableEntry("eureka"))
        entries.push(new TableEntry("final boss"))
        entries.push(new TableEntry("flashback montage realization"))
        entries.push(new TableEntry("go into the light"))
        entries.push(new TableEntry("gunship rescue"))
        entries.push(new TableEntry("hulking up"))
        entries.push(new TableEntry("just in time"))
        entries.push(new TableEntry("destruction bringing devise"))
        entries.push(new TableEntry("monster threat expiration"))
        entries.push(new TableEntry("not an act"))
        entries.push(new TableEntry("parallel conflict sequence"))
        entries.push(new TableEntry("the reveal"))
        entries.push(new TableEntry("throne room showdown"))
        entries.push(new TableEntry("stuff blowing up"))
        entries.push(new TableEntry("acting stupidity"))

        super(entries, TableTitles.ClimacticTrope);
        this.tableType = TableType.Other;
    }
}