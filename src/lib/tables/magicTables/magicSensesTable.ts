import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const magicSenses = [
	'hear magic as music',
	'hear magic as whispers',
	'hear magic as screams',
	'smell magic',
	'taste magic',
	'feel magic as temperature change',
	'feel magic as pressure change',
	'feel magic as tingling',
	'feel magic as pain',
	'hear magic as a sound',
	'feel magic as a touch'
];

export class MagicSensesTable extends Table {
	constructor() {
		const entries = magicSenses.map((sense) => new TableEntry(sense));
		super(entries, TableTitles.Senses, TableType.Other);
	}
}
