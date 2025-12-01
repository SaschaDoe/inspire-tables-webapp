import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

/**
 * Artefacts for small fable animals like rabbits, cats, foxes, squirrels, hedgehogs.
 * These are charming items appropriate for small woodland creatures in fables.
 */
export class SmallAnimalArtefactTable extends Table {
	constructor() {
		const entries: TableEntry[] = [];

		// Weapons & Tools
		entries.push(new TableEntry('maple leaf shield'));
		entries.push(new TableEntry('acorn mace'));
		entries.push(new TableEntry('hazelnut flail'));
		entries.push(new TableEntry('birch bark bow'));
		entries.push(new TableEntry('sharpened carrot sword'));
		entries.push(new TableEntry('pinecone morning star'));
		entries.push(new TableEntry('chestnut catapult'));
		entries.push(new TableEntry('oak branch staff'));
		entries.push(new TableEntry('bramble whip'));
		entries.push(new TableEntry('river stone sling'));

		// Armor & Protection
		entries.push(new TableEntry('nutshell helmet'));
		entries.push(new TableEntry('hedgehog quill armor'));
		entries.push(new TableEntry('woven grass mail'));
		entries.push(new TableEntry('turtle shell buckler'));
		entries.push(new TableEntry('dried mushroom cap helm'));
		entries.push(new TableEntry('bark plate armor'));
		entries.push(new TableEntry('feathered cloak of hiding'));
		entries.push(new TableEntry('moss-covered woodland vest'));

		// Jewelry & Accessories
		entries.push(new TableEntry('amber pendant'));
		entries.push(new TableEntry('berry bead necklace'));
		entries.push(new TableEntry('silver whisker ring'));
		entries.push(new TableEntry('woven flower crown'));
		entries.push(new TableEntry('copper bell collar'));
		entries.push(new TableEntry('lucky rabbit foot charm'));
		entries.push(new TableEntry('polished river stone amulet'));
		entries.push(new TableEntry('braided tail ribbon'));

		// Magical Items
		entries.push(new TableEntry('acorn of endless nuts'));
		entries.push(new TableEntry('enchanted burrow key'));
		entries.push(new TableEntry('moonstone that shows safe paths'));
		entries.push(new TableEntry('speaking mushroom'));
		entries.push(new TableEntry('bag of sleep dust'));
		entries.push(new TableEntry('ever-warm hearthstone'));
		entries.push(new TableEntry('mirror that shows true hearts'));
		entries.push(new TableEntry('compass pointing to home'));
		entries.push(new TableEntry('jar of bottled sunshine'));
		entries.push(new TableEntry('cloak of forest shadows'));

		// Everyday Items
		entries.push(new TableEntry('woven basket backpack'));
		entries.push(new TableEntry('carved wooden spoon'));
		entries.push(new TableEntry('clay cooking pot'));
		entries.push(new TableEntry('gourd water flask'));
		entries.push(new TableEntry('needle and thread kit'));
		entries.push(new TableEntry('twig broom'));
		entries.push(new TableEntry('dried herb medicine pouch'));
		entries.push(new TableEntry('hollow log treasure chest'));
		entries.push(new TableEntry('hand-drawn map on birch bark'));
		entries.push(new TableEntry('tiny wooden pipe'));

		// Books & Knowledge
		entries.push(new TableEntry('book of forest recipes'));
		entries.push(new TableEntry('weather prediction almanac'));
		entries.push(new TableEntry('family recipe scroll'));
		entries.push(new TableEntry('diary bound in oak leaves'));

		super(entries, TableTitles.SmallAnimalArtefact);
		this.tableType = TableType.Artefact;
	}
}
