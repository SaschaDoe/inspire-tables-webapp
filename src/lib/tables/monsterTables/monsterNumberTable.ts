import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {randomIntFromInterval} from "../../utils/randomUtils";

export class MonsterNumberTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("").withFunctionString(randomNumber))
        entries.push(new TableEntry("parents with children").withFunctionString(randomNumber))
        entries.push(new TableEntry("horde"))
        entries.push(new TableEntry("swarm"))
        super(entries, TableTitles.MonsterNumber,TableType.Character);
    }
}

export function randomNumber(){
    let randomNumber = randomIntFromInterval(1,6);
    return randomNumber.toString();
}