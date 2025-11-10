import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class GreekMaleNameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Aisyphan"))
        entries.push(new TableEntry("Alrikos"))
        entries.push(new TableEntry("Amenelaos"))
        entries.push(new TableEntry("Andrios"))
        entries.push(new TableEntry("Avasios"))
        entries.push(new TableEntry("Avessander"))
        entries.push(new TableEntry("Belemanias"))
        entries.push(new TableEntry("Berytos"))
        entries.push(new TableEntry("Chysos"))
        entries.push(new TableEntry("Dariyon"))
        entries.push(new TableEntry("Dirimethos"))
        entries.push(new TableEntry("Efferdaios"))
        entries.push(new TableEntry("Horakles"))
        entries.push(new TableEntry("Ingerydos"))
        entries.push(new TableEntry("Kalchas"))
        entries.push(new TableEntry("Karydios"))
        entries.push(new TableEntry("Kykeon"))
        entries.push(new TableEntry("Kyklanos"))
        entries.push(new TableEntry("Madaion"))
        entries.push(new TableEntry("Meneander"))
        entries.push(new TableEntry("Mermydion"))
        entries.push(new TableEntry("Mionos"))
        entries.push(new TableEntry("Odenios"))
        entries.push(new TableEntry("Okeandros"))
        entries.push(new TableEntry("Peleiston"))
        entries.push(new TableEntry("Pelmides"))
        entries.push(new TableEntry("Peraistos"))
        entries.push(new TableEntry("Praiokles"))
        entries.push(new TableEntry("Pydilion"))
        entries.push(new TableEntry("Rahjenysios"))
        entries.push(new TableEntry("Rahjoros"))
        entries.push(new TableEntry("Rondragoras"))
        entries.push(new TableEntry("Rondrakles"))
        entries.push(new TableEntry("Seneb"))
        entries.push(new TableEntry("Sidor"))
        entries.push(new TableEntry("Stollios"))
        entries.push(new TableEntry("Thalanios"))
        entries.push(new TableEntry("Thyndarios"))
        entries.push(new TableEntry("Tykates"))
        entries.push(new TableEntry("Tyndareos"))
        entries.push(new TableEntry("Xelendonios"))
        entries.push(new TableEntry("Ximater"))
        entries.push(new TableEntry("Yidayion"))
        entries.push(new TableEntry("Zephyros"))
        entries.push(new TableEntry("Zesrad"))
        entries.push(new TableEntry("Calmados"))
        entries.push(new TableEntry("Prosperos"))
        entries.push(new TableEntry("Hadrokles"))
        super(entries, TableTitles.GreekMaleName);
        this.tableType = TableType.Other;
    }
}