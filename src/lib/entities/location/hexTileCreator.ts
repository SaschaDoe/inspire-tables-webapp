import { Creator } from '../base/creator';
import { HexTile } from './hexTile';
import { LandscapeTable } from '$lib/tables/locationTables/landscapeTable';
import { TerrainFeatureTable } from '$lib/tables/locationTables/terrainFeatureTable';

export class HexTileCreator extends Creator<HexTile> {
	create(): HexTile {
		const hexTile = new HexTile();

		hexTile.terrain = new LandscapeTable().roleWithCascade(this.dice).text;

		// 50% chance of having 1-2 features
		if (this.dice.random() > 0.5) {
			const numFeatures = this.dice.rollInterval(1, 2);
			for (let i = 0; i < numFeatures; i++) {
				const feature = new TerrainFeatureTable().roleWithCascade(this.dice).text;
				if (feature && !hexTile.features.includes(feature)) {
					hexTile.features.push(feature);
				}
			}
		}

		// Random coordinates (can be overridden)
		hexTile.coordinates = {
			q: Math.floor(this.dice.random() * 20) - 10,
			r: Math.floor(this.dice.random() * 20) - 10
		};

		// 30% chance of being discovered
		hexTile.discovered = this.dice.random() > 0.7;

		// Generate description
		hexTile.description = this.generateDescription(hexTile);

		return hexTile;
	}

	private generateDescription(hexTile: HexTile): string {
		const featureText =
			hexTile.features.length > 0
				? ` Notable features: ${hexTile.features.join(', ')}.`
				: ' No notable features.';

		const discoveryText = hexTile.discovered ? ' This area has been explored.' : ' Unexplored.';

		return `${this.capitalize(hexTile.terrain)} terrain at coordinates (${hexTile.coordinates.q}, ${hexTile.coordinates.r}).${featureText}${discoveryText}`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
