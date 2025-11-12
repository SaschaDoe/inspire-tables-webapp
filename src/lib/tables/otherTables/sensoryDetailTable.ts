import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class SensoryDetailTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		// Visual
		entries.push(new TableEntry('flickering candlelight'));
		entries.push(new TableEntry('dancing shadows'));
		entries.push(new TableEntry('thick fog'));
		entries.push(new TableEntry('bright sunlight'));
		entries.push(new TableEntry('glowing embers'));
		// Sound
		entries.push(new TableEntry('distant thunder'));
		entries.push(new TableEntry('dripping water'));
		entries.push(new TableEntry('whispering voices'));
		entries.push(new TableEntry('creaking floorboards'));
		entries.push(new TableEntry('howling wind'));
		entries.push(new TableEntry('chirping birds'));
		// Smell
		entries.push(new TableEntry('musty odor'));
		entries.push(new TableEntry('fresh pine scent'));
		entries.push(new TableEntry('burning incense'));
		entries.push(new TableEntry('salty sea air'));
		entries.push(new TableEntry('rotting vegetation'));
		entries.push(new TableEntry('metallic tang'));
		// Touch/Feel
		entries.push(new TableEntry('oppressive heat'));
		entries.push(new TableEntry('biting cold'));
		entries.push(new TableEntry('humid air'));
		entries.push(new TableEntry('rough stone walls'));
		entries.push(new TableEntry('silky fabric'));
		// Taste
		entries.push(new TableEntry('dust in the air'));
		entries.push(new TableEntry('sweet fragrance'));
		entries.push(new TableEntry('bitter smoke'));
		super(entries, TableTitles.SensoryDetail);
		this.tableType = TableType.Other;
	}
}
