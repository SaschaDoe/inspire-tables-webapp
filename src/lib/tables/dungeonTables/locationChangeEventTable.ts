import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const locationChangeEvents: string[] = [
	'conquered',
	'abandoned due to a curse',
	'expanded for more protection',
	'overrun by enemies',
	'cursed',
	'infiltrated',
	'abandoned',
	'seized by enemies',
	'sold',
	'destroyed in war',
	'reclaimed by nature',
	'converted into a sanctuary',
	'occupied by refugees',
	'claimed by a cult',
	'flooded and abandoned',
	'eroded into ruins',
	'enchanted and transformed',
	'quarantined due to disease',
	'collapsing from neglect',
	'revitalized as a community hub',
	'infested with monsters',
	'blessed by a deity',
	'struck by a natural disaster',
	'turned into a battleground',
	'made a royal residence',
	'used as a secret hideout',
	'established as a trade center',
	'haunted by spirits',
	'overthrown in a revolution',
	'transformed by a technological advancement'
];

export class LocationChangeEventTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		for (let event of locationChangeEvents) {
			entries.push(new TableEntry(event));
		}
		super(entries, TableTitles.LocationChangeEvent);
	}
}
