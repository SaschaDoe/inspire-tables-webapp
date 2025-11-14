import { Creator } from '../base/creator';
import { Star } from './star';
import { EnumSizeTable } from '$lib/tables/otherTables/enumSizeTable';
import { Size } from '../size';
import { Temperature } from '../temperature';
import { BlackBodyColorTable } from '$lib/tables/otherTables/blackBodyColorTable';
import type { Color } from './ring';

export class StarCreator extends Creator<Star> {
	// Star color mapping by temperature
	private static readonly STAR_COLORS: Record<string, Color> = {
		'blue-white': { r: 155, g: 176, b: 255 },
		white: { r: 248, g: 247, b: 255 },
		'yellow-white': { r: 255, g: 244, b: 234 },
		yellow: { r: 255, g: 237, b: 227 },
		'orange': { r: 255, g: 209, b: 178 },
		'orange-red': { r: 255, g: 204, b: 111 },
		red: { r: 255, g: 159, b: 104 }
	};

	create(): Star {
		const star = new Star();
		this.setParentReference(star); // Set parent ID and generate star ID

		// Generate size
		const sizes: Array<'tiny' | 'small' | 'medium' | 'large' | 'gigantic'> = [
			'tiny',
			'small',
			'medium',
			'large',
			'gigantic'
		];
		star.size = sizes[this.dice.rollInterval(0, sizes.length - 1)];

		// Store legacy enum size
		star.sizeEnum = +new EnumSizeTable().roleWithCascade(this.dice).text;
		star.massEnum = +new EnumSizeTable().roleWithCascade(this.dice).text;

		// Calculate numerical mass and luminosity based on size
		star.mass = this.calculateMass(star.size);
		star.luminosity = this.calculateLuminosity(star.size, star.mass);
		star.surfaceTemperature = this.calculateTemperature(star.mass);

		// Set legacy temperature
		star.temperature = this.getTemperature(star);

		// Get color name and convert to RGB
		const colorName = new BlackBodyColorTable().roleWithCascade(this.dice).text;
		star.color = StarCreator.STAR_COLORS[colorName] || { r: 255, g: 237, b: 227 };

		// Generate name
		star.name = this.generateName(star);

		// Set stage based on properties
		star.stage = this.determineStage(star);

		this.generateDescription(star);
		return star;
	}

	private calculateMass(size: string): number {
		const massMap: Record<string, number> = {
			tiny: 0.1,
			small: 0.5,
			medium: 1.0,
			large: 2.5,
			gigantic: 5.0
		};
		return massMap[size] || 1.0;
	}

	private calculateLuminosity(size: string, mass: number): number {
		// Luminosity roughly scales with mass^3.5 for main sequence stars
		return Math.pow(mass, 3.5);
	}

	private calculateTemperature(mass: number): number {
		// Temperature increases with mass for main sequence stars
		// Sun: 5778K at 1 solar mass
		const baseTempK = 5778;
		return baseTempK * Math.pow(mass, 0.5);
	}

	private determineStage(star: Star): string {
		// Simplified stellar evolution
		if (star.mass > 3.0) {
			return 'young main sequence';
		} else if (star.mass > 1.5) {
			return 'main sequence';
		} else if (star.mass > 0.5) {
			return 'stable main sequence';
		} else {
			return 'red dwarf';
		}
	}

	private generateName(star: Star): string {
		const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
		const suffixes = ['Prime', 'Major', 'Minor', 'Secundus', 'Tertius'];
		const prefix = prefixes[this.dice.rollInterval(0, prefixes.length - 1)];
		const suffix = suffixes[this.dice.rollInterval(0, suffixes.length - 1)];
		return `${prefix} ${suffix}`;
	}

	private getLuminosity(star: Star): Size {
		if (star.massEnum > Size.medium && star.sizeEnum > Size.medium) {
			return Size.huge;
		}
		if (star.massEnum < Size.medium && star.sizeEnum < Size.medium) {
			return Size.tiny;
		}
		return Size.medium;
	}

	private getTemperature(star: Star): Temperature {
		if (star.massEnum > Size.medium && star.sizeEnum > Size.medium) {
			return Temperature.hot;
		}
		if (star.massEnum < Size.medium && star.sizeEnum < Size.medium) {
			return Temperature.cold;
		}
		return Temperature.medium;
	}

	private generateDescription(star: Star): void {
		const tempK = Math.round(star.surfaceTemperature);
		star.description = `${star.name}, a ${star.size} ${star.stage} star with surface temperature of ${tempK}K and ${star.luminosity.toFixed(2)}× solar luminosity.`;
	}
}
