# Civ 5 / Unciv Graphics Assets

This folder contains graphics assets from **Unciv** (open-source Civilization V clone).

## Attribution

**Source**: [HexaRealm-Tileset](https://github.com/GeneralWadaling/HexaRealm-Tileset) (Unciv tileset mod)
**Base Game**: [Unciv](https://github.com/yairm210/Unciv)
**License**: MPL-2.0 and GPLv3
**Authors**: GeneralWadaling (HexaRealm), Yair Morgenstern (Unciv), and contributors
**Repository**: https://github.com/GeneralWadaling/HexaRealm-Tileset

These assets are from the HexaRealm tileset mod for Unciv, used under the terms of the Mozilla Public License 2.0 and GNU General Public License v3.

## Asset Organization

```
civ5-assets/
├── terrain/          # Base terrain hex tiles
├── resources/        # Resource icons (strategic, luxury, bonus)
├── features/         # Feature overlays (forest, jungle, marsh)
└── rivers/           # River sprites for hex edges
```

## Downloading Assets

### Automated Download (Recommended)

Run the download script from the project root:

```bash
node scripts/download-unciv-assets.js
```

This will automatically download all needed assets from the Unciv repository.

### Manual Download

If you prefer to download manually:

1. **Terrain Tiles**: Download from
   https://github.com/yairm210/Unciv/tree/master/android/assets/ExtraImages/TerrainIcons

2. **Resource Icons**: Download from
   https://github.com/yairm210/Unciv/tree/master/android/assets/ExtraImages/ResourceIcons

3. **Feature Overlays**: Download from
   https://github.com/yairm210/Unciv/tree/master/android/assets/ExtraImages/TerrainFeatureIcons

4. **River Sprites**: Download from
   https://github.com/yairm210/Unciv/tree/master/android/assets/ExtraImages/RiverIcons

## Asset Naming Convention

Assets must follow this naming convention to work with `assetLoader.ts`:

### Terrain
- `Grassland.png` - Grassland terrain
- `Plains.png` - Plains terrain
- `Desert.png` - Desert terrain
- `Tundra.png` - Tundra terrain
- `Snow.png` - Snow terrain
- `Ocean.png` - Ocean terrain
- `Coast.png` - Coastal water
- `Mountain.png` - Mountain terrain
- `Hill.png` - Hilly terrain

### Resources (Strategic)
- `Iron.png`
- `Horses.png`
- `Coal.png`
- `Oil.png`
- `Aluminum.png`
- `Uranium.png`

### Resources (Luxury)
- `Gold.png`
- `Silver.png`
- `Gems.png`
- `Pearls.png`
- `Silk.png`
- `Spices.png`
- `Dyes.png`
- `Incense.png`
- `Wine.png`
- `Cotton.png`
- `Furs.png`
- `Ivory.png`

### Resources (Bonus)
- `Wheat.png`
- `Cattle.png`
- `Deer.png`
- `Fish.png`
- `Stone.png`
- `Sheep.png`
- `Bananas.png`
- `Bison.png`

### Features
- `Forest.png` - Forest overlay
- `Jungle.png` - Jungle overlay
- `Marsh.png` - Marsh overlay
- `Ice.png` - Ice overlay
- `Oasis.png` - Oasis overlay (if available)

### Rivers
- `River-Bottom.png` - River on bottom hex edge
- `River-BottomLeft.png` - River on bottom-left edge
- `River-BottomRight.png` - River on bottom-right edge
- `River-TopLeft.png` - River on top-left edge
- `River-TopRight.png` - River on top-right edge
- `River-Top.png` - River on top edge

## File Format

- **Format**: PNG with transparency
- **Recommended size**:
  - Terrain tiles: 64×64 or 128×128 pixels
  - Resource icons: 32×32 or 64×64 pixels
  - Feature overlays: Same as terrain (64×64 or 128×128)
  - River sprites: Width to match hex edge length

## Fallback Behavior

If graphics assets are not found, `RegionalMapViewer` will automatically fall back to:
- Colored hex polygons for terrain
- Text labels for resources
- Single-letter indicators for features
- Simple blue lines for rivers

This ensures the visualization works even without graphics assets.

## Updating Assets

To update to newer Unciv graphics:

1. Delete contents of `civ5-assets/` folders
2. Re-run the download script or manually download new versions
3. Clear browser cache to force reload of new images

## License Compliance

When distributing this project:
1. Include this README with attribution
2. Include a copy of the MPL-2.0 license (see Unciv repository)
3. Include a copy of the GPLv3 license (see Unciv repository)
4. Clearly indicate that graphics are from Unciv project

## Credits

Special thanks to:
- **Yair Morgenstern** - Creator of Unciv
- **Unciv contributors** - For the excellent pixel art graphics
- **Firaxis Games** - Original Civilization game designers (inspiration)

---

For more information about Unciv:
🔗 https://github.com/yairm210/Unciv
🎮 https://yairm210.itch.io/unciv
