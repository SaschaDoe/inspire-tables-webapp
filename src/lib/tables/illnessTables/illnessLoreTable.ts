import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class IllnessLoreTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Fantasy/mythological lore
		entries.push(new TableEntry("originated from a fallen god's tears"));
		entries.push(new TableEntry('a curse by ancient witches'));
		entries.push(new TableEntry('foretold by an old prophecy'));
		entries.push(new TableEntry('emerged from a forbidden ancient text'));
		entries.push(new TableEntry('a punishment from the sea deity'));
		entries.push(new TableEntry('created in a duel between mages'));
		entries.push(new TableEntry('a side effect of a powerful spell gone wrong'));
		entries.push(new TableEntry('born from the heart of a dying star'));
		entries.push(new TableEntry('a result of the wrath of the forest spirits'));
		entries.push(new TableEntry('linked to the phases of the moon'));
		entries.push(new TableEntry("believed to be the earth's way of seeking balance"));
		entries.push(new TableEntry('said to be a test by the gods for humanity'));
		entries.push(new TableEntry('emerged from the depths of an uncharted dungeon'));
		entries.push(new TableEntry("a manifestation of people's collective nightmares"));
		entries.push(new TableEntry('linked to the disappearance of an ancient civilization'));
		entries.push(new TableEntry('a byproduct of a cosmic event'));
		entries.push(new TableEntry('said to grant visions of other worlds to the afflicted'));
		entries.push(new TableEntry('believed to be a weapon created by a long-lost empire'));
		entries.push(new TableEntry('originates from the breath of a mythical beast'));
		entries.push(new TableEntry('tied to the alignment of mystical ley lines'));
		entries.push(new TableEntry("thought to be the earth's immune response against magic"));
		entries.push(new TableEntry('a consequence of tampering with forbidden alchemy'));
		entries.push(new TableEntry('emerged from the rifts between different realms'));
		entries.push(new TableEntry('seen as a passage to attain enlightenment'));
		entries.push(new TableEntry("associated with a legendary hero's fall"));
		// Sci-fi lore
		entries.push(new TableEntry('engineered as a bioweapon by an advanced alien civilization'));
		entries.push(new TableEntry('a mutation caused by exposure to cosmic radiation'));
		entries.push(new TableEntry('a side effect of experimental space travel technology'));
		entries.push(new TableEntry("originated from a terraformed planet's unique ecosystem"));
		entries.push(new TableEntry('developed in a lab accident during gene editing experiments'));
		entries.push(new TableEntry("a result of long-term exposure to an artificial intelligence's radiation"));
		entries.push(new TableEntry('spread through the galaxy by interstellar traders'));
		entries.push(new TableEntry('an ancient disease revived from cryogenically frozen samples'));
		entries.push(new TableEntry('created by nanobots malfunctioning in the human body'));
		entries.push(new TableEntry('a viral agent designed to sabotage rival colonies'));
		entries.push(new TableEntry("emerged from a black hole's quantum fluctuations"));
		entries.push(new TableEntry('accidentally brought back by explorers from a parallel universe'));
		entries.push(new TableEntry('a psychological condition induced by prolonged space isolation'));
		entries.push(new TableEntry('a genetic modification gone wrong in a utopian society'));
		entries.push(new TableEntry('an adaptive pathogen from a hostile extraterrestrial world'));
		entries.push(new TableEntry("linked to the consumption of an alien species' food source"));
		entries.push(new TableEntry('a digital virus capable of affecting cybernetic implants'));
		entries.push(new TableEntry('spread through a network of intergalactic wormholes'));
		entries.push(new TableEntry('a byproduct of a failed anti-aging experiment'));
		entries.push(new TableEntry("an evolutionary response to a planet's harsh environment"));
		entries.push(new TableEntry('triggered by exposure to a rare element found in asteroid mines'));
		entries.push(new TableEntry("a remnant of an ancient, advanced civilization's biological research"));
		entries.push(new TableEntry('caused by contamination from a synthetic atmosphere'));
		entries.push(new TableEntry('a syndrome affecting humans adapted to zero-gravity environments'));
		entries.push(new TableEntry('a relic of a bioengineered weapon from a forgotten interstellar war'));
		super(entries, TableTitles.IllnessLore);
		this.tableType = TableType.Other;
	}
}
