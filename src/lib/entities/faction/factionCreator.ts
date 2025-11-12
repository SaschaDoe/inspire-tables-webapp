import { Creator } from '../base/creator';
import { Faction } from './faction';
import { AlignmentTable } from '$lib/tables/charTables/alignmentTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { FractionWealthTable } from '$lib/tables/otherTables/fractionWealthTable';
import { MotivationTable } from '$lib/tables/charTables/motivationTable';
import { FactionBeginningMotivationTable } from '$lib/tables/factionTables/factionBeginningMotivationTable';
import { FactionFirstNameTable } from '$lib/tables/factionTables/factionFirstNameTable';
import { FactionSecondNameTable } from '$lib/tables/factionTables/factionSecondNameTable';
import { FactionQuoteTable } from '$lib/tables/factionTables/factionQuoteTable';
import { SignCreator } from '../other/signCreator';
import { CharacterCreator } from '../character/characterCreator';
import { RitualCreator } from '../ritual/ritualCreator';

export class FactionCreator extends Creator<Faction> {
	create(): Faction {
		const faction = new Faction();

		faction.alignment = new AlignmentTable().roleWithCascade(this.dice).text;
		faction.size = new SizeTable().roleWithCascade(this.dice).text;
		faction.influence = new SizeTable().roleWithCascade(this.dice).text;
		faction.wealth = new FractionWealthTable().roleWithCascade(this.dice).text;
		faction.motivation = new MotivationTable().roleWithCascade(this.dice).text;
		faction.beginningMotivation = new FactionBeginningMotivationTable().roleWithCascade(
			this.dice
		).text;

		// Create sign/symbol
		const signCreator = new SignCreator();
		signCreator.dice = this.dice;
		faction.sign = signCreator.create();

		// Create leader
		const leaderCreator = new CharacterCreator();
		leaderCreator.dice = this.dice;
		faction.leader = leaderCreator.create();

		// Create rituals (1-3 rituals)
		const numberOfRituals = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numberOfRituals; i++) {
			const ritualCreator = new RitualCreator();
			ritualCreator.dice = this.dice;
			faction.rituals.push(ritualCreator.create());
		}

		// Generate name
		faction.name = this.generateName();

		// Generate quote
		faction.quote = new FactionQuoteTable().roleWithCascade(this.dice).text;

		// Generate description
		faction.description = this.generateDescription(faction);

		return faction;
	}

	private generateName(): string {
		const firstName = new FactionFirstNameTable().roleWithCascade(this.dice).text;
		const secondName = new FactionSecondNameTable().roleWithCascade(this.dice).text;
		return `${firstName} of the ${secondName}`;
	}

	private generateDescription(faction: Faction): string {
		const parts: string[] = [];

		parts.push(
			`A ${faction.size} ${faction.alignment} faction of ${faction.influence} influence`
		);
		parts.push(`Wealth: ${faction.wealth}`);
		parts.push(`Motivation: ${faction.motivation}`);

		if (faction.leader) {
			parts.push(`Led by ${faction.leader.name}`);
		}

		if (faction.rituals.length > 0) {
			parts.push(
				`Practices ${faction.rituals.length} ritual${faction.rituals.length > 1 ? 's' : ''}`
			);
		}

		parts.push(`Founded to ${faction.beginningMotivation}`);

		if (faction.quote) {
			parts.push(`Motto: "${faction.quote}"`);
		}

		return parts.join('. ') + '.';
	}
}
