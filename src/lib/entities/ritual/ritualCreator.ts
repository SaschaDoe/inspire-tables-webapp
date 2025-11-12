import { Creator } from '../base/creator';
import { Ritual } from './ritual';
import { RitualTimeTable } from '$lib/tables/ritualTables/ritualTimeTable';
import { RitualPreparationTable } from '$lib/tables/ritualTables/ritualPreparationTable';
import { RitualInvocationTable } from '$lib/tables/ritualTables/ritualInvocationTable';
import { RitualLocationTable } from '$lib/tables/ritualTables/ritualLocationTable';
import { RitualExclusivenessTable } from '$lib/tables/ritualTables/ritualExclusivenessTable';
import { RitualActionTable } from '$lib/tables/ritualTables/ritualActionTable';
import { RitualOfferingTable } from '$lib/tables/ritualTables/ritualOfferingTable';
import { RitualCulminationTable } from '$lib/tables/ritualTables/ritualCulminationTable';
import { RitualFeastTable } from '$lib/tables/ritualTables/ritualFeastTable';
import { MagicalTalentTable } from '$lib/tables/talentTables/magicalTalentTable';

export class RitualCreator extends Creator<Ritual> {
	create(): Ritual {
		const ritual = new Ritual();

		// Generate magical effect
		ritual.effect = new MagicalTalentTable().roleWithCascade(this.dice).text;

		// Generate ritual details
		ritual.time = new RitualTimeTable().roleWithCascade(this.dice).text;
		ritual.preparation = new RitualPreparationTable().roleWithCascade(this.dice).text;
		ritual.invocation = new RitualInvocationTable().roleWithCascade(this.dice).text;
		ritual.location = new RitualLocationTable().roleWithCascade(this.dice).text;
		ritual.exclusiveness = new RitualExclusivenessTable().roleWithCascade(this.dice).text;
		ritual.action = new RitualActionTable().roleWithCascade(this.dice).text;
		ritual.offering = new RitualOfferingTable().roleWithCascade(this.dice).text;
		ritual.culmination = new RitualCulminationTable().roleWithCascade(this.dice).text;

		// 50% chance of having a feast
		if (this.dice.random() > 0.5) {
			ritual.feast = new RitualFeastTable().roleWithCascade(this.dice).text;
		}

		// Generate name and description
		ritual.name = this.generateName(ritual);
		ritual.description = this.generateDescription(ritual);

		return ritual;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateName(ritual: Ritual): string {
		// Create a name based on the culmination and effect
		const effectWords = ritual.effect.split(' ').slice(0, 2);
		const culmination = this.capitalize(ritual.culmination);
		return `Ritual of ${culmination} - ${effectWords.map((w) => this.capitalize(w)).join(' ')}`;
	}

	private generateDescription(ritual: Ritual): string {
		let desc = `A sacred ritual performed ${ritual.time} at ${ritual.location}. `;
		desc += `Only ${ritual.exclusiveness} may participate. `;
		desc += `\n\nPreparation involves ${ritual.preparation}. `;
		desc += `The ritual begins with ${ritual.invocation}, followed by ${ritual.action}. `;
		desc += `Participants offer ${ritual.offering} to the divine powers. `;
		desc += `The ceremony culminates in ${ritual.culmination}. `;

		if (ritual.feast) {
			desc += `Afterwards, celebrants engage in ${ritual.feast}. `;
		}

		desc += `\n\nEffect: ${ritual.effect}`;

		return desc;
	}
}
