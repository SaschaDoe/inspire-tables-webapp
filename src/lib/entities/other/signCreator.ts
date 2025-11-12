import { Creator } from '../base/creator';
import { Sign } from './sign';
import { SignSymbolTable } from '$lib/tables/otherTables/signSymbolTable';
import { SignMeaningTable } from '$lib/tables/otherTables/signMeaningTable';
import { SignFormTable } from '$lib/tables/otherTables/signFormTable';
import { ColourTable } from '$lib/tables/otherTables/colourTable';

export class SignCreator extends Creator<Sign> {
	create(): Sign {
		const sign = new Sign();

		// Generate symbol, meaning, and form
		sign.symbol = new SignSymbolTable().roleWithCascade(this.dice).text;
		sign.meaning = new SignMeaningTable().roleWithCascade(this.dice).text;
		sign.form = new SignFormTable().roleWithCascade(this.dice).text;

		// Generate 1-3 colors
		const numColors = this.dice.rollInterval(1, 3);
		for (let i = 0; i < numColors; i++) {
			const color = new ColourTable().roleWithCascade(this.dice).text;
			// Avoid duplicate colors
			if (!sign.colors.includes(color)) {
				sign.colors.push(color);
			}
		}

		// Ensure at least one color
		if (sign.colors.length === 0) {
			sign.colors.push(new ColourTable().roleWithCascade(this.dice).text);
		}

		// Generate name and description
		sign.name = this.generateName(sign);
		sign.description = this.generateDescription(sign);

		return sign;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateName(sign: Sign): string {
		return `The ${this.capitalize(sign.symbol)}`;
	}

	private generateDescription(sign: Sign): string {
		let desc = `A heraldic sign featuring a ${sign.symbol}, ${sign.form}. `;

		const colorList = this.formatColorList(sign.colors);
		desc += `The design uses ${colorList} colors. `;

		desc += `This symbol ${sign.meaning}.`;

		return desc;
	}

	private formatColorList(colors: string[]): string {
		if (colors.length === 1) return colors[0];
		if (colors.length === 2) return `${colors[0]} and ${colors[1]}`;
		const last = colors[colors.length - 1];
		const rest = colors.slice(0, -1).join(', ');
		return `${rest}, and ${last}`;
	}
}
