import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const magicAbilitySourcesFromEntity = [
	'force',
	'divine entity',
	'ancient artifacts',
	'cursed objects',
	'cosmic events that give a source of magic',
	'eldritch beings',
	'planetary alignment',
	'celestial event',
	'dimensional rifts',
	'mystic tattoos',
	'sacred texts',
	'magical entity',
	'elemental forces',
	'otherworldly patron',
	'enchanted springs',
	'vortex of power',
	'spirit animal bond',
	'ley line convergence',
	'spiritual enlightenment',
	'pact with a powerful being',
	'rituals that connect to powerful being',
	'bet with a powerful being',
	'gift from a powerful being'
];

const magicAbilitySources: string[] = [
	'none: could be rule or cost itself like make sacrifice or material into magic',
	'everywhere',

	// one source external
	'force',
	'divine entity',
	'ancient artifacts',
	'cursed objects',
	'cosmic events that give a source of magic',
	'eldritch beings',
	'planetary alignment',
	'celestial event',
	'dimensional rifts',
	'mystic tattoos',
	'sacred texts',
	'magical entity',
	'elemental forces',
	'otherworldly patron',
	'enchanted springs',
	'vortex of power',
	'spirit animal bond',
	'ley line convergence',
	'spiritual enlightenment',
	'pact with a powerful being',
	'rituals that connect to powerful being',
	'bet with a powerful being',
	'gift from a powerful being',

	// one source self
	'genetics',
	'bloodline curse',
	'shamanic heritage',
	'magic force contact now you are changed',
	'cosmic events that changed you',
	'natural affinity',
	'alchemical experimentation that changed you',
	'arcane studies that changed you'

	// pact -> is ruling make sacrifice or external being that gives power
	// ritual -> itself is not the source but a channel
];

export class MagicSourceTable extends Table {
	constructor() {
		const entries = magicAbilitySources.map((source) => new TableEntry(source));
		super(entries, TableTitles.MagicSource);
	}
}
