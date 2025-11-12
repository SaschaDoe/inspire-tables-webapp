import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const reasonsForCreation: string[] = [
	'unite against common threats',
	'maintain cultural heritage',
	'protect from enemies',
	'control a territory',
	'manage resources efficiently',
	'establish trade and economic stability',
	'uphold specific religious beliefs',
	'seek collective security',
	'provide mutual aid and protection',
	'discover new lands and secrets',
	'conduct research and preservation of knowledge',
	'form strategic alliances',
	'promote social and political ideologies',
	'deliver humanitarian aid',
	'enforce laws and justice',
	'explore uncharted territories',
	'assert dominance or superiority',
	'defend against colonization',
	'rebuild after a catastrophe',
	'escape persecution or oppression'
];

export class FactionBeginningMotivationTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let reason of reasonsForCreation) {
			entries.push(new TableEntry(reason));
		}
		super(entries, TableTitles.FractionName);
	}
}

export { reasonsForCreation };
