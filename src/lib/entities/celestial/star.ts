import { Entity } from '../base/entity';
import { Size } from '../size';
import { Temperature } from '../temperature';
import type { Color } from './ring';

export class Star extends Entity {
	name = '';
	parentId = ''; // Reference to parent SolarSystem

	// Visual rendering properties
	color: Color = { r: 255, g: 200, b: 100 }; // RGB color (0-255)
	size: 'tiny' | 'small' | 'medium' | 'large' | 'gigantic' = 'medium';

	// Physical properties (numerical values for calculations)
	luminosity = 1.0; // Relative to Sun (1.0 = Sun's luminosity)
	mass = 1.0; // Relative to Sun (1.0 = Sun's mass)
	surfaceTemperature = 5778; // Temperature in Kelvin

	// Stellar evolution
	stage = 'main sequence'; // 'main sequence', 'red giant', 'white dwarf', etc.

	// Legacy enum properties (kept for compatibility)
	temperature = Temperature.cold;
	sizeEnum = Size.tiny;
	massEnum = Size.tiny;
}
