import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const magicModifier = [
	'change duration',
	'change range',
	'change area',
	'change damage',
	'change path of flight',
	'change speed',
	'change accuracy',
	'change duration of casting',
	'change material',
	'change rules',
	'change limitations',
	'change side effect',
	'change preparation',
	'change source',
	'change weakness'
];

export class MagicSpellModifierTable extends Table {
	constructor() {
		const entries = magicModifier.map((mod) => new TableEntry(mod));
		super(entries, TableTitles.MagicSpellModifier, TableType.Other);
	}
}
