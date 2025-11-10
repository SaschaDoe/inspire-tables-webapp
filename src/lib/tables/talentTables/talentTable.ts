import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {MagicalTalentTable} from "./magicalTalentTable";
import {ProfaneTalentTable} from "./profaneTalentTable";

export class TalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new MagicalTalentTable()))
        entries.push(new TableEntry("")
            .withCascadingRole(new ProfaneTalentTable()))
        super(entries, TableTitles.Talent);
        this.tableType = TableType.Talent;
    }
}

