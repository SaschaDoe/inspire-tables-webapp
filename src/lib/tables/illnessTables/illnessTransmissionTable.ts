import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class IllnessTransmissionTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('airborne particles'));
		entries.push(new TableEntry('direct physical contact'));
		entries.push(new TableEntry('contaminated water or food'));
		entries.push(new TableEntry('bloodborne pathogens'));
		entries.push(new TableEntry('vector-borne (e.g., insects)'));
		entries.push(new TableEntry('sexual transmission'));
		entries.push(new TableEntry('mother to fetus (vertical transmission)'));
		entries.push(new TableEntry('droplet spread'));
		entries.push(new TableEntry('fomites (contaminated objects)'));
		entries.push(new TableEntry('animal to human (zoonotic transmission)'));
		entries.push(new TableEntry('magical contagion'));
		entries.push(new TableEntry('psychic or telepathic transfer'));
		entries.push(new TableEntry('nanobot dissemination'));
		entries.push(new TableEntry('interdimensional exposure'));
		entries.push(new TableEntry('genetic inheritance'));
		entries.push(new TableEntry('cybernetic interface infection'));
		entries.push(new TableEntry('alien spore inhalation'));
		entries.push(new TableEntry('ritualistic transmission'));
		entries.push(new TableEntry('aura or energy field absorption'));
		entries.push(new TableEntry('temporal or chronological exposure'));
		entries.push(new TableEntry('interstellar travel exposure'));
		entries.push(new TableEntry('synthetic lifeform contamination'));
		entries.push(new TableEntry('quantum entanglement'));
		entries.push(new TableEntry('artificial intelligence symbiosis'));
		entries.push(new TableEntry('hyperspace travel effects'));
		super(entries, TableTitles.IllnessTransmission);
		this.tableType = TableType.Other;
	}
}
