import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {FrenchPlaceNameTable} from "./frenchPlaceNameTable";

export class FrenchLastNameTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("de").withCascadingRole(new FrenchPlaceNameTable()));
        entries.push(new TableEntry("di").withCascadingRole(new FrenchPlaceNameTable()));
        entries.push(new TableEntry("della").withCascadingRole(new FrenchPlaceNameTable()));
        entries.push(new TableEntry("da").withCascadingRole(new FrenchPlaceNameTable()));
        entries.push(new TableEntry("delli").withCascadingRole(new FrenchPlaceNameTable()));
        super(entries, TableTitles.FrenchLastName);
    }
}