import { Creator } from '../base/creator';
import { Planet } from './planet';
import { PlanetNameTable } from '$lib/tables/celestialTables/planet/planetNameTable';
import { LivablePlanetTypeTable } from '$lib/tables/celestialTables/planet/planetTypeTable';
import { ContinentCreator } from '../location/continentCreator';

export class PlanetCreator extends Creator<Planet> {
	private isLivable = false;

	create(): Planet {
		const planet = new Planet();
		planet.isLivable = this.isLivable;
		planet.name = new PlanetNameTable().roleWithCascade(this.dice).text;
		planet.type = new LivablePlanetTypeTable().roleWithCascade(this.dice).text;

		// If livable, add a continent
		if (this.isLivable && this.dice.rollInterval(1, 2) === 2) {
			const continentCreator = new ContinentCreator();
			continentCreator.dice = this.dice;
			planet.continents.push(continentCreator.create());
		}

		this.generateDescription(planet);
		return planet;
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
