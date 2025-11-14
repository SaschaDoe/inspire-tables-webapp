import { Creator } from '../base/creator';
import { Continent } from './continent';
import { ContinentNameTable } from '$lib/tables/locationTables/continentNameTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { LandscapeTable } from '$lib/tables/locationTables/landscapeTable';
import { WeatherTable } from '$lib/tables/otherTables/weatherTable';
import { WeatherAdjectiveTable } from '$lib/tables/otherTables/weatherAdjectiveTable';

export class ContinentCreator extends Creator<Continent> {
	create(): Continent {
		const continent = new Continent();
		this.setParentReference(continent); // Automatically sets parentId

		// Generate continent details
		continent.name = new ContinentNameTable().roleWithCascade(this.dice).text;
		continent.size = new SizeTable().roleWithCascade(this.dice).text;
		continent.dominantLandscape = new LandscapeTable().roleWithCascade(this.dice).text;
		continent.primaryWeather = new WeatherTable().roleWithCascade(this.dice).text;
		continent.climate = new WeatherAdjectiveTable().roleWithCascade(this.dice).text;

		// Generate description
		continent.description = this.generateDescription(continent);

		return continent;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateDescription(continent: Continent): string {
		let desc = `${continent.name} is a ${continent.size} continent `;
		desc += `characterized by ${continent.dominantLandscape}. `;

		desc += `The climate is predominantly ${continent.climate}, `;
		desc += `with ${continent.primaryWeather} being common throughout the region.`;

		return desc;
	}
}
