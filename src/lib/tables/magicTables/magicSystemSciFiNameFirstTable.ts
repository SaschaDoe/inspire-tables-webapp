import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const sciFiFirstPartNames: string[] = [
	'quantum',
	'cyber',
	'nano',
	'astro',
	'cosmic',
	'plasma',
	'synth',
	'holographic',
	'neural',
	'void',
	'flux',
	'warp',
	'phase',
	'matrix',
	'virtual',
	'energy',
	'particle',
	'digital',
	'stellar',
	'temporal'
];

export class MagicSystemSciFiNameFirstTable extends Table {
	constructor() {
		const entries = sciFiFirstPartNames.map((name) => new TableEntry(name));
		super(entries, TableTitles.MagicSystemSciFiNameFirst);
	}
}
