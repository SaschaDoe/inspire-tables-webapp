import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

const magicSystemChangingEvents: string[] = [
	'magic entered the world - when the great rift occurred',
	'all summonings became evil - when the archmage entered into a pact with the devil',
	'magic became tied to emotions - after the celestial alignment',
	'elemental magic weakened - following the great storm',
	'magic users lost the ability to control fire - when the eternal flame was extinguished',
	'spells involving time manipulation ceased to exist - after the clock tower\'s destruction',
	'magic became visible to non-users - during the eclipse of the twin moons',
	'teleportation spells started failing - when the ancient portals were sealed',
	'magic started affecting technology - after the cosmic event',
	'the power to resurrect vanished - following the passing of the high priestess',
	'nature-based magic intensified - with the blooming of the eternal forest',
	'summoned creatures gained free will - after the breaking of the grand seal',
	'shadow magic was born - when the sun was eclipsed for seven days',
	'magical healing abilities weakened - as the sacred river dried up',
	"mage's lifespan increased - when the ageless crystal was found",
	'necromancy became impossible - after the day of the wandering souls',
	'mind control spells became erratic - with the awakening of the mind beasts',
	'magic began to corrupt the land - when the dark comet passed',
	'magical bonds and oaths became unbreakable - upon the signing of the eternal treaty',
	'the power to create illusions vanished - after the mirror of truth was shattered'
];

export class MagicEventTable extends Table {
	constructor() {
		const entries = magicSystemChangingEvents.map((event) => new TableEntry(event));
		super(entries, TableTitles.MagicEvent);
	}
}
