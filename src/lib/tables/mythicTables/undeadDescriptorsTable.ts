import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class UndeadDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Skeletal','Zombified','Ghostly','Vampiric','Spectral','Wraith-Like','Mummified','Decayed','Rotting','Decomposed','Fresh','Ancient','Recent','Mindless','Intelligent','Feral','Controlled','Free-Willed','Cursed','Blessed','Unholy','Consecrated','Tainted','Pure','Corrupted','Cleansed','Powerful','Weak','Strong','Feeble','Fast','Slow','Agile','Clumsy','Silent','Noisy','Stealthy','Obvious','Hidden','Revealed','Ethereal','Corporeal','Solid','Insubstantial','Tangible','Intangible','Visible','Invisible','Glowing','Dark','Cold','Hot','Freezing','Burning','Draining','Energizing','Life-Draining','Soul-Stealing','Possessing','Haunting','Wandering','Bound','Trapped','Free','Vengeful','Peaceful','Hostile','Friendly','Malevolent','Benevolent','Evil','Good','Neutral','Chaotic','Lawful','Shambling','Striding','Floating','Flying','Crawling','Rising','Falling','Emerging','Vanishing','Manifesting','Dissipating','Strengthening','Weakening','Growing','Shrinking','Multiplying','Diminishing','Ancient-Warrior','Fallen-Hero','Murder-Victim','Plague-Victim','Wizard','Priest','Noble','Commoner'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicUndeadDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
