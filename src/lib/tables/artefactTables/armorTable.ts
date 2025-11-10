import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ArmorTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("fully stitched armor"))
        entries.push(new TableEntry("chainmaille"))
        entries.push(new TableEntry("plate armor"))
        entries.push(new TableEntry("wooden armor"))
        entries.push(new TableEntry("lamellar armor"))
        entries.push(new TableEntry("leather harness"))
        entries.push(new TableEntry("fur armor"))
        entries.push(new TableEntry("bone armor"))
        entries.push(new TableEntry("robe"))
        super(entries, TableTitles.Armor);
        this.tableType = TableType.Artefact;
    }
}