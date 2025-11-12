import { Creator } from '../base/creator';
import { Star } from './star';
import { EnumSizeTable } from '$lib/tables/otherTables/enumSizeTable';
import { Size } from '../size';
import { Temperature } from '../temperature';
import { BlackBodyColorTable } from '$lib/tables/otherTables/blackBodyColorTable';

export class StarCreator extends Creator<Star> {
	create(): Star {
		const star = new Star();
		star.size = +new EnumSizeTable().roleWithCascade(this.dice).text;
		star.mass = +new EnumSizeTable().roleWithCascade(this.dice).text;
		star.luminosity = this.getLuminosity(star);
		star.temperature = this.getTemperature(star);
		star.color = new BlackBodyColorTable().roleWithCascade(this.dice).text;
		this.generateDescription(star);
		return star;
	}

	private getLuminosity(star: Star): Size {
		if (star.mass > Size.medium && star.size > Size.medium) {
			return Size.huge;
		}
		if (star.mass < Size.medium && star.size < Size.medium) {
			return Size.tiny;
		}
		return Size.medium;
	}

	private getTemperature(star: Star): Temperature {
		if (star.mass > Size.medium && star.size > Size.medium) {
			return Temperature.hot;
		}
		if (star.mass < Size.medium && star.size < Size.medium) {
			return Temperature.cold;
		}
		return Temperature.medium;
	}

	private generateDescription(star: Star): void {
		const sizeNames = ['tiny', 'small', 'medium', 'large', 'huge'];
		const tempNames = ['cold', 'medium', 'hot'];
		star.description = `A ${sizeNames[star.size]} ${star.color} star with ${tempNames[star.temperature]} temperature and ${sizeNames[star.luminosity]} luminosity.`;
	}
}
