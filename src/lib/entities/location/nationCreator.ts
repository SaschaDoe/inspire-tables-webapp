import { Creator } from '../base/creator';
import { Nation } from './nation';
import { NationNameTable } from '$lib/tables/locationTables/nationNameTable';
import { NationAdjectiveTable } from '$lib/tables/locationTables/nationAdjectiveTable';
import { TechnologyTable } from '$lib/tables/otherTables/technologyTable';
import { LandscapeTable } from '$lib/tables/locationTables/landscapeTable';
import { BasicResourceTable } from '$lib/tables/otherTables/basicResourceTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';

export class NationCreator extends Creator<Nation> {
	create(): Nation {
		const nation = new Nation();

		// Generate nation details
		nation.name = new NationNameTable().roleWithCascade(this.dice).text;
		nation.adjective = new NationAdjectiveTable().roleWithCascade(this.dice).text;
		nation.technologyLevel = new TechnologyTable().roleWithCascade(this.dice).text;
		nation.landscape = new LandscapeTable().roleWithCascade(this.dice).text;
		nation.primaryResource = new BasicResourceTable().roleWithCascade(this.dice).text;
		nation.population = new SizeTable().roleWithCascade(this.dice).text;
		nation.government = this.generateGovernment();

		// Generate description
		nation.description = this.generateDescription(nation);

		return nation;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateGovernment(): string {
		const governments = [
			'monarchy',
			'republic',
			'theocracy',
			'oligarchy',
			'democracy',
			'dictatorship',
			'feudal system',
			'magocracy',
			'tribal council',
			'empire',
			'confederation',
			'anarchy'
		];
		const index = this.dice.rollInterval(0, governments.length - 1);
		return governments[index];
	}

	private generateDescription(nation: Nation): string {
		let desc = `${nation.name} is a${this.startsWithVowel(nation.adjective) ? 'n' : ''} ${nation.adjective} nation `;
		desc += `governed by a ${nation.government}. `;

		desc += `The land is characterized by ${nation.landscape}, `;
		desc += `and the population is ${nation.population}. `;

		desc += `The nation's technology level is ${nation.technologyLevel}, `;
		desc += `and their primary resource is ${nation.primaryResource}.`;

		return desc;
	}

	private startsWithVowel(text: string): boolean {
		if (!text) return false;
		return /^[aeiou]/i.test(text);
	}
}
