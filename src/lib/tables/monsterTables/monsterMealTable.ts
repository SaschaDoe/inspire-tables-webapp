import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {RaceTable} from "../charTables/raceTable";
import {ElementTable} from "../otherTables/elementTable";
import {EmotionTable} from "../otherTables/emotionTable";
import {AttributeTable} from "../charTables/attributeTable";
import {DiceRole} from "../diceRole";

export class MonsterMealTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("vegan").withRoleInterval(3,3))
        entries.push(new TableEntry("dreams").withRoleInterval(4,5))
        entries.push(new TableEntry("vegetarian").withRoleInterval(6,8))
        entries.push(new TableEntry("meat").withRoleInterval(9,11))
        entries.push(new TableEntry("omnivores").withRoleInterval(12,14))
        entries.push(new TableEntry("").withCascadingRole(new RaceTable()).withRoleInterval(15,15))
        entries.push(new TableEntry("").withCascadingRole(new ElementTable()).withRoleInterval(16,16))
        entries.push(new TableEntry("it eats emotion: ").withCascadingRole(new EmotionTable()).withRoleInterval(6,8).withRoleInterval(17,17))
        entries.push(new TableEntry("it eats attribute: ").withCascadingRole(new AttributeTable()).withRoleInterval(18,18))
        super(entries, TableTitles.MonsterMeal,TableType.Character, new DiceRole().withNumberOfDice(3));
    }
}