import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";

export class CharacterShadowArchetypeTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("classic villain"))
        entries.push(new TableEntry("representation of chaos"))
        entries.push(new TableEntry("weakness override"))
        entries.push(new TableEntry("evil inner site"))
        entries.push(new TableEntry("evil through peer pressure"))
        entries.push(new TableEntry("seem to be evil"))
        entries.push(new TableEntry("good reasons"))
        entries.push(new TableEntry("power corrupts"))
        entries.push(new TableEntry("evil counterpart"))
        entries.push(new TableEntry("evil twin"))
        entries.push(new TableEntry("imaginary enemy"))
        entries.push(new TableEntry("jacop marley warning"))
        entries.push(new TableEntry("self is evil but I am what I am"))
        super(entries, TableTitles.CharacterShadowArchetype);
    }
}