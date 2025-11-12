import { Creator } from '../base/creator';
import { Treasure } from './treasure';
import { HiddenDescriptionTable } from '$lib/tables/dungeonTables/hiddenDescriptionTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { TreasureContentTable } from '$lib/tables/dungeonTables/treasureContentTable';

export class TreasureCreator extends Creator<Treasure> {
	create(): Treasure {
		const treasure = new Treasure();

		// 50% chance of being hidden
		treasure.isHidden = this.dice.random() > 0.5;

		// If hidden, generate hiding method
		if (treasure.isHidden) {
			treasure.hiddenDescription = new HiddenDescriptionTable().roleWithCascade(this.dice).text;
		}

		// Generate quantity and content
		treasure.quantity = new SizeTable().roleWithCascade(this.dice).text;
		treasure.content = new TreasureContentTable().roleWithCascade(this.dice).text;

		// Generate name and description
		treasure.name = this.generateName(treasure);
		treasure.description = this.generateDescription(treasure);

		return treasure;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateName(treasure: Treasure): string {
		const size = this.capitalize(treasure.quantity);
		const content = this.capitalize(treasure.content);
		return `${size} ${content}`;
	}

	private generateDescription(treasure: Treasure): string {
		let desc = `A ${treasure.quantity} cache of ${treasure.content}. `;

		if (treasure.isHidden) {
			desc += `The treasure is ${treasure.hiddenDescription}. `;
		} else {
			desc += `The treasure is left in the open, unprotected. `;
		}

		return desc;
	}
}
