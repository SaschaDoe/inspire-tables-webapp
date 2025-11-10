import {Table} from "../table";
import {TableEntry} from "../tableEntry";
import {TableTitles} from "../tableTitles";
import {TableType} from "../tableType";

// Note: External dependency removed - artefactStore
// Stub implementation for magical artefact generation
const generateMagicalArtefact = () => "Magical Artefact";

export class MagicalArtefactTable extends Table{
    constructor(){
        let entries = [] as TableEntry[];
        entries.push(new TableEntry("Magical Artefact").withFunctionString(generateMagicalArtefact))
        super(entries, TableTitles.MagicalArtefact);
        this.tableType = TableType.Artefact;
    }
}

