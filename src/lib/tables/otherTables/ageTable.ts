import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export const Ages = ['just-created', 'young', 'juvenile', 'middle-aged', 'mature', 'old', 'ancient'];

export class AgeTable extends Table {
	constructor() {
		const entries = Ages.map((age) => new TableEntry(age));
		super(entries, TableTitles.Age);
		this.tableType = TableType.Other;
	}
}
