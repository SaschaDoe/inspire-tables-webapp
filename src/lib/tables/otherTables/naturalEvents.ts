import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {AnimalTable} from "../charTables/animalTable";
import {MonsterTable} from "../monsterTables/monsterTable";

export class NaturalEvents extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("earthquake"))
        entries.push(new TableEntry("volcano eruption"))
        entries.push(new TableEntry("sun eclipse"))
        entries.push(new TableEntry("moon eclipse"))
        entries.push(new TableEntry("flowering"))
        entries.push(new TableEntry("mating season of").withCascadingRole(new AnimalTable()))
        entries.push(new TableEntry("mating season of").withCascadingRole(new MonsterTable()))
        super(entries, TableTitles.NaturalEvent);
        this.tableType = TableType.Other;
    }
}