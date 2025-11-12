import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualLocationTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('consecrated temple grounds'));
		entries.push(new TableEntry('ancient stone circles'));
		entries.push(new TableEntry('mist-shrouded groves'));
		entries.push(new TableEntry('peak of a sacred mountain'));
		entries.push(new TableEntry('heart of the enchanted forest'));
		entries.push(new TableEntry('banks of a holy river'));
		entries.push(new TableEntry('sands of an ancestral desert'));
		entries.push(new TableEntry('beneath a cascade of waterfalls'));
		entries.push(new TableEntry("at the edge of the world's end"));
		entries.push(new TableEntry('cliff overlooking the sea'));
		entries.push(new TableEntry('in the depths of a hidden cave'));
		entries.push(new TableEntry('ruins of a forgotten city'));
		entries.push(new TableEntry('crossroads under the moonlight'));
		entries.push(new TableEntry('old battlefield steeped in legend'));
		entries.push(new TableEntry('quiet glade near the elder tree'));
		entries.push(new TableEntry('within a circle of towering monoliths'));
		entries.push(new TableEntry('chamber sealed beneath an ancient pyramid'));
		entries.push(new TableEntry('center of a labyrinth'));
		entries.push(new TableEntry('hall of mirrors in a crystal palace'));
		entries.push(new TableEntry('at the altar of an age-old cathedral'));
		super(entries, TableTitles.RitualLocation);
		this.tableType = TableType.Location;
	}
}
