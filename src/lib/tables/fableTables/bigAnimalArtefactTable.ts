import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

/**
 * Artefacts for big fable animals like bears, wolves, lions, elephants, deer.
 * These are grand items appropriate for large noble creatures in fables.
 */
export class BigAnimalArtefactTable extends Table {
	constructor() {
		const entries: TableEntry[] = [];

		// Weapons & Tools
		entries.push(new TableEntry('great oak war club'));
		entries.push(new TableEntry('iron-banded ram horn'));
		entries.push(new TableEntry('boulder-headed mace'));
		entries.push(new TableEntry('ancient tree trunk battering ram'));
		entries.push(new TableEntry('carved antler battle axe'));
		entries.push(new TableEntry('mountain stone hammer'));
		entries.push(new TableEntry('tusk ivory lance'));
		entries.push(new TableEntry('reinforced claw gauntlets'));
		entries.push(new TableEntry('thundering hoof stamps'));
		entries.push(new TableEntry('mighty jaw trap'));

		// Armor & Protection
		entries.push(new TableEntry('chainmail barding'));
		entries.push(new TableEntry('river stone scale armor'));
		entries.push(new TableEntry('hardened bark plate mail'));
		entries.push(new TableEntry('iron crown of the forest king'));
		entries.push(new TableEntry('thick hide war cloak'));
		entries.push(new TableEntry('mammoth bone shoulder guards'));
		entries.push(new TableEntry('great tortoise shell shield'));
		entries.push(new TableEntry('reinforced horn helm'));
		entries.push(new TableEntry('winter fur mantle'));
		entries.push(new TableEntry('dragonscale chest plate'));

		// Jewelry & Accessories
		entries.push(new TableEntry('golden claw ring'));
		entries.push(new TableEntry('chieftain tooth necklace'));
		entries.push(new TableEntry('ancestral clan medallion'));
		entries.push(new TableEntry('jeweled collar of authority'));
		entries.push(new TableEntry('crown of twisted branches'));
		entries.push(new TableEntry('warrior\'s ear cuff'));
		entries.push(new TableEntry('silver fang pendant'));
		entries.push(new TableEntry('royal mane braids with bells'));
		entries.push(new TableEntry('ceremonial nose ring'));
		entries.push(new TableEntry('elder\'s wisdom beads'));

		// Magical Items
		entries.push(new TableEntry('staff of the forest guardian'));
		entries.push(new TableEntry('orb of animal speech'));
		entries.push(new TableEntry('horn that summons the herd'));
		entries.push(new TableEntry('cloak of the great winter'));
		entries.push(new TableEntry('boots of mountain climbing'));
		entries.push(new TableEntry('belt of tremendous strength'));
		entries.push(new TableEntry('crown that commands respect'));
		entries.push(new TableEntry('chalice of healing waters'));
		entries.push(new TableEntry('drum of the thundering stampede'));
		entries.push(new TableEntry('ancient map carved in bone'));

		// Everyday Items (sized for large creatures)
		entries.push(new TableEntry('great cauldron cooking pot'));
		entries.push(new TableEntry('hollow log storage barrel'));
		entries.push(new TableEntry('woven giant basket'));
		entries.push(new TableEntry('stone grinding wheel'));
		entries.push(new TableEntry('fur-lined sleeping den'));
		entries.push(new TableEntry('carved throne of roots'));
		entries.push(new TableEntry('great hall tapestry'));
		entries.push(new TableEntry('feast table carved from a single tree'));
		entries.push(new TableEntry('massive honey pot'));
		entries.push(new TableEntry('salmon smoking rack'));

		// Items of Leadership
		entries.push(new TableEntry('scepter of the clan chief'));
		entries.push(new TableEntry('banner of the pack'));
		entries.push(new TableEntry('tribal war drum'));
		entries.push(new TableEntry('council speaking stone'));
		entries.push(new TableEntry('peace pipe of the elders'));
		entries.push(new TableEntry('judgment gavel'));

		super(entries, TableTitles.BigAnimalArtefact);
		this.tableType = TableType.Artefact;
	}
}
