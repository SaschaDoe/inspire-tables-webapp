import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class QuoteDiscipleTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Quotes from various disciples
		entries.push(new TableEntry('In the light of the sun, we find strength and guidance'));
		entries.push(new TableEntry("The moon's embrace brings us wisdom in our dreams"));
		entries.push(new TableEntry('We trust in the earth to stand firm and provide for us'));
		entries.push(new TableEntry('Beneath the mountains, we find solace and protection'));
		entries.push(new TableEntry('In the heart of the forge, our spirits and wills are shaped'));
		entries.push(new TableEntry('Through the secrets of the stones, we uncover ancient wisdom'));
		entries.push(new TableEntry('With the whisper of the wind, our souls are uplifted'));
		entries.push(new TableEntry('In the depths of the forest, we find harmony and peace'));
		entries.push(new TableEntry('Under the stars, our magic is nurtured and grows strong'));
		entries.push(new TableEntry('In the fury of the storm, we find our bravery and strength'));
		entries.push(new TableEntry('Through the hunt, we honor the cycle of life and death'));
		entries.push(new TableEntry("In the clan's unity, we see the power of bonds and loyalty"));
		entries.push(new TableEntry('With the tides, we learn the lessons of change and adaptability'));
		entries.push(new TableEntry('In the depths of the ocean, we seek mysteries and ancient truths'));
		entries.push(new TableEntry('Under the moonlit sea, our paths are illuminated with clarity'));
		entries.push(new TableEntry('Across the sands, we follow the stars for guidance and hope'));
		entries.push(new TableEntry('In the vast sky, we see endless possibilities and freedom'));
		entries.push(new TableEntry('With the rhythm of the earth, our spirits dance and thrive'));
		super(entries, TableTitles.QuoteDisciple);
		this.tableType = TableType.Other;
	}
}
