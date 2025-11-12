import { Creator } from '../base/creator';
import { God } from './god';
import { GodBynameTable } from '$lib/tables/godTables/godBynameTable';
import { CharacterCreator } from '../character/characterCreator';
import { AnimalTable } from '$lib/tables/charTables/animalTable';
import { TempleTypeTable } from '$lib/tables/locationTables/templeTypeTable';
import { QuoteDiscipleTable } from '$lib/tables/godTables/quoteDiscipleTable';
import { QuoteCautionaryTable } from '$lib/tables/godTables/quoteCautionaryTable';
import { GodStatusTable } from '$lib/tables/godTables/godStatusTable';
import { GodDomainTable } from '$lib/tables/godTables/godDomainTable';
import { SphereTable } from '$lib/tables/locationTables/sphereTable';

export class GodCreator extends Creator<God> {
	create(): God {
		const god = new God();

		// Generate divine titles and identity
		god.byname = new GodBynameTable().roleWithCascade(this.dice).text;

		// Generate underlying character (gods have personalities too!)
		god.character = new CharacterCreator().withDice(this.dice).create();

		// Generate 1-3 domains
		const numDomains = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numDomains; i++) {
			god.domains.push(new GodDomainTable().roleWithCascade(this.dice).text);
		}

		// Generate sacred symbols and places
		god.sacredAnimal = new AnimalTable().roleWithCascade(this.dice).text;
		god.temple = new TempleTypeTable().roleWithCascade(this.dice).text;

		// Generate quotes from followers and critics
		god.quoteDisciple = new QuoteDiscipleTable().roleWithCascade(this.dice).text;
		god.quoteCautionary = new QuoteCautionaryTable().roleWithCascade(this.dice).text;

		// Generate current divine status
		god.status = new GodStatusTable().roleWithCascade(this.dice).text;

		// Generate habitat/realm
		god.habitat = new SphereTable().roleWithCascade(this.dice).text;

		// Generate name and description
		god.name = this.generateName(god);
		god.description = this.generateDescription(god);

		return god;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateName(god: God): string {
		// Combine character name with divine byname
		if (god.character) {
			return `${god.character.name}, ${god.byname}`;
		}
		return god.byname;
	}

	private generateDescription(god: God): string {
		const domainsList = god.domains.join(', ');

		let desc = `${god.name} is a ${god.status} deity of ${domainsList}. `;

		if (god.character) {
			desc += `In mortal form, they appear as a ${god.character.race} ${god.character.profession} with ${god.character.alignment} alignment. `;
		}

		desc += `Their sacred animal is the ${god.sacredAnimal}, and followers worship at ${god.temple}s dedicated to their glory. `;
		desc += `Habitat: ${god.habitat}. `;
		desc += `\n\nDisciples say: "${god.quoteDisciple}" `;
		desc += `\n\nCritics warn: "${god.quoteCautionary}"`;

		return desc;
	}
}
