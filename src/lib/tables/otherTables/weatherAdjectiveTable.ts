import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class WeatherAdjectiveTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("rainy"))
        entries.push(new TableEntry("stormy"))
        entries.push(new TableEntry("snowy"))
        entries.push(new TableEntry("cloudy"))
        entries.push(new TableEntry("hot"))
        entries.push(new TableEntry("sultry"))
        entries.push(new TableEntry("foggy"))
        entries.push(new TableEntry("apocalyptic"))
        entries.push(new TableEntry("mild"))
        entries.push(new TableEntry("sunny"))
        entries.push(new TableEntry("windy"))
        super(entries, TableTitles.WeatherAdjective);
        this.tableType = TableType.Other;
    }
}