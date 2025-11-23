# Hierarchical Hex Map System - Implementation Plan

## Overview

Transform the current flat hex tile system into a multi-level hierarchical system where each hex tile can contain a zoomed-in sub-map. This enables representing Earth-like structures where:
- **Level 1 (Planetary)**: Continents, oceans, major geographic features
- **Level 2 (Continental/Regional)**: Nations, regions, major cities, rivers, mountain ranges
- **Level 3 (Regional/Local)**: Individual cities, settlements, forests, villages, roads
- **(Potential) Level 4+**: City districts, buildings, etc.

## Current System Analysis

### What We Have

1. **HexTile Entity** (`src/lib/entities/location/hexTile.ts`)
   - Extends Entity (has ID, type, metadata)
   - Grid coordinates (x, y)
   - Terrain properties: terrainType, elevation, temperature, dryness
   - Regional properties: feature, weather, hazards
   - Collections: dungeons[], settlements[], hazards[]
   - Parent reference: parentId (currently to Planet or Region)
   - Continent reference: continentId (numeric)

2. **Continent Entity** (`src/lib/entities/location/continent.ts`)
   - Contains array of HexTile objects
   - Simple properties: size, climate, dominantLandscape, primaryWeather
   - References parent Planet via parentId
   - **Current Issue**: Hex tiles are stored as a flat array, not as entities in the store

3. **Nation Entity** (`src/lib/entities/location/nation.ts`)
   - No spatial/hex tile integration
   - Properties: government, population, technologyLevel, primaryResource
   - **Issue**: Disconnected from hex tile system

4. **Region Entity** (`src/lib/entities/location/region.ts`)
   - No spatial/hex tile integration
   - Properties: landscape, weather, resources[]
   - **Issue**: Disconnected from hex tile system

5. **Settlement Entity** (`src/lib/entities/location/settlement.ts`)
   - Can be referenced in HexTile.settlements[]
   - No own hex map (yet)
   - Properties: size, fame, population, events[]

6. **WorldMapCreator** (`src/lib/entities/location/worldMapCreator.ts`)
   - Generates planetary hex maps using noise algorithms
   - Auto-detects continents using flood-fill
   - Creates Continent entities and stores hex tiles in them
   - **Issue**: Hex tiles not stored as entities in entityStore, only as data in continent

### What's Missing

1. **Hierarchical Structure**
   - No concept of zoom levels
   - No sub-map generation for hex tiles
   - No parent-child hex tile relationships

2. **Spatial Entity Linking**
   - Nations/Regions don't occupy hex tiles
   - Can't visualize nation boundaries on hex maps
   - No way to show "Netherlands + Belgium + Luxembourg = 1 continental hex"

3. **Regional Map Generation**
   - No system to generate detailed hex maps when zooming into a continental hex
   - No creator for regional-level hex tiles

4. **Scale Management**
   - No way to define "this continental hex = 100km, this regional hex = 1km"
   - No coordinate transformation between levels

## Proposed Solution

### Core Concept: Recursive Hex Tiles

Each HexTile can optionally contain a **SubHexMap** - a zoomed-in representation of that tile's area as a new hex grid.

### New Structure

#### 1. Enhanced HexTile Entity

