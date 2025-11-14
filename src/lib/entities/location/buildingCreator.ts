import { Creator } from '../base/creator';
import { Building } from './building';
import { BuildingTable } from '$lib/tables/locationTables/buildingTable';
import { BuildingAdjectiveTable } from '$lib/tables/locationTables/buildingAdjectiveTable';
import { QualityTable } from '$lib/tables/otherTables/qualityTable';

export class BuildingCreator extends Creator<Building> {
	create(): Building {
		const building = new Building();

		// Use overrides if provided, otherwise roll on tables
		building.type = this.overrides['type'] || new BuildingTable().roleWithCascade(this.dice).text;
		building.adjective = this.overrides['adjective'] || new BuildingAdjectiveTable().roleWithCascade(this.dice).text;
		building.quality = this.overrides['quality'] || new QualityTable().roleWithCascade(this.dice).text;

		// Generate name (use override if provided)
		building.name = this.overrides['name'] || this.generateName(building);

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
