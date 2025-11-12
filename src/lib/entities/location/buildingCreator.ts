import { Creator } from '../base/creator';
import { Building } from './building';
import { BuildingTable } from '$lib/tables/locationTables/buildingTable';
import { BuildingAdjectiveTable } from '$lib/tables/locationTables/buildingAdjectiveTable';
import { QualityTable } from '$lib/tables/otherTables/qualityTable';

export class BuildingCreator extends Creator<Building> {
	create(): Building {
		const building = new Building();

		building.type = new BuildingTable().roleWithCascade(this.dice).text;
		building.adjective = new BuildingAdjectiveTable().roleWithCascade(this.dice).text;
		building.quality = new QualityTable().roleWithCascade(this.dice).text;

		// Generate name
		building.name = this.generateName(building);

		// Generate description
		building.description = this.generateDescription(building);

		return building;
	}

	private generateName(building: Building): string {
		if (building.adjective) {
			return `The ${this.capitalize(building.adjective)} ${this.capitalize(building.type)}`;
		}
		return `The ${this.capitalize(building.type)}`;
	}

	private generateDescription(building: Building): string {
		const qualityText = building.quality ? ` of ${building.quality} quality` : '';
		const adjectiveText = building.adjective ? `${building.adjective} ` : '';

		return `A ${adjectiveText}${building.type}${qualityText}.`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
