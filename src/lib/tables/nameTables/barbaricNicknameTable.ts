import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {AnimalTable} from "../charTables/animalTable";
import {FantasyCreatureTable} from "../charTables/fantasyCreatureTable";
import {WeaponTable} from "../artefactTables/weaponTable";
import {ColourTable} from "../otherTables/colourTable";
import {AttributeTable} from "../charTables/attributeTable";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

// Note: External dependency removed - stub implementation
const chooseNSCReturnUniqueName = () => "NPC";

export class BarbaricNicknameTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("the Abandoned"))
        entries.push(new TableEntry("the Accursed"))
        entries.push(new TableEntry("slayer of").withFunctionString(chooseNSCReturnUniqueName))
        entries.push(new TableEntry("the Bad"))
        entries.push(new TableEntry("the Bastard"))
        entries.push(new TableEntry("the").withCascadingRole(new AnimalTable()))
        entries.push(new TableEntry("the").withCascadingRole(new FantasyCreatureTable()));
        entries.push(new TableEntry("the").withCascadingRole(new WeaponTable()))
        entries.push(new TableEntry("the prince"))
        entries.push(new TableEntry("the").withCascadingRole(new ColourTable()))
        entries.push(new TableEntry("the Blind"))
        entries.push(new TableEntry("the Bold"))
        entries.push(new TableEntry("the Boneless"))
        entries.push(new TableEntry("the Brave"))
        entries.push(new TableEntry("the Broad-shouldered"))
        entries.push(new TableEntry("the Chief"))
        entries.push(new TableEntry("the Cruel"))
        entries.push(new TableEntry("the Crusader"))
        entries.push(new TableEntry("the Damned"))
        entries.push(new TableEntry("the Devil"))
        entries.push(new TableEntry("the Drunkard"))
        entries.push(new TableEntry("Earth-Shaker"))
        entries.push(new TableEntry("the Elder"))
        entries.push(new TableEntry("the Emperor-King"))
        entries.push(new TableEntry("the Executioner"))
        entries.push(new TableEntry("the Fearless"))
        entries.push(new TableEntry("the Fighter"))
        entries.push(new TableEntry("the Flatnosed"))
        entries.push(new TableEntry("the Forkbeard"))
        entries.push(new TableEntry("from Overseas"))
        entries.push(new TableEntry("the Glorious"))
        entries.push(new TableEntry("the God-Given"))
        entries.push(new TableEntry("the God-like"))
        entries.push(new TableEntry("the God-Loving"))
        entries.push(new TableEntry("the Hairy"))
        entries.push(new TableEntry("the Hidden"))
        entries.push(new TableEntry("the Mysterious"))
        entries.push(new TableEntry("the Magical"))
        entries.push(new TableEntry("the Ill-Tempered"))
        entries.push(new TableEntry("the Impaler"))
        entries.push(new TableEntry("the Invincible"))
        entries.push(new TableEntry("the Last"))
        entries.push(new TableEntry("the Lionheart"))
        entries.push(new TableEntry("the Longhaired"))
        entries.push(new TableEntry("the Mad"))
        entries.push(new TableEntry("the Mighty"))
        entries.push(new TableEntry("the Oath-Taker"))
        entries.push(new TableEntry("the Old"))
        entries.push(new TableEntry("the One-Eyed"))
        entries.push(new TableEntry("the Outlaw"))
        entries.push(new TableEntry("the Powerful"))
        entries.push(new TableEntry("the Sea-Wolf"))
        entries.push(new TableEntry("the Strong"))
        entries.push(new TableEntry("the").withCascadingRole(new AttributeTable()))
        entries.push(new TableEntry("the Tall"))
        entries.push(new TableEntry("the Terrible"))
        entries.push(new TableEntry("the Thunderbolt"))
        entries.push(new TableEntry("the Till the End of the World Passionate"))
        entries.push(new TableEntry("the Tough"))
        entries.push(new TableEntry("the Tyrant"))
        entries.push(new TableEntry("the Warlike"))
        entries.push(new TableEntry("the Who-Fights-Alone"))
        entries.push(new TableEntry("the Wicked"))
        super(entries, TableTitles.BarbaricNickName);
        this.tableType = TableType.Name;
    }
}