```typescript
export enum HexTileZoomLevel {
	Planetary = 0,      // Planet-wide view (1 hex = ~1000km)
	Continental = 1,    // Continent view (1 hex = ~100km)
	Regional = 2,       // Regional view (1 hex = ~10km)
	Local = 3,          // Local view (1 hex = ~1km)
	District = 4        // District view (1 hex = ~100m) - optional
}

export class HexTile extends Entity {
	// Existing properties...
	x = 0;
	y = 0;
	terrainType: TerrainType;
	elevation = 0;
	temperature = 50;
	dryness = 50;

	// NEW: Hierarchical properties
	zoomLevel: HexTileZoomLevel = HexTileZoomLevel.Planetary;
	scale: number = 1000; // km represented by this hex
	hasSubMap: boolean = false; // Does this hex have a zoomed-in view?
	subMapId?: string; // ID of the SubHexMap entity

	// NEW: Spatial entity occupancy
	nationIds: string[] = []; // Nations that occupy this hex
	regionIds: string[] = []; // Regions that occupy this hex

	// Existing collections
	settlements: Settlement[] = [];
	dungeons: Dungeon[] = [];
	hazards: string[] = [];

	// Parent references
	parentId = ''; // Parent Planet, Continent, or parent HexTile
	parentHexTileId?: string; // If this is a sub-hex, which parent hex contains it
	continentId?: number; // For planetary-level hexes
}
```

#### 2. New SubHexMap Entity

```typescript
export class SubHexMap extends Entity {
	type = EntityType.SubHexMap;

	// Grid properties
	width: number = 50; // Typically larger grid for detail
	height: number = 50;

	// Parent reference
	parentHexTileId: string; // Which hex tile this is a zoom of
	parentZoomLevel: HexTileZoomLevel;

	// Child hexes
	hexTileIds: string[] = []; // IDs of HexTile entities at next zoom level

	// Generation metadata
	seed: number = 0;
	generatedAt: Date = new Date();
}
```

#### 3. Enhanced Nation Entity

```typescript
export class Nation extends Entity {
	name = '';
	description = '';
	adjective = '';
	government = '';
	technologyLevel = '';
	primaryResource = '';
	population = '';

	// NEW: Spatial properties
	capitalSettlementId?: string; // Main city
	hexTileIds: string[] = []; // All hex tiles this nation occupies
	borderHexTileIds: string[] = []; // Border hexes (for display)

	// NEW: National features
	majorCities: string[] = []; // Settlement IDs
	territorialClaims: {
		hexTileId: string;
		claimStrength: number; // 0-100, for contested areas
	}[];
}
```

#### 4. Enhanced Region Entity

```typescript
export class Region extends Entity {
	name = '';
	landscape = '';
	weather = '';
	resources: string[] = [];
	description = '';

	// NEW: Spatial properties
	hexTileIds: string[] = []; // Hex tiles this region covers
	parentNationId?: string; // Which nation it belongs to
	regionalCapital?: string; // Settlement ID

	// NEW: Regional features
	majorFeatures: {
		type: 'river' | 'mountain' | 'forest' | 'lake';
		name: string;
		hexTileIds: string[]; // Path of hexes
	}[];
}
```

### Coordinate System

#### Global Coordinates
Each hex tile at any level has **absolute world coordinates** for its center:
```typescript
interface WorldCoordinates {
	latitude: number;  // -90 to 90
	longitude: number; // -180 to 180
	zoomLevel: HexTileZoomLevel;
}
```

#### Grid Coordinates
Within each sub-map, hexes have local (x, y) coordinates:
```typescript
interface GridCoordinates {
	x: number; // Column
	y: number; // Row
	parentSubMapId?: string; // Which sub-map these coords are relative to
}
```

### Map Generation Flow

#### Level 1: Planetary Map (Current System)
1. **WorldMapCreator.create(planet)**
   - Generates planetary hex grid (existing)
   - Detects continents (existing)
   - **NEW**: Mark major continental hexes for sub-map generation
   - **NEW**: Store hex tiles as entities in entityStore

#### Level 2: Continental/Regional Sub-Maps
2. **SubHexMapCreator.createForHexTile(parentHexTile)**
   - Takes a planetary-level hex tile
   - Generates 50x50 grid of regional hexes
   - Inherits terrain bias from parent (if parent is mountains, sub-map has many mountains)
   - Assigns hex tiles to nations/regions
   - Generates regional features (rivers, mountain ranges)
   - Creates Nation entities with hex tile assignments
   - Creates Region entities with hex tile assignments

