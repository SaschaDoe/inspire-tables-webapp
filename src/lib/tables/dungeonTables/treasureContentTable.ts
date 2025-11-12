import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class TreasureContentTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('gold coins'));
		entries.push(new TableEntry('silver coins'));
		entries.push(new TableEntry('platinum coins'));
		entries.push(new TableEntry('precious gems'));
		entries.push(new TableEntry('jewelry'));
		entries.push(new TableEntry('ancient scrolls'));
		entries.push(new TableEntry('magical potions'));
		entries.push(new TableEntry('enchanted weapons'));
		entries.push(new TableEntry('magical armor'));
		entries.push(new TableEntry('rare artifacts'));
		entries.push(new TableEntry('ancient tomes'));
		entries.push(new TableEntry('ornate chalices'));
		entries.push(new TableEntry('gilded crowns'));
		entries.push(new TableEntry('precious metals'));
		entries.push(new TableEntry('exotic spices'));
		entries.push(new TableEntry('fine silks'));
		entries.push(new TableEntry('religious relics'));
		entries.push(new TableEntry('dragon scales'));
		entries.push(new TableEntry('enchanted rings'));
		entries.push(new TableEntry('mystical amulets'));
		entries.push(new TableEntry('rare minerals'));
		entries.push(new TableEntry('ancient coins'));
		entries.push(new TableEntry('jeweled daggers'));
		entries.push(new TableEntry('ornamental shields'));
		entries.push(new TableEntry('ivory figurines'));
		entries.push(new TableEntry('crystal orbs'));
		entries.push(new TableEntry('enchanted staves'));
		entries.push(new TableEntry('magical wands'));
		entries.push(new TableEntry('arcane components'));
		entries.push(new TableEntry('alchemical reagents'));

		super(entries, TableTitles.TreasureContent);
	}
}
