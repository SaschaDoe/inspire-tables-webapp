import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class DomicileDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Abandoned','Occupied','Small','Large','Modest','Grand','Old','New','Dilapidated','Well-Maintained','Wooden','Stone','Brick','Metal','Thatched','Tiled','Single-Story','Multi-Story','Basement','Attic','Cozy','Spacious','Cramped','Airy','Dark','Bright','Clean','Dirty','Furnished','Empty','Luxurious','Spartan','Warm','Cold','Quiet','Noisy','Isolated','Neighboring','Rural','Urban','Suburban','Remote','Fortified','Undefended','Welcoming','Unwelcoming','Comfortable','Uncomfortable','Elegant','Plain','Decorated','Bare','Painted','Unpainted','Maintained','Neglected','Secure','Vulnerable','Private','Public','Hidden','Obvious','Secretive','Open','Mysterious','Ordinary','Magical','Mundane','Ancient','Modern','Traditional','Contemporary','Functional','Impractical','Efficient','Wasteful','Organized','Cluttered','Tidy','Messy','Homey','Sterile','Lived-In','Pristine','Damaged','Intact','Renovated','Original','Extended','Compact','Complex','Simple','Multi-Family','Single-Family','Shared','Private','Owner-Occupied','Rented','Permanent','Temporary','Seasonal','Year-Round','Residential','Mixed-Use','Converted','Purpose-Built','Accessible','Remote'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicDomicileDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
