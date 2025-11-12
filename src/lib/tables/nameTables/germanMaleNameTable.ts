import {Table} from "../table"
import { TableType } from '../tableType';;
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {DiceRole} from "../diceRole";

export class GermanMaleNameTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Adalbert", 11));
        entries.push(new TableEntry("Adalwin", 12));
        entries.push(new TableEntry("Ariald", 13));
        entries.push(new TableEntry("Arnulf", 14));
        entries.push(new TableEntry("Baldwin", 15));
        entries.push(new TableEntry("Berengar", 16));

        entries.push(new TableEntry("Brandolf", 21));
        entries.push(new TableEntry("Dagwin", 22));
        entries.push(new TableEntry("Dankmar", 23));
        entries.push(new TableEntry("Eberhard", 24));
        entries.push(new TableEntry("Eckwin", 25));
        entries.push(new TableEntry("Edmund", 26));

        entries.push(new TableEntry("Eike", 31));
        entries.push(new TableEntry("Erkmar", 32));
        entries.push(new TableEntry("Erwin", 33));
        entries.push(new TableEntry("Falko", 34));
        entries.push(new TableEntry("Folkward", 35));
        entries.push(new TableEntry("Friedbert", 36));

        entries.push(new TableEntry("Frowin", 41));
        entries.push(new TableEntry("Gandolf", 42));
        entries.push(new TableEntry("Gerbod", 43));
        entries.push(new TableEntry("Gottlieb", 44));
        entries.push(new TableEntry("Gudmunt", 45));
        entries.push(new TableEntry("Gunnar", 46));

        entries.push(new TableEntry("Halvor", 51));
        entries.push(new TableEntry("Irvin", 52));
        entries.push(new TableEntry("Knut", 53));
        entries.push(new TableEntry("Leif", 54));
        entries.push(new TableEntry("Lando", 55));
        entries.push(new TableEntry("Manfred", 56));

        entries.push(new TableEntry("Norbert", 61));
        entries.push(new TableEntry("Ragin", 62));
        entries.push(new TableEntry("Sarolf", 63));
        entries.push(new TableEntry("Ulf", 64));
        entries.push(new TableEntry("Willibald", 65));
        entries.push(new TableEntry("Winfried", 66));
        super(entries, TableTitles.GermanMaleName);
        this.diceRole = new DiceRole().withNumberOfDice(2);
    }
}