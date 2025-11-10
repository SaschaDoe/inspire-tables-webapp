import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class EmotionTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("fear"))
        entries.push(new TableEntry("annoyed"))
        entries.push(new TableEntry("disqust"))
        entries.push(new TableEntry("disapproving"))
        entries.push(new TableEntry("desire"))
        entries.push(new TableEntry("admiring"))
        entries.push(new TableEntry("enthusiasm"))
        entries.push(new TableEntry("trust"))
        entries.push(new TableEntry("anger"))
        entries.push(new TableEntry("confusion"))
        entries.push(new TableEntry("astonishment"))
        entries.push(new TableEntry("bored"))
        entries.push(new TableEntry("sad"))
        entries.push(new TableEntry("irritation"))
        entries.push(new TableEntry("serene"))
        entries.push(new TableEntry("concerned"))
        entries.push(new TableEntry("attentive"))
        entries.push(new TableEntry("attentive"))
        super(entries, TableTitles.Emotion);
        this.tableType = TableType.Other;
    }
}