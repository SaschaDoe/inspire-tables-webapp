import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class GreekPlaceName extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Akidos"))
        entries.push(new TableEntry("Arkis"))
        entries.push(new TableEntry("Baltrea"))
        entries.push(new TableEntry("Ridis"))
        entries.push(new TableEntry("Dubar"))
        entries.push(new TableEntry("Heliopolos"))
        entries.push(new TableEntry("Hylailos"))
        entries.push(new TableEntry("Hylpia"))
        entries.push(new TableEntry("Kethas"))
        entries.push(new TableEntry("Kethenis"))
        entries.push(new TableEntry("Kutaki"))
        entries.push(new TableEntry("Lardos"))
        entries.push(new TableEntry("Mylamas"))
        entries.push(new TableEntry("Pailos"))
        entries.push(new TableEntry("Phrygaios"))
        entries.push(new TableEntry("Putras"))
        entries.push(new TableEntry("Tenos"))
        entries.push(new TableEntry("Teremon"))
        entries.push(new TableEntry("Tyllos"))
        entries.push(new TableEntry("Tyrakis"))
        entries.push(new TableEntry("Aryios"))
        entries.push(new TableEntry("Athyros"))
        entries.push(new TableEntry("Ayodon"))
        entries.push(new TableEntry("Balträia"))
        entries.push(new TableEntry("Ferein"))
        entries.push(new TableEntry("Geren"))
        entries.push(new TableEntry("Layrios"))
        entries.push(new TableEntry("Palakar"))
        entries.push(new TableEntry("Putras"))
        super(entries, TableTitles.GreekPlaceName);
        this.tableType = TableType.Other;
    }
}