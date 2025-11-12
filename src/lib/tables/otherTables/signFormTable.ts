import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class SignFormTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('emblazoned on a shield'));
		entries.push(new TableEntry('displayed on a banner'));
		entries.push(new TableEntry('carved into a coat of arms'));
		entries.push(new TableEntry('painted on a flag'));
		entries.push(new TableEntry('engraved on a seal'));
		entries.push(new TableEntry('woven into a tapestry'));
		entries.push(new TableEntry('embroidered on a cloak'));
		entries.push(new TableEntry('stamped on armor'));
		entries.push(new TableEntry('etched on a ring'));
		entries.push(new TableEntry('inscribed on a medallion'));
		entries.push(new TableEntry('displayed on a pennant'));
		entries.push(new TableEntry('mounted on a standard'));
		entries.push(new TableEntry('painted on a tabard'));
		entries.push(new TableEntry('carved above a gateway'));
		entries.push(new TableEntry('displayed on heraldic clothing'));
		entries.push(new TableEntry('shown on a family crest'));
		entries.push(new TableEntry('emblazoned on a surcoat'));
		entries.push(new TableEntry('marked on battle gear'));
		entries.push(new TableEntry('displayed on a war banner'));
		entries.push(new TableEntry('shown in stained glass'));

		super(entries, TableTitles.SignForm);
	}
}
