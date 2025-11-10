import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {DiceRole} from "../diceRole";

// Note: External dependency removed - stub implementation
const getTrope = () => "Adventure Event";

export class AdventureEventTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withFunctionString(getTrope));
        super(entries, TableTitles.AdventureEvent, TableType.Other, new DiceRole().withNumberOfDice(2));
    }
}




