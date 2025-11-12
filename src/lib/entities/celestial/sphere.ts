import { Entity } from '../base/entity';
import type { Galaxy } from './galaxy';

export class Sphere extends Entity {
	name = '';
	galaxies: Galaxy[] = [];
	rule = '';
	birth = '';
}
