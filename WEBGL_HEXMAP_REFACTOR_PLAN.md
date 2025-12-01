# WebGL Hex Map Refactoring Plan

## Overview

Replace the current SVG-based HexMapCanvas with a WebGL-powered renderer using **PixiJS**. This will enable rendering of 100,000+ hexes at 60fps with smooth zoom transitions.

## Why PixiJS?

- **2D-focused**: Designed specifically for 2D graphics (unlike Three.js which is 3D-first)
- **Batching**: Automatically batches draw calls for massive performance gains
- **Easy interactivity**: Built-in hit detection and event system
- **Mature ecosystem**: Well-documented, widely used in games
- **WebGL with Canvas fallback**: Works everywhere

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HexMapWebGL.svelte                        │
│  (Svelte wrapper - handles lifecycle, props, events)         │
├─────────────────────────────────────────────────────────────┤
│                    HexMapRenderer.ts                         │
│  (PixiJS Application setup, zoom/pan controls)               │
├─────────────────────────────────────────────────────────────┤
│  PlanetaryHexLayer.ts  │  RegionalHexLayer.ts               │
│  (Level 1 hexes)       │  (Level 2 hexes - chunked)         │
├─────────────────────────────────────────────────────────────┤
│                    HexGeometry.ts                            │
│  (Hex shape generation, coordinate math)                     │
├─────────────────────────────────────────────────────────────┤
│                    PixiJS (WebGL)                            │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Core Setup
- [ ] Install PixiJS dependency
- [ ] Create `HexMapWebGL.svelte` component
- [ ] Create `HexMapRenderer.ts` class
- [ ] Implement basic PixiJS Application setup
- [ ] Add canvas mount/unmount lifecycle

### Phase 2: Planetary Hex Layer (Level 1)
- [ ] Create `HexGeometry.ts` for hex math
- [ ] Create `PlanetaryHexLayer.ts`
- [ ] Render planetary hexes as Graphics or Sprites
- [ ] Implement terrain colors
- [ ] Add hex selection (click detection)
- [ ] Add hex hover effects

### Phase 3: Zoom & Pan
- [ ] Implement mouse wheel zoom (centered on cursor)
- [ ] Implement click-drag panning
- [ ] Add zoom limits (min/max)
- [ ] Smooth zoom transitions (lerp)

### Phase 4: Regional Hex Layer (Level 2)
- [ ] Create `RegionalHexLayer.ts`
- [ ] Implement chunked rendering (only visible chunks)
- [ ] Viewport culling - calculate visible planetary hexes
- [ ] Render regional hexes only for visible planetary hexes
- [ ] Dynamic chunk loading/unloading on pan

### Phase 5: Level Transition
- [ ] Implement zoom threshold detection
- [ ] Crossfade between layers using alpha
- [ ] Smooth opacity transitions

### Phase 6: Visual Features
- [ ] Terrain colors for regional hexes
- [ ] Feature overlays (forests, rivers)
- [ ] Resource icons (sprites)
- [ ] Selection highlighting
- [ ] Continent overlays

### Phase 7: Integration & Cleanup
- [ ] Replace HexMapCanvas with HexMapWebGL in PlanetViewer
- [ ] Event dispatching (hexSelected, regionalHexSelected)
- [ ] Remove old SVG component
- [ ] Performance testing

## File Structure

```
src/lib/components/worldmap/
├── HexMapWebGL.svelte          # Svelte wrapper component
├── webgl/
│   ├── HexMapRenderer.ts       # Main PixiJS application
│   ├── HexGeometry.ts          # Hex coordinate math & shapes
│   ├── PlanetaryHexLayer.ts    # Level 1 rendering
│   ├── RegionalHexLayer.ts     # Level 2 rendering (chunked)
│   ├── ChunkManager.ts         # Manages visible chunks
│   └── constants.ts            # Colors, sizes, thresholds
```

## Key Technical Decisions

### 1. Rendering Strategy
- Use `PIXI.Graphics` for hex shapes (vector, scalable)
- Batch all hexes of same color together
- Use `PIXI.Container` hierarchy for layers

### 2. Chunking Strategy
- Divide regional hexes into chunks (e.g., 5x5 planetary hexes per chunk)
- Only create/render chunks in viewport + 1 chunk buffer
- Pool and reuse chunk containers

### 3. Interaction
- Use PixiJS's built-in `eventMode = 'static'` for hit detection
- Hover: pointer events on hex graphics
- Click: pointer events with selection state

### 4. Zoom Levels
- 0.2x - 1.6x: Planetary view only
- 1.6x - 2.4x: Crossfade transition
- 2.4x - 8.0x: Regional view only

### 5. Performance Targets
- 60fps at all zoom levels
- < 100ms initial render
- < 16ms per frame during pan/zoom
- Support 100x100 planetary maps (1,000,000 regional hexes)

## Dependencies

```json
{
  "pixi.js": "^8.x"
}
```

## Code Examples

### HexMapWebGL.svelte (skeleton)
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { HexMapRenderer } from './webgl/HexMapRenderer';
  import type { WorldMap } from '$lib/entities/location/worldMap';

  let { worldMap, onHexSelected, onRegionalHexSelected } = $props();

  let container: HTMLDivElement;
  let renderer: HexMapRenderer | null = null;

  onMount(() => {
    renderer = new HexMapRenderer(container, worldMap);
    renderer.on('hexSelected', onHexSelected);
    renderer.on('regionalHexSelected', onRegionalHexSelected);
  });

  onDestroy(() => {
    renderer?.destroy();
  });
</script>

<div bind:this={container} class="hex-map-webgl"></div>
```

### HexMapRenderer.ts (skeleton)
```typescript
import { Application, Container } from 'pixi.js';
import { PlanetaryHexLayer } from './PlanetaryHexLayer';
import { RegionalHexLayer } from './RegionalHexLayer';

export class HexMapRenderer extends EventTarget {
  private app: Application;
  private planetaryLayer: PlanetaryHexLayer;
  private regionalLayer: RegionalHexLayer;
  private scale = 0.6;

  constructor(container: HTMLElement, worldMap: WorldMap) {
    this.app = new Application();
    await this.app.init({
      resizeTo: container,
      backgroundColor: 0x1e293b,
      antialias: true,
    });
    container.appendChild(this.app.canvas);

    this.setupLayers(worldMap);
    this.setupInteraction();
    this.app.ticker.add(this.update.bind(this));
  }

  private update(delta: number) {
    // Update layer visibility based on zoom
    // Update chunk loading based on viewport
  }
}
```

## Migration Strategy

1. Build new WebGL component alongside existing SVG
2. Add feature flag to switch between them
3. Test thoroughly with various map sizes
4. Remove old SVG component once stable

## Estimated Effort

- Phase 1: 1 hour
- Phase 2: 2 hours
- Phase 3: 1 hour
- Phase 4: 3 hours (most complex)
- Phase 5: 1 hour
- Phase 6: 2 hours
- Phase 7: 1 hour

**Total: ~11 hours**

## Success Criteria

- [ ] 60fps with 50x50 world map at all zoom levels
- [ ] Smooth zoom transition between planetary and regional
- [ ] All existing interactions work (click, hover, selection)
- [ ] Memory usage stable during pan/zoom
- [ ] No visual regression from SVG version
