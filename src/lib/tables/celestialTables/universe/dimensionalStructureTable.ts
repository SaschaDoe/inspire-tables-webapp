import { Table } from '../../table';
import { TableEntry } from '../../tableEntry';
import { TableTitles } from '../../tableTitles';
import { TableType } from '../../tableType';

const dimensionalStructures: string[] = [
	'a three-dimensional space with linear time',
	'a four-dimensional space with branching timelines',
	'a five-dimensional space with multiple temporal layers',
	'an eleven-dimensional space with hidden compact dimensions',
	'a fractal structure with infinite self-similar scales',
	'a membrane floating in a higher-dimensional bulk',
	'a closed loop where beginning meets end',
	'a möbius topology with one-sided reality',
	'a nested hierarchy of pocket dimensions',
	'a bubble universe among infinite others',
	'a holographic projection from a lower dimension',
	'a quantum superposition of all possible states',
	'a crystalline lattice of interconnected realities',
	'a fluid medium where dimensions merge and split',
	'a toroidal structure with cyclic time',
	'a hyperbolic space with exponentially expanding regions',
	'a discrete network of quantum nodes',
	'a continuous manifold with smooth geometry',
	'a patchwork of different dimensional regions',
	'a Klein bottle with no inside or outside'
];

export class DimensionalStructureTable extends Table {
	constructor() {
		const entries = dimensionalStructures.map((structure) => new TableEntry(structure));
		super(entries, TableTitles.DimensionalStructure);
		this.tableType = TableType.Other;
	}
}
