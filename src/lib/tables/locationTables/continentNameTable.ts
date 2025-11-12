import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class ContinentNameTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('Pangaea'));
		entries.push(new TableEntry('Gondwana'));
		entries.push(new TableEntry('Laurasia'));
		entries.push(new TableEntry('Atlantis'));
		entries.push(new TableEntry('Lemuria'));
		entries.push(new TableEntry('Mu'));
		entries.push(new TableEntry('Hyperborea'));
		entries.push(new TableEntry('Thule'));
		entries.push(new TableEntry('Avalonia'));
		entries.push(new TableEntry('Zealandia'));
		entries.push(new TableEntry('Baltica'));
		entries.push(new TableEntry('Siberia'));
		entries.push(new TableEntry('Amazonia'));
		entries.push(new TableEntry('Arctica'));
		entries.push(new TableEntry('Antarctica'));
		entries.push(new TableEntry('Vaalbara'));
		entries.push(new TableEntry('Ur'));
		entries.push(new TableEntry('Kenorland'));
		entries.push(new TableEntry('Nuna'));
		entries.push(new TableEntry('Rodinia'));

		super(entries, TableTitles.ContinentName);
	}
}
