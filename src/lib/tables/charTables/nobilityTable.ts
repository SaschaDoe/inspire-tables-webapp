import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {DiceRole} from "../diceRole";
import {TableType} from "../tableType";
import type {RoleResult} from "../roleResult";

export class NobilityTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("high nobel").withRoleInterval(1,1))
        entries.push(new TableEntry("nobel").withRoleInterval(2,3))
        entries.push(new TableEntry("privileged free").withRoleInterval(4,6))
        entries.push(new TableEntry("free").withRoleInterval(7,12))
        entries.push(new TableEntry("serf").withRoleInterval(13,16))
        entries.push(new TableEntry("slave").withRoleInterval(17,18))
        super(entries, TableTitles.Nobility,TableType.Character,new DiceRole().withNumberOfDice(3));
        this.functions.push(withNobility)
    }
}

export function withNobility(factory: Factory, roleResult: RoleResult){
    let charFactory = factory as CharacterFactory;
    charFactory.withNobility(roleResult.text);
}