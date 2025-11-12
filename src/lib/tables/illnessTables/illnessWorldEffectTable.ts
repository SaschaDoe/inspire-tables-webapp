import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class IllnessWorldEffectTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Mundane effects
		entries.push(new TableEntry('economic downturn'));
		entries.push(new TableEntry('social unrest'));
		entries.push(new TableEntry('quarantine measures'));
		entries.push(new TableEntry('healthcare system overload'));
		entries.push(new TableEntry('travel restrictions'));
		entries.push(new TableEntry('population decline'));
		entries.push(new TableEntry('increased mortality rate'));
		entries.push(new TableEntry('disruption of supply chains'));
		entries.push(new TableEntry('changes in public policies'));
		entries.push(new TableEntry('stigmatization of affected groups'));
		entries.push(new TableEntry('advancements in medical research'));
		entries.push(new TableEntry('rise in mental health issues'));
		entries.push(new TableEntry('shift in population demographics'));
		entries.push(new TableEntry('increased public health awareness'));
		entries.push(new TableEntry('cultural changes'));
		entries.push(new TableEntry('political tensions'));
		entries.push(new TableEntry('religious interpretations and movements'));
		entries.push(new TableEntry('ecological changes'));
		entries.push(new TableEntry('changes in work habits and environments'));
		entries.push(new TableEntry('educational system disruptions'));
		entries.push(new TableEntry('technological advancements for healthcare'));
		entries.push(new TableEntry('strengthening of community bonds'));
		entries.push(new TableEntry('emergence of new political powers'));
		entries.push(new TableEntry('changes in artistic and literary expression'));
		entries.push(new TableEntry('modification of social norms and behaviors'));
		// Magical/fantasy effects
		entries.push(new TableEntry('awakening of ancient beings'));
		entries.push(new TableEntry('emergence of new magical abilities in the population'));
		entries.push(new TableEntry('creation of forbidden zones tainted by magic'));
		entries.push(new TableEntry('collapse of magical barriers or protections'));
		entries.push(new TableEntry('altered behavior of magical creatures'));
		entries.push(new TableEntry('enchantment of natural landscapes'));
		entries.push(new TableEntry('distortion of time and space in affected areas'));
		entries.push(new TableEntry('rise of cults worshiping the illness as a deity'));
		entries.push(new TableEntry('emergence of a new class of magic users'));
		entries.push(new TableEntry('transformation or mutation of flora and fauna'));
		entries.push(new TableEntry('prophecies being fulfilled or altered'));
		entries.push(new TableEntry('opening of portals to other realms'));
		entries.push(new TableEntry('shifts in the balance of elemental forces'));
		entries.push(new TableEntry('revival of long-forgotten rituals and spells'));
		entries.push(new TableEntry('corruption or purification of sacred sites'));
		entries.push(new TableEntry('creation of new mythologies and legends'));
		entries.push(new TableEntry('changes in the alignment of stars and celestial bodies'));
		entries.push(new TableEntry('alteration of the physical laws of the universe'));
		entries.push(new TableEntry('rise or fall of powerful sorcerers or witches'));
		entries.push(new TableEntry('emergence of new sentient races or species'));
		entries.push(new TableEntry('discovery of previously unknown magical resources'));
		entries.push(new TableEntry('enhancement or suppression of magical powers'));
		entries.push(new TableEntry('creation of magical artifacts related to the illness'));
		entries.push(new TableEntry('initiation of quests to cure or exploit the illness'));
		entries.push(new TableEntry('triggering of apocalyptic or world-changing events'));
		super(entries, TableTitles.IllnessWorldEffect);
		this.tableType = TableType.Other;
	}
}
