import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ElementTable} from "../otherTables/elementTable";
import {generateContinentName} from "../nameTables/nameGenerator";

export class SphereTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withFunctionString(generateContinentName)
            .with(": sphere of death"))
        entries.push(new TableEntry("")
            .withFunctionString(generateContinentName)
            .with(": sphere of fey"))
        entries.push(new TableEntry("")
            .withFunctionString(generateContinentName)
            .with(": sphere of divine"))
        entries.push(new TableEntry("")
            .withFunctionString(generateContinentName)
            .with(": sphere of cosmic"))
        entries.push(new TableEntry("")
            .withFunctionString(generateContinentName)
            .with(": sphere of hell"))
        entries.push(new TableEntry("")
            .withFunctionString(generateContinentName)
            .with(": sphere of void"))
        entries.push(new TableEntry("")
            .withFunctionString(generateContinentName)
            .with(": sphere of hidden paths"))
        entries.push(new TableEntry("")
            .withFunctionString(generateContinentName)
            .with(": sphere associated with ")
            .withCascadingRole(new ElementTable()))
        super(entries, TableTitles.Sphere);
        this.tableType = TableType.Location;
    }
}