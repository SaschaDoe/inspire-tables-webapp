import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class MutationDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Extra-Limb','Missing-Limb','Enlarged','Shrunken','Scaled','Furred','Feathered','Spiked','Horned','Tailed','Clawed','Fanged','Tentacled','Webbed','Winged','Gilled','Multi-Eyed','No-Eyes','Glowing','Translucent','Armored','Soft-Skinned','Thick-Skinned','Hardened','Flexible','Rigid','Twisted','Straight','Bent','Elongated','Compressed','Expanded','Contracted','Swollen','Atrophied','Hypertrophied','Deformed','Enhanced','Weakened','Strengthened','Accelerated','Slowed','Adapted','Maladapted','Specialized','Generalized','Evolved','Devolved','Advanced','Primitive','Complex','Simple','Beneficial','Detrimental','Neutral','Dominant','Recessive','Stable','Unstable','Spreading','Contained','Active','Dormant','Growing','Shrinking','Painful','Painless','Visible','Hidden','External','Internal','Skeletal','Muscular','Nervous','Sensory','Digestive','Respiratory','Circulatory','Integumentary','Mental','Physical','Psychological','Biological','Chemical','Radiation-Induced','Magical','Natural','Artificial','Genetic','Environmental','Toxic','Benign','Malignant','Cancerous','Healthy','Diseased','Infected','Clean','Contagious','Non-Contagious','Hereditary','Spontaneous'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicMutationDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
