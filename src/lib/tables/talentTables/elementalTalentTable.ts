import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {BodyPartsTable} from "../otherTables/bodyPartsTable";
import {WeaponTable} from "../artefactTables/weaponTable";
import {ArmorTable} from "../artefactTables/armorTable";
import {ElementTable} from "../otherTables/elementTable";

export class ElementalTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("manifestation of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("projectile of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("ray of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("ball of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("").withCascadingRole(new BodyPartsTable()).with("of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("summoning minor elemental of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("summoning elemental of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("summoning gene of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("summoning").withCascadingRole(new WeaponTable()).with("of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("summoning").withCascadingRole(new ArmorTable()).with("of").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("enclose self in").withCascadingRole(new ElementTable()))
        entries.push(new TableEntry("enclose other in").withCascadingRole(new ElementTable()))
        super(entries, TableTitles.ElementalTalent);
        this.tableType = TableType.Talent;
    }
}