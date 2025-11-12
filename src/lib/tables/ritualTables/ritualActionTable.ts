import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualActionTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Mundane ritual actions
		entries.push(new TableEntry('processional marches'));
		entries.push(new TableEntry('symbolic gestures'));
		entries.push(new TableEntry('ritualistic dances'));
		entries.push(new TableEntry('prostration before the altar'));
		entries.push(new TableEntry('kneeling in silence'));
		entries.push(new TableEntry('circumambulation of sacred objects'));
		entries.push(new TableEntry('chanting in unison'));
		entries.push(new TableEntry('drawing of sigils in the air'));
		entries.push(new TableEntry('casting of runes'));
		entries.push(new TableEntry('lighting of ceremonial torches'));
		entries.push(new TableEntry('anointing with holy oils'));
		entries.push(new TableEntry('placement of offerings'));
		entries.push(new TableEntry('recitation of vows'));
		entries.push(new TableEntry('silent meditation'));
		entries.push(new TableEntry('loud acclamations'));
		entries.push(new TableEntry('exchange of sacred objects'));
		entries.push(new TableEntry('bathing in sanctified waters'));
		entries.push(new TableEntry('binding of wrists with ribbons'));
		entries.push(new TableEntry('symbolic combat or sparring'));
		entries.push(new TableEntry('creation of talismans'));
		// Magical ritual actions
		entries.push(new TableEntry('summoning ethereal beings'));
		entries.push(new TableEntry('conjuring elemental spirits'));
		entries.push(new TableEntry('weaving spells of protection'));
		entries.push(new TableEntry('binding phantoms to service'));
		entries.push(new TableEntry('transmuting elements'));
		entries.push(new TableEntry('opening portals to other realms'));
		entries.push(new TableEntry("invoking ancient dragons' names"));
		entries.push(new TableEntry('channeling cosmic energies'));
		entries.push(new TableEntry('levitating sacred stones'));
		entries.push(new TableEntry('performing divination with enchanted artifacts'));
		entries.push(new TableEntry('casting illusions of prophetic visions'));
		entries.push(new TableEntry('enacting the dance of the celestial bodies'));
		entries.push(new TableEntry('singing melodies that alter reality'));
		entries.push(new TableEntry('raising barriers between worlds'));
		entries.push(new TableEntry('unleashing storms with incantations'));
		entries.push(new TableEntry('commanding the flora and fauna'));
		entries.push(new TableEntry('engraving runes of power into the earth'));
		entries.push(new TableEntry('drawing mana from ley lines'));
		entries.push(new TableEntry('sealing pacts with otherworldly entities'));
		entries.push(new TableEntry('wielding enchanted weapons in ritual combat'));
		super(entries, TableTitles.RitualAction);
		this.tableType = TableType.Other;
	}
}
