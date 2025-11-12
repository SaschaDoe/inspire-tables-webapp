import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class ClueConclusionTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('confession or true events'));
		entries.push(new TableEntry('trace to someone who knows more'));
		entries.push(new TableEntry('trace to a location where new information can be found'));
		entries.push(new TableEntry('trace to a new suspect'));
		entries.push(new TableEntry('motive'));
		entries.push(new TableEntry('method'));
		entries.push(new TableEntry('time'));
		entries.push(new TableEntry('location of crime'));
		entries.push(new TableEntry('location of secret meeting'));
		entries.push(new TableEntry('murder weapon or important artefact'));
		entries.push(new TableEntry('customer, client or contractor'));
		entries.push(new TableEntry('exculpatory evidence'));
		entries.push(new TableEntry('more certainty of something already known'));
		entries.push(new TableEntry('identity'));
		entries.push(new TableEntry('profession'));
		entries.push(new TableEntry('time of the next planned event'));
		entries.push(new TableEntry('location of the next planned event'));
		entries.push(new TableEntry('true allegiance of a dubious character'));
		entries.push(new TableEntry('origin of something'));
		entries.push(new TableEntry('password or key'));
		entries.push(new TableEntry('nature of anomaly'));
		entries.push(new TableEntry('relationship'));
		entries.push(new TableEntry('identity of a traitor'));
		entries.push(new TableEntry('purpose of something'));
		entries.push(new TableEntry('weakness'));
		entries.push(new TableEntry('history'));
		super(entries, TableTitles.ClueConclusion);
		this.tableType = TableType.Other;
	}
}
