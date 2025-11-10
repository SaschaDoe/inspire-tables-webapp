import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {WeaponTable} from "../artefactTables/weaponTable";
import {ElementTable} from "../otherTables/elementTable";

export class EpicSubstantiveTable extends Table {
    constructor() {
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("storm"));
        entries.push(new TableEntry("death"));
        entries.push(new TableEntry("temper"));
        entries.push(new TableEntry("hope"));
        entries.push(new TableEntry("shadow"));
        entries.push(new TableEntry("apocalypse"));
        entries.push(new TableEntry("eternal"));
        entries.push(new TableEntry("flame"));
        entries.push(new TableEntry("eagle"));
        entries.push(new TableEntry("silence"));
        entries.push(new TableEntry("moon"));
        entries.push(new TableEntry("sun"));
        entries.push(new TableEntry("universe"));
        entries.push(new TableEntry("afterlife"));
        entries.push(new TableEntry("blood"));
        entries.push(new TableEntry("flame"));
        entries.push(new TableEntry("dawn"));
        entries.push(new TableEntry("thunder"));
        entries.push(new TableEntry("wind"));
        entries.push(new TableEntry("spell"));
        entries.push(new TableEntry("prayer"));
        entries.push(new TableEntry("dream"));
        entries.push(new TableEntry("star"));
        super(entries, TableTitles.EpicSubstantive);
    }
}