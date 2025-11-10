import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {GreekPlaceName} from "./greekPlaceName";

export class GreekLastNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("from").withCascadingRole(new GreekPlaceName()))
        super(entries, TableTitles.GreekLastName);
        this.tableType = TableType.Other;
    }
}