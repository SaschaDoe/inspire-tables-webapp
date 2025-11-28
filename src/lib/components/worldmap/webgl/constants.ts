import { TerrainType } from '$lib/entities/location/terrainType';

// Hex sizes
export const PLANETARY_HEX_SIZE = 20; // Base size for planetary hexes
export const REGIONAL_GRID_SIZE = 10; // 10x10 regional hexes per planetary hex

// Zoom thresholds
export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 20.0; // Allow zooming in much closer
export const REGIONAL_ZOOM_START = 1.6; // Start showing regional hexes
export const REGIONAL_ZOOM_FULL = 2.4; // Full regional view

// Chunk settings for regional layer
export const CHUNK_SIZE = 3; // 3x3 planetary hexes per chunk
export const CHUNK_BUFFER = 1; // Load 1 chunk beyond viewport

// Colors (as hex numbers for PixiJS)
export const TERRAIN_COLORS_HEX: Record<TerrainType, number> = {
	[TerrainType.Water]: 0x2563eb,
	[TerrainType.Ocean]: 0x1e40af, // Darker blue for deep ocean
	[TerrainType.Coast]: 0x3b82f6, // Lighter blue for coastal waters
	[TerrainType.Grass]: 0x22c55e,
	[TerrainType.Hills]: 0x84cc16,
	[TerrainType.Mountain]: 0x6b7280,
	[TerrainType.Desert]: 0xd97706,
	[TerrainType.Snow]: 0xf3f4f6,
	[TerrainType.Tundra]: 0xcbd5e1,
	[TerrainType.Jungle]: 0x15803d,
	[TerrainType.Plains]: 0xbef264,
	[TerrainType.GrassHills]: 0x65a30d,
	[TerrainType.SaltLake]: 0xa5f3fc,
	[TerrainType.IceFloe]: 0xe0f2fe,
	[TerrainType.JungleHills]: 0x166534,
	[TerrainType.HighMountain]: 0x374151,
	[TerrainType.SnowMountain]: 0xf9fafb,
	[TerrainType.Lava]: 0xdc2626,
	[TerrainType.AshPlains]: 0x52525b,
	[TerrainType.AshHills]: 0x3f3f46
};

// Feature colors
export const FEATURE_COLORS: Record<string, number> = {
	Forest: 0x228b22,
	Jungle: 0x006400,
	Marsh: 0x4a6741,
	Ice: 0xe0f2fe
};

// UI colors
export const SELECTION_COLOR = 0xf59e0b;
export const HOVER_COLOR = 0xa855f7;
export const STROKE_COLOR = 0x000000;
export const BACKGROUND_COLOR = 0x1e293b;
