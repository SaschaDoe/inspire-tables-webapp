import { TerrainType } from '$lib/entities/location/terrainType';
import { StrategicResource, LuxuryResource } from '$lib/entities/location/regionalHexTile';

/**
 * AssetLoader - Manages loading of Civ 5/Unciv graphics assets
 *
 * Provides utilities for:
 * - Loading terrain tile images
 * - Loading resource icons
 * - Loading feature overlays
 * - Loading river sprites
 * - Checking if assets are available
 * - Falling back to colored polygons if assets missing
 *
 * Usage:
 * ```typescript
 * const terrainPath = AssetLoader.getTerrainAsset(TerrainType.Grassland);
 * const resourcePath = AssetLoader.getResourceAsset(StrategicResource.Iron);
 * const hasAssets = await AssetLoader.checkAssetsAvailable();
 * ```
 */

const ASSET_BASE_PATH = '/civ5-assets';

// Cache for checking asset availability
let assetsAvailable: boolean | null = null;
const loadedAssets = new Set<string>();
const failedAssets = new Set<string>();

/**
 * Terrain type to filename mapping
 */
const TERRAIN_FILE_MAP: Record<TerrainType, string> = {
	[TerrainType.Grass]: 'Grassland.png',
	[TerrainType.Plains]: 'Plains.png',
	[TerrainType.Desert]: 'Desert.png',
	[TerrainType.Tundra]: 'Tundra.png',
	[TerrainType.Snow]: 'Snow.png',
	[TerrainType.Ocean]: 'Ocean.png',
	[TerrainType.Coast]: 'Coast.png',
	[TerrainType.Mountain]: 'Mountain.png',
	[TerrainType.Hills]: 'Hill.png',
	[TerrainType.Forest]: 'Forest.png',
	[TerrainType.Jungle]: 'Jungle.png',
	[TerrainType.Swamp]: 'Marsh.png',
	[TerrainType.Lake]: 'Coast.png', // Reuse Coast
	[TerrainType.Marsh]: 'Marsh.png',
	[TerrainType.Lava]: 'Desert.png', // Fallback to Desert
	[TerrainType.AshPlains]: 'Desert.png', // Fallback
	[TerrainType.IceFloe]: 'Ice.png',
	[TerrainType.SaltLake]: 'Coast.png', // Fallback
	[TerrainType.Volcanic]: 'Mountain.png' // Fallback
};

/**
 * Resource type to filename mapping
 */
const RESOURCE_FILE_MAP: Record<string, string> = {
	// Strategic
	[StrategicResource.Iron]: 'Iron.png',
	[StrategicResource.Horses]: 'Horses.png',
	[StrategicResource.Coal]: 'Coal.png',
	[StrategicResource.Oil]: 'Oil.png',
	[StrategicResource.Aluminum]: 'Aluminum.png',
	[StrategicResource.Uranium]: 'Uranium.png',

	// Luxury
	[LuxuryResource.Gold]: 'Gold.png',
	[LuxuryResource.Silver]: 'Silver.png',
	[LuxuryResource.Gems]: 'Gems.png',
	[LuxuryResource.Pearls]: 'Pearls.png',
	[LuxuryResource.Silk]: 'Silk.png',
	[LuxuryResource.Spices]: 'Spices.png',
	[LuxuryResource.Dyes]: 'Dyes.png',
	[LuxuryResource.Incense]: 'Incense.png',
	[LuxuryResource.Wine]: 'Wine.png',
	[LuxuryResource.Cotton]: 'Cotton.png',
	[LuxuryResource.Furs]: 'Furs.png',
	[LuxuryResource.Ivory]: 'Ivory.png',

	// Bonus (capitalized names)
	'Wheat': 'Wheat.png',
	'Cattle': 'Cattle.png',
	'Deer': 'Deer.png',
	'Fish': 'Fish.png',
	'Stone': 'Stone.png',
	'Sheep': 'Sheep.png',
	'Bananas': 'Bananas.png',
	'Bison': 'Bison.png'
};

/**
 * Feature name to filename mapping
 */
const FEATURE_FILE_MAP: Record<string, string> = {
	'Forest': 'Forest.png',
	'Jungle': 'Jungle.png',
	'Marsh': 'Marsh.png',
	'Ice': 'Ice.png',
	'Oasis': 'Oasis.png',
	'Fallout': 'Fallout.png'
};

