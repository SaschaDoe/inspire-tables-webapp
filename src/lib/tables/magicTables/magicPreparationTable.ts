import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const spellPreparationActions: string[] = [
	'drawing a magic circle',
	'chanting incantations',
	'performing ritual gestures',
	'meditating',
	'conducting energy through crystals',
	'mixing potions',
	'reading ancient texts',
	'aligning with celestial bodies',
	'cleansing the area with sacred smoke',
	'fasting or abstaining from certain foods',
	'anointing oneself with oils',
	'carving runes',
	'casting protective wards',
	'summoning spirit guides or familiars',
	'grounding and centering',
	'creating talismans or amulets',
	'sacrificing offerings',
	'connecting with natural elements',
	'visualizing the desired outcome',
	'weaving magical sigils',
	'humming or toning to raise energy',
	'blessing or consecrating the space',
	'charging items with magical intent',
	'reciting prayers or blessings',
	'using divination tools for guidance',
	'dancing to raise energy',
	'collecting dew or rainwater',
	'tying knots in cords or ribbons',
	'constructing a complex astrological chart',
	'engraving symbols on a sacred ground',
	'brewing a rare and intricate elixir',
	'conducting a multi-day fasting and purification ritual',
	'embarking on a vision quest',
	'performing a series of challenging magical trials',
	'completing a pilgrimage to a sacred site',
	'undertaking a night-long vigil under the stars',
	'crafting a unique magical instrument or tool',
	'deciphering cryptic prophetic dreams',
	'harvesting magical components at specific astrological times',
	'binding elemental spirits into service',
	'engaging in deep trance work to communicate with otherworldly beings',
	'creating a detailed and elaborate magical tapestry',
	'performing a ritual dance during specific lunar phases',
	'singing an ancient song that takes hours to complete',
	'assembling a complex array of mirrors to reflect celestial light',
	'growing a magical plant from seed to maturity',
	'weaving a cloak imbued with magical threads',
	'constructing a labyrinth for meditative walking',
	'life long training in a specific magical tradition',
	'life long dedication'
];

export class MagicPreparationTable extends Table {
	constructor() {
		const entries = spellPreparationActions.map((action) => new TableEntry(action));
		super(entries, TableTitles.SpellPreparation);
	}
}
