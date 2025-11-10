import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class IndianMaleNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Adrejin"))
        entries.push(new TableEntry("Alrijan"))
        entries.push(new TableEntry("Jeskojin"))
        entries.push(new TableEntry("Pratesch"))
        entries.push(new TableEntry("Navi"))
        entries.push(new TableEntry("Jai"))
        entries.push(new TableEntry("Kabir"))
        entries.push(new TableEntry("Ajay"))
        entries.push(new TableEntry("Isaan"))
        entries.push(new TableEntry("Sahil"))
        entries.push(new TableEntry("Shaan"))
        entries.push(new TableEntry("Marajian"))
        entries.push(new TableEntry("Xanderan"))
        entries.push(new TableEntry("Abhijeet"))
        entries.push(new TableEntry("Angad"))
        entries.push(new TableEntry("Akshat"))
        entries.push(new TableEntry("Danish"))
        entries.push(new TableEntry("Purab"))
        entries.push(new TableEntry("Puresch"))
        entries.push(new TableEntry("Scharesch"))
        entries.push(new TableEntry("Pasch Pasch"))
        super(entries, TableTitles.IndianMaleName);
        this.tableType = TableType.Other;
    }
}