import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export class NationNameTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('Aetheria'));
		entries.push(new TableEntry('Valoria'));
		entries.push(new TableEntry('Drakonia'));
		entries.push(new TableEntry('Sylvaria'));
		entries.push(new TableEntry('Norvalis'));
		entries.push(new TableEntry('Arcanum'));
		entries.push(new TableEntry('Eldoria'));
		entries.push(new TableEntry('Thundar'));
		entries.push(new TableEntry('Mystara'));
		entries.push(new TableEntry('Zephyria'));
		entries.push(new TableEntry('Nocturn'));
		entries.push(new TableEntry('Luminos'));
		entries.push(new TableEntry('Terranova'));
		entries.push(new TableEntry('Astoria'));
		entries.push(new TableEntry('Meridian'));
		entries.push(new TableEntry('Avalon'));
		entries.push(new TableEntry('Caelum'));
		entries.push(new TableEntry('Umbria'));
		entries.push(new TableEntry('Solaris'));
		entries.push(new TableEntry('Glacius'));
		entries.push(new TableEntry('Verdantia'));
		entries.push(new TableEntry('Pyrosia'));
		entries.push(new TableEntry('Aquaria'));
		entries.push(new TableEntry('Ventus'));
		entries.push(new TableEntry('Celestia'));
		entries.push(new TableEntry('Shadowmere'));
		entries.push(new TableEntry('Brighthollow'));
		entries.push(new TableEntry('Ironpeak'));
		entries.push(new TableEntry('Stormhaven'));
		entries.push(new TableEntry('Goldenvale'));
		entries.push(new TableEntry('Silverwood'));
		entries.push(new TableEntry('Crystalia'));
		entries.push(new TableEntry('Ebonmoor'));
		entries.push(new TableEntry('Ivoryspire'));
		entries.push(new TableEntry('Sapphire Shores'));
		entries.push(new TableEntry('Crimson Empire'));
		entries.push(new TableEntry('Emerald Kingdom'));
		entries.push(new TableEntry('Azure Realm'));
		entries.push(new TableEntry('Obsidian Dominion'));
		entries.push(new TableEntry('Pearl Coast'));

		super(entries, TableTitles.NationName, TableType.Location);
	}
}
