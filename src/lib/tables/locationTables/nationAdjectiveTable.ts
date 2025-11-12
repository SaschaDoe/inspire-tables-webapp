import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class NationAdjectiveTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('eldritch'));
		entries.push(new TableEntry('enigmatic'));
		entries.push(new TableEntry('arcane'));
		entries.push(new TableEntry('celestial'));
		entries.push(new TableEntry('primordial'));
		entries.push(new TableEntry('ethereal'));
		entries.push(new TableEntry('elysian'));
		entries.push(new TableEntry('mythic'));
		entries.push(new TableEntry('shadowy'));
		entries.push(new TableEntry('abyssal'));
		entries.push(new TableEntry('mystical'));
		entries.push(new TableEntry('otherworldly'));
		entries.push(new TableEntry('timeless'));
		entries.push(new TableEntry('cryptic'));
		entries.push(new TableEntry('enchanted'));
		entries.push(new TableEntry('obsidian'));
		entries.push(new TableEntry('umbral'));
		entries.push(new TableEntry('esoteric'));
		entries.push(new TableEntry('immortal'));
		entries.push(new TableEntry('eternal'));
		entries.push(new TableEntry('forbidden'));
		entries.push(new TableEntry('hallowed'));
		entries.push(new TableEntry('phantasmal'));
		entries.push(new TableEntry('celestine'));
		entries.push(new TableEntry('twilight'));
		entries.push(new TableEntry('illustrious'));
		entries.push(new TableEntry('oracular'));
		entries.push(new TableEntry('shrouded'));
		entries.push(new TableEntry('veiled'));
		entries.push(new TableEntry('sacred'));
		entries.push(new TableEntry('lost'));
		entries.push(new TableEntry('whispering'));
		entries.push(new TableEntry('luminous'));
		entries.push(new TableEntry('occult'));
		entries.push(new TableEntry('fabled'));
		entries.push(new TableEntry('ominous'));
		entries.push(new TableEntry('majestic'));
		entries.push(new TableEntry('tempestuous'));
		entries.push(new TableEntry('divine'));
		entries.push(new TableEntry('revered'));
		entries.push(new TableEntry('eclipsed'));
		entries.push(new TableEntry('mysterious'));
		entries.push(new TableEntry('sun-kissed'));
		entries.push(new TableEntry('overgrown'));
		entries.push(new TableEntry('deserted'));
		entries.push(new TableEntry('bountiful'));

		super(entries, TableTitles.NationAdjective);
	}
}
