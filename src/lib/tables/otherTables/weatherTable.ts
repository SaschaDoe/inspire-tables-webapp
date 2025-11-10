import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class WeatherTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("rain"))
        entries.push(new TableEntry("storm"))
        entries.push(new TableEntry("snow fall"))
        entries.push(new TableEntry("ice storm"))
        entries.push(new TableEntry("clouds"))
        entries.push(new TableEntry("hot wind"))
        entries.push(new TableEntry("sultry weather"))
        entries.push(new TableEntry("fog"))
        entries.push(new TableEntry("apocalypse"))
        entries.push(new TableEntry("mild weather"))
        entries.push(new TableEntry("sunny weather"))
        entries.push(new TableEntry("wind"))
        entries.push(new TableEntry("tornado"))
        entries.push(new TableEntry("thunderstorm"))
        entries.push(new TableEntry("aurora borealis"))
        entries.push(new TableEntry("rainbow"))
        super(entries, TableTitles.Weather);
        this.tableType = TableType.Other;
    }
}