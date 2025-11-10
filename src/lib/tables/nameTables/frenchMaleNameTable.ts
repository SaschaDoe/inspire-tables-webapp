import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";

export class FrenchMaleNameTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Jean"));
        entries.push(new TableEntry("Louis"));
        entries.push(new TableEntry("Pierre"));
        entries.push(new TableEntry("Henri"));
        entries.push(new TableEntry("Andre"));
        entries.push(new TableEntry("Rene"));
        entries.push(new TableEntry("Emile"));
        entries.push(new TableEntry("Maurice"));
        entries.push(new TableEntry("Eugene"));
        entries.push(new TableEntry("Robert"));
        entries.push(new TableEntry("Antoine"));
        entries.push(new TableEntry("Fernand"));
        entries.push(new TableEntry("Victor"));
        entries.push(new TableEntry("Alphonse"));
        entries.push(new TableEntry("Camille"));
        entries.push(new TableEntry("Alexandre"));
        entries.push(new TableEntry("Etienne"));
        entries.push(new TableEntry("Julien"));
        entries.push(new TableEntry("Armand"));
        entries.push(new TableEntry("Claude"));
        entries.push(new TableEntry("Arthur"));
        entries.push(new TableEntry("Raoul"));
        entries.push(new TableEntry("Gustave"));
        entries.push(new TableEntry("Frederic"));
        entries.push(new TableEntry("Laurent"));
        entries.push(new TableEntry("Alricio"));
        entries.push(new TableEntry("Ariosto"));
        entries.push(new TableEntry("Basilius"));
        entries.push(new TableEntry("Boldrino"));
        entries.push(new TableEntry("Beppo"));
        entries.push(new TableEntry("Gabrino"));
        entries.push(new TableEntry("Pandolfo"));
        entries.push(new TableEntry("Pulpio"));
        entries.push(new TableEntry("Thalion"));
        entries.push(new TableEntry("Ugo"));
        entries.push(new TableEntry("Zordan"));
        entries.push(new TableEntry("Masaniello"));
        entries.push(new TableEntry("Richelieu"));
        super(entries, TableTitles.FrenchMaleName);
    }
}