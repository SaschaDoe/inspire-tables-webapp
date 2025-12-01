# Hex Tile Refactoring Plan

## Overview

Refactor the hex tile system to properly separate General (overview) and Detailed (simulation) layers, with proper Entity support for simulation integration.

## Current State

| Component | Type | Purpose |
|-----------|------|---------|
| `HexTile` | Entity | Planetary-level hex (layer 1) |
| `RegionalHexData` | Interface | Detailed hex data (layer 2) - NOT an entity |
| `RegionalHexTile` | Entity | Unused legacy entity |

## Target State

| Component | Type | Purpose |
|-----------|------|---------|
| `GeneralHexTile` | Entity | Overview hex (layer 1) - for map navigation |
| `DetailedHexTile` | Entity | Simulation hex (layer 2) - for Unciv simulation |

---

## Phase 1: Entity Renaming & Creation

### 1.1 Rename HexTile → GeneralHexTile
- [ ] Rename `src/lib/entities/location/hexTile.ts` → `generalHexTile.ts`
- [ ] Update class name `HexTile` → `GeneralHexTile`
- [ ] Update all imports across codebase (~50+ files)
- [ ] Update WorldMap to use `GeneralHexTile`

### 1.2 Create DetailedHexTile Entity
- [ ] Create `src/lib/entities/location/detailedHexTile.ts`
- [ ] Based on `RegionalHexData` but as proper Entity
- [ ] Add fields needed for simulation:
  ```typescript
  class DetailedHexTile extends Entity {
    // Position
    globalX: number;        // Global coordinate
    globalY: number;
    localX: number;         // Local within GeneralHexTile
    localY: number;
    parentGeneralHexId: string;  // Reference to parent

    // Terrain (from RegionalHexData)
    terrainType: TerrainType;
    elevation: number;
    feature: string;

    // Rivers
    hasRiver: boolean;
    riverSides: number[];

    // Resources
    strategicResource: StrategicResource;
    luxuryResource: LuxuryResource;
    bonusResource: string;

    // Ownership (for simulation)
    ownerNationId?: string;
    ownerCityId?: string;

    // Yields
    yields: TileYields;

    // Improvements (for simulation)
    improvement?: string;
    improvementProgress: number;

    // Units (references)
    unitIds: string[];

    // Combat
    defensiveBonus: number;
    movementCost: number;
    isImpassable: boolean;
    isCoastal: boolean;
  }
  ```

### 1.3 Update WorldMap Structure
- [ ] Update `WorldMap` class:
  ```typescript
  class WorldMap {
    // General layer (for overview rendering)
    generalHexTiles: GeneralHexTile[][];

    // Detailed layer (for simulation) - flat indexed storage
    detailedHexTiles: Map<string, DetailedHexTile>;  // key: "globalX,globalY"

    // Dimensions
    width: number;   // General hex count
    height: number;
    detailedWidth: number;   // Total detailed hex count
    detailedHeight: number;
    gridSize: number;  // Detailed per General (e.g., 10)
  }
  ```

### 1.4 Remove Legacy Code
- [ ] Remove `RegionalHexData` interface (replaced by DetailedHexTile)
- [ ] Remove or update `RegionalHexTile` entity if unused
- [ ] Clean up `regionalHexes` array from GeneralHexTile

---

## Phase 2: Map Generation Updates

### 2.1 Update WorldMapCreator
- [ ] Generate `GeneralHexTile` entities (renamed from HexTile)
- [ ] Generate `DetailedHexTile` entities for ALL tiles at map creation
- [ ] Store DetailedHexTiles in flat Map structure with global coordinates
- [ ] Maintain parent-child references between General and Detailed tiles

### 2.2 Efficient Storage Strategy
```typescript
// Global coordinate calculation
function getGlobalCoords(generalX: number, generalY: number, localX: number, localY: number, gridSize: number) {
  return {
    globalX: generalX * gridSize + localX,
    globalY: generalY * gridSize + localY
  };
}

// Key for Map storage
function getDetailedHexKey(globalX: number, globalY: number): string {
  return `${globalX},${globalY}`;
}
```

