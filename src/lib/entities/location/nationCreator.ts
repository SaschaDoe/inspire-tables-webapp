import { Creator } from '../base/creator';
import { Nation } from './nation';
import { NationNameTable } from '$lib/tables/locationTables/nationNameTable';
import { NationAdjectiveTable } from '$lib/tables/locationTables/nationAdjectiveTable';
import { TechnologyTable } from '$lib/tables/otherTables/technologyTable';
import { LandscapeTable } from '$lib/tables/locationTables/landscapeTable';
import { BasicResourceTable } from '$lib/tables/otherTables/basicResourceTable';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { TerrainType } from './terrainType';

export class NationCreator extends Creator<Nation> {
	/**
	 * Create RPG-mode nation (manual creation for RPG content)
	 * Sets isSimulationGenerated = false and uses simple narrative properties
	 */
	create(): Nation {
		const nation = new Nation();

		// Set mode flag
		nation.isSimulationGenerated = false;

		// Generate basic nation details
		nation.name = new NationNameTable().roleWithCascade(this.dice).text;
		nation.adjective = new NationAdjectiveTable().roleWithCascade(this.dice).text;

		// RPG-mode properties
		nation.technologyLevel = new TechnologyTable().roleWithCascade(this.dice).text;
		nation.landscape = new LandscapeTable().roleWithCascade(this.dice).text;
		nation.primaryResource = new BasicResourceTable().roleWithCascade(this.dice).text;
		nation.populationSize = new SizeTable().roleWithCascade(this.dice).text;
		nation.government = this.generateGovernment();

		// Set preferred terrain types based on landscape
		nation.preferredTerrainTypes = this.landscapeToTerrainTypes(nation.landscape || 'plains');

		// Generate description
		nation.description = this.generateDescription(nation);

		return nation;
	}

	/**
	 * Convert landscape string to terrain type array for settler placement
	 */
	private landscapeToTerrainTypes(landscape: string): TerrainType[] {
		const lowerLandscape = landscape.toLowerCase();

		if (lowerLandscape.includes('desert') || lowerLandscape.includes('arid')) {
			return [TerrainType.Desert, TerrainType.Plains];
		}
		if (lowerLandscape.includes('mountain')) {
			return [TerrainType.Hills, TerrainType.GrassHills, TerrainType.Mountain];
		}
		if (lowerLandscape.includes('forest') || lowerLandscape.includes('wood')) {
			return [TerrainType.Grass, TerrainType.GrassHills];
		}
		if (lowerLandscape.includes('jungle') || lowerLandscape.includes('tropical')) {
			return [TerrainType.Jungle, TerrainType.JungleHills];
		}
		if (lowerLandscape.includes('tundra') || lowerLandscape.includes('cold') || lowerLandscape.includes('arctic')) {
			return [TerrainType.Tundra, TerrainType.Snow];
		}
		if (lowerLandscape.includes('coast') || lowerLandscape.includes('sea') || lowerLandscape.includes('ocean')) {
			return [TerrainType.Coast, TerrainType.Grass, TerrainType.Plains];
		}
		if (lowerLandscape.includes('plain') || lowerLandscape.includes('grassland')) {
			return [TerrainType.Plains, TerrainType.Grass];
		}
		if (lowerLandscape.includes('hill')) {
			return [TerrainType.Hills, TerrainType.GrassHills];
		}

		// Default: fertile lands
		return [TerrainType.Grass, TerrainType.Plains, TerrainType.GrassHills];
	}

	/**
	 * Create simulation-mode nation for placement on a planet
	 * Sets isSimulationGenerated = true and initializes all simulation mechanics
	 */
	static createForSimulation(params: {
		name: string;
		adjective?: string;
		race?: string;
		foundingYear?: number;
		leaderName: string;
		leaderTitle?: string;
		governmentType?: string;
		parentPlanetId: string;
		preferredTerrainTypes?: TerrainType[];
		cultureTraits?: Partial<import('./nation').CultureTraits>;
	}): Nation {
		const nation = new Nation();

		// Set mode flag
		nation.isSimulationGenerated = true;

		// Basic properties
		nation.name = params.name;
		nation.adjective = params.adjective || `${params.name}ian`;
		nation.race = params.race || 'Human';
		nation.foundingYear = params.foundingYear || 0;

		// Leadership
		nation.leaderName = params.leaderName;
		nation.leaderTitle = params.leaderTitle || 'Chief';
		nation.governmentType = params.governmentType || 'Tribal';

		// Parent reference
		nation.parentPlanetId = params.parentPlanetId;

		// Preferred terrain for starting position
		if (params.preferredTerrainTypes) {
			nation.preferredTerrainTypes = params.preferredTerrainTypes;
		}

		// Culture traits
		if (params.cultureTraits) {
			nation.cultureTraits = { ...nation.cultureTraits, ...params.cultureTraits };
		}

		// Initialize with starting resources
		nation.resources.gold = 50;
		nation.yields.gold = 2;

		return nation;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateGovernment(): string {
		const governments = [
			'monarchy',
			'republic',
			'theocracy',
			'oligarchy',
			'democracy',
			'dictatorship',
			'feudal system',
			'magocracy',
			'tribal council',
			'empire',
			'confederation',
			'anarchy'
		];
		const index = this.dice.rollInterval(0, governments.length - 1);
		return governments[index];
	}

	private generateDescription(nation: Nation): string {
		let desc = `${nation.name} is a${this.startsWithVowel(nation.adjective) ? 'n' : ''} ${nation.adjective} nation `;
		desc += `governed by a ${nation.government}. `;

		desc += `The land is characterized by ${nation.landscape}, `;
		desc += `and the population is ${nation.populationSize}. `;

		desc += `The nation's technology level is ${nation.technologyLevel}, `;
		desc += `and their primary resource is ${nation.primaryResource}.`;

		return desc;
	}

	private startsWithVowel(text: string): boolean {
		if (!text) return false;
		return /^[aeiou]/i.test(text);
	}
}