#### Level 3: Local Sub-Maps (Future)
3. **SubHexMapCreator.createLocalMap(parentHexTile)**
   - Takes a regional-level hex tile
   - Generates grid showing individual settlements, forests, roads
   - Each hex represents ~1km

### Visualization System

#### ContinentViewer Updates
```svelte
<!-- Current: Shows planetary hexes with continent highlighted -->
<!-- NEW: Make continental hexes clickable to zoom in -->

<polygon
	points={getHexPoints(tile, hexSize)}
	fill={TERRAIN_COLORS[tile.terrainType]}
	stroke={tile.hasSubMap ? '#00ff00' : '#f59e0b'} // Green if zoomable
	onclick={() => handleHexZoom(tile)}
/>

{#if tile.nationIds.length > 0}
	<!-- Show nation boundaries/colors as overlay -->
{/if}
```

#### New RegionalHexMapViewer
```svelte
<script>
	// Shows regional hex map (Level 2)
	// Displays nations as colored regions
	// Shows regional features (rivers, mountains)
	// Each hex can be clicked to zoom to Level 3
</script>
```

### Generation Strategy

#### 1. On-Demand Generation
**Advantages:**
- Fast initial planet creation
- No wasted computation for unexplored areas
- Lower memory usage

**Implementation:**
```typescript
async function handleHexClick(hexTile: HexTile) {
	if (!hexTile.hasSubMap) {
		// Generate sub-map on first click
		const subMapCreator = new SubHexMapCreator();
		const subMap = await subMapCreator.createForHexTile(hexTile);

		// Store in entityStore
		entityStore.createEntity(subMap);

		// Update parent hex
		hexTile.hasSubMap = true;
		hexTile.subMapId = subMap.id;
		entityStore.updateEntity(hexTile.id, hexTile);
	}

	// Navigate to sub-map view
	navigateToSubMap(hexTile.subMapId);
}
```

#### 2. Pre-Generated for Key Areas
For important areas (capitals, major continents), pre-generate sub-maps during world creation.

### Creator Classes to Implement

#### 1. SubHexMapCreator
```typescript
export class SubHexMapCreator {
	createForHexTile(parentHexTile: HexTile): SubHexMap {
		// 1. Create SubHexMap entity
		// 2. Determine grid size based on zoom level
		// 3. Generate hex tiles using noise (biased by parent)
		// 4. Detect nations (like continents, but for nation boundaries)
		// 5. Generate regions within nations
		// 6. Place settlements
		// 7. Create geographic features (rivers, mountains)
		// 8. Store all hex tiles as entities
		// 9. Return SubHexMap
	}
}
```

#### 2. NationBoundaryGenerator
```typescript
export class NationBoundaryGenerator {
	detectNations(hexTiles: HexTile[][]): Nation[] {
		// Similar to ContinentDetector
		// Use Voronoi-like algorithm or noise-based borders
		// Assign hexes to nations
		// Create Nation entities with hex tile IDs
	}
}
```

#### 3. RegionalFeatureGenerator
```typescript
export class RegionalFeatureGenerator {
	generateRiver(startHex: HexTile, hexGrid: HexTile[][]): string[] {
		// Find path from high elevation to ocean
		// Return array of hex tile IDs forming river
	}

	generateMountainRange(hexGrid: HexTile[][]): string[] {
		// Find connected high-elevation hexes
		// Return hex tile IDs
	}
}
```

### Entity Store Integration

