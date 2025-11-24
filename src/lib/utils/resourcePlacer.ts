import type { RegionalHexTile } from '$lib/entities/location/regionalHexTile';
import { TerrainType } from '$lib/entities/location/terrainType';
import { StrategicResource, LuxuryResource } from '$lib/entities/location/regionalHexTile';

/**
 * Bonus resources (food/production bonuses, not tradeable)
 */
const BONUS_RESOURCES = [
	'Wheat',
	'Cattle',
	'Deer',
	'Fish',
	'Stone',
	'Sheep',
	'Bananas',
	'Bison'
] as const;

/**
 * Resource placement rule - defines where a resource can spawn
 */
interface ResourceRule {
	resource: string;
	type: 'strategic' | 'luxury' | 'bonus';
	validTerrain: TerrainType[];
	validFeatures?: string[]; // If specified, must have one of these features
	excludeFeatures?: string[]; // Cannot have these features
	planetConstraint?: (planetType: string) => boolean; // Planet-specific rules
	rarity: number; // 0-1, higher = more common
}

/**
 * ResourcePlacer - Places Civilization 5-style resources on regional maps
 *
 * Resources in Civ 5:
 * - **Strategic**: Iron, Horses, Coal, Oil, Aluminum, Uranium (needed for units/buildings)
 * - **Luxury**: Gold, Gems, Spices, Wine, etc. (provide happiness, tradeable)
 * - **Bonus**: Wheat, Cattle, Fish, etc. (provide extra yields, not tradeable)
 *
 * Distribution rules:
 * - Strategic: ~1 per 200-300 hexes (rare but essential)
 * - Luxury: ~1 per 100-150 hexes (important for happiness)
 * - Bonus: ~1 per 20-30 hexes (common, improve yields)
 * - Resources respect terrain and climate (no spices on ice planets, no furs in deserts)
 * - Clustered placement (resources tend to appear in groups)
 *
 * Usage:
 * ```typescript
 * ResourcePlacer.placeResources(regionalHexTiles, width, height, planetType, seed);
 * ```
 */
export class ResourcePlacer {
	// Resource density constants
	private static readonly STRATEGIC_DENSITY = 250; // 1 per N hexes
	private static readonly LUXURY_DENSITY = 125; // 1 per N hexes
	private static readonly BONUS_DENSITY = 25; // 1 per N hexes

	// Clustering constants
	private static readonly CLUSTER_CHANCE = 0.4; // 40% chance of additional resource nearby
	private static readonly CLUSTER_RADIUS = 2; // Max distance for clustered resources

	/**
	 * Place all resources on a regional map
	 */
	static placeResources(
		tiles: RegionalHexTile[],
		width: number,
		height: number,
		planetType: string,
		seed: number
	): void {
		// Simple seeded random number generator
		let rng = seed;
		const random = () => {
			rng = (rng * 9301 + 49297) % 233280;
			return rng / 233280;
		};

		// Filter rules by planet type
		const strategicRules = this.getStrategicRules().filter(
			r => !r.planetConstraint || r.planetConstraint(planetType)
		);
		const luxuryRules = this.getLuxuryRules().filter(
			r => !r.planetConstraint || r.planetConstraint(planetType)
		);
		const bonusRules = this.getBonusRules().filter(
			r => !r.planetConstraint || r.planetConstraint(planetType)
		);

		// Place strategic resources
		this.placeResourceType(
			tiles,
			width,
			height,
			strategicRules,
			this.STRATEGIC_DENSITY,
			random
		);

		// Place luxury resources
		this.placeResourceType(tiles, width, height, luxuryRules, this.LUXURY_DENSITY, random);

		// Place bonus resources
		this.placeResourceType(tiles, width, height, bonusRules, this.BONUS_DENSITY, random);
	}

