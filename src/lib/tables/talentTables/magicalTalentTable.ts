import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TalentCategoryTable} from "./talentCategoryTable";
import {ElementalTalentTable} from "./elementalTalentTable";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";
import {ChangeTalentTable} from "./changeTalentTable";
import {FromAnotherHigherPowerTalent} from "./fromAnotherHigherPowerTalent";
import {SummonTalentTable} from "./summonTalentTable";
import {ProphecyTalentTable} from "./prophecyTalentTable";
import {LimitationTable} from "./limitationTable";
import {PsyTalentTable} from "./psyTalentTable";
import {HealingTalentTable} from "./healingTalentTable";
import {ObjectEnchantmentTable} from "./objectEnchantmentTable";
import {TimeTalentTable} from "./timeTalentTable";
import {TravelTalentTable} from "./travelTalentTable";

export class MagicalTalentTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new ChangeTalentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new ElementalTalentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new FromAnotherHigherPowerTalent())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new SummonTalentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new ProphecyTalentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new PsyTalentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new HealingTalentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new ObjectEnchantmentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new TimeTalentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        entries.push(new TableEntry("")
            .withCascadingRole(new TalentCategoryTable())
            .withCascadingRole(new TravelTalentTable())
            .withCascadingRole(new LimitationTable(),30," but with the limitation of "))
        super(entries, TableTitles.MagicalTalent);
        this.tableType = TableType.Talent;
        this.probability = 30;
        this.moreThanOnce = true;
    }
}