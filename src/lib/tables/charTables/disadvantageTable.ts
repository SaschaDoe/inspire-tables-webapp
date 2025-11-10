import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {AttributeTable} from "./attributeTable";
import {SenseTable} from "../otherTables/senseTable";
import {ElementTable} from "../otherTables/elementTable";
import {TableType} from "../tableType";

export class DisadvantageTable extends Table{
    constructor(){
        let entries = [];
        entries.push(new TableEntry("unlucky"));
        entries.push(new TableEntry("obedient to power").withFunction(AddCharForPower));
        entries.push(new TableEntry("fat"))
        entries.push(new TableEntry("rumors"))
        entries.push(new TableEntry("outcast"))
        entries.push(new TableEntry("shy"))
        entries.push(new TableEntry("low attribute ").withCascadingRole(new AttributeTable()))
        entries.push(new TableEntry("untalented"))
        entries.push(new TableEntry("bad sense ").withCascadingRole(new SenseTable()))
        entries.push(new TableEntry("blind"))
        entries.push(new TableEntry("deaf"))
        entries.push(new TableEntry("vulnerable to cold"))
        entries.push(new TableEntry("vulnerable to heat"))
        entries.push(new TableEntry("no sense of magic"))
        entries.push(new TableEntry("no sense of money"))
        entries.push(new TableEntry("naive"))
        entries.push(new TableEntry("slow"))
        entries.push(new TableEntry("ugly"))
        entries.push(new TableEntry("old"))
        entries.push(new TableEntry("long sleeper"))
        entries.push(new TableEntry("bleeder"))
        entries.push(new TableEntry("bones of glass"))
        entries.push(new TableEntry("hot tempered"))
        entries.push(new TableEntry("wanted"))
        entries.push(new TableEntry("mad"))
        entries.push(new TableEntry("ill"))
        entries.push(new TableEntry("vulnerable to ").withCascadingRole(new ElementTable()))
        super(entries, TableTitles.Disadvantages);
        this.tableType = TableType.Character;
    }
}

export function AddCharForPower(char: Character){
    let newChar = new CharacterFactory().create();
    let relationship = new Relationship(char, newChar, RelationshipType.Obedient, RelationshipType.Acquaintanceship);
    newChar.relationships.push(relationship);
    char.relationships.push(relationship);
    addNSCToCharacterStore(newChar);
    return char;
}