#### Store Hex Tiles as Entities
```typescript
// In WorldMapCreator.createContinentEntities()
for (const continentInfo of worldMap.continents) {
	const continent = continentCreator.create();

	// NEW: Store each hex tile as an entity
	const hexTileEntities: HexTile[] = [];
	for (const tile of continentInfo.tiles) {
		// Convert to proper entity
		tile.type = EntityType.HexTile;
		tile.id = `hex-${continent.id}-${tile.x}-${tile.y}`;
		tile.parentId = continent.id;
		tile.continentId = continentInfo.id;
		tile.zoomLevel = HexTileZoomLevel.Planetary;
		tile.scale = this.calculateHexScale(planet.size);

		// Store in entity store
		entityStore.createEntity(tile);
		hexTileEntities.push(tile);
	}

	// Store references in continent
	continent.hexTileIds = hexTileEntities.map(t => t.id);
	continent.hexTiles = []; // Keep for backward compat, or remove
}
```

### Navigation System

#### Breadcrumb Trail
```svelte
<div class="breadcrumb">
	<button onclick={() => goToPlanet()}>🌍 {planet.name}</button>
	{#if currentContinent}
		→ <button onclick={() => goToContinent()}>{continent.name}</button>
	{/if}
	{#if currentRegionalHex}
		→ <button onclick={() => goToRegion()}>Region ({hex.x}, {hex.y})</button>
	{/if}
</div>
```

#### Zoom Stack
```typescript
interface ZoomStack {
	level: HexTileZoomLevel;
	entityId: string; // Planet, Continent, or HexTile ID
	viewState: {
		scale: number;
		panX: number;
		panY: number;
	};
}

let navigationStack: ZoomStack[] = $state([]);

function zoomIn(hexTile: HexTile) {
	// Push current view to stack
	navigationStack.push({
		level: currentZoomLevel,
		entityId: currentEntity.id,
		viewState: { scale, panX, panY }
	});

	// Navigate to sub-map
	loadSubMap(hexTile.subMapId);
}

function zoomOut() {
	const previous = navigationStack.pop();
	if (previous) {
		// Restore previous view
		loadEntity(previous.entityId);
		scale = previous.viewState.scale;
		panX = previous.viewState.panX;
		panY = previous.viewState.panY;
	}
}
```

## Implementation Phases

### Phase 1: Foundation (Core Structure)
1. **Update HexTile entity** with zoom level, scale, sub-map properties
2. **Create SubHexMap entity** and add to EntityType enum
3. **Update EntityViewer** to handle SubHexMap type
4. **Store planetary hex tiles as entities** instead of just in continent array
5. **Add hex tile viewer registration** to viewerRegistry

**Files to Modify:**
- `src/lib/entities/location/hexTile.ts`
- `src/lib/types/entity.ts` (add SubHexMap)
- `src/lib/entities/location/worldMapCreator.ts` (store hexes as entities)
- `src/lib/components/entities/viewerRegistry.ts`

### Phase 2: Sub-Map Generation
1. **Create SubHexMapCreator** class
2. **Implement on-demand generation** (generate when hex clicked)
3. **Add terrain inheritance** (sub-map inherits parent terrain bias)
4. **Test with single hex** → multi-level zoom

**New Files:**
- `src/lib/entities/location/subHexMap.ts`
- `src/lib/entities/location/subHexMapCreator.ts`

### Phase 3: Nation Integration
1. **Update Nation entity** with hexTileIds
2. **Create NationBoundaryGenerator** (detect nations in hex grid)
3. **Update NationCreator** to assign hex tiles
4. **Visual nation boundaries** in hex map viewer

**Files to Modify:**
- `src/lib/entities/location/nation.ts`
- `src/lib/entities/location/nationCreator.ts`

**New Files:**
- `src/lib/utils/nationBoundaryGenerator.ts`

### Phase 4: Region Integration
1. **Update Region entity** with hexTileIds
2. **Create RegionalFeatureGenerator** (rivers, mountain ranges)
3. **Link regions to nations**
4. **Update RegionCreator** to work with hex maps

**Files to Modify:**
- `src/lib/entities/location/region.ts`
- `src/lib/entities/location/regionCreator.ts`

**New Files:**
- `src/lib/utils/regionalFeatureGenerator.ts`

