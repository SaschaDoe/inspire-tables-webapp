import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {DiceRole} from "../diceRole";
import {TransitionAdjectiveTable} from "./transitionAdjectiveTable";

export class TransitionTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("pit")
            .withCascadingRole(new TransitionAdjectiveTable())
            .withRoleInterval(3,5))
        entries.push(new TableEntry("rope")
            .withCascadingRole(new TransitionAdjectiveTable())
            .withRoleInterval(6,6))
        entries.push(new TableEntry("ladder")
            .withCascadingRole(new TransitionAdjectiveTable())
            .withRoleInterval(7,7))
        entries.push(new TableEntry("stairway")
            .withCascadingRole(new TransitionAdjectiveTable())
            .withRoleInterval(8,9))
        entries.push(new TableEntry("passage entry")
            .withCascadingRole(new TransitionAdjectiveTable())
            .withRoleInterval(10,11))
        entries.push(new TableEntry("door")
            .withCascadingRole(new TransitionAdjectiveTable())
            .withRoleInterval(12,15))
        entries.push(new TableEntry("hole")
            .withCascadingRole(new TransitionAdjectiveTable())
            .withRoleInterval(16,17))
        entries.push(new TableEntry("magic")
            .withCascadingRole(new TransitionAdjectiveTable())
            .withRoleInterval(18,18))
        super(entries, TableTitles.Transition, TableType.Location, new DiceRole().withNumberOfDice(3));
    }
}