import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class ColourTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("red"))
        entries.push(new TableEntry("blond"))
        entries.push(new TableEntry("white"))
        entries.push(new TableEntry("grey"))
        entries.push(new TableEntry("brown"))
        entries.push(new TableEntry("black"))
        entries.push(new TableEntry("blue"))
        entries.push(new TableEntry("green"))
        entries.push(new TableEntry("speckled").withSelfCascade())
        entries.push(new TableEntry("yellow"))
        entries.push(new TableEntry("opal"))
        entries.push(new TableEntry("rainbow colours side by side"))
        entries.push(new TableEntry("shimmering").withSelfCascade())
        entries.push(new TableEntry("altering").withSelfCascade().withSelfCascade())
        entries.push(new TableEntry("glittery").withSelfCascade())
        entries.push(new TableEntry("purple"))
        entries.push(new TableEntry("pink"))
        entries.push(new TableEntry("light").withSelfCascade())
        entries.push(new TableEntry("dark").withSelfCascade())
        entries.push(new TableEntry("poison green"))
        entries.push(new TableEntry("neon yellow"))
        entries.push(new TableEntry("mint"))
        entries.push(new TableEntry("indigo"))
        entries.push(new TableEntry("fuxia"))
        entries.push(new TableEntry("mahagony"))
        entries.push(new TableEntry("lapis lazuli"))
        entries.push(new TableEntry("transparent"))
        entries.push(new TableEntry("totally new colour"))
        super(entries, TableTitles.Colour);
        this.tableType = TableType.Other;
    }
}