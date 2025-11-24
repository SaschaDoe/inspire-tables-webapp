# Regional Map Visualization - Usage Guide

## Phase 2.5 Implementation (Phase A - Basic Colored Hexes)

This document explains how to visualize the generated regional maps with the new `RegionalMapViewer` component.

---

## ✅ What's Implemented (Phase A)

**RegionalMapViewer Component** - Full visualization of 50x50 regional hex maps with:
- ✅ Color-coded terrain hexes (Grassland, Desert, Snow, Ocean, etc.)
- ✅ River rendering (blue lines on hex edges)
- ✅ Resource labels (text showing Iron, Wheat, Gold, etc.)
- ✅ Feature indicators (F=Forest, J=Jungle, M=Marsh)
- ✅ Zoom/pan controls (mouse drag, scroll wheel, +/- buttons)
- ✅ Hex selection (click to see details)
- ✅ Terrain statistics (distribution bars)
- ✅ Resource counters (strategic, luxury, bonus, rivers)

---

## How to Generate and View a Regional Map

### Step 1: Generate a Regional Map

```typescript
import { RegionalMapCreator } from '$lib/entities/location/regionalMapCreator';
import { PlanetaryHexTile } from '$lib/entities/location/planetaryHexTile';
import { entityStore } from '$lib/stores/entityStore';

// Create or get a planetary hex tile
const planetaryHex = new PlanetaryHexTile();
planetaryHex.x = 10;
planetaryHex.y = 15;
planetaryHex.parentPlanetId = 'some-planet-id';
planetaryHex.elevation = 5;
planetaryHex.temperature = 60; // Temperate
planetaryHex.dryness = 40; // Moderate moisture

// Generate the regional map
const regionalMap = RegionalMapCreator.create(
	planetaryHex,
	'earth-like', // Planet type: earth-like, ice, desert, jungle, water, volcanic, barren
	12345 // Random seed for consistent generation
);

// Save to entity store (so the viewer can load tiles)
entityStore.setEntity(regionalMap.id, regionalMap);

// Also save all the generated hex tiles
const allTiles = regionalMap.hexTileIds.map(id =>
	entityStore.getEntity(id)
);
```

### Step 2: Display with RegionalMapViewer

```svelte
<script>
	import RegionalMapViewer from '$lib/components/entities/viewers/RegionalMapViewer.svelte';
	import { entityStore } from '$lib/stores/entityStore';

	// Get the regional map from the store
	const regionalMap = entityStore.getEntity('your-regional-map-id');
</script>

<RegionalMapViewer {regionalMap} />
```

---

## Terrain Colors Reference

The viewer uses Civ 5-style terrain colors:

| Terrain Type | Color | Hex Code |
|-------------|-------|----------|
| Ocean | Dark Blue | `#1e40af` |
| Coast | Blue | `#3b82f6` |
| Grassland | Green | `#22c55e` |
| Plains | Yellow | `#fbbf24` |
| Desert | Orange | `#f59e0b` |
| Tundra | Light Gray | `#cbd5e1` |
| Snow | White | `#f8fafc` |
| Mountain | Brown | `#78716c` |
| Hills | Dark Yellow | `#a16207` |
| Forest | Dark Green | `#15803d` |
| Jungle | Very Dark Green | `#166534` |
| Lava | Red | `#dc2626` |
| Ash Plains | Gray | `#6b7280` |

---

## Features and Overlays

**Rivers**:
- Rendered as bright blue lines (`#60a5fa`) on hex edges
- Uses the `riverSides` array (0-5 for each hex edge)
- Semi-transparent for better visibility

**Resources**:
- **Strategic**: Iron, Horses, Coal, Oil, Aluminum, Uranium
- **Luxury**: Gold, Gems, Spices, Wine, Silk, Furs, Pearls, etc.
- **Bonus**: Wheat, Cattle, Fish, Deer, Stone, Sheep, Bananas
- Displayed as yellow text labels in the center of resource hexes

**Features**:
- Displayed as single-letter indicators:
  - **F** = Forest
  - **J** = Jungle
  - **M** = Marsh
  - **I** = Ice
  - **O** = Oasis
- White text with shadow for readability

---

## Interaction Controls

