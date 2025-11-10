import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

// Note: External dependencies removed - stub implementations
const addNewMonsterToStoreReturnUniqueName = () => "Monster";
const chooseNSCReturnUniqueName = () => "NPC";
const addArtefactToStoreReturnUniqueName = () => "Artefact";

export class FractionQuestTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("kill ")
            .withFunctionString(addNewMonsterToStoreReturnUniqueName))
        entries.push(new TableEntry("kill ")
            .withFunctionString(chooseNSCReturnUniqueName))
        entries.push(new TableEntry("bring ")
            .withFunctionString(chooseNSCReturnUniqueName))
        entries.push(new TableEntry("bring ")
            .withFunctionString(addNewMonsterToStoreReturnUniqueName))
        entries.push(new TableEntry("bring ")
            .withFunctionString(addArtefactToStoreReturnUniqueName))
        super(entries, TableTitles.FractionQuest);
        this.tableType = TableType.Other;
    }
}