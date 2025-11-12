import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const sciFiSecondPartNames: string[] = [
	'manipulation',
	'conduction',
	'fabrication',
	'projection',
	'enhancement',
	'transmutation',
	'navigation',
	'generation',
	'simulation',
	'resonance',
	'interface',
	'network',
	'field',
	'drive',
	'system',
	'matrix',
	'array',
	'circuit',
	'framework',
	'mechanism'
];

export class MagicSystemSciFiNameSecondTable extends Table {
	constructor() {
		const entries = sciFiSecondPartNames.map((name) => new TableEntry(name));
		super(entries, TableTitles.Default);
	}
}
