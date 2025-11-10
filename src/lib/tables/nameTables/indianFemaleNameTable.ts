import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class IndianFemaleNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Achtevsabu"))
        entries.push(new TableEntry("Erisabu"))
        entries.push(new TableEntry("Alryscha"))
        entries.push(new TableEntry("Wladyscha"))
        entries.push(new TableEntry("Rondrasab"))
        entries.push(new TableEntry("Sababa"))
        entries.push(new TableEntry("Ruhalljida"))
        entries.push(new TableEntry("Sumujida"))
        entries.push(new TableEntry("Yezeminersabab"))
        entries.push(new TableEntry("Rursabab"))
        entries.push(new TableEntry("Aina"))
        entries.push(new TableEntry("Alya"))
        entries.push(new TableEntry("Amena"))
        entries.push(new TableEntry("Aditi"))
        entries.push(new TableEntry("Antara"))
        entries.push(new TableEntry("Aparna"))
        entries.push(new TableEntry("Arshpreet"))
        entries.push(new TableEntry("Arunima"))
        entries.push(new TableEntry("Chitra"))
        entries.push(new TableEntry("Garima"))
        entries.push(new TableEntry("Gurleen"))
        entries.push(new TableEntry("Chavi"))
        entries.push(new TableEntry("Lavanya"))
        entries.push(new TableEntry("Marukka"))
        entries.push(new TableEntry("Nagma"))
        entries.push(new TableEntry("Schweta"))
        entries.push(new TableEntry("Upanasana"))
        super(entries, TableTitles.IndianFemaleName);
        this.tableType = TableType.Other;
    }
}