	/**
	 * Place a specific type of resource across the map
	 */
	private static placeResourceType(
		tiles: RegionalHexTile[],
		width: number,
		height: number,
		rules: ResourceRule[],
		density: number,
		random: () => number
	): void {
		const targetCount = Math.floor(tiles.length / density);
		const placedTiles = new Set<string>(); // Track tiles that already have resources

		for (let i = 0; i < targetCount; i++) {
			// Pick a random resource from available rules (weighted by rarity)
			const rule = this.pickWeightedRandom(rules, random);
			if (!rule) continue;

			// Find valid placement locations
			const validTiles = tiles.filter(
				tile =>
					!placedTiles.has(`${tile.x},${tile.y}`) &&
					this.canPlaceResource(tile, rule) &&
					this.noResourceOnTile(tile)
			);

			if (validTiles.length === 0) continue;

			// Pick random valid tile
			const randomIndex = Math.floor(random() * validTiles.length);
			const tile = validTiles[randomIndex];

			// Place resource
			this.applyResource(tile, rule);
			placedTiles.add(`${tile.x},${tile.y}`);

			// Maybe place clustered resources nearby
			if (random() < this.CLUSTER_CHANCE) {
				this.placeCluster(
					tiles,
					width,
					height,
					tile,
					rule,
					placedTiles,
					random
				);
			}
		}
	}

	/**
	 * Place a cluster of the same resource type near a tile
	 */
	private static placeCluster(
		tiles: RegionalHexTile[],
		width: number,
		height: number,
		centerTile: RegionalHexTile,
		rule: ResourceRule,
		placedTiles: Set<string>,
		random: () => number
	): void {
		// Get nearby tiles within cluster radius
		const nearbyTiles = this.getTilesInRadius(
			centerTile.x,
			centerTile.y,
			this.CLUSTER_RADIUS,
			tiles,
			width,
			height
		);

		// Filter valid tiles
		const validNearby = nearbyTiles.filter(
			tile =>
				!placedTiles.has(`${tile.x},${tile.y}`) &&
				this.canPlaceResource(tile, rule) &&
				this.noResourceOnTile(tile)
		);

		if (validNearby.length === 0) return;

		// Place 1-2 more resources nearby
		const clusterSize = Math.floor(random() * 2) + 1;
		for (let i = 0; i < clusterSize && i < validNearby.length; i++) {
			const randomIndex = Math.floor(random() * validNearby.length);
			const tile = validNearby[randomIndex];

			this.applyResource(tile, rule);
			placedTiles.add(`${tile.x},${tile.y}`);

			// Remove from valid list
			validNearby.splice(randomIndex, 1);
		}
	}

	/**
	 * Check if a resource can be placed on a tile
	 */
	private static canPlaceResource(tile: RegionalHexTile, rule: ResourceRule): boolean {
		// Check terrain
		if (!rule.validTerrain.includes(tile.terrainType)) {
			return false;
		}

		// Check feature requirements
		if (rule.validFeatures && rule.validFeatures.length > 0) {
			if (!rule.validFeatures.includes(tile.feature)) {
				return false;
			}
		}

		// Check feature exclusions
		if (rule.excludeFeatures && rule.excludeFeatures.length > 0) {
			if (rule.excludeFeatures.includes(tile.feature)) {
				return false;
			}
		}

		// Can't place on impassable tiles
		if (tile.isImpassable) {
			return false;
		}

		return true;
	}

	/**
	 * Check if tile has no resources yet
	 */
	private static noResourceOnTile(tile: RegionalHexTile): boolean {
		return (
			tile.strategicResource === StrategicResource.None &&
			tile.luxuryResource === LuxuryResource.None &&
			!tile.bonusResource
		);
	}

	/**
	 * Apply a resource to a tile
	 */
	private static applyResource(tile: RegionalHexTile, rule: ResourceRule): void {
		if (rule.type === 'strategic') {
			tile.strategicResource = rule.resource as StrategicResource;
		} else if (rule.type === 'luxury') {
			tile.luxuryResource = rule.resource as LuxuryResource;
		} else if (rule.type === 'bonus') {
			tile.bonusResource = rule.resource;
		}
	}

