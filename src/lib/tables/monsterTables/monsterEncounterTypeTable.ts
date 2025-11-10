import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class MonsterEncounterTypeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("excrements"))
        entries.push(new TableEntry("hear it far away"))
        entries.push(new TableEntry("hear it next door"))
        entries.push(new TableEntry("in this room"))
        entries.push(new TableEntry("found its nest"))
        entries.push(new TableEntry("old tracks"))
        entries.push(new TableEntry("young tracks"))
        entries.push(new TableEntry("found its meal"))
        super(entries, TableTitles.MonsterEncounterType,TableType.Character);
    }
}