### 2.3 Entity ID Strategy
- Use deterministic IDs for DetailedHexTiles: `detailed-hex-{planetId}-{globalX}-{globalY}`
- This allows recreation without ID conflicts
- Enables efficient lookup

---

## Phase 3: Rendering Optimization

### 3.1 Layer Visibility Optimization
- [ ] Don't render DetailedHexTile layer when zoom < REGIONAL_ZOOM_START
- [ ] Destroy chunk graphics when layer becomes invisible
- [ ] Only create chunks when layer is visible

### 3.2 Viewport Culling (Already Exists)
- Current chunking system already culls non-visible chunks
- Verify chunks are properly destroyed when out of view

### 3.3 Render from Entity Store
- [ ] Update `RegionalHexLayer` → `DetailedHexLayer`
- [ ] Fetch DetailedHexTile entities from WorldMap.detailedHexTiles
- [ ] Use global coordinates for chunk management

### 3.4 Memory Optimization
- [ ] Limit maximum loaded chunks (LRU cache)
- [ ] Configurable chunk buffer size based on device capability

---

## Phase 4: Simulation Integration

### 4.1 Connect SimulationEngine to DetailedHexTiles
- [ ] Update SimulationEngine to work with DetailedHexTile entities
- [ ] Add methods to query tiles by coordinates
- [ ] Add methods to query tiles by owner (nation/city)

### 4.2 Add Simulation Controls to PlanetViewer
- [ ] Add "Start Simulation" button
- [ ] Add simulation speed controls (pause, 1x, 2x, 5x)
- [ ] Add turn counter display
- [ ] Add "Process Turn" button for manual stepping

### 4.3 Simulation State in WorldMap
```typescript
class WorldMap {
  // ... existing fields

  // Simulation state
  simulationEnabled: boolean;
  currentTurn: number;
  nations: Nation[];
  cities: City[];
}
```

### 4.4 UI Components for Simulation
- [ ] Create `SimulationControls.svelte` component
- [ ] Show nation/city overlays on map when simulation active
- [ ] Highlight owned tiles with nation colors
- [ ] Show unit positions

---

## Phase 5: Testing & Cleanup

### 5.1 Update Tests
- [ ] Update all tests using HexTile → GeneralHexTile
- [ ] Add tests for DetailedHexTile entity
- [ ] Add tests for WorldMap tile lookup
- [ ] Add simulation integration tests

### 5.2 Performance Testing
- [ ] Benchmark map generation with full DetailedHexTile entities
- [ ] Benchmark rendering with large maps
- [ ] Memory usage profiling

### 5.3 Cleanup
- [ ] Remove unused imports
- [ ] Remove deprecated code
- [ ] Update documentation

---

## Implementation Order

1. **Phase 1.2**: Create DetailedHexTile entity (new file, no breaking changes)
2. **Phase 1.3**: Update WorldMap to support new structure
3. **Phase 2**: Update WorldMapCreator to generate DetailedHexTiles
4. **Phase 3**: Update rendering layer
5. **Phase 1.1**: Rename HexTile → GeneralHexTile (bulk refactor)
6. **Phase 4**: Simulation integration
7. **Phase 5**: Testing & cleanup

---

## File Changes Summary

### New Files
- `src/lib/entities/location/detailedHexTile.ts`
- `src/lib/components/worldmap/webgl/DetailedHexLayer.ts` (renamed from RegionalHexLayer)
- `src/lib/components/simulation/SimulationControls.svelte`

### Renamed Files
- `hexTile.ts` → `generalHexTile.ts`
- `RegionalHexLayer.ts` → `DetailedHexLayer.ts`

### Modified Files (Major)
- `worldMap.ts` - New structure
- `worldMapCreator.ts` - Generate DetailedHexTiles
- `HexMapRenderer.ts` - Use DetailedHexLayer
- `PlanetViewer.svelte` - Add simulation controls

### Modified Files (Import Updates)
- ~50+ files with HexTile imports

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1 (Entities) | Medium |
| Phase 2 (Generation) | Medium |
| Phase 3 (Rendering) | Small |
| Phase 4 (Simulation) | Large |
| Phase 5 (Testing) | Medium |

Total: Significant refactoring, recommend incremental implementation with testing at each phase.
