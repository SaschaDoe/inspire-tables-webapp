import { Creator } from '../base/creator';
import { Event } from './event';
import { EventTypeTable } from '$lib/tables/otherTables/eventTypeTable';
import { LocationTable } from '$lib/tables/otherTables/locationTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { HistoricalEventTable } from '$lib/tables/otherTables/historicalEventTable';

export class EventCreator extends Creator<Event> {
	create(): Event {
		const event = new Event();

		event.type = new EventTypeTable().roleWithCascade(this.dice).text;
		event.location = new LocationTable().roleWithCascade(this.dice).text;
		event.impact = new SizeTable().roleWithCascade(this.dice).text;

		// Generate 1-3 consequences
		const numConsequences = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numConsequences; i++) {
			event.consequences.push(new HistoricalEventTable().roleWithCascade(this.dice).text);
		}

		// Generate name
		event.name = this.generateName(event);

		// Generate description
		event.description = this.generateDescription(event);

		return event;
	}

	private generateName(event: Event): string {
		return `The ${this.capitalize(event.type)} of ${this.capitalize(event.location)}`;
	}

	private generateDescription(event: Event): string {
		const consequenceText =
			event.consequences.length > 0
				? ` This led to ${event.consequences.join(', then ')}.`
				: '';

		return `A ${event.impact} ${event.type} that occurred at ${event.location}.${consequenceText}`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
