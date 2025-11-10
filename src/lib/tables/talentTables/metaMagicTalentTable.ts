import {TableEntry} from "../tableEntry";
import {Table} from "../table";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {MagicalTalentTable} from "./magicalTalentTable";

export class MetaMagicTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("new spell: ")
            .withCascadingRole(new MagicalTalentTable())
            .withCascadingRole(new MagicalTalentTable()))
        entries.push(new TableEntry("reverse talent"))
        entries.push(new TableEntry("alter time of talent"))
        entries.push(new TableEntry("alter strength of talent"))
        entries.push(new TableEntry("alter distant talent"))
        entries.push(new TableEntry("alter flight path"))
        entries.push(new TableEntry("alter number of targets"))
        entries.push(new TableEntry("alter number of targets"))
        entries.push(new TableEntry("telekinesis"))
        entries.push(new TableEntry("open"))
        entries.push(new TableEntry("close"))
        entries.push(new TableEntry("force wall"))
        entries.push(new TableEntry("change a physical rule"))
        entries.push(new TableEntry("meta game"))
        entries.push(new TableEntry("grant wish"))
        super(entries, TableTitles.MetaMagicTalent);
        this.tableType = TableType.Talent;
    }
}