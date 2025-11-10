import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ElementTable} from "../otherTables/elementTable";

export class LandscapeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("forest")
            .withSelfCascade(20, " and "))
        entries.push(new TableEntry("gras"))
        entries.push(new TableEntry("hills")
            .withSelfCascade(20, " and "))
        entries.push(new TableEntry("mountains")
            .withSelfCascade(20, " and "))
        entries.push(new TableEntry("river")
            .withCascadingRole(new ElementTable(), 10, " of ")
            .withSelfCascade(20, " and "))
        entries.push(new TableEntry("desert"))
        entries.push(new TableEntry("shores")
            .withSelfCascade(20, " and "))
        entries.push(new TableEntry("lake")
            .withCascadingRole(new ElementTable(),10," of ")
            .withSelfCascade(20, " and "))
        super(entries, TableTitles.Landscape);
        this.tableType = TableType.Location;
    }
}