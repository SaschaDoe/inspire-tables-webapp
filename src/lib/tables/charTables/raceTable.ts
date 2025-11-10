import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {AnimalTable} from "./animalTable";
import {FantasyCreatureTable} from "./fantasyCreatureTable";
import {TableType} from "../tableType";
import {DiceRole} from "../diceRole";


export class RaceTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withRoleInterval(3,5)
            .withCascadingRole(new FantasyCreatureTable()));
        entries.push(new TableEntry("dwarf")
            .withRoleInterval(6,7));
        entries.push(new TableEntry("elf")
            .withRoleInterval(8,9));
        entries.push(new TableEntry("human")
            .withRoleInterval(10,15));
        entries.push(new TableEntry("half human half")
            .withRoleInterval(16,17)
            .withCascadingRole(new AnimalTable()));
        entries.push(new TableEntry("")
            .withRoleInterval(18,18)
            .withCascadingRole(new AnimalTable())
            .withCascadingRole(new AnimalTable()));
        super(entries, TableTitles.Race,TableType.Character, new DiceRole().withNumberOfDice(3));
    }
}