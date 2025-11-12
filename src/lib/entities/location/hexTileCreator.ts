import { Creator } from '../base/creator';
import { HexTile } from './hexTile';
import { HexTypeTable } from '$lib/tables/locationTables/hexTypeTable';
import { HexFeatureTable } from '$lib/tables/locationTables/hexFeatureTable';
import { HexTileHazardTable } from '$lib/tables/locationTables/hexTileHazardTable';
import { WeatherTable } from '$lib/tables/otherTables/weatherTable';
import { DungeonCreator } from '../dungeon/dungeonCreator';
import { SettlementCreator } from './settlementCreator';

export class HexTileCreator extends Creator<HexTile> {
	private techLevel = '';

	create(): HexTile {
		const hexTile = new HexTile();

		// Set tech level
		hexTile.techLevel = this.techLevel;

		// Set type, feature, and weather
		hexTile.type = new HexTypeTable().roleWithCascade(this.dice).text;
		hexTile.feature = new HexFeatureTable().roleWithCascade(this.dice).text;
		hexTile.weather = new WeatherTable().roleWithCascade(this.dice).text;

		// Add hazards (0-2 hazards)
		const numberOfHazards = this.dice.rollInterval(1, 3) - 1; // 0-2
		for (let i = 0; i < numberOfHazards; i++) {
			hexTile.hazards.push(new HexTileHazardTable().roleWithCascade(this.dice).text);
		}

		// Random 3D coordinates (can be overridden)
		hexTile.coordinates = {
			x: Math.floor(this.dice.random() * 20) - 10,
			y: Math.floor(this.dice.random() * 20) - 10,
			z: Math.floor(this.dice.random() * 20) - 10
		};

		// 30% chance of being discovered
		hexTile.discovered = this.dice.random() > 0.7;

		// Small chance of dungeon (10%)
		if (this.dice.random() > 0.9) {
			const dungeonCreator = new DungeonCreator();
			dungeonCreator.dice = this.dice;
			hexTile.dungeons.push(dungeonCreator.create());
		}

		// Small chance of settlement (15%)
		if (this.dice.random() > 0.85) {
			const settlementCreator = new SettlementCreator();
			settlementCreator.dice = this.dice;
			hexTile.settlements.push(settlementCreator.create());
		}

		// Generate description
		hexTile.description = this.generateDescription(hexTile);

		return hexTile;
	}

	withTechLevel(techLevel: string): this {
		this.techLevel = techLevel;
		return this;
	}

	private generateDescription(hexTile: HexTile): string {
		const parts: string[] = [];

		parts.push(
			`${this.capitalize(hexTile.type)} hex with ${hexTile.feature} at (${hexTile.coordinates.x}, ${hexTile.coordinates.y}, ${hexTile.coordinates.z})`
		);

		if (hexTile.weather) {
			parts.push(`Weather: ${hexTile.weather}`);
		}

		if (hexTile.hazards.length > 0) {
			parts.push(`Hazards: ${hexTile.hazards.join(', ')}`);
		}

		if (hexTile.dungeons.length > 0) {
			parts.push(
				`Contains ${hexTile.dungeons.length} dungeon${hexTile.dungeons.length > 1 ? 's' : ''}`
			);
		}

		if (hexTile.settlements.length > 0) {
			parts.push(
				`Contains ${hexTile.settlements.length} settlement${hexTile.settlements.length > 1 ? 's' : ''}`
			);
		}

		if (hexTile.techLevel) {
			parts.push(`Tech level: ${hexTile.techLevel}`);
		}

		const discoveryText = hexTile.discovered ? 'Explored' : 'Unexplored';
		parts.push(discoveryText);

		return parts.join('. ') + '.';
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
