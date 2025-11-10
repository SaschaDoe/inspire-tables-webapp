import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class EndingTropeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("100% completion"))
        entries.push(new TableEntry("album closure"))
        entries.push(new TableEntry("all is well"))
        entries.push(new TableEntry("all just a dream"))
        entries.push(new TableEntry("ambiguous ending"))
        entries.push(new TableEntry("apocalypse wow"))
        entries.push(new TableEntry("audience alienating ending"))
        entries.push(new TableEntry("awesome crowning"))
        entries.push(new TableEntry("babies ever after"))
        entries.push(new TableEntry("wedding"))
        entries.push(new TableEntry("kiss"))
        entries.push(new TableEntry("party"))
        entries.push(new TableEntry("bittersweet"))
        entries.push(new TableEntry("bluffing the murderer"))
        entries.push(new TableEntry("murder is one of you"))
        entries.push(new TableEntry("the good guy is the bad"))
        entries.push(new TableEntry("but now I must go"))
        entries.push(new TableEntry("chased of the sunset"))
        entries.push(new TableEntry("drove of the sunset"))
        entries.push(new TableEntry("cosmic deadline"))
        entries.push(new TableEntry("terentino ending"))
        entries.push(new TableEntry("dawn of an era"))
        entries.push(new TableEntry("defeat means labor"))
        entries.push(new TableEntry("deus ex machina"))
        entries.push(new TableEntry("doomed"))
        entries.push(new TableEntry("dump them all"))
        entries.push(new TableEntry("ending by ascending"))
        entries.push(new TableEntry("epilogue letter"))
        entries.push(new TableEntry("everybody did it"))
        entries.push(new TableEntry("everybody lives"))
        entries.push(new TableEntry("everybody is dead, dave"))
        entries.push(new TableEntry("faction specific ending"))
        entries.push(new TableEntry("first time in this location"))
        entries.push(new TableEntry("group picture ending"))
        entries.push(new TableEntry("home sweet home"))
        entries.push(new TableEntry("i choose to stay"))
        entries.push(new TableEntry("hospital epilogue"))
        entries.push(new TableEntry("last day of school"))
        entries.push(new TableEntry("last day of vacation"))
        entries.push(new TableEntry("medals for everyone"))
        entries.push(new TableEntry("call for aggriculture"))
        entries.push(new TableEntry("shootout"))
        entries.push(new TableEntry("moving away ending"))
        entries.push(new TableEntry("not normal anymore"))
        entries.push(new TableEntry("one last"))
        entries.push(new TableEntry("ruins I caused"))
        entries.push(new TableEntry("wealthy happy after"))
        entries.push(new TableEntry("YEAH shot"))
        entries.push(new TableEntry("villain can flee"))
        entries.push(new TableEntry("villain is arrested"))
        entries.push(new TableEntry("villain is dead"))
        super(entries, TableTitles.EndingTropes);
        this.tableType = TableType.Artefact;
    }
}