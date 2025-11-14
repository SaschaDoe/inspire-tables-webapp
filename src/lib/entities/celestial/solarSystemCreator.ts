import { Creator } from '../base/creator';
import { SolarSystem } from './solarSystem';
import { SolarSystemNameTable } from '$lib/tables/celestialTables/solarSystem/solarSystemNameTable';
import { NumberOfSunsTable } from '$lib/tables/celestialTables/solarSystem/numberOfSunsTable';
import { StarCreator } from './starCreator';
import { PlanetCreator } from './planetCreator';

export class SolarSystemCreator extends Creator<SolarSystem> {
	// Nested entity requirements
	static readonly NESTED_ENTITY_RULES = {
		planets: {
			min: 1,
			max: undefined, // No maximum
			entityType: 'planet' as const,
			displayName: 'Planet'
		},
		stars: {
			min: 1,
			max: undefined, // No maximum
			entityType: 'star' as const,
			displayName: 'Star'
		}
	};

	create(): SolarSystem {
		const solarSystem = new SolarSystem();
		this.setParentReference(solarSystem); // Automatically sets parentId

		solarSystem.name = new SolarSystemNameTable().roleWithCascade(this.dice).text;

		// Set random position on galaxy image (450px max-width, 300px height)
		// Add margin (60px from edges) to keep markers more centered and visible
		solarSystem.positionX = this.dice.rollInterval(60, 390);
		solarSystem.positionY = this.dice.rollInterval(60, 240);

		// Create stars
		const numberOfSuns = +new NumberOfSunsTable().roleWithCascade(this.dice).text;
		for (let i = 0; i < numberOfSuns; i++) {
			const starCreator = new StarCreator();
			starCreator.dice = this.dice;
			solarSystem.stars.push(starCreator.withParent(solarSystem.id).create());
		}

		// Calculate habitable zone based on star properties
		this.calculateHabitableZone(solarSystem);

		// Generate system age and stage
		this.generateSystemProperties(solarSystem);

		// Create at least one livable planet in habitable zone
		const planetCreator = new PlanetCreator().withLivable();
		planetCreator.dice = this.dice;
		const livablePlanet = planetCreator.withParent(solarSystem.id).create();
		// Place livable planet in middle of habitable zone
		livablePlanet.distanceFromStar =
			(solarSystem.habitableZoneStart + solarSystem.habitableZoneEnd) / 2;
		solarSystem.planets.push(livablePlanet);
		solarSystem.lastDistanceFromStar = livablePlanet.distanceFromStar;

		// Possibly add more planets
		const numExtraPlanets = this.dice.rollInterval(1, 6) - 3; // 0-3 extra planets
		for (let i = 0; i < numExtraPlanets; i++) {
			const extraPlanet = new PlanetCreator();
			extraPlanet.dice = this.dice;
			const planet = extraPlanet.withParent(solarSystem.id).create();

			// Assign orbital distance
			planet.distanceFromStar = this.assignOrbitalDistance(solarSystem);
			solarSystem.planets.push(planet);
		}

		this.generateDescription(solarSystem);
		return solarSystem;
	}

	/**
	 * Calculate habitable zone based on star luminosity
	 * Formula based on stellar luminosity and greenhouse effect
	 */
	private calculateHabitableZone(solarSystem: SolarSystem): void {
		if (solarSystem.stars.length === 0) {
			solarSystem.habitableZoneStart = 0.9;
			solarSystem.habitableZoneEnd = 1.5;
			return;
		}

		// Use the primary (first) star for habitable zone calculation
		const primaryStar = solarSystem.stars[0];
		const luminosity = primaryStar.luminosity;

		// Inner edge: runaway greenhouse effect threshold
		solarSystem.habitableZoneStart = Math.sqrt(luminosity / 1.1);

		// Outer edge: maximum greenhouse effect threshold
		solarSystem.habitableZoneEnd = Math.sqrt(luminosity / 0.53);

		// Ensure minimum zone size
		if (solarSystem.habitableZoneEnd - solarSystem.habitableZoneStart < 0.3) {
			const center = (solarSystem.habitableZoneStart + solarSystem.habitableZoneEnd) / 2;
			solarSystem.habitableZoneStart = center - 0.15;
			solarSystem.habitableZoneEnd = center + 0.15;
		}
	}

	/**
	 * Generate system age and evolutionary stage
	 */
	private generateSystemProperties(solarSystem: SolarSystem): void {
		// Generate age (0.1 to 10 billion years)
		solarSystem.age = this.dice.rollInterval(1, 100) / 10;

		// Determine stage based on age
		if (solarSystem.age < 1.0) {
			solarSystem.stage = 'young system';
			solarSystem.stageDescription = 'A young stellar system still clearing debris and forming planets.';
		} else if (solarSystem.age < 5.0) {
			solarSystem.stage = 'mature system';
			solarSystem.stageDescription = 'A stable mature system with fully formed planets.';
		} else if (solarSystem.age < 8.0) {
			solarSystem.stage = 'aging system';
			solarSystem.stageDescription = 'An old system where the star is beginning to expand.';
		} else {
			solarSystem.stage = 'ancient system';
			solarSystem.stageDescription = 'An ancient system nearing the end of its stellar lifecycle.';
		}
	}

	/**
	 * Assign orbital distance to a new planet
	 * Uses logarithmic spacing to spread planets realistically
	 */
	private assignOrbitalDistance(solarSystem: SolarSystem): number {
		const lastDistance = solarSystem.lastDistanceFromStar;

		// Determine if planet is inner or outer relative to last planet
		const isOuter = this.dice.rollInterval(1, 2) === 2;

		let newDistance: number;

		if (isOuter) {
			// Place farther out (logarithmic spacing)
			const spacing = this.dice.rollInterval(5, 15) / 10; // 0.5 to 1.5 AU
			newDistance = lastDistance + spacing;
		} else {
			// Place closer in
			const spacing = this.dice.rollInterval(2, 8) / 10; // 0.2 to 0.8 AU
			newDistance = Math.max(0.1, lastDistance - spacing);
		}

		// Update tracking
		solarSystem.lastDistanceFromStar = newDistance;

		return newDistance;
	}

	private generateDescription(solarSystem: SolarSystem): void {
		const starText = solarSystem.stars.length === 1 ? '1 star' : `${solarSystem.stars.length} stars`;
		const planetText =
			solarSystem.planets.length === 1
				? '1 planet'
				: `${solarSystem.planets.length} planets`;
		solarSystem.description = `${solarSystem.name}, a solar system with ${starText} and ${planetText}.`;
	}
}
