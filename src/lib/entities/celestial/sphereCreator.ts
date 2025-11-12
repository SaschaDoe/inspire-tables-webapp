import { Creator } from '../base/creator';
import { Sphere } from './sphere';
import { SphereNameTable } from '$lib/tables/celestialTables/sphere/sphereNameTable';
import { SphereRuleTable } from '$lib/tables/celestialTables/sphere/sphereRuleTable';
import { WorldCreationMethodTable } from '$lib/tables/celestialTables/cosmicBirthTable';
import { GalaxyCreator } from './galaxyCreator';

export class SphereCreator extends Creator<Sphere> {
	create(): Sphere {
		const sphere = new Sphere();
		sphere.name = new SphereNameTable().roleWithCascade(this.dice).text;
		sphere.rule = new SphereRuleTable().roleWithCascade(this.dice).text;
		sphere.birth = new WorldCreationMethodTable().roleWithCascade(this.dice).text;

		// Create at least one galaxy
		const galaxyCreator = new GalaxyCreator();
		galaxyCreator.dice = this.dice;
		sphere.galaxies.push(galaxyCreator.create());

		this.generateDescription(sphere);
		return sphere;
	}

	private generateDescription(sphere: Sphere): void {
		const galaxyText =
			sphere.galaxies.length === 1 ? '1 galaxy' : `${sphere.galaxies.length} galaxies`;
		sphere.description = `${sphere.name}, a cosmic sphere containing ${galaxyText}. ${sphere.rule} Created through ${sphere.birth}.`;
	}
}
