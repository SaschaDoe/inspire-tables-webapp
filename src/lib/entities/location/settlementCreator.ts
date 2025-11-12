import { Creator } from '../base/creator';
import { Settlement } from './settlement';
import { TownSizeTable } from '$lib/tables/townTables/townSizeTable';
import { TownFameTable } from '$lib/tables/townTables/townFameTable';
import { TownEventTable } from '$lib/tables/townTables/townEventTable';

export class SettlementCreator extends Creator<Settlement> {
	create(): Settlement {
		const settlement = new Settlement();

		settlement.size = new TownSizeTable().roleWithCascade(this.dice).text;
		settlement.fame = new TownFameTable().roleWithCascade(this.dice).text;

		// Generate 1-3 recent events
		const numEvents = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numEvents; i++) {
			settlement.events.push(new TownEventTable().roleWithCascade(this.dice).text);
		}

		// Calculate population based on size
		settlement.population = this.calculatePopulation(settlement.size);

		// Generate name
		settlement.name = this.generateName(settlement);

		// Generate description
		settlement.description = this.generateDescription(settlement);

		return settlement;
	}

	private calculatePopulation(size: string): number {
		// Rough population estimates based on size
		const populations: Record<string, [number, number]> = {
			hamlet: [20, 100],
			village: [100, 1000],
			town: [1000, 5000],
			'large town': [5000, 20000],
			city: [20000, 100000],
			'large city': [100000, 500000],
			metropolis: [500000, 2000000]
		};

		const range = populations[size.toLowerCase()] || [100, 1000];
		return this.dice.rollInterval(range[0], range[1]);
	}

	private generateName(settlement: Settlement): string {
		// Simple name generation based on size
		const prefixes = ['North', 'South', 'East', 'West', 'New', 'Old'];
		const suffixes = ['haven', 'port', 'ford', 'ton', 'shire', 'dale', 'wick', 'stead'];

		const usePrefix = this.dice.random() > 0.5;
		const prefix = usePrefix
			? prefixes[Math.floor(this.dice.random() * prefixes.length)]
			: '';
		const suffix = suffixes[Math.floor(this.dice.random() * suffixes.length)];

		return usePrefix ? `${prefix}${suffix}` : this.capitalize(suffix);
	}

	private generateDescription(settlement: Settlement): string {
		const eventText =
			settlement.events.length > 0
				? ` Recent events: ${settlement.events.join(', ')}.`
				: '';

		return `A ${settlement.size} known for ${settlement.fame}. Population: approximately ${settlement.population}.${eventText}`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
