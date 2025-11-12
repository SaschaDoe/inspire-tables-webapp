import { Entity } from '../base/entity';
import type { Continent } from '../location/continent';

export class Planet extends Entity {
	name = '';
	isLivable = false;
	continents: Continent[] = [];
	type = 'earth-like';
}