	/**
	 * Get all tiles within a radius
	 */
	private static getTilesInRadius(
		centerX: number,
		centerY: number,
		radius: number,
		tiles: RegionalHexTile[],
		width: number,
		height: number
	): RegionalHexTile[] {
		const result: RegionalHexTile[] = [];

		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				const x = centerX + dx;
				const y = centerY + dy;

				// Check bounds
				if (x < 0 || x >= width || y < 0 || y >= height) continue;

				// Check distance (hex distance)
				if (Math.abs(dx) + Math.abs(dy) + Math.abs(dx + dy) > radius * 2) continue;

				const tile = this.getTileAt(tiles, x, y, width);
				if (tile && tile !== tiles[centerY * width + centerX]) {
					result.push(tile);
				}
			}
		}

		return result;
	}

	/**
	 * Pick a random item from array weighted by rarity
	 */
	private static pickWeightedRandom(
		rules: ResourceRule[],
		random: () => number
	): ResourceRule | null {
		if (rules.length === 0) return null;

		const totalWeight = rules.reduce((sum, r) => sum + r.rarity, 0);
		let randomValue = random() * totalWeight;

		for (const rule of rules) {
			randomValue -= rule.rarity;
			if (randomValue <= 0) {
				return rule;
			}
		}

		return rules[rules.length - 1];
	}

	/**
	 * Get tile at coordinates
	 */
	private static getTileAt(
		tiles: RegionalHexTile[],
		x: number,
		y: number,
		width: number
	): RegionalHexTile | undefined {
		const index = y * width + x;
		return tiles[index];
	}

	/**
	 * Define strategic resource placement rules
	 */
	private static getStrategicRules(): ResourceRule[] {
		return [
			{
				resource: StrategicResource.Iron,
				type: 'strategic',
				validTerrain: [TerrainType.Hills, TerrainType.Grass, TerrainType.Plains, TerrainType.Tundra],
				rarity: 1.0
			},
			{
				resource: StrategicResource.Horses,
				type: 'strategic',
				validTerrain: [TerrainType.Grass, TerrainType.Plains],
				excludeFeatures: ['Forest', 'Jungle', 'Marsh'],
				rarity: 1.0
			},
			{
				resource: StrategicResource.Coal,
				type: 'strategic',
				validTerrain: [TerrainType.Hills, TerrainType.Grass, TerrainType.Plains],
				rarity: 0.8
			},
			{
				resource: StrategicResource.Oil,
				type: 'strategic',
				validTerrain: [TerrainType.Desert, TerrainType.Tundra, TerrainType.Snow, TerrainType.Coast, TerrainType.Ocean],
				rarity: 0.8
			},
			{
				resource: StrategicResource.Aluminum,
				type: 'strategic',
				validTerrain: [TerrainType.Hills, TerrainType.Desert, TerrainType.Tundra],
				rarity: 0.7
			},
			{
				resource: StrategicResource.Uranium,
				type: 'strategic',
				validTerrain: [TerrainType.Grass, TerrainType.Plains, TerrainType.Desert, TerrainType.Tundra, TerrainType.Hills, TerrainType.Mountain],
				rarity: 0.5 // Rarest strategic resource
			}
		];
	}

	/**
	 * Define luxury resource placement rules
	 */
	private static getLuxuryRules(): ResourceRule[] {
		return [
			{
				resource: LuxuryResource.Gold,
				type: 'luxury',
				validTerrain: [TerrainType.Desert, TerrainType.Hills, TerrainType.Plains],
				rarity: 0.8
			},
			{
				resource: LuxuryResource.Silver,
				type: 'luxury',
				validTerrain: [TerrainType.Hills, TerrainType.Tundra, TerrainType.Desert],
				rarity: 0.9
			},
			{
				resource: LuxuryResource.Gems,
				type: 'luxury',
				validTerrain: [TerrainType.Hills, TerrainType.Mountain],
				validFeatures: ['Forest', 'Jungle', ''],
				rarity: 0.7
			},
			{
				resource: LuxuryResource.Pearls,
				type: 'luxury',
				validTerrain: [TerrainType.Coast],
				planetConstraint: (p) => p !== 'ice' && p !== 'desert',
				rarity: 0.8
			},
			{
				resource: LuxuryResource.Silk,
				type: 'luxury',
				validTerrain: [TerrainType.Grass],
				validFeatures: ['Forest'],
				planetConstraint: (p) => p === 'earth-like' || p === 'jungle',
				rarity: 0.7
			},
			{
				resource: LuxuryResource.Spices,
				type: 'luxury',
				validTerrain: [TerrainType.Grass],
				validFeatures: ['Jungle'],
				planetConstraint: (p) => p === 'earth-like' || p === 'jungle',
				rarity: 0.8
			},
			{
				resource: LuxuryResource.Dyes,
				type: 'luxury',
				validTerrain: [TerrainType.Grass, TerrainType.Plains],
				validFeatures: ['Forest', 'Jungle'],
				planetConstraint: (p) => p === 'earth-like' || p === 'jungle',
				rarity: 0.8
			},
			{
				resource: LuxuryResource.Incense,
				type: 'luxury',
				validTerrain: [TerrainType.Desert, TerrainType.Plains],
				rarity: 0.7
			},
			{
				resource: LuxuryResource.Wine,
				type: 'luxury',
				validTerrain: [TerrainType.Grass, TerrainType.Plains],
				excludeFeatures: ['Jungle', 'Marsh'],
				planetConstraint: (p) => p === 'earth-like',
				rarity: 0.8
			},
			{
				resource: LuxuryResource.Cotton,
				type: 'luxury',
				validTerrain: [TerrainType.Grass, TerrainType.Plains],
				planetConstraint: (p) => p === 'earth-like' || p === 'jungle',
				rarity: 0.9
			},
			{
				resource: LuxuryResource.Furs,
				type: 'luxury',
				validTerrain: [TerrainType.Tundra, TerrainType.Snow],
				validFeatures: ['Forest'],
				planetConstraint: (p) => p === 'earth-like' || p === 'ice',
				rarity: 0.8
			},
			{
				resource: LuxuryResource.Ivory,
				type: 'luxury',
				validTerrain: [TerrainType.Plains],
				planetConstraint: (p) => p === 'earth-like',
				rarity: 0.6
			}
		];
	}

	/**
	 * Define bonus resource placement rules
	 */
	private static getBonusRules(): ResourceRule[] {
		return [
			{
				resource: 'Wheat',
				type: 'bonus',
				validTerrain: [TerrainType.Plains],
				excludeFeatures: ['Forest', 'Jungle', 'Marsh'],
				rarity: 1.2
			},
			{
				resource: 'Cattle',
				type: 'bonus',
				validTerrain: [TerrainType.Grass],
				excludeFeatures: ['Forest', 'Jungle', 'Marsh'],
				rarity: 1.0
			},
			{
				resource: 'Deer',
				type: 'bonus',
				validTerrain: [TerrainType.Grass, TerrainType.Tundra, TerrainType.Plains],
				validFeatures: ['Forest'],
				rarity: 1.0
			},
			{
				resource: 'Fish',
				type: 'bonus',
				validTerrain: [TerrainType.Coast, TerrainType.Ocean],
				planetConstraint: (p) => p !== 'ice',
				rarity: 1.5
			},
			{
				resource: 'Stone',
				type: 'bonus',
				validTerrain: [TerrainType.Grass, TerrainType.Plains, TerrainType.Hills, TerrainType.Desert, TerrainType.Tundra],
				rarity: 0.8
			},
			{
				resource: 'Sheep',
				type: 'bonus',
				validTerrain: [TerrainType.Hills, TerrainType.Grass, TerrainType.Plains],
				excludeFeatures: ['Forest', 'Jungle'],
				rarity: 0.9
			},
			{
				resource: 'Bananas',
				type: 'bonus',
				validTerrain: [TerrainType.Grass],
				validFeatures: ['Jungle'],
				planetConstraint: (p) => p === 'earth-like' || p === 'jungle',
				rarity: 1.0
			},
			{
				resource: 'Bison',
				type: 'bonus',
				validTerrain: [TerrainType.Plains],
				excludeFeatures: ['Forest', 'Jungle'],
				planetConstraint: (p) => p === 'earth-like',
				rarity: 0.7
			}
		];
	}
}
