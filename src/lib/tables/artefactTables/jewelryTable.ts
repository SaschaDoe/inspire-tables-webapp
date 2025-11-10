import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {GemstoneTable} from "./gemstoneTable";
import {BodyPartsTable} from "../otherTables/bodyPartsTable";

export class JewelryTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new BodyPartsTable())
            .with("ring"))
        entries.push(new TableEntry("")
            .withCascadingRole(new BodyPartsTable())
            .with("ring with ")
            .withCascadingRole(new GemstoneTable()))
        entries.push(new TableEntry("")
            .withCascadingRole(new BodyPartsTable())
            .with("open ring"))
        entries.push(new TableEntry("")
            .withCascadingRole(new BodyPartsTable())
            .with("open ring with")
            .withCascadingRole(new GemstoneTable()))
        entries.push(new TableEntry("")
            .withCascadingRole(new BodyPartsTable())
            .with("pendant"))
        entries.push(new TableEntry("")
            .withCascadingRole(new BodyPartsTable())
            .with("pendant with")
            .withCascadingRole(new GemstoneTable()))
        super(entries, TableTitles.Jewelry);
        this.tableType = TableType.Artefact;
    }
}