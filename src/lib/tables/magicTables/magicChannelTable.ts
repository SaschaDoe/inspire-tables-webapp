import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class MagicChannelTable extends Table {
	constructor() {
		const entries = [
			new TableEntry('own body'),
			new TableEntry('body part'),
			new TableEntry('weapon'),
			new TableEntry('armor'),
			new TableEntry('artwork'),
			new TableEntry('clothing'),
			new TableEntry('furnishing'),
			new TableEntry('gemstone'),
			new TableEntry('jewelery'),
			new TableEntry('material'),
			new TableEntry('animal'),
			new TableEntry('other artefact'),
			new TableEntry('specific body part'),
			new TableEntry('specific weapon'),
			new TableEntry('specific armor'),
			new TableEntry('specific artwork'),
			new TableEntry('specific clothing'),
			new TableEntry('specific furnishing'),
			new TableEntry('specific gemstone'),
			new TableEntry('specific jewelery'),
			new TableEntry('specific material'),
			new TableEntry('specific animal'),
			new TableEntry('element'),
			new TableEntry('potions'),
			new TableEntry('blood'),
			new TableEntry('tattoo'),
			new TableEntry('crystal'),
			new TableEntry('wand'),
			new TableEntry('staff'),
			new TableEntry('runes'),
			new TableEntry('voice'),
			new TableEntry('mind')
		];
		super(entries, TableTitles.MagicChannel, TableType.Other);
	}
}
