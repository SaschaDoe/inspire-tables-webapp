import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const secretSocietySuffixes: string[] = [
	'hidden',
	'arcane',
	'forgotten lore',
	'eternal mystery',
	'sacred flame',
	'veiled truth',
	'enigmatic grimoire',
	'lost codex',
	'silent chant',
	'hidden throne',
	'secret philosophers',
	'masked',
	'unseen oracle',
	'arcane seal',
	'whispered prophecy',
	'luminous path',
	'obscure manuscript',
	'cryptic relic',
	'shrouded path',
	'veiled society',
	'ancient depths',
	'hidden harmony',
	'thirteenth hour',
	'shadowed key',
	'esoteric rites',
	'silent choir',
	'forbidden tome',
	'mystic veil',
	'primeval rite',
	'occult',
	'eternal watch',
	'night',
	'whispering shadows',
	'sealed gates',
	'ancient order',
	'inner sanctum',
	'third eye',
	'celestial secrets',
	'eldritch power',
	'sovereign stars'
];

export class FactionSecondNameTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let suffix of secretSocietySuffixes) {
			entries.push(new TableEntry(suffix));
		}
		super(entries, TableTitles.FactionSecondName, TableType.Name);
	}
}

export { secretSocietySuffixes };
