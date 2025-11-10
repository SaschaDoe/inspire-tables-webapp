import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {DiceRole} from "../diceRole";

export class GermanFemaleNameTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Adelheid", 11));
        entries.push(new TableEntry("Alsuna", 12));
        entries.push(new TableEntry("Alwina", 13));
        entries.push(new TableEntry("Arnhild", 14));
        entries.push(new TableEntry("Baltrun", 15));
        entries.push(new TableEntry("Brunhilde", 16));

        entries.push(new TableEntry("Dagmar", 21));
        entries.push(new TableEntry("Edelgard", 22));
        entries.push(new TableEntry("Eila", 23));
        entries.push(new TableEntry("Elfriede", 24));
        entries.push(new TableEntry("Elke", 25));
        entries.push(new TableEntry("Ermlinde", 26));

        entries.push(new TableEntry("Faralda", 31));
        entries.push(new TableEntry("Ferun", 32));
        entries.push(new TableEntry("Frauke", 33));
        entries.push(new TableEntry("Gelsa", 34));
        entries.push(new TableEntry("Gerda", 35));
        entries.push(new TableEntry("Gisela", 36));

        entries.push(new TableEntry("Gudrun", 41));
        entries.push(new TableEntry("Gwendolin", 42));
        entries.push(new TableEntry("Heilrun", 43));
        entries.push(new TableEntry("Helga", 44));
        entries.push(new TableEntry("Herlinde", 45));
        entries.push(new TableEntry("Hildegard", 46));

        entries.push(new TableEntry("Iduna", 51));
        entries.push(new TableEntry("Irma", 52));
        entries.push(new TableEntry("Kriemhild", 53));
        entries.push(new TableEntry("Kunna", 54));
        entries.push(new TableEntry("Lykke", 55));
        entries.push(new TableEntry("Margard", 56));

        entries.push(new TableEntry("Odarike", 61));
        entries.push(new TableEntry("Rinelda", 62));
        entries.push(new TableEntry("Rosaline", 63));
        entries.push(new TableEntry("Saskia", 64));
        entries.push(new TableEntry("Walda", 65));
        entries.push(new TableEntry("Wilfriede", 66));
        super(entries, TableTitles.GermanFemaleNames);
        this.diceRole = new DiceRole().withNumberOfDice(2);
    }
}