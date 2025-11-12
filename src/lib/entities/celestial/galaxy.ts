import { Entity } from '../base/entity';
import type { SolarSystem } from './solarSystem';

export class Galaxy extends Entity {
	name = '';
	size = '';
	solarSystems: SolarSystem[] = [];
}
