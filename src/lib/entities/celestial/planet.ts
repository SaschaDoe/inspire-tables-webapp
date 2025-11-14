import { Entity } from '../base/entity';
import type { Continent } from '../location/continent';
import type { Ring, Color } from './ring';
import type { WorldMap } from '../location/worldMap';

export class Planet extends Entity {
	name = '';
	nameTranslation = ''; // Translation/pronunciation guide
	nameMeaning = ''; // Meaning/etymology of the name
	isLivable = false;
	continents: Continent[] = [];
	type = 'earth-like';
	parentId = ''; // Reference to parent SolarSystem
	worldMap: WorldMap | null = null; // Hex map for planet surface

	// Visual rendering properties
	color: Color = { r: 100, g: 100, b: 150 }; // Base surface color (0-255 RGB)
	atmosphereColor: [Color, number] = [{ r: 135, g: 206, b: 235 }, 0.3]; // [Color, transparency 0-1]
	seed = 0; // Seed for procedural texture generation
	size: 'tiny' | 'small' | 'medium' | 'large' | 'gigantic' = 'medium';
	resolution = 64; // Texture resolution for rendering
	noiseScale = 2; // Scale factor for noise generation
	brightness = 0.5; // Brightness multiplier (0-1)

	// Physical properties
	distanceFromStar = 1.0; // Distance in AU (Astronomical Units)
	obliquity = 23.5; // Axial tilt in degrees (0-360)
	atmosphere: 'none' | 'nitrogen-oxygen' | 'toxic' | 'methane' | 'carbon-dioxide' = 'nitrogen-oxygen';
	weather: 'clear' | 'moderate' | 'foggy' | 'stormy' = 'moderate';
	orbitPeriod = 365; // Days to orbit star
	rotationPeriod = 24; // Hours per day

	// Additional features
	rings: Ring[] = [];
	ringColorName = '';
	moons: string[] = []; // Array of moon names (simplified for now)
	hasMagneticField = false;
	surfaceGravity = 1.0; // Relative to Earth (1.0 = Earth gravity)
}
