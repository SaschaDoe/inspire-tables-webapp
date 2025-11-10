import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";

export class AttitudeTable extends Table{
    constructor(){
        let entries = [];
        entries.push(new TableEntry("good"));
        entries.push(new TableEntry("neutral"));
        entries.push(new TableEntry("evil"));
        super(entries, TableTitles.Attitude);
    }
}