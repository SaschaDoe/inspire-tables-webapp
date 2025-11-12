import { Creator } from '../base/creator';
import { Galaxy } from './galaxy';
import { GalaxyNameTable } from '$lib/tables/celestialTables/galaxyNameTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { SolarSystemCreator } from './solarSystemCreator';

export class GalaxyCreator extends Creator<Galaxy> {
	create(): Galaxy {
		const galaxy = new Galaxy();
		galaxy.name = new GalaxyNameTable().roleWithCascade(this.dice).text;
		galaxy.size = new SizeTable().roleWithCascade(this.dice).text;

		// Create at least one solar system
		const solarSystemCreator = new SolarSystemCreator();
		solarSystemCreator.dice = this.dice;
		galaxy.solarSystems.push(solarSystemCreator.create());

		this.generateDescription(galaxy);
		return galaxy;
	}

	private generateDescription(galaxy: Galaxy): void {
		const systemText =
			galaxy.solarSystems.length === 1
				? '1 solar system'
				: `${galaxy.solarSystems.length} solar systems`;
		galaxy.description = `${galaxy.name}, a ${galaxy.size} galaxy containing ${systemText}.`;
	}
}
