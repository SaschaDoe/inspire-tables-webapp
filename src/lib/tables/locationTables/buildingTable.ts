import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

export class BuildingTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("castle"))
        entries.push(new TableEntry("hill"))
        entries.push(new TableEntry("tomb"))
        entries.push(new TableEntry("port"))
        entries.push(new TableEntry("temple"))
        entries.push(new TableEntry("refuge"))
        entries.push(new TableEntry("village"))
        entries.push(new TableEntry("city"))
        entries.push(new TableEntry("shelter"))
        entries.push(new TableEntry("labyrinth"))
        entries.push(new TableEntry("mine"))
        entries.push(new TableEntry("hatchery"))
        entries.push(new TableEntry("monastery"))
        entries.push(new TableEntry("house"))
        entries.push(new TableEntry("cathedral"))
        entries.push(new TableEntry("megalith"))
        entries.push(new TableEntry("nest"))
        entries.push(new TableEntry("bastion"))
        entries.push(new TableEntry("palace"))
        entries.push(new TableEntry("bridge"))
        entries.push(new TableEntry("outpost"))
        entries.push(new TableEntry("cliffs"))
        entries.push(new TableEntry("pits"))
        entries.push(new TableEntry("chapel"))
        entries.push(new TableEntry("prison"))
        entries.push(new TableEntry("mausoleum"))
        entries.push(new TableEntry("academy"))
        entries.push(new TableEntry("dungeon"))
        entries.push(new TableEntry("reef"))
        entries.push(new TableEntry("garden"))
        entries.push(new TableEntry("pyramid"))
        entries.push(new TableEntry("forest"))
        entries.push(new TableEntry("tower"))
        entries.push(new TableEntry("halls"))
        entries.push(new TableEntry("shrine"))
        entries.push(new TableEntry("lair"))
        entries.push(new TableEntry("hoard"))
        super(entries, TableTitles.Building);
        this.tableType = TableType.Location;
    }
}