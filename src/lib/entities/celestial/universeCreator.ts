import { Creator } from '../base/creator';
import { Universe } from './universe';
import { UniverseNameTable } from '$lib/tables/celestialTables/universe/universeNameTable';
import { DimensionalStructureTable } from '$lib/tables/celestialTables/universe/dimensionalStructureTable';
import { UniverseAgeTable } from '$lib/tables/celestialTables/universe/universeAgeTable';
import { SphereCreator } from './sphereCreator';
import { Sphere } from './sphere';

export class UniverseCreator extends Creator<Universe> {
	create(): Universe {
		const universe = new Universe();
		universe.name = new UniverseNameTable().roleWithCascade(this.dice).text;
		universe.dimensionalStructure = new DimensionalStructureTable().roleWithCascade(this.dice).text;
		universe.age = new UniverseAgeTable().roleWithCascade(this.dice).text;

		// Always create the normal "Material Sphere" first with standard physics
		const materialSphere = new Sphere();
		materialSphere.name = 'Material Sphere';
		materialSphere.birth = 'Big Bang';
		materialSphere.rule = 'Standard physics with fundamental forces: gravity, electromagnetism, strong and weak nuclear forces';
		materialSphere.galaxies = []; // Will be populated if accessed
		universe.spheres.push(materialSphere);

		// Create 0-9 additional random spheres
		const additionalSpheresCount = this.dice.roll(1, 10) - 1; // 0 to 9
		const sphereCreator = new SphereCreator();
		sphereCreator.dice = this.dice;

		for (let i = 0; i < additionalSpheresCount; i++) {
			universe.spheres.push(sphereCreator.create());
		}

		this.generateDescription(universe);
		return universe;
	}

	private generateDescription(universe: Universe): void {
		const sphereText =
			universe.spheres.length === 1 ? '1 sphere' : `${universe.spheres.length} spheres`;
		universe.description = `${universe.name}, ${universe.age}. It has ${universe.dimensionalStructure}. Contains ${sphereText}.`;
	}
}
