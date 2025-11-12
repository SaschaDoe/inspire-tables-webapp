import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const spellSideEffects: string[] = [
	'uncontrollable laughter',
	'temporary colorblindness',
	'reversed speech',
	'reversed spell effect',
	'elemental summoning',
	'involuntary teleportation to a random nearby location',
	'spontaneous weather changes',
	'transformation into a small animal',
	'sudden growth of plant life around the caster',
	'attraction of magical creatures',
	'amnesia about recent events',
	'invisibility of random objects',
	'unintended time jumps, skipping a few moments into the future',
	'switching voices with someone nearby',
	'creation of a doppelganger',
	'inability to lie for a certain period',
	'bursts of intense cold or heat',
	'temporary loss of gravity',
	'random object duplication',
	'echoing sounds in the surrounding area',
	'temporary musical outbursts - everything said is sung',
	'auras that reveal emotions',
	'random age fluctuation by a few years',
	'telepathic connection to animals',
	'involuntary dimension shifting',
	'switching handedness (left-hand becomes right, and vice versa)',
	'changing hair color',
	'emitting light from fingertips',
	'partial transformation into elemental forms (fire, water, etc.)',
	'merging shadows with others',
	'hearing whispers of spirits',
	'enhanced taste sensation',
	'permanent loss of a sense (sight, hearing, etc.)',
	'transformation into inanimate objects',
	'erasure of personal memories',
	'being hunted by a spectral entity',
	'body part petrification',
	'spontaneous combustion',
	'binding to an ancient curse',
	'splitting into multiple personalities',
	'becoming a beacon for dark magic',
	'attracting hostile interdimensional beings',
	'uncontrollable teleportation to hazardous places',
	'summoning a malevolent spirit',
	'loss of control over magical abilities',
	'becoming invisible to others permanently',
	'opening rifts in reality',
	'inducing cataclysmic natural disasters',
	'triggering an aura of fear in others',
	'becoming ethereal and intangible at random',
	'time looping in short bursts',
	'trapped in an alternate reality',
	'absorbing the emotions of others uncontrollably',
	'draining life force from surrounding living things'
];

export class SideEffectTable extends Table {
	constructor() {
		const entries = spellSideEffects.map((effect) => new TableEntry(effect));
		super(entries, TableTitles.Default);
	}
}
