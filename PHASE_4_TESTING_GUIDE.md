# Phase 4: Planet Workflow Integration - Testing Guide

## Overview
This guide provides step-by-step instructions for testing the Planet → Regional Map workflow integration.

## Setup
- Dev server is running on http://localhost:5173/
- Build completed successfully with no errors
- All Phase 4 code has been implemented

## Test Scenario 1: Basic Planetary Hex Expansion

### Prerequisites
1. Open http://localhost:5173/ in your browser
2. Navigate to an existing planet entity OR create a new planet with a world map

### Steps to Test

#### 1. Generate/Open a Planet with World Map
- **Option A**: Use an existing planet entity that has a generated world map
- **Option B**: Create a new planet and generate its world map

#### 2. Open Planet Viewer
- Click on the planet entity to open the PlanetViewer
- Verify that the world map is displayed with hex tiles

#### 3. Select a Hex Tile
- Click on any land-based hex tile on the world map (not ocean)
- Verify that the hex tile info panel appears on the right side
- **Expected Info Panel Contents**:
  - Hex coordinates (x, y)
  - Terrain type
  - Elevation
  - Temperature
  - Dryness
  - Continent ID (if the hex belongs to a continent)

#### 4. Click "Expand to Regional Map" Button
- Locate the green "🔍 Expand to Regional Map" button in the hex info panel
- Click the button
- **Expected Results**:
  - Console logs should show:
    ```
    Created regional map [ID] for planetary hex (x, y)
    - Map size: 50x50 (2500 hexes)
    - Planet type: [earth-like/desert/ice/jungle/volcanic/water/barren]
    ```
  - The application should automatically navigate to the RegionalMapViewer
  - You should see a detailed 50x50 hex map with terrain, features, and resources

#### 5. Verify Regional Map Generation
In the RegionalMapViewer, verify:
- **Map Size**: 50x50 hexes (2,500 total hexes)
- **Terrain Variety**: Mix of terrain types (grass, plains, desert, mountains, etc.) appropriate for the planet type
- **Natural Features**: Rivers, forests, jungles, marshes (depending on terrain)
- **Resources**: Strategic and luxury resources placed throughout the map
- **Yields**: Each hex should show food/production/gold yields

#### 6. Verify Entity Store Persistence
- Open browser DevTools (F12)
- Go to Application → Local Storage
- Check that the following entities were created and saved:
  - **PlanetaryHexTile**: The converted hex tile entity
  - **RegionalMap**: The new regional map entity
  - **RegionalHexTile**: 2,500 hex tile entities (check a sample)

#### 7. Navigate to Parent Continent (if applicable)
- If the selected hex belonged to a continent, click the "Parent Continent" link in the RegionalMapViewer
- Verify that you navigate to the ContinentViewer

#### 8. Verify Regional Map Link in ContinentViewer
In the ContinentViewer, verify:
- A new section titled "Regional Maps (1)" is displayed
- The regional map card shows:
  - **Map icon**: 🗺️
  - **Name**: "Regional Map at (x, y)"
  - **Dimensions**: 50×50
  - **Hexes**: 2500
  - **Simulation Status**: "○ Not initialized" (initially)
- Clicking the regional map card navigates back to the RegionalMapViewer

## Test Scenario 2: Multiple Regional Map Expansion

### Steps to Test

#### 1. Return to Planet Viewer
- Navigate back to the planet entity
- Open the PlanetViewer

#### 2. Expand Additional Hex Tiles
- Select a different hex tile (in a different location)
- Click "Expand to Regional Map" button
- Verify that a new regional map is generated
- Repeat 2-3 more times with different hex tiles

#### 3. Verify Multiple Regional Maps in Continent
- Navigate to a continent that has multiple expanded hex tiles
- In the ContinentViewer, verify:
  - Section title shows correct count: "Regional Maps (3)" (or however many you created)
  - All regional map cards are displayed in a grid
  - Each card shows the correct coordinates and information

#### 4. Test Preventing Duplicate Expansion
- Return to Planet Viewer
- Select a hex tile that you already expanded
- Click "Expand to Regional Map" button
- **Expected Results**:
  - Console should show: "Planetary hex (x, y) already has a regional map: [ID]"
  - Should navigate to the existing regional map (not create a new one)

## Test Scenario 3: Different Planet Types

### Steps to Test

#### 1. Test Different Terrain Types
Expand hex tiles with different characteristics to verify planet type inference:

**Ice Planet** (temperature < 20):
- Select a cold hex tile (temperature < 20)
- Expand to regional map
- Verify: Mostly Snow and Tundra terrain, Ice features

