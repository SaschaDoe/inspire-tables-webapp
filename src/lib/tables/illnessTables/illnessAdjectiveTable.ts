import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class IllnessAdjectiveTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('contagious'));
		entries.push(new TableEntry('infectious'));
		entries.push(new TableEntry('virulent'));
		entries.push(new TableEntry('debilitating'));
		entries.push(new TableEntry('chronic'));
		entries.push(new TableEntry('acute'));
		entries.push(new TableEntry('mysterious'));
		entries.push(new TableEntry('lethal'));
		entries.push(new TableEntry('benign'));
		entries.push(new TableEntry('endemic'));
		entries.push(new TableEntry('epidemic'));
		entries.push(new TableEntry('rare'));
		entries.push(new TableEntry('genetic'));
		entries.push(new TableEntry('mutative'));
		entries.push(new TableEntry('psychosomatic'));
		entries.push(new TableEntry('alien'));
		entries.push(new TableEntry('magical'));
		entries.push(new TableEntry('cursed'));
		entries.push(new TableEntry('nano-engineered'));
		entries.push(new TableEntry('cybernetic'));
		entries.push(new TableEntry('parasitic'));
		entries.push(new TableEntry('psychic'));
		entries.push(new TableEntry('interdimensional'));
		entries.push(new TableEntry('bioengineered'));
		entries.push(new TableEntry('antibiotic-resistant'));
		entries.push(new TableEntry('supernatural'));
		entries.push(new TableEntry('ancient'));
		entries.push(new TableEntry('mythical'));
		entries.push(new TableEntry('cosmic'));
		entries.push(new TableEntry('elemental'));
		entries.push(new TableEntry('arcane'));
		entries.push(new TableEntry('toxic'));
		entries.push(new TableEntry('radioactive'));
		entries.push(new TableEntry('neurodegenerative'));
		entries.push(new TableEntry('psychotropic'));
		entries.push(new TableEntry('hallucinogenic'));
		entries.push(new TableEntry('transmutable'));
		entries.push(new TableEntry('pandemic'));
		entries.push(new TableEntry('zombifying'));
		entries.push(new TableEntry('necrotic'));
		entries.push(new TableEntry('phantasmal'));
		entries.push(new TableEntry('chronal'));
		entries.push(new TableEntry('hyperspatial'));
		super(entries, TableTitles.IllnessAdjective);
		this.tableType = TableType.Other;
	}
}
