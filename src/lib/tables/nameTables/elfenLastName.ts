import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {VerbTable} from "./verbTable";
import {EpicSubstantiveTable} from "./epicSubstantiveTable";

export class ElfenLastName extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("who")
            .withCascadingRole(new VerbTable())
            .withCascadingRole(new EpicSubstantiveTable()));
        super(entries,
            TableTitles.ElfenLastName);
    }
}