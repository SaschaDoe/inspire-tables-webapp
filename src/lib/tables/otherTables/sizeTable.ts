import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export const Sizes = ["tiny", "small", "medium", "large", "gigantic", "huge", "big", "normal sized"];

export class SizeTable extends Table{
    constructor(){
        const entries = Sizes.map(size => new TableEntry(size));
        super(entries, TableTitles.Size);
        this.tableType = TableType.Other;
    }

}