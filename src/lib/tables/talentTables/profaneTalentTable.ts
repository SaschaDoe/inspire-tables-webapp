import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ArtistTalentTable} from "./artistTalentTable";
import {AthleticsTalentTable} from "./athleticsTalentTable";
import {CraftTable} from "./craftTable";

export class ProfaneTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("").withCascadingRole(new ArtistTalentTable()))
        entries.push(new TableEntry("").withCascadingRole(new AthleticsTalentTable()))
        entries.push(new TableEntry("").withCascadingRole(new CraftTable()))
        super(entries, TableTitles.ProfaneTalent);
        this.tableType = TableType.Talent;
    }
}