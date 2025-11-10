import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ProfaneArtefactTable} from "./profaneArtefactTable";

export class WeaponTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("sword"))
        entries.push(new TableEntry("long-sword"))
        entries.push(new TableEntry("broadsword"))
        entries.push(new TableEntry("spear"))
        entries.push(new TableEntry("knife"))
        entries.push(new TableEntry("axe"))
        entries.push(new TableEntry("morning star"))
        entries.push(new TableEntry("bow"))
        entries.push(new TableEntry("crossbow"))
        entries.push(new TableEntry("throwing dagger"))
        entries.push(new TableEntry("rod"))
        entries.push(new TableEntry("staff"))
        entries.push(new TableEntry("hammer"))
        entries.push(new TableEntry("two handed hammer"))
        entries.push(new TableEntry("club"))
        entries.push(new TableEntry("slingshot"))
        entries.push(new TableEntry("combat fan"))
        entries.push(new TableEntry("throwing star"))
        entries.push(new TableEntry("improvised weapon: (")
            .withCascadingRole(new ProfaneArtefactTable())
            .with(")"))
        entries.push(new TableEntry("flail"))
        entries.push(new TableEntry("gun"))
        entries.push(new TableEntry("butterfly"))
        entries.push(new TableEntry("katana"))
        entries.push(new TableEntry("needle"))
        entries.push(new TableEntry("")
            .withSelfCascade()
            .with(" together with ")
            .withSelfCascade())
        entries.push(new TableEntry("whip"))
        entries.push(new TableEntry("lance"))
        entries.push(new TableEntry("rifle"))
        entries.push(new TableEntry("shotgun"))
        entries.push(new TableEntry("rocket launcher"))
        entries.push(new TableEntry("shield"))
        super(entries, TableTitles.Weapon);
        this.tableType = TableType.Artefact;
    }
}