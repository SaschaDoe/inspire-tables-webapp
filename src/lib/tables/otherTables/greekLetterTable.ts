import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

export const greekLetters = [
	'alpha',
	'beta',
	'gamma',
	'delta',
	'epsilon',
	'zeta',
	'eta',
	'theta',
	'iota',
	'kappa',
	'lambda',
	'mu',
	'nu',
	'xi',
	'omicron',
	'pi',
	'rho',
	'sigma',
	'tau',
	'upsilon',
	'phi',
	'chi',
	'psi',
	'omega'
];

export class GreekLetterTable extends Table {
	constructor() {
		const entries = greekLetters.map((letter) => new TableEntry(letter));
		super(entries, TableTitles.GreekLetter);
		this.tableType = TableType.Other;
	}
}
