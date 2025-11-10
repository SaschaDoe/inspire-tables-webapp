import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {AttitudeTable} from "./attitudeTable";

export class AlignmentTable extends Table{
    constructor(){
        let entries = [];
        entries.push(new TableEntry("lawful ").withCascadingRole(new AttitudeTable()));
        entries.push(new TableEntry("neutral").withCascadingRole(new AttitudeTable()));
        entries.push(new TableEntry("chaotic ").withCascadingRole(new AttitudeTable()));
        super(entries, TableTitles.Alignment);
    }
}
