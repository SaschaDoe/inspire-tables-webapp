import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const factionSayings: string[] = [
	'one for all, all for one',
	'strength in unity, honor in loyalty',
	'knowledge is the light, ignorance the darkness',
	'through adversity, to the stars',
	'in shadows we trust, in secrecy we thrive',
	'bound by nature, guardians of the wild',
	'forge in fire, stand as stone',
	'our bond is our strength',
	'by the sword, for the sword',
	'from many, one',
	'wisdom through ages, power through knowledge',
	'in silence, wisdom; in shadow, truth',
	'with honor we rise, with pride we stand',
	'unseen, unforgotten',
	'in the sea, we find our destiny',
	'faster than wind, quieter than shadow',
	'to the end, together',
	'beneath the surface, lies the truth',
	'from the ashes, we shall rise',
	'eternal as the stars, steadfast as the mountain',
	"where there's a will, there's a way",
	'the first to the key, the last to the lock',
	'as the stars guide, so shall we follow',
	'in dreams, truth',
	'never yielding, ever advancing',
	'echoes of the past, whispers of the future',
	'beneath the waves, our secrets lie',
	'in the heart of chaos, we find order',
	'united in purpose, divided in approach',
	'as the sun sets, our resolve rises',
	'in the dance of time, we find our rhythm',
	'our roots run deep, our ambitions deeper',
	'the wind carries our will, the earth guards our secrets',
	'in unity, we find strength; in diversity, wisdom',
	'we rise by lifting others',
	'as the hammer shapes the metal, so does adversity shape the soul',
	'in the balance of light and shadow, we walk',
	'our journey is eternal, our destination unknown',
	'from the ashes of defeat, the seeds of victory',
	'guided by history, driven by innovation',
	'stars guide, destiny follows',
	'echoes in the wind, secrets in the sand',
	'rise with the sun, rest with the moon',
	'forever explorers, in lands known and unknown',
	'unseen but ever present',
	'the flame endures, through storm and calm',
	'beyond the horizon, our legacy awaits',
	'wisdom in age, courage in youth',
	'from shadows, light; from ashes, life',
	'every end, a new beginning',
	'in unity, harmony; in division, chaos',
	"time's river flows, our legacy remains",
	'through stormy seas, we find our path',
	'as the tree bends, so do we adapt',
	'with silent wings, we soar',
	'in the heart of winter, the strength of the wolf',
	'carved by history, shaped by tomorrow',
	'seekers of truth, in a world of myths',
	'in every heart, a wild song',
	'beneath the stars, our path unfolds',
	'in darkness, we find power',
	'from chaos, order; from fear, obedience',
	'the night whispers our name',
	'shadows are our canvas, fear our paint',
	'our will is the only law',
	'beneath the lies, the truth of power',
	'we are the architects of the night',
	'in the silence, our command is law',
	'our strength is forged in the fires of betrayal',
	'to reign is to isolate; to command is to fear',
	'where light ends, our domain begins',
	'every soul has its price',
	'through the ashes, our throne',
	'we weave the threads of fate',
	'our whispers shape the world',
	'in our grasp, the world trembles',
	'we rise as the light fades',
	'our empire, built on secrets and lies',
	'the darkness shelters us',
	'we are the storm that is approaching'
];

export class FactionQuoteTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let saying of factionSayings) {
			entries.push(new TableEntry(saying));
		}
		super(entries, TableTitles.FractionName);
	}
}

export { factionSayings };
