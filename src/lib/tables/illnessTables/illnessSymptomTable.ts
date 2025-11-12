import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class IllnessSymptomTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Physical symptoms
		entries.push(new TableEntry('fever'));
		entries.push(new TableEntry('cough'));
		entries.push(new TableEntry('sore throat'));
		entries.push(new TableEntry('headache'));
		entries.push(new TableEntry('muscle aches'));
		entries.push(new TableEntry('fatigue'));
		entries.push(new TableEntry('nausea'));
		entries.push(new TableEntry('dizziness'));
		entries.push(new TableEntry('sweating'));
		entries.push(new TableEntry('chills'));
		entries.push(new TableEntry('rash'));
		entries.push(new TableEntry('swelling'));
		entries.push(new TableEntry('weight loss'));
		entries.push(new TableEntry('insomnia'));
		entries.push(new TableEntry('abdominal pain'));
		entries.push(new TableEntry('blurry vision'));
		entries.push(new TableEntry('confusion'));
		entries.push(new TableEntry('mood swings'));
		entries.push(new TableEntry('hallucinations'));
		// Magical/fantasy symptoms
		entries.push(new TableEntry('loss of magic'));
		entries.push(new TableEntry('mana depletion'));
		entries.push(new TableEntry('cursed'));
		entries.push(new TableEntry('weakened'));
		entries.push(new TableEntry('bleeding'));
		entries.push(new TableEntry('petrified'));
		entries.push(new TableEntry('exhausted'));
		entries.push(new TableEntry('vulnerable'));
		super(entries, TableTitles.IllnessSymptom);
		this.tableType = TableType.Other;
	}
}
