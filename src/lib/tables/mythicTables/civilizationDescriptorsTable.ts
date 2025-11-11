import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class CivilizationDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Advanced','Primitive','Peaceful','Warlike','Democratic','Authoritarian','Religious','Secular','Agrarian','Industrial','Nomadic','Settled','Tribal','Imperial','Federal','Unitary','Diverse','Homogeneous','Isolated','Connected','Prosperous','Poor','Expanding','Declining','Young','Ancient','Innovative','Traditional','Magical','Technological','Artistic','Utilitarian','Hierarchical','Egalitarian','Merit-Based','Hereditary','Militaristic','Pacifist','Mercantile','Subsistence','Urban','Rural','Coastal','Inland','Mountain','Plains','Forest','Desert','Arctic','Tropical','Literate','Oral','Scientific','Superstitious','Tolerant','Intolerant','Open','Closed','Progressive','Conservative','Centralized','Decentralized','Bureaucratic','Informal','Lawful','Chaotic','Honorable','Corrupt','Unified','Fragmented','Strong','Weak','Independent','Subjugated','Sovereign','Vassal','Isolationist','Expansionist','Defensive','Aggressive','Allied','Neutral','Hostile','Friendly','Xenophobic','Cosmopolitan','Mystical','Mundane','Enlightened','Ignorant','Free','Enslaved','Just','Oppressive','Stable','Unstable','Harmonious','Conflicted','Wealthy','Impoverished','Educated','Uneducated','Sophisticated','Simple'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicCivilizationDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
