import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class IllnessTypeTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('fever'));
		entries.push(new TableEntry('plague'));
		entries.push(new TableEntry('epidemic'));
		entries.push(new TableEntry('pandemic'));
		entries.push(new TableEntry('infection'));
		entries.push(new TableEntry('sickness'));
		entries.push(new TableEntry('disease'));
		entries.push(new TableEntry('malady'));
		entries.push(new TableEntry('affliction'));
		entries.push(new TableEntry('syndrome'));
		entries.push(new TableEntry('disorder'));
		entries.push(new TableEntry('pestilence'));
		entries.push(new TableEntry('contagion'));
		entries.push(new TableEntry('virus'));
		entries.push(new TableEntry('blight'));
		entries.push(new TableEntry('scourge'));
		entries.push(new TableEntry('infestation'));
		super(entries, TableTitles.IllnessType);
		this.tableType = TableType.Other;
	}
}
