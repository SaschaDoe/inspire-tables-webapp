import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const universeAges: string[] = [
	'newly born, still forming its first structures',
	'young and energetic, in its first billion years',
	'adolescent, with stable galaxies emerging',
	'mature, in its prime with abundant life',
	'middle-aged, around 13.8 billion years old',
	'aging, with red giants becoming common',
	'ancient, with most stars long dead',
	'approaching heat death as entropy maximizes',
	'timeless, existing outside linear progression',
	'cyclical, repeatedly dying and being reborn',
	'infant, just seconds after the big bang',
	'prehistoric, before stars could form',
	'pristine, in its first cosmic dawn',
	'established, with well-defined physical laws',
	'elderly, with increasingly diffuse matter',
	'terminal, approaching final collapse',
	'eternal, having no beginning or end',
	'frozen, locked in a single moment',
	'accelerating, expanding ever faster',
	'contracting, heading toward the big crunch'
];

export class UniverseAgeTable extends Table {
	constructor() {
		const entries = universeAges.map((age) => new TableEntry(age));
		super(entries, TableTitles.UniverseAge);
		this.tableType = TableType.Other;
	}
}
