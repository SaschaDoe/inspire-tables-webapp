import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class GodBynameTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('Stormbringer'));
		entries.push(new TableEntry('Keeper of Secrets'));
		entries.push(new TableEntry('Eternal Flame'));
		entries.push(new TableEntry('Earth Shaper'));
		entries.push(new TableEntry('Night Sovereign'));
		entries.push(new TableEntry('Life Weaver'));
		entries.push(new TableEntry('Shadow Walker'));
		entries.push(new TableEntry('Final Judge'));
		entries.push(new TableEntry('Star Guide'));
		entries.push(new TableEntry('Boundless Sky'));
		entries.push(new TableEntry('Unseen Guardian'));
		entries.push(new TableEntry('Harvest Warden'));
		entries.push(new TableEntry('Silent Hunter'));
		entries.push(new TableEntry("Sun's Herald"));
		entries.push(new TableEntry('Plague Bringer'));
		entries.push(new TableEntry('Iron Heart'));
		entries.push(new TableEntry('Frost Monarch'));
		entries.push(new TableEntry("Ocean's Voice"));
		entries.push(new TableEntry('Tranquil Sage'));
		entries.push(new TableEntry('Whispering One'));
		entries.push(new TableEntry('Flame Dancer'));
		entries.push(new TableEntry('Warden of the Lost'));
		entries.push(new TableEntry('Light in Darkness'));
		entries.push(new TableEntry('Master of Wilds'));
		entries.push(new TableEntry('Bearer of Fortunes'));
		entries.push(new TableEntry('Ceaseless Watcher'));
		entries.push(new TableEntry('Sovereign of Depths'));
		entries.push(new TableEntry('Ever-Changing'));
		entries.push(new TableEntry('Veiled Prophet'));
		entries.push(new TableEntry('Cosmic Serpent'));
		entries.push(new TableEntry('Inferno Sovereign'));
		entries.push(new TableEntry('Guardian of Gates'));
		entries.push(new TableEntry('Timeless One'));
		entries.push(new TableEntry('Prime Architect'));
		entries.push(new TableEntry('Soul Forger'));
		entries.push(new TableEntry('Dream Weaver'));
		entries.push(new TableEntry('Crimson Warrior'));
		entries.push(new TableEntry('Phantom'));
		entries.push(new TableEntry('Gilded Sovereign'));
		entries.push(new TableEntry('Stone Protector'));
		super(entries, TableTitles.GodByname);
		this.tableType = TableType.Name;
	}
}