/**
 * River hex side to filename mapping (0-5)
 * Hex sides in axial coordinates (pointy-top):
 * 0: East, 1: SE, 2: SW, 3: West, 4: NW, 5: NE
 */
const RIVER_FILE_MAP: Record<number, string> = {
	0: 'River-BottomRight.png', // East
	1: 'River-Bottom.png', // SE
	2: 'River-BottomLeft.png', // SW
	3: 'River-TopLeft.png', // West
	4: 'River-Top.png', // NW
	5: 'River-TopRight.png' // NE
};

export class AssetLoader {
	/**
	 * Get the path to a terrain asset
	 */
	static getTerrainAsset(terrainType: TerrainType): string | null {
		const filename = TERRAIN_FILE_MAP[terrainType];
		if (!filename) return null;
		return `${ASSET_BASE_PATH}/terrain/${filename}`;
	}

	/**
	 * Get the path to a resource asset
	 */
	static getResourceAsset(resource: StrategicResource | LuxuryResource | string): string | null {
		const filename = RESOURCE_FILE_MAP[resource];
		if (!filename) return null;
		return `${ASSET_BASE_PATH}/resources/${filename}`;
	}

	/**
	 * Get the path to a feature overlay asset
	 */
	static getFeatureAsset(feature: string): string | null {
		const filename = FEATURE_FILE_MAP[feature];
		if (!filename) return null;
		return `${ASSET_BASE_PATH}/features/${filename}`;
	}

	/**
	 * Get the path to a river sprite asset
	 */
	static getRiverAsset(hexSide: number): string | null {
		const filename = RIVER_FILE_MAP[hexSide];
		if (!filename) return null;
		return `${ASSET_BASE_PATH}/rivers/${filename}`;
	}

	/**
	 * Check if an asset exists by attempting to load it
	 */
	static async checkAssetExists(path: string): Promise<boolean> {
		// Check cache first
		if (loadedAssets.has(path)) return true;
		if (failedAssets.has(path)) return false;

		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				loadedAssets.add(path);
				resolve(true);
			};
			img.onerror = () => {
				failedAssets.add(path);
				resolve(false);
			};
			img.src = path;
		});
	}

	/**
	 * Check if Unciv graphics assets are available
	 * Tests a sample of critical assets
	 */
	static async checkAssetsAvailable(): Promise<boolean> {
		// Return cached result if available
		if (assetsAvailable !== null) {
			return assetsAvailable;
		}

		// Test a few critical assets
		const testAssets = [
			this.getTerrainAsset(TerrainType.Grass),
			this.getResourceAsset(StrategicResource.Iron),
			this.getFeatureAsset('Forest'),
			this.getRiverAsset(0)
		];

		const results = await Promise.all(
			testAssets.map(path => path ? this.checkAssetExists(path) : Promise.resolve(false))
		);

		// Consider assets available if at least 50% of test assets load
		const successRate = results.filter(r => r).length / results.length;
		assetsAvailable = successRate >= 0.5;

		return assetsAvailable;
	}

	/**
	 * Preload an asset
	 */
	static preloadAsset(path: string): Promise<void> {
		if (loadedAssets.has(path)) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				loadedAssets.add(path);
				resolve();
			};
			img.onerror = () => {
				failedAssets.add(path);
				reject(new Error(`Failed to load asset: ${path}`));
			};
			img.src = path;
		});
	}

	/**
	 * Preload multiple assets in parallel
	 */
	static async preloadAssets(paths: (string | null)[]): Promise<void> {
		const validPaths = paths.filter(p => p !== null) as string[];
		const promises = validPaths.map(path => this.preloadAsset(path).catch(() => {
			// Silently ignore failed preloads
		}));
		await Promise.all(promises);
	}

	/**
	 * Clear the asset cache (for testing or reloading)
	 */
	static clearCache(): void {
		loadedAssets.clear();
		failedAssets.clear();
		assetsAvailable = null;
	}

	/**
	 * Get asset load statistics
	 */
	static getStats(): { loaded: number; failed: number; total: number } {
		const loaded = loadedAssets.size;
		const failed = failedAssets.size;
		const total = loaded + failed;
		return { loaded, failed, total };
	}
}
