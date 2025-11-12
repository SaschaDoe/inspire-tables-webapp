import { Creator } from '../base/creator';
import { Adventure } from './adventure';
import { BeginningTropeTable } from '$lib/tables/adventureTables/beginningTropeTable';
import { PlotTropeTable } from '$lib/tables/adventureTables/plotTropeTable';
import { AdventureRisingTable } from '$lib/tables/adventureTables/adventureRisingTable';
import { AdventureClimaxTable } from '$lib/tables/adventureTables/adventureClimaxTable';
import { EndingTropeTable } from '$lib/tables/adventureTables/endingTropeTable';

export class AdventureCreator extends Creator<Adventure> {
	create(): Adventure {
		const adventure = new Adventure();

		// Story structure
		adventure.beginning = new BeginningTropeTable().roleWithCascade(this.dice).text;
		adventure.climax = new AdventureClimaxTable().roleWithCascade(this.dice).text;
		adventure.ending = new EndingTropeTable().roleWithCascade(this.dice).text;

		// Generate 2-4 rising action events
		const numRisingActions = this.dice.rollInterval(2, 4);
		for (let i = 0; i < numRisingActions; i++) {
			adventure.risingAction.push(new AdventureRisingTable().roleWithCascade(this.dice).text);
		}

		// Generate 1-3 plot tropes
		const numPlotTropes = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numPlotTropes; i++) {
			adventure.plotTropes.push(new PlotTropeTable().roleWithCascade(this.dice).text);
		}

		// Generate name based on beginning and ending
		adventure.name = this.generateName(adventure);

		// Generate description combining all elements
		adventure.description = this.generateDescription(adventure);

		return adventure;
	}

	private generateName(adventure: Adventure): string {
		const beginningWords = adventure.beginning.split(' ').slice(0, 2).join(' ');
		return `The ${this.capitalize(beginningWords)} Adventure`;
	}

	private generateDescription(adventure: Adventure): string {
		const risingText =
			adventure.risingAction.length > 0
				? ` Along the way, ${adventure.risingAction.join(', then ')}.`
				: '';
		const tropesText =
			adventure.plotTropes.length > 0
				? ` This adventure features ${adventure.plotTropes.join(' and ')}.`
				: '';

		return `${this.capitalize(adventure.beginning)}.${risingText} The climax occurs when ${adventure.climax}. Finally, ${adventure.ending}.${tropesText}`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
