import { Table } from '../table'
import { TableType } from '../tableType';;
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';

export const magicVisuals = [
	'invisible',
	'light',
	'colors',
	'shapes',
	'symbols',
	'aura',
	'avatar of caster',
	'soul animal of caster'
];

export class MagicVisualTable extends Table {
	constructor() {
		const entries = magicVisuals.map((visual) => new TableEntry(visual));
		super(entries, TableTitles.MagicVisual, TableType.Other);
	}
}
