import { Entity } from '../base/entity';
import type { Planet } from './planet';
import type { Star } from './star';

export class SolarSystem extends Entity {
	name = '';
	planets: Planet[] = [];
	stars: Star[] = [];
	positionX = 0;
	positionY = 0;
	parentId = ''; // Reference to parent Galaxy

	// Habitable zone (calculated from star properties)
	habitableZoneStart = 0.9; // Inner edge in AU
	habitableZoneEnd = 1.5; // Outer edge in AU

	// System properties
	stage = 'mature'; // 'protoplanetary disk', 'young system', 'mature system', 'aging system'
	stageDescription = ''; // Detailed description of stage
	age = 4.6; // Age in billions of years
	lastDistanceFromStar = 0.2; // Track last assigned orbital distance for new planets (in AU)
}
