import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {DiceRole} from "../diceRole";

export class FractionWealthTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("very rich").withRoleInterval(2,3))
        entries.push(new TableEntry("wealthy").withRoleInterval(4,6))
        entries.push(new TableEntry("sustainable rich").withRoleInterval(7,7))
        entries.push(new TableEntry("need funding").withRoleInterval(8,9))
        entries.push(new TableEntry("need money desperately").withRoleInterval(10,11))
        entries.push(new TableEntry("bankrupt").withRoleInterval(12,12))
        super(entries, TableTitles.FractionWealth, TableType.Fraction, new DiceRole().withNumberOfDice(2));
    }
}