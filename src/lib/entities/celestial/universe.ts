import { Entity } from '../base/entity';
import type { Sphere } from './sphere';

export class Universe extends Entity {
	name = '';
	spheres: Sphere[] = [];
	dimensionalStructure = '';
	fundamentalLaws = '';
	age = '';
}
