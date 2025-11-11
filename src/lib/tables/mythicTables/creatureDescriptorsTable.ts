import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class CreatureDescriptorsTable extends Table {
	constructor() {
		const descriptors = ['Huge','Tiny','Winged','Scaled','Furred','Feathered','Armored','Horned','Clawed','Fanged','Tentacled','Multi-Headed','Multi-Eyed','Cyclopean','Blind','Glowing','Transparent','Invisible','Ethereal','Corporeal','Undead','Living','Constructed','Natural','Magical','Mundane','Intelligent','Bestial','Savage','Docile','Aggressive','Peaceful','Hostile','Friendly','Neutral','Venomous','Poisonous','Toxic','Harmless','Deadly','Dangerous','Safe','Rare','Common','Unique','Ancient','Young','Old','Newborn','Mature','Juvenile','Adult','Elder','Flying','Swimming','Burrowing','Climbing','Walking','Slithering','Crawling','Hopping','Leaping','Running','Slow','Fast','Agile','Clumsy','Graceful','Awkward','Beautiful','Hideous','Terrifying','Cute','Majestic','Pathetic','Powerful','Weak','Strong','Feeble','Hardy','Frail','Resilient','Vulnerable','Nocturnal','Diurnal','Crepuscular','Solitary','Pack','Herd','Swarm','Predator','Prey','Scavenger','Omnivore','Carnivore','Herbivore','Parasitic','Symbiotic','Territorial','Migratory'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicCreatureDescriptors, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
