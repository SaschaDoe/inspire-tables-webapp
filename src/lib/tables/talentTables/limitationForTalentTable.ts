import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const limitations: string[] = [
	'forever',
	'touch',
	'no control',
	'certain time',
	'long ritual',
	'very loud',
	'concentration',
	'eye contact',
	'with consent',
	'only self',
	'one time',
	'when the stars are right',
	'only in the dark',
	'only in the light',
	'only in the rain',
	'only with certain element',
	'in specific season',
	'only at a temperature range',
	'only in a certain weather',
	'only in a certain mood',
	'only in a certain place',
	'only in a certain time',
	'only in a certain situation',
	'only in a certain state',
	'only in a certain form',
	'only in a certain shape',
	'only in a certain size',
	'only with artefact',
	'only with material nearby',
	'only with consuming material',
	'only with material from a certain place',
	'only with material from a certain time'
];

export class LimitationForTalentTable extends Table {
	constructor() {
		const entries = limitations.map((limitation) => new TableEntry(limitation));
		super(entries, TableTitles.Limitation);
	}
}
