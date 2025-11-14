import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const connectionNames: string[] = [
	// Rifts & Tears
	'The Void Rift',
	'The Eternal Tear',
	'The Cosmic Fissure',
	'The Shattered Veil',
	'The Reality Breach',
	'The Dimensional Crack',

	// Bridges & Paths
	'The Starlight Bridge',
	'The Eternal Path',
	'The Dream Corridor',
	'The Soul Highway',
	'The Astral Crossing',
	'The Forgotten Way',
	'The Silver Thread',
	'The Golden Strand',
	'The Midnight Road',
	'The Twilight Passage',

	// Gates & Portals
	'The Celestial Gateway',
	'The Soul Gate',
	'The Liminal Portal',
	'The Threshold of Echoes',
	'The Mirror Door',
	'The Abyss Gate',
	'The Heavenly Door',

	// Weaves & Threads
	'The Cosmic Weave',
	'The Fate Thread',
	'The Reality Tapestry',
	'The Wyrd Strand',
	'The Destiny Line',

	// Nexuses & Junctions
	'The Starlight Nexus',
	'The Convergence Point',
	'The Axis Mundi',
	'The World Tree Root',
	'The Cosmic Junction',
	'The Sphere Confluence',

	// Mysterious & Unusual
	'The Whisper Between',
	'The Silence That Connects',
	'The Echo Chamber',
	'The Memory Passage',
	'The Dream Conduit',
	'The Nightmare Tunnel',
	'The Forgotten Link',
	'The Lost Pathway',
	'The Hidden Nexus',
	'The Secret Crossing',

	// Elemental
	'The Flame Bridge',
	'The Ice Path',
	'The Storm Corridor',
	'The Lightning Arc',
	'The Thunder Road',
	'The Ocean Current',
	'The Wind Tunnel',

	// Death & Afterlife
	'The Styx Crossing',
	'The River of Souls',
	'The Final Journey',
	'The Death March',
	'The Soul Stream',
	'The Afterlife Passage',
	'The Reaper Road',

	// Light & Dark
	'The Shadow Veil',
	'The Light Beam',
	'The Penumbra Path',
	'The Umbral Gate',
	'The Radiant Way',
	'The Eclipse Corridor',

	// Time & Space
	'The Temporal Rift',
	'The Timeless Void',
	'The Eternal Moment',
	'The Infinity Loop',
	'The Paradox Point',
	'The Spacetime Fold',

	// Divine & Sacred
	'The Divine Stairway',
	'The Sacred Spiral',
	'The Holy Ascent',
	'The Blessed Pathway',
	'The Celestial Ladder',
	'The Divine Bridge',

	// Nature & Cosmic
	'The Comet Trail',
	'The Nebula Drift',
	'The Gravity Well',
	'The Black Hole Passage',
	'The Wormhole Express',
	'The Stellar Wind',
	'The Galactic Stream',

	// Abstract & Philosophical
	'The Liminal Space',
	'The Between Place',
	'The Neither Here Nor There',
	'The Boundary Dissolution',
	'The Unity Point',
	'The Separation Line',
	'The Convergence',

	// Mythological
	'The Bifrost Fragment',
	'The Rainbow Bridge',
	'The World Serpent Coil',
	'The Phoenix Path',
	'The Dragon Breath',
	'The Titan Step',

	// Mysterious German/Foreign flavor
	'The Weltenschleier',
	'The Zwischenraum',
	'The Anderswelt-Tor',
	'The Seelenbrücke',
	'The Traumweg',
	'The Schicksalsfaden',

	// Poetic & Beautiful
	'The Whispered Promise',
	'The Silent Symphony',
	'The Eternal Embrace',
	'The Cosmic Heartbeat',
	'The Soul Longing',
	'The Memory of Stars',
	'The Dream of Unity',

	// Dark & Ominous
	'The Abyss Stare',
	'The Void Hunger',
	'The Devouring Path',
	'The Madness Gate',
	'The Screaming Silence',
	'The Endless Fall',
	'The Oblivion Door',

	// Weird & Unusual
	'The Sideways Moment',
	'The Inside-Out Place',
	'The Backwards Step',
	'The Upside-Down Path',
	'The Wrong-Way Current',
	'The Impossible Angle',
	'The Non-Euclidean Passage'
];

export class SphereConnectionNameTable extends Table {
	constructor() {
		const entries = connectionNames.map((name) => new TableEntry(name));
		super(entries, TableTitles.SphereConnectionName);
		this.tableType = TableType.Name;
	}
}
