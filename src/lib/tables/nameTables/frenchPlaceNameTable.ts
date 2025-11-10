import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";

export class FrenchPlaceNameTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Tegaliani"));
        entries.push(new TableEntry("Chambord"));
        entries.push(new TableEntry("Chenonceau"));
        entries.push(new TableEntry("Fontainebleau"));
        entries.push(new TableEntry("Pierrefonds"));
        entries.push(new TableEntry("Rivau"));
        entries.push(new TableEntry("Constermana"));
        entries.push(new TableEntry("Casa Costa"));
        entries.push(new TableEntry("Haute Tour"));
        entries.push(new TableEntry("Grande Paggiano"));
        entries.push(new TableEntry("Murs epais"));
        entries.push(new TableEntry("Route des Perdus"));
        entries.push(new TableEntry("Peruzzi"));
        entries.push(new TableEntry("Spada"));
        entries.push(new TableEntry("Tortona"));
        entries.push(new TableEntry("Rocheforte"));
        entries.push(new TableEntry("Ponziani"));
        entries.push(new TableEntry("Mont Roge"));
        entries.push(new TableEntry("Graziani"));
        entries.push(new TableEntry("Dejouner"));
        super(entries, TableTitles.FrenchPlaceNameTable);
    }
}