import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

// Note: External dependency removed - stub implementation
const addPictureToStoreReturnsDescription = () => "Picture";

export class FurnishingTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("altar"))
        entries.push(new TableEntry("table"))
        entries.push(new TableEntry("wall hanging"))
        entries.push(new TableEntry("").withFunctionString(addPictureToStoreReturnsDescription))
        entries.push(new TableEntry("a wall carving").withFunctionString(addPictureToStoreReturnsDescription))
        entries.push(new TableEntry("bed"))
        entries.push(new TableEntry("kitchen"))
        entries.push(new TableEntry("storage"))
        entries.push(new TableEntry("laboratory"))
        super(entries, TableTitles.Furnishing);
        this.tableType = TableType.Dungeon;
    }
}