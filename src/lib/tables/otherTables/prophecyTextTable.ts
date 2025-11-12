import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class ProphecyTextTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('when the stars align, a great change will come'));
		entries.push(new TableEntry('the chosen one will rise from humble origins'));
		entries.push(new TableEntry('darkness will fall upon the land before the dawn'));
		entries.push(new TableEntry('three signs shall herald the end of an age'));
		entries.push(new TableEntry('a sword shall be drawn that cannot be sheathed'));
		entries.push(new TableEntry('the old gods will awaken from their slumber'));
		entries.push(new TableEntry('fire and ice shall meet, and the world will tremble'));
		entries.push(new TableEntry('betrayal will come from within the inner circle'));
		entries.push(new TableEntry('the dead shall rise when the moon turns red'));
		entries.push(new TableEntry('a great sacrifice will be required to save all'));
		entries.push(new TableEntry('twin destinies shall converge at the crossroads'));
		entries.push(new TableEntry('the forbidden knowledge will be uncovered'));
		entries.push(new TableEntry('a new empire will rise from the ashes of the old'));
		entries.push(new TableEntry('the ancient enemy will return in a different form'));
		entries.push(new TableEntry('seven trials must be overcome to claim victory'));
		super(entries, TableTitles.ProphecyText);
		this.tableType = TableType.Other;
	}
}
