import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const magicWeaknesses: string[] = [
	'magic is nullified in the presence of gold',
	'casters lose their powers when they break a promise',
	"using magic drains the caster's life force, aging them slightly",
	'magic cannot affect anything made of pure silver',
	'spellcasters are vulnerable to a specific rare herb',
	'casting spells causes temporary blindness',
	'magic is weakened during solar eclipses',
	'the presence of a specific animal neutralizes all magic',
	'spells fail in areas where a certain ancient language is spoken',
	'magic users are unable to lie, as it diminishes their powers',
	'casting magic leaves the user physically weakened for hours',
	'magic cannot penetrate a circle of salt',
	'spellcasters lose their ability when in total darkness',
	'magic is ineffective against those of pure heart',
	'the use of magic attracts malevolent spirits',
	'a specific gemstone can absorb magical energies, rendering spells useless',
	'using magic causes intense, disorienting vertigo',
	'magical abilities are dormant when the caster is inebriated',
	'casters are allergic to a common substance, like iron or wheat',
	'spells are disrupted by the sound of bells',
	'magic is less effective in the presence of children',
	"intense emotions like love or hate can block a caster's abilities",
	'spellcasters are unable to cross running water',
	'magic leaves a unique, traceable signature detectable by other mages',
	'casting spells in quick succession leads to unpredictable outcomes'
];

export class MagicWeaknessTable extends Table {
	constructor() {
		const entries = magicWeaknesses.map((weakness) => new TableEntry(weakness));
		super(entries, TableTitles.MagicWeakness, TableType.Other);
	}
}
