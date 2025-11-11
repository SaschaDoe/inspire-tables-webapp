import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

export class AnimalActionsTable extends Table {
	constructor() {
		const descriptors = ['Attacks','Flees','Watches','Stalks','Hunts','Feeds','Drinks','Sleeps','Rests','Grooms','Plays','Fights','Mates','Nests','Migrates','Hides','Climbs','Swims','Flies','Runs','Walks','Prowls','Pounces','Charges','Circles','Waits','Ambushes','Tracks','Scents','Listens','Observes','Communicates','Calls','Roars','Howls','Growls','Hisses','Chirps','Sings','Marks-Territory','Defends','Protects','Gathers','Hoards','Burrows','Digs','Scratches','Bites','Claws','Kicks','Tramples','Gore','Stings','Spits','Constricts','Crushes','Shakes','Tosses','Drags','Carries','Drops','Follows','Leads','Herds','Scatters','Groups','Isolates','Dominates','Submits','Challenges','Postures','Displays','Intimidates','Flees','Freezes','Bluffs','Feigns-Death','Camouflages','Changes-Color','Burrows','Retreats','Advances','Investigates','Ignores','Startles','Panics','Calms','Relaxes','Tenses','Prepares','Readies','Strikes','Lunges','Leaps','Dodges','Evades','Blocks'];
		const entries = descriptors.map((desc, i) => new TableEntry(desc).withRoleInterval(i + 1, i + 1));
		super(entries, TableTitles.MythicAnimalActions, TableType.SoloRPG, new DiceRole(1, 100));
	}
}
