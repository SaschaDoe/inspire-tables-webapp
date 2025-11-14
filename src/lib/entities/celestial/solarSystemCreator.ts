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
			solarSystem.stars.push(starCreator.create());
		}

		// Create at least one livable planet
		const planetCreator = new PlanetCreator().withLivable();
		planetCreator.dice = this.dice;
		solarSystem.planets.push(planetCreator.withParent(solarSystem.id).create());

		// Possibly add more planets
		const numExtraPlanets = this.dice.rollInterval(1, 6) - 3; // 0-3 extra planets
		for (let i = 0; i < numExtraPlanets; i++) {
			const extraPlanet = new PlanetCreator();
			extraPlanet.dice = this.dice;
			solarSystem.planets.push(extraPlanet.withParent(solarSystem.id).create());
		}

		this.generateDescription(solarSystem);
		return solarSystem;
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