**Desert Planet** (temp > 75, dryness > 70):
- Select a hot, dry hex tile
- Expand to regional map
- Verify: Mostly Desert terrain, occasional Plains, Oasis features

**Jungle Planet** (temp > 70, dryness < 30):
- Select a hot, wet hex tile
- Expand to regional map
- Verify: Mostly Grass terrain, abundant Jungle and Forest features

**Earth-like** (moderate temperature and moisture):
- Select a temperate hex tile
- Expand to regional map
- Verify: Varied terrain (Grass, Plains, Forest, Hills, Mountains)

#### 2. Verify Terrain Consistency
- The regional map terrain should reflect the parent planetary hex characteristics
- Temperature, moisture, and elevation should influence terrain distribution
- Features should match the climate (no jungles on ice planets, no ice on jungle planets)

## Test Scenario 4: Entity References

### Steps to Test

#### 1. Verify Parent References
In the browser DevTools or by inspecting the RegionalMap entity:
- **regionalMap.parentPlanetaryHexId**: Should reference the PlanetaryHexTile ID
- **regionalMap.parentPlanetId**: Should reference the Planet ID
- **regionalMap.parentContinentId**: Should reference the Continent ID (if applicable)

#### 2. Verify Child References
Inspect entities to verify:
- **PlanetaryHexTile.hasRegionalMap**: Should be `true`
- **PlanetaryHexTile.regionalMapId**: Should reference the RegionalMap ID
- **Continent.regionalMapIds[]**: Should contain all RegionalMap IDs created from that continent's hexes

## Test Scenario 5: Error Handling

### Steps to Test

#### 1. Test Ocean Tile Expansion
- Select an ocean hex tile
- Click "Expand to Regional Map"
- **Expected**: Should still work (water worlds can have regional maps)
- Verify: Regional map has mostly Ocean/Coast terrain

#### 2. Test Edge Case Coordinates
- Select hex tiles at the edges of the world map (x=0, y=0, or max coordinates)
- Expand to regional map
- Verify: No errors, maps generate correctly

## Expected Console Output

During successful expansion, you should see console logs like:

```
Created regional map reg-map-abc123 for planetary hex (5, 7)
- Map size: 50x50 (2500 hexes)
- Planet type: earth-like
```

## Success Criteria

✅ **Phase 4 is successful if**:
1. Clicking "Expand to Regional Map" creates a detailed 50x50 regional map
2. Navigation to RegionalMapViewer happens automatically
3. All 2,500+ entities (RegionalMap + RegionalHexTiles) are saved to entity store
4. PlanetaryHexTile is created and linked to the RegionalMap
5. Continent's regionalMapIds array is updated
6. ContinentViewer displays all regional maps in a grid with correct information
7. Clicking a regional map card navigates to that map
8. Duplicate expansion is prevented (returns existing map instead of creating new one)
9. Different planet types generate appropriate terrain distributions
10. All parent/child entity references are correctly set

## Troubleshooting

### If the "Expand to Regional Map" button doesn't appear:
- Check that you've selected a hex tile by clicking on it
- Verify that the hex info panel is visible
- Check browser console for errors

### If regional map doesn't generate:
- Check browser console for errors
- Verify that RegionalMapCreator is working (check network tab)
- Ensure entity store has write permissions

### If navigation doesn't work:
- Check that the 'openEntity' event is being dispatched
- Verify that RegionalMapViewer is registered in the entity viewer system

### If continental links don't show:
- Verify that continent.regionalMapIds array is populated
- Check that PlanetWorkflow.getContinentRegionalMaps() returns results
- Ensure the Section is rendering (check if continentRegionalMaps.length > 0)

## Manual Testing Checklist

- [ ] Basic planetary hex expansion works
- [ ] Regional map displays with 2,500 hexes
- [ ] Terrain types are appropriate for planet type
- [ ] Rivers, features, and resources are generated
- [ ] Multiple expansions create separate regional maps
- [ ] Duplicate expansion prevention works
- [ ] Continent viewer shows regional maps section
- [ ] Regional map cards are clickable and navigate correctly
- [ ] Different planet types generate correct terrain distributions
- [ ] All entity references are correctly set
- [ ] Entity store persistence works
- [ ] Console logs show expected output
- [ ] No errors in browser console

## Next Steps After Testing

Once all tests pass:
1. Commit Phase 4: Planet Workflow Integration
2. Update HIERARCHICAL_HEXMAP_PLAN.md with Phase 4 completion status
3. Move on to Phase 5 (if planned)
