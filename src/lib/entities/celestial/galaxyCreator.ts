import { Creator } from '../base/creator';
import { Galaxy } from './galaxy';
import { GalaxyNameTable } from '$lib/tables/celestialTables/galaxyNameTable';
import { SizeTable, Sizes } from '$lib/tables/otherTables/sizeTable';
import { SolarSystemCreator } from './solarSystemCreator';
import { GalaxyTypeTable, GalaxyTypes } from '$lib/tables/locationTables/galaxyTables/galaxyTypeTable';
import { SpiralGalaxyImagesTable } from '$lib/tables/locationTables/galaxyTables/spiralGalaxyImagesTable';
import { EclipticGalaxyImagesTable } from '$lib/tables/locationTables/galaxyTables/eclipticGalaxyImagesTable';
import { OtherGalaxyImagesTable } from '$lib/tables/locationTables/galaxyTables/otherGalaxyImagesTable';
import { AgeTable } from '$lib/tables/otherTables/ageTable';

// CSS Colors for galaxy color extraction
const CssColors = [
	'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet',
	'black', 'white', 'purple', 'gray', 'pink', 'teal', 'cyan',
	'magenta', 'aquamarine', 'silver', 'beige', 'brown'
];

export class GalaxyCreator extends Creator<Galaxy> {
	// Nested entity requirements
	static readonly NESTED_ENTITY_RULES = {
		solarSystems: {
			min: 1,
			max: undefined, // No maximum
			entityType: 'solarSystem' as const,
			displayName: 'Solar System'
		}
	};

	create(): Galaxy {
		const galaxy = new Galaxy();

		// Roll galaxy type
		galaxy.type = new GalaxyTypeTable().roleWithCascade(this.dice).text;

		// Generate name, ensuring it doesn't contain other galaxy types
		const otherTypes = GalaxyTypes.filter((type) => type !== galaxy.type);
		do {
			galaxy.name = new GalaxyNameTable().roleWithCascade(this.dice).text;
		} while (otherTypes.some((type) => galaxy.name.includes(type)));

		// Select image based on type
		galaxy.imagePath = '/galaxies/';
		if (galaxy.type === 'spiral') {
			galaxy.imagePath += new SpiralGalaxyImagesTable().roleWithCascade(this.dice).text;
		} else if (galaxy.type === 'ecliptic') {
			galaxy.imagePath += new EclipticGalaxyImagesTable().roleWithCascade(this.dice).text;
		} else {
			galaxy.imagePath += new OtherGalaxyImagesTable().roleWithCascade(this.dice).text;
		}

		// Extract or generate color
		galaxy.color = this.getColorFrom(galaxy.name);
		if (galaxy.color === 'black') {
			const randomNumber = this.dice.rollInterval(0, 1);
			if (randomNumber === 0) {
				galaxy.imagePath = '/galaxies/stars.png';
			} else {
				galaxy.imagePath = '/galaxies/starsDarker.png';
			}
			galaxy.color = 'transparent';
		}

		// Generate rotation velocity (150-300 km/s)
		galaxy.rotationVelocity = this.dice.rollInterval(150, 300);

		// Get size from name if present, otherwise roll
		const sizeFromName = this.getSizeFromName(galaxy.name);
		if (sizeFromName === '') {
			galaxy.size = new SizeTable().roleWithCascade(this.dice).text;
		} else {
			galaxy.size = sizeFromName;
		}

		// Calculate size in lightyears
		galaxy.sizeInLightyears = this.getSizeInLightyears(galaxy.size);

		// Generate mass
		galaxy.mass = new SizeTable().roleWithCascade(this.dice).text;
		galaxy.massInSolarMasses = this.getSizeInSolarMasses(galaxy.mass);

		// 10% chance for active galactic nucleus
		galaxy.hasActiveGalacticNucleus = this.dice.rollInterval(1, 100) > 90;

		// Generate age
		galaxy.age = new AgeTable().roleWithCascade(this.dice).text;
		galaxy.ageInYears = this.getAgeInYears(galaxy.age);

		// Initialize anomalies
		galaxy.anomalies = [];
		galaxy.isAlreadyScannedForAnomalies = false;

		// Create at least one solar system
		const solarSystemCreator = new SolarSystemCreator();
		solarSystemCreator.dice = this.dice;
		const solarSystem = solarSystemCreator.withParent(galaxy.id).create();
		galaxy.solarSystems.push(solarSystem);

		this.generateDescription(galaxy);
		return galaxy;
	}

	private generateDescription(galaxy: Galaxy): void {
		const systemText =
			galaxy.solarSystems.length === 1
				? '1 solar system'
				: `${galaxy.solarSystems.length} solar systems`;
		galaxy.description = `${galaxy.name}, a ${galaxy.size} ${galaxy.type} galaxy containing ${systemText}.`;
	}

	private getColorFrom(name: string): string {
		const words = name.split(' ');

		for (const color of CssColors) {
			for (const word of words) {
				if (word === color) {
					return color;
				}
			}
		}
		return 'transparent';
	}

	private getSizeInLightyears(size: string): number {
		switch (size) {
			case 'tiny':
				return this.dice.rollInterval(1000, 7000);
			case 'small':
				return this.dice.rollInterval(7000, 10000);
			case 'medium':
				return this.dice.rollInterval(10000, 100000);
			case 'large':
				return this.dice.rollInterval(100000, 1000000);
			case 'gigantic':
				return this.dice.rollInterval(1000000, 10000000);
			default:
				return 0;
		}
	}

	private getSizeInSolarMasses(mass: string): string {
		const firstNumber = this.dice.rollInterval(1, 100);
		let secondNumber = 0;

		switch (mass) {
			case 'tiny':
				secondNumber = 9;
				break;
			case 'small':
				secondNumber = 10;
				break;
			case 'medium':
				secondNumber = 11;
				break;
			case 'large':
				secondNumber = 12;
				break;
			case 'gigantic':
				secondNumber = 13;
				break;
		}

		return `${firstNumber}x10^${secondNumber}`;
	}

	private getAgeInYears(age: string): number {
		let ageInMillionYears = 0;

		switch (age) {
			case 'just-created':
				ageInMillionYears = this.dice.rollInterval(1, 400);
				break;
			case 'young':
			case 'juvenile':
				ageInMillionYears = this.dice.rollInterval(400, 1000);
				break;
			case 'middle-aged':
			case 'mature':
				ageInMillionYears = this.dice.rollInterval(1000, 10000);
				break;
			case 'old':
				ageInMillionYears = this.dice.rollInterval(10000, 14000);
				break;
			case 'ancient':
				ageInMillionYears = this.dice.rollInterval(14000, 15000);
				break;
		}

		return ageInMillionYears;
	}

	private getSizeFromName(name: string): string {
		const words = name.split(' ');

		for (const size of Sizes) {
			for (const word of words) {
				if (word === size) {
					return size;
				}
			}
		}
		return '';
	}
}
