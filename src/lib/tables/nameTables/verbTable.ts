import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";

export class VerbTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("sees"));
        entries.push(new TableEntry("dreams"));
        entries.push(new TableEntry("brings"));
        entries.push(new TableEntry("laughed at"));
        entries.push(new TableEntry("hears"));
        entries.push(new TableEntry("whispers to"));
        entries.push(new TableEntry("sings"));
        entries.push(new TableEntry("cast"));
        entries.push(new TableEntry("weaves"));
        entries.push(new TableEntry("goes over"));
        entries.push(new TableEntry("fears"));
        entries.push(new TableEntry("let screech"));
        entries.push(new TableEntry("forms"));
        entries.push(new TableEntry("knows"));
        entries.push(new TableEntry("with"));
        entries.push(new TableEntry("puts storm into"));
        entries.push(new TableEntry("searches"));
        entries.push(new TableEntry("proclaims"));
        entries.push(new TableEntry("defies")); //trotzt
        super(entries,
            TableTitles.Verb);
    }
}