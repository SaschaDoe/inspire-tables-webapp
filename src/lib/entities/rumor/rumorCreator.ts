import { Creator } from '../base/creator';
import { Rumor } from './rumor';
import { RumorContentTable } from '$lib/tables/otherTables/rumorContentTable';
import { TruthLevelTable } from '$lib/tables/otherTables/truthLevelTable';
import { ProfessionTable } from '$lib/tables/charTables/professionTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';

export class RumorCreator extends Creator<Rumor> {
	create(): Rumor {
		const rumor = new Rumor();

		rumor.content = new RumorContentTable().roleWithCascade(this.dice).text;
		rumor.truthLevel = new TruthLevelTable().roleWithCascade(this.dice).text;
		rumor.source = new ProfessionTable().roleWithCascade(this.dice).text;
		rumor.spread = new SizeTable().roleWithCascade(this.dice).text;

		// Generate description
		rumor.description = this.generateDescription(rumor);

		return rumor;
	}

	private generateDescription(rumor: Rumor): string {
		return `Word is spreading (${rumor.spread} scale) that ${rumor.content}. This rumor, reportedly from a ${rumor.source}, is ${rumor.truthLevel}.`;
	}
}
