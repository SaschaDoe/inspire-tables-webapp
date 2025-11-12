import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class TerrainFeatureTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Natural features
		entries.push(new TableEntry('ancient ruins'));
		entries.push(new TableEntry('standing stones'));
		entries.push(new TableEntry('sacred grove'));
		entries.push(new TableEntry('natural spring'));
		entries.push(new TableEntry('cave entrance'));
		entries.push(new TableEntry('rocky outcrop'));
		entries.push(new TableEntry('hidden valley'));
		entries.push(new TableEntry('waterfall'));
		entries.push(new TableEntry('ancient tree'));
		entries.push(new TableEntry('stone circle'));
		// Structural features
		entries.push(new TableEntry('old road'));
		entries.push(new TableEntry('crumbling bridge'));
		entries.push(new TableEntry('abandoned watchtower'));
		entries.push(new TableEntry('burial mound'));
		entries.push(new TableEntry('stone cairn'));
		entries.push(new TableEntry('old shrine'));
		// Dangerous features
		entries.push(new TableEntry('monster lair'));
		entries.push(new TableEntry('quicksand pit'));
		entries.push(new TableEntry('poisonous flora'));
		entries.push(new TableEntry('unstable ground'));
		// Magical features
		entries.push(new TableEntry('ley line nexus'));
		entries.push(new TableEntry('magical anomaly'));
		entries.push(new TableEntry('portal remnants'));
		entries.push(new TableEntry('enchanted clearing'));
		// Resource features
		entries.push(new TableEntry('ore deposit'));
		entries.push(new TableEntry('herb patch'));
		entries.push(new TableEntry('crystal formation'));
		entries.push(new TableEntry('rare wood grove'));
		// Empty (common)
		entries.push(new TableEntry(''));
		entries.push(new TableEntry(''));
		super(entries, TableTitles.TerrainFeature);
		this.tableType = TableType.Location;
	}
}
