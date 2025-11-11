import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class AlienSpeciesDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Humanoid','Reptilian','Insectoid','Avian','Aquatic','Crystalline','Gaseous','Energy-Based','Silicon-Based','Carbon-Based','Mechanical','Organic','Hybrid','Shapeshifting','Telepathic','Psychic','Hive-Mind','Individual','Collective','Solitary','Advanced','Primitive','Ancient','Young','Peaceful','Warlike','Curious','Xenophobic','Friendly','Hostile','Neutral','Diplomatic','Aggressive','Defensive','Expansionist','Isolationist','Trading','Raiding','Exploring','Colonizing','Migrating','Stationary','Nomadic','Settled','Small','Large','Tiny','Gigantic','Microscopic','Macroscopic','Multi-Dimensional','Extra-Dimensional','Time-Sensitive','Timeless','Immortal','Short-Lived','Long-Lived','Reproducing','Cloning','Budding','Spawning','Egg-Laying','Live-Birth','Asexual','Sexual','Hermaphroditic','Multi-Gendered','Genderless','Carnivorous','Herbivorous','Omnivorous','Photosynthetic','Energy-Consuming','Parasitic','Symbiotic','Independent','Technological','Magical','Psionic','Physical','Ethereal','Corporeal','Winged','Tentacled','Many-Limbed','Limbless','Bipedal','Quadrupedal','Multi-Pedal','Floating','Swimming','Flying','Burrowing','Climbing'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicAlienSpeciesDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
