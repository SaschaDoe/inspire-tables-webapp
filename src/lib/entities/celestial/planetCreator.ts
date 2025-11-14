import { Creator } from '../base/creator';
import { Planet } from './planet';
import { PlanetNameTable } from '$lib/tables/celestialTables/planet/planetNameTable';
import { LivablePlanetTypeTable, AllPlanetTypeTable } from '$lib/tables/celestialTables/planet/planetTypeTable';
import { ContinentCreator } from '../location/continentCreator';
import { Ring, type Color } from './ring';
import { getResolution } from '$lib/utils/three/celestialRendering';

export class PlanetCreator extends Creator<Planet> {
	// Nested entity requirements
	static readonly NESTED_ENTITY_RULES = {
		continents: {
			min: 0,
			max: undefined, // No maximum
			entityType: 'continent' as const,
			displayName: 'Continent'
		}
	};

	// Planet color palettes based on type
	private static readonly PLANET_COLORS: Record<string, Color[]> = {
		'earth-like': [
			{ r: 50, g: 100, b: 200 }, // Ocean blue (dominant)
			{ r: 60, g: 140, b: 70 }, // Land green
			{ r: 40, g: 90, b: 180 } // Deep ocean blue
		],
		jungle: [
			{ r: 20, g: 120, b: 40 }, // Vibrant jungle green
			{ r: 40, g: 140, b: 50 }, // Bright forest green
			{ r: 30, g: 100, b: 35 } // Deep jungle green
		],
		water: [
			{ r: 10, g: 60, b: 180 }, // Deep ocean blue
			{ r: 20, g: 80, b: 200 }, // Ocean blue
			{ r: 30, g: 100, b: 220 } // Light ocean blue
		],
		desert: [
			{ r: 193, g: 68, b: 14 }, // Mars red-orange
			{ r: 220, g: 130, b: 60 }, // Sandy orange
			{ r: 180, g: 90, b: 50 } // Reddish brown
		],
		ice: [
			{ r: 240, g: 248, b: 255 }, // Snow white
			{ r: 230, g: 240, b: 250 }, // Ice white
			{ r: 220, g: 235, b: 255 } // Glacier white
		],
		volcanic: [
			{ r: 140, g: 40, b: 20 }, // Dark volcanic rock
			{ r: 200, g: 60, b: 30 }, // Glowing lava
			{ r: 100, g: 30, b: 15 } // Cooled lava
		],
		'gas giant': [
			{ r: 200, g: 150, b: 100 }, // Jupiter-like
			{ r: 220, g: 200, b: 160 }, // Saturn-like (pale yellow)
			{ r: 140, g: 180, b: 200 } // Uranus/Neptune-like (ice blue)
		],
		barren: [
			{ r: 130, g: 120, b: 110 }, // Grey rock
			{ r: 100, g: 90, b: 80 }, // Dark grey
			{ r: 150, g: 140, b: 130 } // Light grey
		]
	};

	// Atmosphere colors based on type
	private static readonly ATMOSPHERE_COLORS: Record<string, [Color, number]> = {
		'nitrogen-oxygen': [{ r: 135, g: 206, b: 235 }, 0.3], // Sky blue
		toxic: [{ r: 150, g: 200, b: 50 }, 0.4], // Greenish
		methane: [{ r: 200, g: 140, b: 100 }, 0.35], // Orange
		'carbon-dioxide': [{ r: 255, g: 180, b: 120 }, 0.3], // Reddish
		none: [{ r: 0, g: 0, b: 0 }, 0] // No atmosphere
	};

	// Ring colors
	private static readonly RING_COLORS: Color[] = [
		{ r: 200, g: 180, b: 150, a: 0.7 },
		{ r: 180, g: 160, b: 140, a: 0.6 },
		{ r: 220, g: 200, b: 180, a: 0.8 },
		{ r: 160, g: 140, b: 120, a: 0.5 }
	];

	private isLivable = false;
	private distanceFromStar = 1.0; // Will be set by SolarSystemCreator

