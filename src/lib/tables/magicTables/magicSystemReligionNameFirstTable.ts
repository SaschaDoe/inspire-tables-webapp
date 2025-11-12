import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const religiousMagicFirstPartNames: string[] = [
	'divine',
	'sacred',
	'celestial',
	'holy',
	'spiritual',
	'ethereal',
	'mystic',
	'soul',
	'cosmic',
	'universal',
	'faith',
	'divinity',
	'eternal',
	'light',
	// Added darker, evil-sounding names
	'infernal',
	'demonic',
	'shadow',
	'dark',
	'nether',
	'occult',
	'forbidden',
	'eldritch',
	'cursed',
	'necrotic'
];

export class MagicSystemReligionNameFirstTable extends Table {
	constructor() {
		const entries = religiousMagicFirstPartNames.map((name) => new TableEntry(name));
		super(entries, TableTitles.Default);
	}
}
