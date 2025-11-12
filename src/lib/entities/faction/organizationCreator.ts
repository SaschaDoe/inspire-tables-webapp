import { Creator } from '../base/creator';
import { Organization } from './organization';
import { FractionNameTable } from '$lib/tables/otherTables/fractionNameTable';
import { AlignmentTable } from '$lib/tables/charTables/alignmentTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { FractionWealthTable } from '$lib/tables/otherTables/fractionWealthTable';
import { LocationTable } from '$lib/tables/otherTables/locationTable';
import { ProfessionTable } from '$lib/tables/charTables/professionTable';
import { MotivationTable } from '$lib/tables/charTables/motivationTable';

export class OrganizationCreator extends Creator<Organization> {
	create(): Organization {
		const org = new Organization();

		// Generate organization details
		const orgType = this.generateOrganizationType();
		org.type = orgType;
		org.name = this.generateOrganizationName(orgType);
		org.alignment = new AlignmentTable().roleWithCascade(this.dice).text;
		org.size = new SizeTable().roleWithCascade(this.dice).text;
		org.wealth = new FractionWealthTable().roleWithCascade(this.dice).text;
		org.headquarters = new LocationTable().roleWithCascade(this.dice).text;
		org.leader = new ProfessionTable().roleWithCascade(this.dice).text;
		org.goals = new MotivationTable().roleWithCascade(this.dice).text;
		org.influence = this.generateInfluence();
		org.reputation = this.generateReputation();

		// Generate description
		org.description = this.generateDescription(org);

		return org;
	}

	private generateOrganizationType(): string {
		const types = [
			'guild',
			'company',
			'cult',
			'military order',
			'secret society',
			'merchant consortium',
			'thieves guild',
			'mages circle',
			'religious order',
			'knightly order',
			'mercenary company',
			'trade union',
			'criminal syndicate',
			'noble house',
			'academic institution',
			'adventuring party',
			'spy network',
			'revolutionary group'
		];
		const index = this.dice.rollInterval(0, types.length - 1);
		return types[index];
	}

	private generateOrganizationName(type: string): string {
		const baseName = new FractionNameTable().roleWithCascade(this.dice).text;

		// Add type-specific prefix or suffix
		const prefixes = ['The', 'Order of', 'Society of', 'Brotherhood of', 'Circle of'];
		const suffixes = ['Guild', 'Company', 'Order', 'Society', 'Consortium', 'Alliance'];

		if (this.dice.random() > 0.5) {
			const prefix = prefixes[this.dice.rollInterval(0, prefixes.length - 1)];
			return `${prefix} ${baseName}`;
		} else {
			const suffix = suffixes[this.dice.rollInterval(0, suffixes.length - 1)];
			return `${baseName} ${suffix}`;
		}
	}

	private generateInfluence(): string {
		const influences = [
			'minimal',
			'local',
			'regional',
			'national',
			'international',
			'legendary'
		];
		const index = this.dice.rollInterval(0, influences.length - 1);
		return influences[index];
	}

	private generateReputation(): string {
		const reputations = [
			'unknown',
			'mysterious',
			'feared',
			'respected',
			'beloved',
			'notorious',
			'controversial',
			'prestigious',
			'infamous',
			'revered'
		];
		const index = this.dice.rollInterval(0, reputations.length - 1);
		return reputations[index];
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateDescription(org: Organization): string {
		let desc = `${org.name} is a ${org.size} ${org.type} `;
		desc += `with ${org.wealth} wealth and ${org.influence} influence. `;

		desc += `They are ${org.alignment} aligned and led by a ${org.leader}. `;
		desc += `Their primary goal is ${org.goals}. `;

		desc += `Headquartered in ${org.headquarters}, `;
		desc += `they have a ${org.reputation} reputation in the region.`;

		return desc;
	}
}
