import { Creator } from '../base/creator';
import { Talent } from './talent';
import { TalentTable } from '$lib/tables/talentTables/talentTable';
import { TalentCategoryTable } from '$lib/tables/talentTables/talentCategoryTable';

export class TalentCreator extends Creator<Talent> {
	create(): Talent {
		const talent = new Talent();

		talent.category = new TalentCategoryTable().roleWithCascade(this.dice).text;
		talent.type = new TalentTable().roleWithCascade(this.dice).text;

		// Generate name from type
		talent.name = this.generateName(talent.type);

		// Generate description
		talent.description = this.generateDescription(talent);

		return talent;
	}

	private generateName(type: string): string {
		// Extract key words from type for name
		const words = type.split(' ').filter((w) => w.length > 3);
		if (words.length > 0) {
			return words.map((w) => this.capitalize(w)).join(' ');
		}
		return this.capitalize(type);
	}

	private generateDescription(talent: Talent): string {
		return `A ${talent.category} talent that grants the ability to ${talent.type}.`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
