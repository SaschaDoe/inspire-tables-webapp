import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {DiceRole} from "../diceRole";


export class RelationshipTypeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry(RelationshipType.Love));
        entries.push(new TableEntry(RelationshipType.Friendship));
        entries.push(new TableEntry(RelationshipType.Obedient));
        entries.push(new TableEntry(RelationshipType.Acquaintanceship));
        entries.push(new TableEntry(RelationshipType.JustMet));
        entries.push(new TableEntry(RelationshipType.Hatred));
        entries.push(new TableEntry(RelationshipType.ArchEnemy));

        super(entries, TableTitles.RelationshipType);
    }

    changeToPartyDistribution(){
        this.entries = [];
        this.entries.push(new TableEntry(RelationshipType.Love).withRoleInterval(3,3));
        this.entries.push(new TableEntry(RelationshipType.Obedient).withRoleInterval(4,5));
        this.entries.push(new TableEntry(RelationshipType.Friendship).withRoleInterval(6,9));
        this.entries.push(new TableEntry(RelationshipType.Acquaintanceship).withRoleInterval(10,13));
        this.entries.push(new TableEntry(RelationshipType.JustMet).withRoleInterval(14,16));
        this.entries.push(new TableEntry(RelationshipType.Hatred).withRoleInterval(17,17));
        this.entries.push(new TableEntry(RelationshipType.ArchEnemy).withRoleInterval(18,18));
        this.diceRole = new DiceRole().withNumberOfDice(3)
    }
}