	create(): Planet {
		const planet = new Planet();
		this.setParentReference(planet); // Automatically sets parentId

		// Use overrides if provided
		planet.name = this.overrides['name'] || new PlanetNameTable().roleWithCascade(this.dice).text;

		// Use different table based on livable flag
		// If isLivable is explicitly set, use LivablePlanetTypeTable, otherwise use AllPlanetTypeTable
		planet.type = this.overrides['type'] || (this.isLivable
			? new LivablePlanetTypeTable().roleWithCascade(this.dice).text
			: new AllPlanetTypeTable().roleWithCascade(this.dice).text as any);

		// Set isLivable based on planet type
		planet.isLivable = ['earth-like', 'desert', 'ice', 'water', 'jungle'].includes(planet.type);

		// Generate visualization properties
		this.generateVisualizationProperties(planet);

		// If livable, add a continent
		if (this.isLivable && this.dice.rollInterval(1, 2) === 2) {
			const continentCreator = new ContinentCreator();
			continentCreator.dice = this.dice;
			planet.continents.push(continentCreator.withParent(planet.id).create());
		}

		this.generateDescription(planet);
		return planet;
	}

	/**
	 * Generate all visualization properties for the planet
	 */
	private generateVisualizationProperties(planet: Planet): void {
		// Generate size
		const sizes: Array<'tiny' | 'small' | 'medium' | 'large' | 'gigantic'> = [
			'tiny',
			'small',
			'medium',
			'large',
			'gigantic'
		];
		planet.size = this.overrides['size'] || sizes[this.dice.rollInterval(0, sizes.length - 1)];

		// Generate color based on planet type
		const colorPalette =
			PlanetCreator.PLANET_COLORS[planet.type] || PlanetCreator.PLANET_COLORS['barren'];
		planet.color = colorPalette[this.dice.rollInterval(0, colorPalette.length - 1)];

		// Generate seed for procedural textures (based on planet ID hash)
		planet.seed = this.hashString(planet.id);

		// Calculate resolution based on size
		planet.resolution = getResolution(planet.size);
		planet.noiseScale = 2;
		planet.brightness = 0.5;

		// Generate atmosphere
		planet.atmosphere = this.overrides['atmosphere'] || this.generateAtmosphere(planet);
		planet.atmosphereColor =
			PlanetCreator.ATMOSPHERE_COLORS[planet.atmosphere] ||
			PlanetCreator.ATMOSPHERE_COLORS['none'];

		// Generate weather (only for planets with atmosphere)
		if (this.overrides['weather']) {
			planet.weather = this.overrides['weather'];
		} else if (planet.atmosphere !== 'none') {
			const weathers: Array<'clear' | 'moderate' | 'foggy' | 'stormy'> = [
				'clear',
				'moderate',
				'foggy',
				'stormy'
			];
			planet.weather = weathers[this.dice.rollInterval(0, weathers.length - 1)];
		} else {
			planet.weather = 'clear';
		}

		// Generate obliquity (axial tilt)
		planet.obliquity = this.overrides['obliquity'] !== undefined ? this.overrides['obliquity'] : this.dice.rollInterval(0, 30); // Most planets 0-30 degrees

		// Generate rings (gas giants more likely to have rings)
		if (planet.type === 'gas giant' && this.dice.rollInterval(1, 100) > 50) {
			this.generateRings(planet);
		} else if (this.dice.rollInterval(1, 100) > 90) {
			// Small chance for other planets
			this.generateRings(planet);
		}

		// Set distance from star (will be overridden by SolarSystemCreator)
		planet.distanceFromStar = this.distanceFromStar;

		// Generate additional properties
		this.generateNameDetails(planet);
		this.generatePhysicalProperties(planet);
		this.generateMoons(planet);
	}

