import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class SignMeaningTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('represents strength and valor'));
		entries.push(new TableEntry('symbolizes wisdom and knowledge'));
		entries.push(new TableEntry('signifies loyalty and devotion'));
		entries.push(new TableEntry('denotes courage in battle'));
		entries.push(new TableEntry('represents divine favor'));
		entries.push(new TableEntry('symbolizes royal lineage'));
		entries.push(new TableEntry('signifies protection and guardianship'));
		entries.push(new TableEntry('denotes ancient heritage'));
		entries.push(new TableEntry('represents unity and brotherhood'));
		entries.push(new TableEntry('symbolizes honor and glory'));
		entries.push(new TableEntry('signifies victory over enemies'));
		entries.push(new TableEntry('denotes magical prowess'));
		entries.push(new TableEntry('represents justice and fairness'));
		entries.push(new TableEntry('symbolizes endurance and perseverance'));
		entries.push(new TableEntry('signifies prosperity and wealth'));
		entries.push(new TableEntry('denotes sacred duty'));
		entries.push(new TableEntry('represents freedom and independence'));
		entries.push(new TableEntry('symbolizes peace and harmony'));
		entries.push(new TableEntry('signifies transformation and change'));
		entries.push(new TableEntry('denotes power and authority'));
		entries.push(new TableEntry('represents hope and renewal'));
		entries.push(new TableEntry('symbolizes cunning and strategy'));
		entries.push(new TableEntry('signifies nature and growth'));
		entries.push(new TableEntry('denotes vengeance and retribution'));
		entries.push(new TableEntry('represents balance and order'));
		entries.push(new TableEntry('symbolizes mystery and secrets'));
		entries.push(new TableEntry('signifies leadership and command'));
		entries.push(new TableEntry('denotes sacrifice and dedication'));
		entries.push(new TableEntry('represents rebirth and resurrection'));
		entries.push(new TableEntry('symbolizes nobility and grace'));

		super(entries, TableTitles.SignMeaning);
	}
}
