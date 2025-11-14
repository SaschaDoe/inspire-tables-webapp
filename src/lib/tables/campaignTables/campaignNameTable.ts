import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const campaignNames: string[] = [
	// Epic fantasy names
	'The Chronicles of the Fallen Star',
	'Shadows of the Forgotten Realm',
	'Rise of the Ancient Order',
	'The Shattered Crown',
	'Legends of the Void',
	'The Last Prophecy',
	'Echoes of Eternity',
	'The Darkening Sky',
	'Tales of the Crimson Dawn',
	'The Eternal Conflict',

	// Sci-fi names
	'Beyond the Edge of Space',
	'The Quantum Paradox',
	'Starfall Protocol',
	'The Void Between Stars',
	'Chronicles of the Nexus',
	'The Singularity War',
	'Echoes Across the Galaxy',
	'The Lost Colony',
	'Fractured Dimensions',
	'The Infinite Horizon',

	// Mystery/Thriller
	'The Veiled Conspiracy',
	'Whispers in the Dark',
	'The Midnight Protocol',
	'Shadows of Doubt',
	'The Hidden Truth',
	'Secrets of the Abyss',
	'The Silent Witness',
	'Echoes of the Past',
	'The Forgotten Case',
	'The Last Testament',

	// Adventure
	'The Quest for the Lost Artifact',
	'Journey to the Unknown',
	'The Treasure of the Seven Seas',
	'Beyond the Horizon',
	'The Great Expedition',
	'Tales of the Wanderer',
	'The Path of Heroes',
	'The Legendary Adventure',
	'The Grand Odyssey',
	'The Epic Journey',

	// Horror
	'The Nightmare Chronicles',
	'Whispers from Beyond',
	'The Haunting',
	'Shadows of Madness',
	'The Dark Descent',
	'Terror in the Night',
	'The Cursed Legacy',
	'Echoes of Horror',
	'The Unspeakable Evil',
	'The Dread Awakening',

	// War/Military
	'The Final Stand',
	'Blood and Glory',
	'The War for Tomorrow',
	'Battle for Supremacy',
	'The Last Battalion',
	'Chronicles of Warfare',
	'The Siege of Eternity',
	'The Crimson Campaign',
	'The War of the Worlds',
	'The Endless Conflict',

	// Mixed genre
	'The Broken Alliance',
	'Legacy of the Ancients',
	'The Rising Storm',
	'Chronicles of Destiny',
	'The Fallen Empire',
	'Twilight of the Gods',
	'The Age of Chaos',
	'The Burning World',
	'The Sacred Quest',
	'The Forbidden Path'
];

export class CampaignNameTable extends Table {
	constructor() {
		const entries = campaignNames.map((name) => new TableEntry(name));
		super(entries, TableTitles.CampaignName);
		this.tableType = TableType.Campaign;
	}
}
