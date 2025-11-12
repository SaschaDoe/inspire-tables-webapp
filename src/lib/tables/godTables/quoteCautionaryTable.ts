import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class QuoteCautionaryTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Cautionary quotes from critics
		entries.push(
			new TableEntry("Blinded by the sun's radiance, they fail to see the shadows it casts")
		);
		entries.push(
			new TableEntry(
				"Those who listen too intently to the moon's whispers risk losing their own voice"
			)
		);
		entries.push(
			new TableEntry(
				'In their reverence for the earth, they forget that even solid ground can quake and swallow them whole'
			)
		);
		entries.push(
			new TableEntry('Obsession with mountain secrets often leads to burials beneath them')
		);
		entries.push(
			new TableEntry("The forge's flame that strengthens steel can also consume flesh and bone")
		);
		entries.push(
			new TableEntry("In their search for stone's wisdom, many lose sight of the world above")
		);
		entries.push(
			new TableEntry(
				'Those who commune too deeply with the wind may find themselves lost in its gusts'
			)
		);
		entries.push(
			new TableEntry('In seeking peace in the forest, some become prey to its lurking dangers')
		);
		entries.push(
			new TableEntry(
				'The enchantment of the stars can lead to a life spent gazing upwards, blind to the perils at their feet'
			)
		);
		entries.push(
			new TableEntry(
				'The strength gained from storm worship can swiftly turn to reckless destruction'
			)
		);
		entries.push(
			new TableEntry('In glorifying the hunt, some lose their humanity, becoming beasts themselves')
		);
		entries.push(
			new TableEntry(
				"The clan's unity, when twisted, can become a shackle that binds and stifles"
			)
		);
		entries.push(
			new TableEntry('Adhering too closely to the tides can leave one stranded in unfamiliar waters')
		);
		entries.push(
			new TableEntry("Those who dive too greedily into ocean's mysteries often drown in their depths")
		);
		entries.push(
			new TableEntry('Following the moonlit sea can lead to treacherous currents and hidden reefs')
		);
		entries.push(
			new TableEntry("Fixating on the stars can lead one into the desert's merciless embrace")
		);
		entries.push(
			new TableEntry('Worshipping the vast sky can instill a restlessness that never finds solace')
		);
		entries.push(
			new TableEntry(
				"Dancing to the earth's rhythm can become a frenzied escape from facing life's harsh realities"
			)
		);
		super(entries, TableTitles.QuoteCautionary);
		this.tableType = TableType.Other;
	}
}
