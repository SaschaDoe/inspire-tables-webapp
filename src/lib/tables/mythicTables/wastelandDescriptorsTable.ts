import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class WastelandDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Barren','Desolate','Empty','Lifeless','Dead','Dying','Ruined','Devastated','Scorched','Frozen','Toxic','Radioactive','Cursed','Blighted','Polluted','Contaminated','Ashen','Dusty','Sandy','Rocky','Cracked','Parched','Arid','Dry','Windswept','Storm-Wracked','Volcanic','Burned','Charred','Blasted','Shattered','Broken','Destroyed','Annihilated','Post-Apocalyptic','Pre-Apocalyptic','Recovering','Worsening','Stabilized','Deteriorating','Mutated','Corrupted','Twisted','Warped','Changed','Transformed','Alien','Hostile','Dangerous','Deadly','Inhospitable','Uninhabitable','Abandoned','Forgotten','Lost','Hidden','Exposed','Open','Flat','Irregular','Cratered','Scarred','Marked','Tainted','Poisoned','Infected','Diseased','Healthy','Struggling','Surviving','Adapting','Evolving','Devolving','Regressing','Advancing','Reclaiming','Fading','Persistent','Resilient','Fragile','Harsh','Extreme','Moderate','Severe','Intense','Mild','Brutal','Unforgiving','Merciless','Relentless','Constant','Variable','Changing','Static','Shifting','Fixed','Permanent','Temporary','Eternal','Fleeting'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicWastelandDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
