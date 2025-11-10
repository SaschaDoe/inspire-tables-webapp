import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {BeginningTropeTable} from "./beginningTropeTable";
import {DiceRole} from "../diceRole";

// Note: External dependencies removed - charStore, dungeonStore, artefactStore, fractionStore
// Stub implementations
const addNewNSCToCharacterStoreReturnDescription = () => "NPC Character";
const addDungeonToStoreReturnDescription = () => "Dungeon";
const addArtefactToStoreReturnDescription = () => "Artefact";
const addNewFractionToStoreReturnDescription = () => "Faction";

export class AdventureBeginningTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withRoleInterval(2,7)
            .withCascadingRole(new BeginningTropeTable()));
        entries.push(new TableEntry("fraction introduction: ")
            .withRoleInterval(8,8)
            .withFunctionString(addNewFractionToStoreReturnDescription));
        entries.push(new TableEntry("dungeon introduction: ")
            .withRoleInterval(9,9)
            .withFunctionString(addDungeonToStoreReturnDescription));
        entries.push(new TableEntry("character introduction: ")
            .withRoleInterval(10,10)
            .withFunctionString(addNewNSCToCharacterStoreReturnDescription));
        entries.push(new TableEntry("artefact introduction: ")
            .withRoleInterval(11,12)
            .withFunctionString(addArtefactToStoreReturnDescription));
        super(entries, TableTitles.AdventureBeginning, TableType.Other, new DiceRole().withNumberOfDice(2));
    }
}