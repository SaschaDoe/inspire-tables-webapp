import { Entity } from '../base/entity';
import type { Sphere } from './sphere';

export type UniverseStructureType =
	| 'schalen' // Concentric shells/layers (like Dante's spheres)
	| 'tree' // Norse Yggdrasil-like branches
	| 'web' // Interconnected web
	| 'cluster' // Grouped spheres
	| 'linear' // Linear chain
	| 'custom'; // User-defined

export class Universe extends Entity {
	name = '';
	spheres: Sphere[] = [];
	dimensionalStructure = '';
	age = '';
	/** How the spheres are structured/connected */
	structureType: UniverseStructureType = 'custom';
	/** IDs of sphere connection entities */
	sphereConnectionIds: string[] = [];
}
