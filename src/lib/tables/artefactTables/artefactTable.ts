import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {WeaponTable} from "./weaponTable";
import {JewelryTable} from "./jewelryTable";
import {ArmorTable} from "./armorTable";

export class ArtefactTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new WeaponTable()))
        entries.push(new TableEntry("")
            .withCascadingRole(new JewelryTable()));
        entries.push(new TableEntry("")
            .withCascadingRole(new ArmorTable()))
        super(entries, TableTitles.Artefact);
        this.tableType = TableType.Artefact;
    }
}