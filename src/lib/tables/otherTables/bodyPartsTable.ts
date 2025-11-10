import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class BodyPartsTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("body"))
        entries.push(new TableEntry("finger"))
        entries.push(new TableEntry("arm"))
        entries.push(new TableEntry("neck"))
        entries.push(new TableEntry("head"))
        entries.push(new TableEntry("leg"))
        entries.push(new TableEntry("foot"))
        entries.push(new TableEntry("nose"))
        entries.push(new TableEntry("mouth"))
        entries.push(new TableEntry("ear"))
        entries.push(new TableEntry("forehead"))
        super(entries, TableTitles.BodyParts);
        this.tableType = TableType.Other;
    }
}