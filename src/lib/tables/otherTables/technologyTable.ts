import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {DiceRole} from "../diceRole";

export class TechnologyTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("stone age").withRoleInterval(3,3))
        entries.push(new TableEntry("bronze age").withRoleInterval(4,5))
        entries.push(new TableEntry("antic").withRoleInterval(6,6))
        entries.push(new TableEntry("classic").withRoleInterval(7,7))
        entries.push(new TableEntry("dark ages").withRoleInterval(8,8))
        entries.push(new TableEntry("middle age").withRoleInterval(9,10))
        entries.push(new TableEntry("renaissance").withRoleInterval(11,12))
        entries.push(new TableEntry("industrial").withRoleInterval(13,13))
        entries.push(new TableEntry("modern").withRoleInterval(14,14))
        entries.push(new TableEntry("atomic age").withRoleInterval(15,15))
        entries.push(new TableEntry("information").withRoleInterval(16,16))
        entries.push(new TableEntry("near future").withRoleInterval(17,17))
        entries.push(new TableEntry("cosmic travel age").withRoleInterval(18,18))
        super(entries, TableTitles.Technology, TableType.Other, new DiceRole().withNumberOfDice(3));
    }

}