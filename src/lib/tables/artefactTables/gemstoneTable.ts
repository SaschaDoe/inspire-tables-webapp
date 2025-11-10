import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class GemstoneTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("diamond"))
        entries.push(new TableEntry("rubin"))
        entries.push(new TableEntry("alexandrite"))
        entries.push(new TableEntry("amethyst"))
        entries.push(new TableEntry("ametrine"))
        entries.push(new TableEntry("apatite"))
        entries.push(new TableEntry("amber"))
        entries.push(new TableEntry("ammolite"))
        entries.push(new TableEntry("opal"))
        entries.push(new TableEntry("aquamarine"))
        entries.push(new TableEntry("aventurine"))
        entries.push(new TableEntry("beryl"))
        entries.push(new TableEntry("onyx"))
        entries.push(new TableEntry("pearl"))
        entries.push(new TableEntry("sapphire"))
        entries.push(new TableEntry("topaz"))
        entries.push(new TableEntry("spinel"))
        entries.push(new TableEntry("zircon"))
        entries.push(new TableEntry("emerald"))
        entries.push(new TableEntry("ruby"))
        entries.push(new TableEntry("quartz"))
        entries.push(new TableEntry("citrine"))
        entries.push(new TableEntry("colobmian"))
        entries.push(new TableEntry("jade"))
        entries.push(new TableEntry("lapis lazuli"))
        super(entries, TableTitles.Gemstone);
        this.tableType = TableType.Artefact;
    }
}