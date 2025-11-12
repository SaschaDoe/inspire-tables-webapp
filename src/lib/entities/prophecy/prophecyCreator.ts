import { Creator } from '../base/creator';
import { Prophecy } from './prophecy';
import { ProphecyTextTable } from '$lib/tables/otherTables/prophecyTextTable';
import { ProfessionTable } from '$lib/tables/charTables/professionTable';

export class ProphecyCreator extends Creator<Prophecy> {
	create(): Prophecy {
		const prophecy = new Prophecy();

		prophecy.text = new ProphecyTextTable().roleWithCascade(this.dice).text;
		prophecy.source = new ProfessionTable().roleWithCascade(this.dice).text;

		// Generate timeframe
		const timeframes = [
			'within days',
			'within weeks',
			'within months',
			'within years',
			'within a generation',
			'within an age',
			'when conditions are met',
			'at the appointed time'
		];
		prophecy.timeframe = timeframes[Math.floor(this.dice.random() * timeframes.length)];

		// Generate fulfillment status
		const statuses = ['unfulfilled', 'partially fulfilled', 'nearing fulfillment', 'misinterpreted'];
		prophecy.fulfillment = statuses[Math.floor(this.dice.random() * statuses.length)];

		// Generate interpretation
		prophecy.interpretation = this.generateInterpretation(prophecy.text);

		// Generate description
		prophecy.description = this.generateDescription(prophecy);

		return prophecy;
	}

	private generateInterpretation(text: string): string {
		const interpretations = [
			'Scholars debate its true meaning',
			'The signs are becoming clearer',
			'Multiple interpretations exist',
			'The meaning remains obscure',
			'Ancient texts shed light on this',
			'Recent events may fulfill this'
		];
		return interpretations[Math.floor(this.dice.random() * interpretations.length)];
	}

	private generateDescription(prophecy: Prophecy): string {
		return `A prophecy from a ${prophecy.source} foretells: "${prophecy.text}". Expected timeframe: ${prophecy.timeframe}. Status: ${prophecy.fulfillment}. ${prophecy.interpretation}.`;
	}
}
