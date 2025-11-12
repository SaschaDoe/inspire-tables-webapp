import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export class RitualPreparationTable extends Table {
	constructor() {
		let entries = [] as TableEntry[];
		entries.push(new TableEntry('cleansing rites'));
		entries.push(new TableEntry('fasting'));
		entries.push(new TableEntry('gathering sacred herbs'));
		entries.push(new TableEntry('collecting magical components'));
		entries.push(new TableEntry('preparing ritual attire'));
		entries.push(new TableEntry('making ceremonial masks'));
		entries.push(new TableEntry('forging ritual tools'));
		entries.push(new TableEntry('drawing sacred symbols'));
		entries.push(new TableEntry('mixing anointing oils'));
		entries.push(new TableEntry('brewing ceremonial potions'));
		entries.push(new TableEntry('building the altar'));
		entries.push(new TableEntry('decorating the sacred space'));
		entries.push(new TableEntry('practicing ritual chants'));
		entries.push(new TableEntry('fastening ritual jewelry'));
		entries.push(new TableEntry('inscribing protective wards'));
		entries.push(new TableEntry('carving totems'));
		entries.push(new TableEntry('assembling musical instruments'));
		entries.push(new TableEntry('purifying the area with smoke'));
		entries.push(new TableEntry('laying out offering items'));
		entries.push(new TableEntry('consecrating the ground'));
		super(entries, TableTitles.RitualPreparation);
		this.tableType = TableType.Other;
	}
}