	/**
	 * Generate name translation and meaning based on planet type
	 */
	private generateNameDetails(planet: Planet): void {
		// Generate meanings and translations that match the planet type
		const typeBasedDetails: Record<string, { meanings: string[]; translations: string[] }> = {
			'earth-like': {
				meanings: ['Home World', 'Blue Pearl', 'Life Bringer', 'Green Sphere', 'Cradle of Life'],
				translations: ['Terra', 'Gaia', 'Viridis', 'Vita', 'Mundus']
			},
			desert: {
				meanings: ['Red Sands', 'Dust World', 'Arid One', 'Storm World', 'Crimson Desert'],
				translations: ['Rubrum', 'Aridus', 'Sabulum', 'Siccus', 'Harena']
			},
			ice: {
				meanings: ['Frozen World', 'Ice Realm', 'Winter Star', 'White Pearl', 'Eternal Cold'],
				translations: ['Glacies', 'Frigus', 'Niveus', 'Gelidus', 'Hibernus']
			},
			water: {
				meanings: ['Ocean World', 'Blue Depths', 'Endless Sea', 'Water Sphere', 'Liquid Pearl'],
				translations: ['Aqua', 'Mare', 'Oceanus', 'Caeruleus', 'Profundus']
			},
			jungle: {
				meanings: ['Wild World', 'Green Heart', 'Untamed One', 'Forest Sphere', 'Life Abundant'],
				translations: ['Viridis', 'Silva', 'Luxuriosus', 'Florens', 'Vegetatus']
			},
			volcanic: {
				meanings: ['Fire World', 'Burning One', 'Lava Sphere', 'Eternal Flame', 'Inferno'],
				translations: ['Ignis', 'Vulcanus', 'Ardor', 'Flamma', 'Incendium']
			},
			'gas giant': {
				meanings: ['Storm King', 'Sky Giant', 'Eternal Tempest', 'Cloud Colossus', 'Wind Titan'],
				translations: ['Ventus', 'Gigantus', 'Tempestas', 'Nebula', 'Caelum']
			},
			barren: {
				meanings: ['Dead World', 'Silent Stone', 'Lifeless One', 'Grey Wanderer', 'Empty Sphere'],
				translations: ['Vastus', 'Sterilis', 'Desertus', 'Mutus', 'Vacuus']
			}
		};

		const details = typeBasedDetails[planet.type] || typeBasedDetails['barren'];
		planet.nameMeaning = details.meanings[this.dice.rollInterval(0, details.meanings.length - 1)];
		planet.nameTranslation = details.translations[this.dice.rollInterval(0, details.translations.length - 1)];
	}

	/**
	 * Generate physical properties based on size and type
	 */
	private generatePhysicalProperties(planet: Planet): void {
		// Calculate surface gravity based on size
		if (this.overrides['surfaceGravity'] !== undefined) {
			planet.surfaceGravity = this.overrides['surfaceGravity'];
		} else {
			const gravityMap: Record<string, number> = {
				tiny: 0.3,
				small: 0.6,
				medium: 1.0,
				large: 1.5,
				gigantic: 2.5
			};
			planet.surfaceGravity = gravityMap[planet.size] || 1.0;
		}

		// Magnetic field (more likely for larger planets with metallic core)
		if (planet.size === 'large' || planet.size === 'gigantic') {
			planet.hasMagneticField = this.dice.rollInterval(1, 100) > 30;
		} else {
			planet.hasMagneticField = this.dice.rollInterval(1, 100) > 70;
		}

		// Calculate rotation period (hours per day)
		if (this.overrides['rotationPeriod'] !== undefined) {
			planet.rotationPeriod = this.overrides['rotationPeriod'];
		} else {
			// Smaller planets tend to rotate faster
			const baseRotation = planet.size === 'tiny' ? 10 : planet.size === 'small' ? 16 : 24;
			planet.rotationPeriod = baseRotation + this.dice.rollInterval(-8, 12);
		}

		// Orbit period calculated from distance (Kepler's third law approximation)
		// T^2 ∝ a^3, where T is in Earth years and a is in AU
		planet.orbitPeriod = Math.round(Math.pow(planet.distanceFromStar, 1.5) * 365);
	}

