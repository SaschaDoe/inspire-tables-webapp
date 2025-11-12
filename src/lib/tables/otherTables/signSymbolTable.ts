import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class SignSymbolTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('fleur-de-lis'));
		entries.push(new TableEntry('cross'));
		entries.push(new TableEntry('rose'));
		entries.push(new TableEntry('thistle'));
		entries.push(new TableEntry('harp'));
		entries.push(new TableEntry('crown'));
		entries.push(new TableEntry('castle'));
		entries.push(new TableEntry('key'));
		entries.push(new TableEntry('anchor'));
		entries.push(new TableEntry('shell'));
		entries.push(new TableEntry('oak'));
		entries.push(new TableEntry('palm'));
		entries.push(new TableEntry('ivy'));
		entries.push(new TableEntry('wheat'));
		entries.push(new TableEntry('moon'));
		entries.push(new TableEntry('sun'));
		entries.push(new TableEntry('star'));
		entries.push(new TableEntry('comet'));
		entries.push(new TableEntry('tower'));
		entries.push(new TableEntry('sword'));
		entries.push(new TableEntry('spear'));
		entries.push(new TableEntry('arrow'));
		entries.push(new TableEntry('axe'));
		entries.push(new TableEntry('hammer'));
		entries.push(new TableEntry('torch'));
		entries.push(new TableEntry('book'));
		entries.push(new TableEntry('scroll'));
		entries.push(new TableEntry('chevron'));
		entries.push(new TableEntry('lion'));
		entries.push(new TableEntry('eagle'));
		entries.push(new TableEntry('dragon'));
		entries.push(new TableEntry('griffin'));
		entries.push(new TableEntry('phoenix'));
		entries.push(new TableEntry('unicorn'));
		entries.push(new TableEntry('serpent'));
		entries.push(new TableEntry('wolf'));
		entries.push(new TableEntry('bear'));
		entries.push(new TableEntry('stag'));
		entries.push(new TableEntry('raven'));
		entries.push(new TableEntry('ship'));
		entries.push(new TableEntry('mountain'));
		entries.push(new TableEntry('tree'));
		entries.push(new TableEntry('flame'));
		entries.push(new TableEntry('lightning bolt'));
		entries.push(new TableEntry('scales of justice'));
		entries.push(new TableEntry('hourglass'));
		entries.push(new TableEntry('skull'));
		entries.push(new TableEntry('wings'));
		entries.push(new TableEntry('chalice'));

		super(entries, TableTitles.SignSymbol);
	}
}
