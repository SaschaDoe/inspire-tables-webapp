import { Creator } from '../base/creator';
import { Faction } from './faction';
import { AlignmentTable } from '$lib/tables/charTables/alignmentTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { FractionWealthTable } from '$lib/tables/otherTables/fractionWealthTable';
import { MotivationTable } from '$lib/tables/charTables/motivationTable';
import { FractionNameTable } from '$lib/tables/otherTables/fractionNameTable';

export class FactionCreator extends Creator<Faction> {
	create(): Faction {
		const faction = new Faction();

		faction.alignment = new AlignmentTable().roleWithCascade(this.dice).text;
		faction.size = new SizeTable().roleWithCascade(this.dice).text;
		faction.influence = new SizeTable().roleWithCascade(this.dice).text;
		faction.wealth = new FractionWealthTable().roleWithCascade(this.dice).text;
		faction.motivation = new MotivationTable().roleWithCascade(this.dice).text;

		// Generate name
		faction.name = this.generateName(faction);

		// Generate description
		faction.description = this.generateDescription(faction);

		return faction;
	}

	private generateName(faction: Faction): string {
		const baseName = new FractionNameTable().roleWithCascade(this.dice).text;
		return this.capitalize(baseName);
	}

	private generateDescription(faction: Faction): string {
		return `A ${faction.size} ${faction.alignment} faction of ${faction.influence} influence. Wealth: ${faction.wealth}. Motivation: ${faction.motivation}.`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
