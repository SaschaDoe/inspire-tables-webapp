import { Creator } from '../base/creator';
import { Universe } from './universe';
import { UniverseNameTable } from '$lib/tables/celestialTables/universe/universeNameTable';
import { DimensionalStructureTable } from '$lib/tables/celestialTables/universe/dimensionalStructureTable';
import { FundamentalLawsTable } from '$lib/tables/celestialTables/universe/fundamentalLawsTable';
import { UniverseAgeTable } from '$lib/tables/celestialTables/universe/universeAgeTable';
import { SphereCreator } from './sphereCreator';

export class UniverseCreator extends Creator<Universe> {
	create(): Universe {
		const universe = new Universe();
		universe.name = new UniverseNameTable().roleWithCascade(this.dice).text;
		universe.dimensionalStructure = new DimensionalStructureTable().roleWithCascade(this.dice).text;
		universe.fundamentalLaws = new FundamentalLawsTable().roleWithCascade(this.dice).text;
		universe.age = new UniverseAgeTable().roleWithCascade(this.dice).text;

		// Create at least one sphere
		const sphereCreator = new SphereCreator();
		sphereCreator.dice = this.dice;
		universe.spheres.push(sphereCreator.create());

		this.generateDescription(universe);
		return universe;
	}

	private generateDescription(universe: Universe): void {
		const sphereText =
			universe.spheres.length === 1 ? '1 sphere' : `${universe.spheres.length} spheres`;
		universe.description = `${universe.name}, ${universe.age}. It has ${universe.dimensionalStructure}. The fundamental law states that ${universe.fundamentalLaws}. Contains ${sphereText}.`;
	}
}
