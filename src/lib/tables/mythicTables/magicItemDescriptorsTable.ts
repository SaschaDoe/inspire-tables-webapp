import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class MagicItemDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Ancient','Powerful','Weak','Cursed','Blessed','Legendary','Common','Rare','Unique','Sentient','Dormant','Active','Growing','Fading','Glowing','Dark','Light','Heavy','Weightless','Fragile','Indestructible','Beautiful','Ugly','Elegant','Crude','Ornate','Plain','Jeweled','Simple','Complex','Mysterious','Obvious','Hidden','Revealed','Bound','Free','Sealed','Unsealed','Locked','Unlocked','Protected','Vulnerable','Warded','Unprotected','Attuned','Unattuned','Bonded','Unbonded','Personal','Transferable','Hereditary','Stolen','Found','Gifted','Earned','Bought','Made','Discovered','Lost','Recovered','Damaged','Intact','Restored','Broken','Repaired','Enhanced','Diminished','Charged','Depleted','Rechargeable','Single-Use','Limited-Use','Unlimited','Weapon','Armor','Tool','Accessory','Clothing','Jewelry','Container','Book','Scroll','Potion','Wand','Staff','Ring','Amulet','Cloak','Crown','Helm','Shield','Sword','Artifact','Relic','Heirloom','Trophy','Treasure','Bane','Boon','Key','Focus'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicMagicItemDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
