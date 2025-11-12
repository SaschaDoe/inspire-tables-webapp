import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

const worldCreationMethods: string[] = [
	'big bang',
	'emergence from cosmic egg',
	'creation by divine entities',
	'convergence of elemental forces',
	'fragmentation of an ancient, primordial world',
	'spontaneous manifestation from collective dreams',
	'unfolding from a cosmic lotus',
	'shaping by celestial architects',
	'sprouting from the World Tree',
	'coalescence of star dust and magic',
	'splitting from a parallel universe',
	'result of a cosmic wager or game',
	'weaving by the threads of fate',
	'crystallization from primordial chaos',
	'emergence from an interdimensional rift',
	'shattering of an ancient cosmic mirror',
	'assembly from cosmic puzzle pieces',
	'birth from the ashes of a dead world',
	'emergence from a divine symphony',
	'collapsing of a star into a new reality',
	'congealing from the cosmic soup',
	'creation as a dream of a sleeping god',
	'melding of multiple dimensions',
	'emanating from the heart of a black hole',
	'crafted from the remnants of forgotten realms'
];

export class WorldCreationMethodTable extends Table {
	constructor() {
		const entries = worldCreationMethods.map((method) => new TableEntry(method));
		super(entries, TableTitles.WorldCreationMethod);
		this.tableType = TableType.Other;
	}
}
