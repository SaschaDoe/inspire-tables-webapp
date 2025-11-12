import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const powerArcs = ['exponential', 'straight', 'milestones', 'circular'];

export class PowerArcTable extends Table {
	constructor() {
		const entries = powerArcs.map((arc) => new TableEntry(arc));
		super(entries, TableTitles.PowerArc);
	}
}
