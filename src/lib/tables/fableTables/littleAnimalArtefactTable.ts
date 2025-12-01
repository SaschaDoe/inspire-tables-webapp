import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

/**
 * Artefacts for little/tiny fable animals like insects, worms, snails, small frogs.
 * These are whimsical items appropriate for very small creatures in fables.
 */
export class LittleAnimalArtefactTable extends Table {
	constructor() {
		const entries: TableEntry[] = [];

		// Weapons & Tools
		entries.push(new TableEntry('dewdrop sword'));
		entries.push(new TableEntry('thorn dagger'));
		entries.push(new TableEntry('pine needle lance'));
		entries.push(new TableEntry('rose thorn spear'));
		entries.push(new TableEntry('splinter bow with dandelion seed arrows'));
		entries.push(new TableEntry('grass blade saber'));
		entries.push(new TableEntry('ant mandible pincers'));
		entries.push(new TableEntry('bee stinger rapier'));

		// Armor & Protection
		entries.push(new TableEntry('acorn cap helmet'));
		entries.push(new TableEntry('beetle shell shield'));
		entries.push(new TableEntry('seed husk armor'));
		entries.push(new TableEntry('flower petal cloak'));
		entries.push(new TableEntry('snail shell fortress'));
		entries.push(new TableEntry('walnut shell breastplate'));
		entries.push(new TableEntry('dragonfly wing cape'));
		entries.push(new TableEntry('ladybug spot shield'));

		// Jewelry & Accessories
		entries.push(new TableEntry('morning dew necklace'));
		entries.push(new TableEntry('spider silk scarf'));
		entries.push(new TableEntry('pollen dust pouch'));
		entries.push(new TableEntry('firefly lantern'));
		entries.push(new TableEntry('raindrop crystal pendant'));
		entries.push(new TableEntry('mushroom cap hat'));
		entries.push(new TableEntry('clover crown'));
		entries.push(new TableEntry('butterfly scale bracelet'));

		// Magical Items
		entries.push(new TableEntry('enchanted honeycomb'));
		entries.push(new TableEntry('glowing moss wand'));
		entries.push(new TableEntry('moonbeam in a dewdrop'));
		entries.push(new TableEntry('singing cricket leg fiddle'));
		entries.push(new TableEntry('echo shell that whispers secrets'));
		entries.push(new TableEntry('compass made from a dandelion seed'));
		entries.push(new TableEntry('bottle of captured starlight'));
		entries.push(new TableEntry('feather quill from a hummingbird'));

		// Everyday Items
		entries.push(new TableEntry('leaf umbrella'));
		entries.push(new TableEntry('cobweb hammock'));
		entries.push(new TableEntry('acorn cup drinking vessel'));
		entries.push(new TableEntry('pebble grinding stone'));
		entries.push(new TableEntry('moss pillow bed'));
		entries.push(new TableEntry('bark canoe'));
		entries.push(new TableEntry('thistle comb'));
		entries.push(new TableEntry('hollow reed flute'));

		super(entries, TableTitles.LittleAnimalArtefact);
		this.tableType = TableType.Artefact;
	}
}
