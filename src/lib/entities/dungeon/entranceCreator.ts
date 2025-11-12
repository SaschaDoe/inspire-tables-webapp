import { Creator } from '../base/creator';
import { Entrance } from './entrance';
import { EntranceTypeTable } from '$lib/tables/dungeonTables/entranceTypeTable';
import { EntranceAdjectiveTable } from '$lib/tables/dungeonTables/entranceAdjectiveTable';
import { TrapCreator } from './trapCreator';

export class EntranceCreator extends Creator<Entrance> {
	create(): Entrance {
		const entrance = new Entrance();

		// Generate entrance details
		entrance.type = new EntranceTypeTable().roleWithCascade(this.dice).text;
		entrance.adjective = new EntranceAdjectiveTable().roleWithCascade(this.dice).text;

		// Generate 0-2 traps (1d3 - 1)
		const numTraps = this.dice.rollInterval(1, 3) - 1;
		for (let i = 0; i < numTraps; i++) {
			entrance.traps.push(new TrapCreator().withDice(this.dice).create());
		}

		// Generate name and description
		entrance.name = this.generateName(entrance);
		entrance.description = this.generateDescription(entrance);

		return entrance;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateName(entrance: Entrance): string {
		return `${this.capitalize(entrance.adjective)} ${this.capitalize(entrance.type)}`;
	}

	private generateDescription(entrance: Entrance): string {
		let desc = `A ${entrance.adjective} ${entrance.type} serves as an entrance to the dungeon. `;

		if (entrance.traps.length > 0) {
			desc += `The entrance is protected by ${entrance.traps.length} trap${entrance.traps.length > 1 ? 's' : ''}. `;
		} else {
			desc += `The entrance appears unguarded and safe. `;
		}

		return desc;
	}

	/**
	 * Creates multiple entrances (1-6)
	 */
	createMany(): Entrance[] {
		const numberOfEntrances = this.dice.rollInterval(1, 6);
		const entrances: Entrance[] = [];
		for (let i = 0; i < numberOfEntrances; i++) {
			entrances.push(this.create());
		}
		return entrances;
	}
}