### Phase 5: Visualization
1. **Create RegionalHexMapViewer** component
2. **Add zoom controls** to ContinentViewer
3. **Nation boundary overlay** rendering
4. **Regional feature overlay** (rivers, mountains)
5. **Navigation breadcrumb** system

**New Files:**
- `src/lib/components/entities/viewers/RegionalHexMapViewer.svelte`
- `src/lib/components/maps/HexMapZoomControls.svelte`
- `src/lib/components/maps/NationBoundaryOverlay.svelte`

### Phase 6: Advanced Features
1. **Settlement placement** on regional maps
2. **Road network generation** between settlements
3. **Level 3 local maps** (optional)
4. **Trade route visualization**
5. **Political boundaries animation** (changing over time)

## Data Model Example

### Example: Earth-like Planet

```
Planet: Terra
└─ Planetary HexMap (100x100, 1 hex = 500km)
   ├─ Hex(45, 27) - Ocean
   ├─ Hex(46, 27) - Coastal (has SubHexMap)
   │  └─ SubHexMap (50x50, 1 hex = 10km)
   │     ├─ Hex(0, 0) - Ocean
   │     ├─ Hex(10, 15) - Plains (Nation: Netherlands)
   │     ├─ Hex(11, 15) - Plains (Nation: Netherlands)
   │     ├─ Hex(12, 15) - Plains (Nation: Belgium)
   │     └─ ...
   │        └─ Netherlands (Nation)
   │           ├─ hexTileIds: [sub-hex IDs 10-20]
   │           ├─ regions: [Noord-Holland, Zuid-Holland, ...]
   │           └─ capital: Amsterdam (Settlement)
   └─ Hex(47, 28) - Mountains (Continent: Europe)
```

## Benefits of This System

1. **Scalable Detail**: Only generate detail where needed
2. **Performance**: Don't render 1 million hexes at once
3. **Realistic Geography**: Show how small nations fit in large continents
4. **Narrative Integration**: "The party travels from Amsterdam (local hex) → Netherlands (regional hex) → Europe (continental hex)"
5. **Modular**: Each zoom level is independent
6. **Extensible**: Easy to add Level 4 (city districts), Level 5 (buildings)

## Open Questions

1. **How many zoom levels?** Start with 3 (Planetary, Regional, Local)?
2. **Grid size at each level?** 50x50? 100x100? Varies by level?
3. **Pre-generate or on-demand?** Hybrid approach?
4. **Nation generation algorithm?** Voronoi? Noise-based? User-drawn?
5. **How to handle hex tile entities in store?** Too many entities? Use separate HexTileStore?

## Migration Strategy

### Backward Compatibility
1. Keep existing `continent.hexTiles[]` array initially
2. Gradually migrate to `continent.hexTileIds[]` with entity references
3. Add feature flag: `useHierarchicalHexMaps`
4. Run old and new systems in parallel during transition

### Data Migration Script
```typescript
async function migrateHexTilesToEntities() {
	const continents = entityStore.getEntitiesByType('continent');

	for (const continent of continents) {
		// Convert hex tiles to entities
		for (const tile of continent.hexTiles) {
			tile.id = `hex-${continent.id}-${tile.x}-${tile.y}`;
			tile.type = EntityType.HexTile;
			tile.parentId = continent.id;
			tile.zoomLevel = HexTileZoomLevel.Planetary;

			entityStore.createEntity(tile);
		}

		// Update continent with references
		continent.hexTileIds = continent.hexTiles.map(t => t.id);
		entityStore.updateEntity(continent.id, continent);
	}
}
```

## Next Steps

1. **Review this plan** - Discuss scope, priorities, technical decisions
2. **Decide on Phase 1 approach** - Start with foundation?
3. **Prototype SubHexMap generation** - Test performance, UX
4. **Design nation boundary algorithm** - How should nations be generated?
5. **Implement progressively** - One phase at a time

---

**This is a living document - update as we refine the design!**
