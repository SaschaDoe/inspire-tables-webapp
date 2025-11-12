import { Creator } from '../base/creator';
import { Clue } from './clue';
import { ClueSourceTable } from '$lib/tables/otherTables/clueSourceTable';
import { ClueObjectTable } from '$lib/tables/otherTables/clueObjectTable';
import { TruthLevelTable } from '$lib/tables/otherTables/truthLevelTable';
import { ClueConclusionTable } from '$lib/tables/otherTables/clueConclusionTable';

export class ClueCreator extends Creator<Clue> {
	create(): Clue {
		const clue = new Clue();

		clue.source = new ClueSourceTable().roleWithCascade(this.dice).text;
		clue.object = new ClueObjectTable().roleWithCascade(this.dice).text;
		clue.truthLevel = new TruthLevelTable().roleWithCascade(this.dice).text;
		clue.conclusion = new ClueConclusionTable().roleWithCascade(this.dice).text;

		// Generate a name based on conclusion
		clue.name = `${this.capitalize(clue.conclusion)} Clue`;

		// Generate description combining all elements
		clue.description = this.generateDescription(clue);

		return clue;
	}

	private generateDescription(clue: Clue): string {
		return `A clue discovered through ${clue.source}. The evidence takes the form of ${clue.object}. This clue appears to be ${clue.truthLevel} and points to ${clue.conclusion}.`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
