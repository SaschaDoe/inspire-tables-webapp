import { Creator } from '../base/creator';
import { WeatherEvent } from './weatherEvent';
import { WeatherTable } from '$lib/tables/otherTables/weatherTable';
import { WeatherAdjectiveTable } from '$lib/tables/otherTables/weatherAdjectiveTable';
import { LocationTable } from '$lib/tables/otherTables/locationTable';

export class WeatherEventCreator extends Creator<WeatherEvent> {
	create(): WeatherEvent {
		const event = new WeatherEvent();

		// Generate weather event details
		event.type = this.generateEventType();
		event.weather = new WeatherTable().roleWithCascade(this.dice).text;
		event.adjective = new WeatherAdjectiveTable().roleWithCascade(this.dice).text;
		event.severity = this.generateSeverity();
		event.duration = this.generateDuration();
		event.location = new LocationTable().roleWithCascade(this.dice).text;

		// Generate name
		event.name = this.generateEventName(event);

		// Generate 1-4 effects
		const effectCount = this.dice.rollInterval(1, 4);
		for (let i = 0; i < effectCount; i++) {
			const effect = this.generateEffect();
			if (!event.effects.includes(effect)) {
				event.effects.push(effect);
			}
		}

		// Generate description
		event.description = this.generateDescription(event);

		return event;
	}

	private generateEventType(): string {
		const types = [
			'storm',
			'blizzard',
			'drought',
			'flood',
			'heatwave',
			'cold snap',
			'fog',
			'windstorm',
			'tornado',
			'hurricane',
			'monsoon',
			'dust storm',
			'ice storm',
			'hailstorm',
			'magical weather',
			'aurora',
			'meteor shower',
			'eclipse'
		];
		const index = this.dice.rollInterval(0, types.length - 1);
		return types[index];
	}

	private generateSeverity(): string {
		const severities = ['minor', 'moderate', 'severe', 'catastrophic', 'apocalyptic'];
		const index = this.dice.rollInterval(0, severities.length - 1);
		return severities[index];
	}

	private generateDuration(): string {
		const durations = [
			'a few minutes',
			'an hour',
			'several hours',
			'a day',
			'several days',
			'a week',
			'several weeks',
			'a month',
			'a season',
			'ongoing'
		];
		const index = this.dice.rollInterval(0, durations.length - 1);
		return durations[index];
	}

	private generateEffect(): string {
		const effects = [
			'crop damage',
			'flooding',
			'building damage',
			'travel disruption',
			'visibility reduced',
			'temperature extremes',
			'power outages',
			'wildlife displacement',
			'disease outbreak',
			'famine risk',
			'trade disruption',
			'communication failure',
			'magical disturbances',
			'injuries',
			'deaths',
			'property destruction',
			'water contamination',
			'land erosion',
			'forest fires',
			'avalanches'
		];
		const index = this.dice.rollInterval(0, effects.length - 1);
		return effects[index];
	}

	private generateEventName(event: WeatherEvent): string {
		const article = ['a', 'e', 'i', 'o', 'u'].includes(event.adjective.charAt(0).toLowerCase())
			? 'An'
			: 'A';
		return `${article} ${this.capitalize(event.adjective)} ${this.capitalize(event.type)}`;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateDescription(event: WeatherEvent): string {
		let desc = `${event.name} has struck ${event.location}. `;
		desc += `This ${event.severity} weather event is expected to last ${event.duration}. `;

		if (event.effects.length > 0) {
			desc += `The primary effects include: ${event.effects.join(', ')}. `;
		}

		desc += `The current conditions are ${event.adjective} with ${event.weather}.`;

		return desc;
	}
}
