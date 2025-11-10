import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {SizeTable} from "../otherTables/sizeTable";
import {MaterialsTable} from "./materialsTable";
import {ArtefactTable} from "./artefactTable";
import {MagicalArtefactTable} from "./magicalArtefactTable";

export class TreasureTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("").withCascadingRole(new SizeTable()).with(" pile of ").withCascadingRole(new MaterialsTable()))
        entries.push(new TableEntry("").withCascadingRole(new ArtefactTable()))
        entries.push(new TableEntry("").withCascadingRole(new MagicalArtefactTable()))
        entries.push(new TableEntry("information"))
        entries.push(new TableEntry("key"))
        super(entries, TableTitles.Treasure);
        this.tableType = TableType.Artefact;
    }
}