	/**
	 * Generate moons for the planet
	 */
	private generateMoons(planet: Planet): void {
		// Larger planets more likely to have moons
		let maxMoons = 0;
		if (planet.size === 'gigantic') maxMoons = 5;
		else if (planet.size === 'large') maxMoons = 3;
		else if (planet.size === 'medium') maxMoons = 2;
		else if (planet.size === 'small') maxMoons = 1;

		if (maxMoons > 0 && this.dice.rollInterval(1, 100) > 50) {
			const moonCount = this.dice.rollInterval(1, maxMoons);
			const moonNames = [
				'Luna',
				'Phobos',
				'Deimos',
				'Titan',
				'Europa',
				'Io',
				'Ganymede',
				'Callisto',
				'Triton',
				'Enceladus',
				'Mimas',
				'Rhea'
			];

			for (let i = 0; i < moonCount; i++) {
				const moonName = moonNames[this.dice.rollInterval(0, moonNames.length - 1)];
				planet.moons.push(`${moonName} ${i + 1}`);
			}
		}
	}

	/**
	 * Generate atmosphere type based on planet properties
	 */
	private generateAtmosphere(planet: Planet): Planet['atmosphere'] {
		// Desert planets have thin CO2 or no atmosphere (like Mars)
		if (planet.type === 'desert') {
			return this.dice.rollInterval(1, 100) > 50 ? 'carbon-dioxide' : 'none';
		}

		// Barren planets have no atmosphere
		if (planet.type === 'barren') {
			return 'none';
		}

		// Ice planets have thin or no atmosphere
		if (planet.type === 'ice') {
			return this.dice.rollInterval(1, 100) > 70 ? 'none' : 'carbon-dioxide';
		}

		// Volcanic planets have toxic atmosphere
		if (planet.type === 'volcanic') {
			return 'toxic';
		}

		// Earth-like, jungle, and water planets have breathable atmosphere with clouds
		if (planet.isLivable && (planet.type === 'earth-like' || planet.type === 'jungle' || planet.type === 'water')) {
			return 'nitrogen-oxygen';
		}

		const atmospheres: Array<Planet['atmosphere']> = [
			'none',
			'toxic',
			'methane',
			'carbon-dioxide'
		];

		// Gas giants always have atmosphere
		if (planet.type === 'gas giant') {
			return atmospheres[this.dice.rollInterval(1, atmospheres.length - 1)];
		}

		return atmospheres[this.dice.rollInterval(0, atmospheres.length - 1)];
	}

	/**
	 * Generate planetary rings
	 */
	private generateRings(planet: Planet): void {
		const ringCount = this.dice.rollInterval(1, 3); // 1-3 rings
		const ringColors = PlanetCreator.RING_COLORS;

		for (let i = 0; i < ringCount; i++) {
			const color = ringColors[this.dice.rollInterval(0, ringColors.length - 1)];
			const baseRadius = 1.4;
			const ringWidth = 0.3;
			const innerRadius = baseRadius + i * ringWidth;
			const outerRadius = innerRadius + ringWidth;

			const ring = new Ring(`Ring ${i + 1}`, color, innerRadius, outerRadius);
			planet.rings.push(ring);
		}

		planet.ringColorName = 'icy'; // Could be expanded to more descriptive names
	}

	/**
	 * Simple hash function to convert string to number seed
	 */
	private hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return Math.abs(hash);
	}

	/**
	 * Set distance from star (called by SolarSystemCreator)
	 */
	withDistanceFromStar(distance: number): this {
		this.distanceFromStar = distance;
		return this;
	}

	withLivable(): this {
		this.isLivable = true;
		return this;
	}

	private generateDescription(planet: Planet): void {
		const livableText = planet.isLivable ? 'livable' : 'uninhabitable';
		const continentText =
			planet.continents.length > 0
				? ` with ${planet.continents.length} continent${planet.continents.length > 1 ? 's' : ''}`
				: '';
		planet.description = `A ${livableText} ${planet.type} planet${continentText}.`;
	}
}
