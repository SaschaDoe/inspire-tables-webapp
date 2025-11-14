import { Entity } from '../base/entity';
import type { Galaxy } from './galaxy';

export class Sphere extends Entity {
	name = '';
	galaxies: Galaxy[] = [];
	rule = '';
	birth = '';
	/** IDs of sphere connections from this sphere */
	outgoingConnectionIds: string[] = [];
	/** IDs of sphere connections to this sphere */
	incomingConnectionIds: string[] = [];
	/** Optional layer number for "schalen" (layered) universe structure */
	layer?: number;
}
