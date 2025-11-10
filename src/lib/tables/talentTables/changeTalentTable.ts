import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {BodyPartsTable} from "../otherTables/bodyPartsTable";
import {RaceTable} from "../charTables/raceTable";
import {AttributeTable} from "../charTables/attributeTable";
import {ProfaneTalentTable} from "./profaneTalentTable";

export class ChangeTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("lighten").withCascadingRole(new BodyPartsTable()))
        entries.push(new TableEntry("make heavier").withCascadingRole(new BodyPartsTable()))
        entries.push(new TableEntry("shrink").withCascadingRole(new BodyPartsTable()))
        entries.push(new TableEntry("grow").withCascadingRole(new BodyPartsTable()))
        entries.push(new TableEntry("slow down").withCascadingRole(new BodyPartsTable()))
        entries.push(new TableEntry("fasten").withCascadingRole(new BodyPartsTable()))
        entries.push(new TableEntry("improve attribute").withCascadingRole(new AttributeTable()))
        entries.push(new TableEntry("worsen attribute").withCascadingRole(new AttributeTable()))
        entries.push(new TableEntry("transformation into").withCascadingRole(new RaceTable()))
        entries.push(new TableEntry("be extraordinary good in ").withCascadingRole(new ProfaneTalentTable()))
        entries.push(new TableEntry("invisibility"))
        entries.push(new TableEntry("not destroyable"))
        super(entries, TableTitles.ChangeTalent);
        this.tableType = TableType.Talent;
    }
}