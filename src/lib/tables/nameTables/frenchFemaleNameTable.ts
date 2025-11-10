import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";

export class FrenchFemaleNameTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Jeanne"));
        entries.push(new TableEntry("Marguerite"));
        entries.push(new TableEntry("Louise"));
        entries.push(new TableEntry("Suzanne"));
        entries.push(new TableEntry("Marcelle"));
        entries.push(new TableEntry("Anne"));
        entries.push(new TableEntry("Eugenie"));
        entries.push(new TableEntry("Henriette"));
        entries.push(new TableEntry("Helene"));
        entries.push(new TableEntry("Lucie"));
        entries.push(new TableEntry("Georgette"));
        entries.push(new TableEntry("Angele"));
        entries.push(new TableEntry("Therese"));
        entries.push(new TableEntry("Blanche"));
        entries.push(new TableEntry("Antoinette"));
        entries.push(new TableEntry("Elise"));
        entries.push(new TableEntry("Cecile"));
        entries.push(new TableEntry("Charlotte"));
        entries.push(new TableEntry("Julie"));
        entries.push(new TableEntry("Adrienne"));
        entries.push(new TableEntry("Claire"));
        entries.push(new TableEntry("Victorine"));
        entries.push(new TableEntry("Albertine"));
        entries.push(new TableEntry("Odette"));
        entries.push(new TableEntry("Alphonsine"));
        entries.push(new TableEntry("Clementine"));
        entries.push(new TableEntry("Phiomene"));
        entries.push(new TableEntry("Clotilde"));
        entries.push(new TableEntry("Felicie"));
        entries.push(new TableEntry("Alexendrine"));
        entries.push(new TableEntry("Elysia"));
        entries.push(new TableEntry("Fassianne"));
        entries.push(new TableEntry("Tilliana"));
        entries.push(new TableEntry("Vanossa"));
        entries.push(new TableEntry("Valionna"));
        entries.push(new TableEntry("Feodora"));
        super(entries, TableTitles.FrenchFemaleName);
    }
}