import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ProfaneArtefactTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("table"))
        entries.push(new TableEntry("chair"))
        entries.push(new TableEntry("candle"))
        entries.push(new TableEntry("board"))
        entries.push(new TableEntry("bottle"))
        entries.push(new TableEntry("dirt"))
        entries.push(new TableEntry("waste"))
        entries.push(new TableEntry("glass"))
        entries.push(new TableEntry("carpet"))
        entries.push(new TableEntry("stick"))
        entries.push(new TableEntry("poker"))
        entries.push(new TableEntry("pan"))
        entries.push(new TableEntry("pot"))
        entries.push(new TableEntry("knife"))
        entries.push(new TableEntry("spoon"))
        entries.push(new TableEntry("fork"))
        entries.push(new TableEntry("dishes"))
        entries.push(new TableEntry("stone"))
        super(entries, TableTitles.ProfaneArtefact);
        this.tableType = TableType.Artefact;
    }
}