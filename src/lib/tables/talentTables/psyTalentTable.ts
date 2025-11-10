import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {EmotionTable} from "../otherTables/emotionTable";
import {SenseTable} from "../otherTables/senseTable";

export class PsyTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("control"))
        entries.push(new TableEntry("command"))
        entries.push(new TableEntry("weave dreams"))
        entries.push(new TableEntry("go into dreams"))
        entries.push(new TableEntry("hear thoughts"))
        entries.push(new TableEntry("speak in thoughts"))
        entries.push(new TableEntry("pain"))
        entries.push(new TableEntry("no pain"))
        entries.push(new TableEntry("sleep"))
        entries.push(new TableEntry("better sense").withCascadingRole(new SenseTable()))
        entries.push(new TableEntry("worse sense").withCascadingRole(new SenseTable()))
        entries.push(new TableEntry("higher emotion").withCascadingRole(new EmotionTable()))
        entries.push(new TableEntry("lower emotion").withCascadingRole(new EmotionTable()))
        super(entries, TableTitles.PsyTalent);
        this.tableType = TableType.Talent;
    }
}