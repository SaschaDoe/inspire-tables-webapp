import { Entity } from '../base/entity';
import type { Planet } from './planet';
import type { Star } from './star';

export class SolarSystem extends Entity {
	name = '';
	planets: Planet[] = [];
	stars: Star[] = [];
}
