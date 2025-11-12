import { Creator } from '../base/creator';
import { Region } from './region';
import { LandscapeTable } from '$lib/tables/locationTables/landscapeTable';
import { WeatherTable } from '$lib/tables/otherTables/weatherTable';
import { BasicResourceTable } from '$lib/tables/otherTables/basicResourceTable';

export class RegionCreator extends Creator<Region> {
	create(): Region {
		const region = new Region();

		region.landscape = new LandscapeTable().roleWithCascade(this.dice).text;
		region.weather = new WeatherTable().roleWithCascade(this.dice).text;

		// Generate 1-3 resources
		const numResources = this.dice.rollInterval(1, 3);
		const resourceTable = new BasicResourceTable();
		for (let i = 0; i < numResources; i++) {
			const resource = resourceTable.roleWithCascade(this.dice).text;
			if (!region.resources.includes(resource)) {
				region.resources.push(resource);
			}
		}

		// Generate name based on landscape
		region.name = `${this.capitalize(region.landscape)} Region`;

		// Generate description
		region.description = this.generateDescription(region);

		return region;
	}

	private generateDescription(region: Region): string {
		const resourceText =
			region.resources.length > 0
				? ` Rich in ${region.resources.join(', ')}.`
				: ' Resources unknown.';

		return `A ${region.landscape} region with ${region.weather} weather.${resourceText}`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
