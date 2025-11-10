import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class CharacterIntroductionTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("established character joins late fight"))
        entries.push(new TableEntry("attack introduction"))
        entries.push(new TableEntry("avengers assemble"))
        entries.push(new TableEntry("bait and switch character intro"))
        entries.push(new TableEntry("big damn heroes"))
        entries.push(new TableEntry("big entrance"))
        entries.push(new TableEntry("bitch alert"))
        entries.push(new TableEntry("click hello"))
        entries.push(new TableEntry("clique tour with character narrator"))
        entries.push(new TableEntry("come with me if you want to live"))
        entries.push(new TableEntry("crash into hello"))
        entries.push(new TableEntry("delayed narrator introduction"))
        entries.push(new TableEntry("drool hello"))
        entries.push(new TableEntry("early bird"))
        entries.push(new TableEntry("emerging from the shadows"))
        entries.push(new TableEntry("establishing character moment"))
        entries.push(new TableEntry("everyone meets everyone"))
        entries.push(new TableEntry("falling into the plot"))
        entries.push(new TableEntry("feet first introduction"))
        entries.push(new TableEntry("forgotten first meeting"))
        entries.push(new TableEntry("hero looking for group"))
        entries.push(new TableEntry("kick the dog"))
        entries.push(new TableEntry("pet the dog"))
        entries.push(new TableEntry("meet awkwardly the cute"))
        entries.push(new TableEntry("minor kidroduktion"))
        entries.push(new TableEntry("morning routine"))
        entries.push(new TableEntry("mysterious stranger"))
        entries.push(new TableEntry("omniscient council of vagueness"))
        entries.push(new TableEntry("mysterious protector"))
        entries.push(new TableEntry("chased"))
        entries.push(new TableEntry("putting the band back together"))
        entries.push(new TableEntry("rescue introduction"))
        entries.push(new TableEntry("sliding bike stop"))
        entries.push(new TableEntry("arrow zipping through air"))
        entries.push(new TableEntry("dangerous threat knock out strongest first"))
        entries.push(new TableEntry("into the cell"))
        entries.push(new TableEntry("meet at the local inn"))
        super(entries, TableTitles.CharacterIntroduction);
        this.tableType = TableType.Other;
    }
}