import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const divineSpellFailureOutcomes: string[] = [
	'backfires and harms the caster',
	'produces unintended results',
	'consumes extra divine energy',
	'draws the attention of malevolent divine entities',
	'causes a divine intervention against the caster',
	'inflicts a divine curse or divine retribution',
	'summons vengeful divine beings',
	"erases a part of the caster's divine knowledge",
	'triggers divine wrath',
	'leaves a divine mark on the caster',
	'twists the divine energy, corrupting it',
	"shatters the caster's connection to the divine",
	'distorts the fabric of divine reality',
	"silences the caster's divine voice",
	'fails with a haunting echo of divine disappointment',
	'engulfs the area in a suffocating divine miasma, harming all within',
	'renders the caster blind to divine visions',
	"causes the caster's prayers to become unintelligible babble",
	"transforms the caster's sacred symbols into heretical icons",
	'inverts the intended divine blessing into a curse',
	'locks the caster out from accessing divine realms in meditation',
	'forces the caster to relive their worst sins in vivid detail',
	"draws forth a shadow of a deity's anger upon the land",
	'traps the caster in a limbo between the mortal and divine planes',
	'unleashes a plague of divine origin, marking the caster as its herald',
	'strips the caster of their divine favor, rendering them a pariah',
	'incites a frenzy in nearby divine creatures, turning them hostile',
	'collapses a local shrine or sacred site, attributing the blasphemy to the caster',
	"induces a permanent, eerie silence in the caster's presence, a sign of divine shunning",
	'conjures a storm of divine energy that cannot be controlled or dispelled'
];

// TODO: add to spells not magic systems
export class MagicFailConsequenceTable extends Table {
	constructor() {
		const entries = divineSpellFailureOutcomes.map((outcome) => new TableEntry(outcome));
		super(entries, TableTitles.MagicFailConsequence, TableType.Other);
	}
}
