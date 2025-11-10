import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ArtworkTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("picture"))
        entries.push(new TableEntry("wall carpet"))
        entries.push(new TableEntry("coat of arms"))
        entries.push(new TableEntry("flag"))
        entries.push(new TableEntry("graffiti"))
        entries.push(new TableEntry("stature"))
        super(entries, TableTitles.Artwork);
        this.tableType = TableType.Artefact;
    }
}