| Action | Control |
|--------|---------|
| **Pan** | Click and drag with mouse |
| **Zoom In** | Click **+** button OR scroll wheel up |
| **Zoom Out** | Click **−** button OR scroll wheel down |
| **Reset View** | Click **⟲** button |
| **Select Hex** | Click on any hex tile |
| **View Hex Details** | Click hex → details panel appears below map |
| **Close Details** | Click **✕** in details panel header |

---

## Testing Different Planet Types

You can test all 7 planet types to see how terrain generation varies:

```typescript
// Ice Planet - mostly snow/tundra
const iceMap = RegionalMapCreator.create(planetaryHex, 'ice', 1001);

// Desert Planet - mostly desert with some plains
const desertMap = RegionalMapCreator.create(planetaryHex, 'desert', 1002);

// Water Planet - mostly ocean with small islands
const waterMap = RegionalMapCreator.create(planetaryHex, 'water', 1003);

// Jungle Planet - dense grass with jungle features
const jungleMap = RegionalMapCreator.create(planetaryHex, 'jungle', 1004);

// Earth-like - full terrain variety
const earthMap = RegionalMapCreator.create(planetaryHex, 'earth-like', 1005);

// Volcanic - mountains, lava, ash
const volcanicMap = RegionalMapCreator.create(planetaryHex, 'volcanic', 1006);

// Barren - desert/snow, minimal resources
const barrenMap = RegionalMapCreator.create(planetaryHex, 'barren', 1007);
```

---

## What's Next (Phase B - Unciv Graphics)

Future enhancements will add real Civ 5/Unciv graphics:

1. **Terrain Textures** - Replace solid colors with pixel art tiles
2. **Resource Icons** - Replace text labels with proper icons (Iron ore, Wheat sheaves, etc.)
3. **Feature Sprites** - Replace letter indicators with tree/jungle sprites
4. **River Sprites** - Enhanced river graphics with proper flow visualization
5. **Hex Borders** - Nation border visualization (for Phase 3)
6. **Unit Icons** - When units are added in Phase 3
7. **City Icons** - When cities are founded in Phase 3

For now, the colored hex visualization allows you to immediately see and debug map generation!

---

## Example Output

When you open a regional map in the viewer, you'll see:

**Header Section**:
- Map name (e.g., "Regional Map at (10, 15)")

**Overview Cards** (6 cards showing):
- Dimensions (e.g., "50 × 50")
- Total Hexes (e.g., "2500")
- River Tiles (e.g., "427 tiles")
- Strategic Resources (e.g., "12")
- Luxury Resources (e.g., "18")
- Bonus Resources (e.g., "94")

**Terrain Distribution**:
- Bar chart showing percentage of each terrain type
- Colored bars matching terrain colors
- Sorted by most common to least common

**Interactive Map**:
- 50x50 hex grid with color-coded terrain
- Rivers as blue lines
- Resources as yellow text labels
- Features as white letter indicators
- Pan, zoom, and hex selection enabled

**Hex Details Panel** (when hex clicked):
- Shows full Entity Viewer for selected hex
- All hex properties (terrain, resources, yields, etc.)
- Close button to dismiss

---

## Troubleshooting

**Map is empty/blank**:
- Check that `RegionalMapCreator.create()` was called
- Check that tiles were saved to `entityStore`
- Verify `regionalMap.hexTileIds` is not empty

**Can't see hexes**:
- Try zooming out (click − button)
- Try clicking "⟲" to reset view
- Check browser console for errors

**Rivers not showing**:
- Rivers are generated automatically by `RiverGenerator`
- Should see ~3-7 river systems per map
- Rivers flow from high elevation to ocean/lakes

**Resources not showing**:
- Resources are placed automatically by `ResourcePlacer`
- Strategic: ~1 per 250 hexes
- Luxury: ~1 per 125 hexes
- Bonus: ~1 per 25 hexes
- Look for yellow text labels

---

## Performance Notes

- Rendering 2,500 hexes (50×50) performs well up to ~3x zoom
- SVG rendering is efficient for this grid size
- If performance issues occur, reduce map size in `RegionalMapCreator.DEFAULT_WIDTH/HEIGHT`
- Or increase zoom limits in `RegionalMapViewer` (currently 0.3x - 5x)

---

**Enjoy exploring your procedurally generated Civ 5-style regional maps!**
