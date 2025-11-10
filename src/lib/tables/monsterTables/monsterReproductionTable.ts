import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class MonsterReproductionTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("division").withRoleInterval(3,3))
        entries.push(new TableEntry("not reproducing it is infertile").withRoleInterval(4,5))
        entries.push(new TableEntry("self fertilization").withRoleInterval(6,7))
        entries.push(new TableEntry("sexual intercourse").withRoleInterval(8,11))
        entries.push(new TableEntry("orgy").withRoleInterval(12,12))
        entries.push(new TableEntry("lays eggs").withRoleInterval(13,14))
        entries.push(new TableEntry("eggs under water").withRoleInterval(15,15))
        entries.push(new TableEntry("parasite").withRoleInterval(16,17))
        entries.push(new TableEntry("bag").withRoleInterval(18,18))
        super(entries, TableTitles.MonsterReproduction,TableType.Character);
    }
}