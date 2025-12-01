# Unciv Simulation Integration - Updated Plan
## Based on Code Review & User Requirements

**Date:** 2025-11-25
**Status:** Ready to implement
**Unciv Reference:** Cloned to `old examples/Unciv/`

---

## 🎯 USER REQUIREMENTS

1. ✅ **Clone Unciv** for architecture reference
2. ✅ **Implementation priority**: Entity Integration → UI → Combat
3. ✅ **Merge Settlement + City** into one entity
4. ✅ **Graphics**: Unciv assets only (no colored hex fallback)
5. ✅ **Keep existing structure**: Continents, hex tiles clickable
6. ✅ **Time input**: User specifies years, simulation runs live

---

## 📐 CURRENT ARCHITECTURE REVIEW

### Three-Level Hex System

```
Level 1: WorldMap (Planet.worldMap)
  ├─ 2D grid of HexTile[] (planetary scale, simple)
  └─ Detected continents[] (groups of hexes)

Level 2: PlanetaryHexTile (continental hex, 500-1000km)
  ├─ terrainType, elevation, temperature, dryness
  ├─ continentId (group with other planetary hexes)
  └─ regionalMapId? (link to detailed map)

Level 3: RegionalHexTile (simulation hex, 10-50km)
  ├─ Full Civ 5 properties (resources, improvements, yields)
  ├─ Ownership tracking (ownerNationId, ownershipHistory)
  ├─ Discovery tracking (discoveredByNations)
  ├─ Military tracking (unitIds, battleSiteIds)
  └─ City/unit presence flags
```

### Current Entity Structure

**Planet**
```typescript
class Planet {
  worldMap: WorldMap; // 2D HexTile[][] grid
  continents: Continent[]; // Detected landmasses
}
```

**Continent**
```typescript
class Continent {
  hexTiles: HexTile[]; // Tiles in this continent
  size, climate, dominantLandscape;
}
```

**HexTile** (simple, 31 lines)
```typescript
class HexTile {
  x, y, terrainType, elevation, temperature, dryness;
  continentId?; // Which continent
  settlements: Settlement[]; // RPG settlements
  dungeons: Dungeon[];
}
```

**PlanetaryHexTile** (continental scale, 55 lines)
```typescript
class PlanetaryHexTile {
  x, y, terrainType, elevation, temperature, dryness;
  continentId?;
  hasRegionalMap, regionalMapId?; // Link to detailed simulation
}
```

**RegionalHexTile** (simulation scale, 399 lines)
```typescript
class RegionalHexTile {
  // Terrain
  terrainType, elevation, feature, hasRiver, riverSides[];

  // Resources
  strategicResource, luxuryResource, bonusResource;

  // Improvements
  improvement, improvementPillaged, hasRoad, hasRailroad;

  // Ownership
  ownerNationId, ownerCityId, ownershipHistory[];

  // Exploration
  discoveredByNations[], visibleToNations[];

  // Military
  hasCity, cityId, hasUnit, unitIds[];
  battleSiteIds[], historicalEventIds[];

  // Yields (calculated)
  yields: { food, production, gold, science, culture };

  // Combat
  defensiveBonus, movementCost, isImpassable;
}
```

**Settlement** (simple RPG, 11 lines)
```typescript
class Settlement {
  name, size, fame, events[], population, description;
}
```

**City** (full simulation, 620 lines)
```typescript
class City {
  // Core
  name, ownerNationId, founderNationId, foundedYear;
  hexTileId, parentRegionalMapId, coordinates;
  population, foodStored, isCapital;

  // Yields
  yields: CityYields; // food, production, gold, science, culture + breakdowns

  // Managers (Unciv-inspired)
  populationManager: CityPopulationManager;
  productionManager: CityProductionManager;
  expansionManager: CityExpansionManager;

  // Territory
  ownedHexTileIds[]; // Hexes this city controls
  workedHexTileIds[]; // Hexes being worked by citizens

  // Buildings & Wonders
  buildings: BuildingType[];
  wonders: string[];

  // Military
  garrisonedUnitIds[], combatStrength, rangedStrength;
  hitPoints, maxHitPoints;

  // History
  conquestHistory: ConquestRecord[];

  // Methods
  processTurn(), calculateYields(), assignWorkers(), etc.
}
```

### Current Viewers

**PlanetViewer** ✅
- Shows 3D planet rendering
- Shows WorldMap (HexMapCanvas) with continents
- Click hex → shows details panel
- Can add continents manually
- **MISSING**: "Expand to Regional Map" button

**ContinentViewer** ✅
- Shows continent details
- Groups hex tiles by terrain
- Displays normalized hex grid
- **MISSING**: Link to regional maps

**RegionalMapViewer** ✅
- Shows overview stats
- Shows hex map (SVG rendering)
- Graphics mode toggle (Unciv assets)
- Pan/zoom controls
- **MISSING**: Simulation controls, nation overlays, city/unit markers

---

## 🔄 MERGING SETTLEMENT + CITY

### Strategy: Extend City, Deprecate Settlement

**Approach:**
1. **Keep City class** as primary entity
2. **Add "RPG mode" flag** to distinguish manual vs simulation cities
3. **Add simple properties** from Settlement to City (size, fame, events)
4. **Update CityCreator** to support both modes
5. **Create CityViewer** that works for both contexts
6. **Migrate existing Settlement entities** to City

### Updated City Class

```typescript
export class City extends Entity {
  // === EXISTING SIMULATION PROPERTIES ===
  // (all current 620 lines stay)

  // === NEW: RPG MODE PROPERTIES ===
  isSimulationGenerated = false; // false = manual RPG, true = simulation

  // RPG-only fields (used when isSimulationGenerated = false)
  size?: string; // from Settlement: 'small', 'medium', 'large'
  fame?: string; // from Settlement: 'unknown', 'famous', 'legendary'
  rpgEvents?: string[]; // from Settlement: narrative events
  rpgDescription?: string; // from Settlement: flavor text

  // === UNIFIED FIELDS ===
  // These work in both modes:
  population // number (RPG: 100-10000, Simulation: 1-50)
  name // string
  description // string (generated or manual)
}
```

### CityCreator Updates

```typescript
export class CityCreator extends Creator<City> {
  /**
   * Create manual RPG city (replaces SettlementCreator)
   */
  create(): City {
    const city = new City();
    city.isSimulationGenerated = false;
    city.name = this.generateCityName();
    city.size = this.dice.rollOnTable(['small', 'medium', 'large']);
    city.fame = this.dice.rollOnTable(['unknown', 'famous']);
    city.population = this.dice.rollDice(1, 1000) + 500;
    city.rpgDescription = `A ${city.size} settlement...`;
    return city;
  }

  /**
   * Create simulation city (used by SimulationEngine)
   */
  static createFromSimulation(
    name: string,
    ownerNationId: string,
    hexTileId: string,
    coordinates: { x: number; y: number },
    foundedYear: number
  ): City {
    const city = new City();
    city.isSimulationGenerated = true;
    city.name = name;
    city.ownerNationId = ownerNationId;
    city.hexTileId = hexTileId;
    city.coordinates = coordinates;
    city.foundedYear = foundedYear;
    city.population = 1; // Starts at pop 1
    // Initialize managers
    city.populationManager = new CityPopulationManager();
    city.productionManager = new CityProductionManager();
    city.expansionManager = new CityExpansionManager();
    return city;
  }
}
```

### CityViewer Component

```svelte
<script lang="ts">
  import type { City } from '$lib/entities/location/city';

  let { city, parentEntity }: Props = $props();

  const isSimulation = $derived(city.isSimulationGenerated);
</script>

{#if isSimulation}
  <!-- SIMULATION CITY VIEW -->
  <Section title="Overview">
    <InfoGrid items={[
      { label: 'Owner', value: getNationName(city.ownerNationId) },
      { label: 'Founded', value: city.foundedYear },
      { label: 'Population', value: city.population },
      { label: 'Capital', value: city.isCapital ? 'Yes' : 'No' }
    ]} />
  </Section>

  <Section title="Yields">
    <YieldsDisplay yields={city.yields} />
  </Section>

  <Section title="Population">
    <PopulationDisplay manager={city.populationManager} />
  </Section>

  <Section title="Production">
    <ProductionDisplay manager={city.productionManager} />
  </Section>

  <!-- ... full simulation UI -->
{:else}
  <!-- RPG CITY VIEW -->
  <Section title="Overview">
    <InfoGrid items={[
      { label: 'Size', value: city.size },
      { label: 'Fame', value: city.fame },
      { label: 'Population', value: city.population }
    ]} />
  </Section>

  <Section title="Description">
    <p>{city.rpgDescription}</p>
  </Section>

  <Section title="Events">
    <ul>
      {#each city.rpgEvents || [] as event}
        <li>{event}</li>
      {/each}
    </ul>
  </Section>
{/if}
```

### Migration Script

**File:** `src/lib/migration/migrateSettlementsToCities.ts`

```typescript
/**
 * One-time migration: Convert Settlement entities → City entities
 */
export async function migrateSettlementsToCities() {
  const settlementEntities = entityStore.getAllEntities()
    .filter(e => e.type === EntityType.Settlement);

  console.log(`Migrating ${settlementEntities.length} settlements to cities...`);

  for (const settlementEntity of settlementEntities) {
    const settlement = settlementEntity.customFields.generatedEntity as Settlement;

    // Create new City from Settlement data
    const city = new City();
    city.id = settlement.id; // Keep same ID
    city.name = settlement.name;
    city.description = settlement.description;
    city.population = settlement.population || 1000;
    city.isSimulationGenerated = false; // RPG mode
    city.size = settlement.size;
    city.fame = settlement.fame;
    city.rpgEvents = settlement.events;
    city.rpgDescription = settlement.description;

    // Update entity type
    settlementEntity.type = EntityType.City;
    settlementEntity.customFields.generatedEntity = city;

    // Save
    entityStore.updateEntity(settlementEntity.id, settlementEntity);
  }

  console.log('Migration complete!');
}
```

---

## 🎨 GRAPHICS STRATEGY: Unciv-Only Rendering

### Current RegionalMapViewer Graphics

**Problem**: Toggle between colored hexes / Unciv assets
**Solution**: Always use Unciv assets, layer system for overlays

### Rendering Layers (Always Unciv Graphics)

```svelte
<svg>
  <!-- Layer 1: BASE TERRAIN (Unciv terrain sprites) -->
  <g id="terrain-layer">
    {#each hexes as hex}
      <image
        href="/civ5-assets/terrain/{hex.terrainType}.png"
        x={hexX} y={hexY} width={64} height={64}
      />
    {/each}
  </g>

  <!-- Layer 2: FEATURES (Unciv feature sprites) -->
  <g id="features-layer">
    {#each hexes as hex}
      {#if hex.feature}
        <image
          href="/civ5-assets/features/{hex.feature}.png"
          x={hexX} y={hexY} width={64} height={64}
        />
      {/if}
    {/each}
  </g>

  <!-- Layer 3: RESOURCES (Unciv resource sprites) -->
  <g id="resources-layer">
    {#each hexes as hex}
      {#if hex.strategicResource !== 'none'}
        <image
          href="/civ5-assets/resources/{hex.strategicResource}.png"
          x={hexX} y={hexY} width={32} height={32}
        />
      {/if}
    {/each}
  </g>

  <!-- Layer 4: IMPROVEMENTS (Unciv improvement sprites) -->
  <g id="improvements-layer">
    {#each hexes as hex}
      {#if hex.improvement !== 'none'}
        <image
          href="/civ5-assets/improvements/{hex.improvement}.png"
          x={hexX} y={hexY} width={48} height={48}
        />
      {/if}
    {/each}
  </g>

  <!-- Layer 5: NATION BORDERS (colored overlays, 30% opacity) -->
  <g id="borders-layer" style="opacity: 0.3">
    {#each hexes as hex}
      {#if hex.ownerNationId}
        <polygon
          points={hexPoints}
          fill={getNationColor(hex.ownerNationId)}
          stroke={getNationColor(hex.ownerNationId)}
          stroke-width="2"
        />
      {/if}
    {/each}
  </g>

  <!-- Layer 6: CITIES (Unciv city sprites + labels) -->
  <g id="cities-layer">
    {#each cities as city}
      <image
        href="/civ5-assets/cities/city-{getCitySizeCategory(city.population)}.png"
        x={cityX} y={cityY} width={48} height={48}
        style="cursor: pointer"
        onclick={() => handleCityClick(city)}
      />
      {#if city.isCapital}
        <image
          href="/civ5-assets/cities/capital-star.png"
          x={cityX - 8} y={cityY - 8} width={16} height={16}
        />
      {/if}
      <text
        x={cityX} y={cityY + 32}
        text-anchor="middle"
        fill="white"
        stroke="black"
        stroke-width="2"
        style="font-size: 12px; cursor: pointer"
        onclick={() => handleCityClick(city)}
      >
        {city.name}
      </text>
    {/each}
  </g>

  <!-- Layer 7: UNITS (Unciv unit sprites) -->
  <g id="units-layer">
    {#each units as unit}
      <image
        href="/civ5-assets/units/{unit.unitType}.png"
        x={unitX} y={unitY} width={32} height={32}
        style="cursor: pointer"
        onclick={() => handleUnitClick(unit)}
      />
      {#if unit.health < 100}
        <rect
          x={unitX} y={unitY + 28}
          width={32 * (unit.health / 100)} height={4}
          fill="green"
        />
      {/if}
    {/each}
  </g>

  <!-- Layer 8: SELECTION HIGHLIGHT -->
  <g id="selection-layer">
    {#if selectedHex}
      <polygon
        points={getHexPoints(selectedHex)}
        fill="none"
        stroke="yellow"
        stroke-width="3"
      />
    {/if}
  </g>

  <!-- Layer 9: CONTINENT BOUNDARIES (optional toggle) -->
  {#if showContinentBorders}
    <g id="continent-borders" style="opacity: 0.5">
      {#each continentBorders as border}
        <polyline
          points={border.points}
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-dasharray="4,4"
        />
      {/each}
    </g>
  {/if}
</svg>
```

### Clickable Regions

**Strategy**: SVG event handlers on each layer

```svelte
<!-- Hex tiles: Click for details -->
<polygon
  points={hexPoints}
  fill="transparent" <!-- Invisible but clickable -->
  onclick={() => handleHexClick(hex)}
  onmouseenter={() => hoveredHex = hex}
  onmouseleave={() => hoveredHex = null}
  style="cursor: pointer"
/>

<!-- Cities: Click to open CityViewer -->
<g onclick={() => openCityEntity(city.id)} style="cursor: pointer">
  <image href="..." />
  <text>{city.name}</text>
</g>

<!-- Units: Click to open UnitViewer -->
<image
  href="..."
  onclick={() => openUnitEntity(unit.id)}
  style="cursor: pointer"
/>
```

### Continent Visualization

**PlanetViewer WorldMap**: Show continents with borders
```svelte
<!-- In HexMapCanvas component -->
{#each planet.continents as continent}
  <g
    onclick={() => handleContinentClick(continent)}
    style="cursor: pointer"
  >
    {#each continent.hexTiles as hex}
      <polygon
        points={hexPoints}
        fill={TERRAIN_COLORS[hex.terrainType]}
        stroke={continent.borderColor || 'white'}
        stroke-width="2"
      />
    {/each}
  </g>
{/each}
```

**ContinentViewer**: Show normalized hex grid with Unciv graphics
```svelte
<!-- Show continent hexes with Unciv terrain -->
{#each continent.hexTiles as hex}
  <image
    href="/civ5-assets/terrain/{hex.terrainType}.png"
    x={normalizedX} y={normalizedY}
    onclick={() => handleHexClick(hex)}
  />
{/each}
```

---

## ⏱️ USER-DRIVEN SIMULATION TIME

### SimulationControlPanel Design

```svelte
<script lang="ts">
  let yearInput = $state<number>(100); // User-specified years
  let turnsPerYear = $state<number>(4); // Default: 4 turns per year
  let speedMultiplier = $state<number>(1); // 1x, 2x, 5x, 10x

  const totalTurns = $derived(yearInput * turnsPerYear);
  const simulationDuration = $derived(totalTurns / speedMultiplier); // in seconds

  async function startSimulation() {
    if (!engine) await initializeSimulation();

    isRunning = true;
    isPaused = false;

    // Calculate delay per turn based on speed
    const msPerTurn = 1000 / speedMultiplier; // 1x = 1 turn/sec

    for (let turn = 0; turn < totalTurns; turn++) {
      if (!isRunning || isPaused) break;

      // Process turn
      engine.processTurn();

      // Update UI
      currentYear = engine.currentYear;
      currentTurn = turn + 1;
      progressPercent = (currentTurn / totalTurns) * 100;

      // Trigger map re-render
      onSimulationUpdate(engine);

      // Wait before next turn (or process immediately if speed = max)
      if (speedMultiplier < 999) {
        await new Promise(resolve => setTimeout(resolve, msPerTurn));
      }
    }

    isRunning = false;
    console.log('Simulation complete!');
  }
</script>

<div class="simulation-controls">
  <h3>Simulation Setup</h3>

  <!-- Time input -->
  <div class="input-group">
    <label for="years">Simulate how many years?</label>
    <input
      type="number"
      id="years"
      bind:value={yearInput}
      min="10"
      max="10000"
      step="10"
    />
    <span class="help-text">
      {totalTurns} turns total ({simulationDuration.toFixed(1)}s at {speedMultiplier}x speed)
    </span>
  </div>

  <!-- Turns per year -->
  <div class="input-group">
    <label for="turns-per-year">Turns per year:</label>
    <select bind:value={turnsPerYear}>
      <option value={1}>1 turn/year (fast)</option>
      <option value={2}>2 turns/year</option>
      <option value={4}>4 turns/year (default)</option>
      <option value={12}>12 turns/year (monthly)</option>
    </select>
  </div>

  <!-- Nations -->
  <div class="input-group">
    <label for="nations">Number of nations:</label>
    <input
      type="number"
      id="nations"
      bind:value={nationCount}
      min="2"
      max="8"
    />
  </div>

  <!-- Speed control -->
  <div class="input-group">
    <label for="speed">Simulation speed:</label>
    <select bind:value={speedMultiplier}>
      <option value={0.5}>0.5x (slow, 1 turn per 2 sec)</option>
      <option value={1}>1x (1 turn per sec)</option>
      <option value={2}>2x (2 turns per sec)</option>
      <option value={5}>5x (5 turns per sec)</option>
      <option value={10}>10x (10 turns per sec)</option>
      <option value={999}>Max speed (instant)</option>
    </select>
  </div>

  <!-- Action buttons -->
  <div class="button-group">
    {#if !isInitialized}
      <button onclick={initializeSimulation}>
        Initialize Simulation
      </button>
    {:else if !isRunning}
      <button onclick={startSimulation} class="primary">
        ▶ Run {yearInput} Years
      </button>
      <button onclick={resetSimulation}>
        🔄 Reset
      </button>
    {:else if isPaused}
      <button onclick={resumeSimulation} class="primary">
        ▶ Resume
      </button>
      <button onclick={stopSimulation}>
        ⏹ Stop
      </button>
    {:else}
      <button onclick={pauseSimulation}>
        ⏸ Pause
      </button>
      <button onclick={stepSimulation}>
        ⏭ Step
      </button>
    {/if}
  </div>

  <!-- Progress -->
  {#if isRunning || currentTurn > 0}
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
      </div>
      <div class="progress-text">
        Year {currentYear} | Turn {currentTurn} / {totalTurns} ({progressPercent.toFixed(1)}%)
      </div>
    </div>
  {/if}
</div>
```

---

## 📦 UPDATED IMPLEMENTATION PLAN

### **PHASE 1: Entity Integration** (Week 1)

#### 1.1 Merge Settlement → City
- ✅ Already reviewed City/Settlement classes
- [ ] Add `isSimulationGenerated` flag to City
- [ ] Add RPG properties (size, fame, rpgEvents, rpgDescription)
- [ ] Update CityCreator with both modes
- [ ] Create migration script
- [ ] Run migration on existing entities
- [ ] Update entity registry (remove settlement, keep city)

#### 1.2 Create SimulationEntityBridge
- [ ] Create `src/lib/simulation/SimulationEntityBridge.ts`
- [ ] Implement Nation ↔ Entity sync
- [ ] Implement City ↔ Entity sync
- [ ] Implement Unit ↔ Entity sync
- [ ] Implement Event/Battle ↔ Entity sync
- [ ] Add batch update optimization

#### 1.3 Update SimulationEngine
- [ ] Add `entityBridge` property
- [ ] Modify `processTurn()` to sync entities
- [ ] Add `initializeFromEntities()` method
- [ ] Add nation/city creation helpers
- [ ] Test: Create simulation, verify entities saved

### **PHASE 2: UI Components** (Week 2)

#### 2.1 SimulationControlPanel
- [ ] Create `src/lib/components/simulation/SimulationControlPanel.svelte`
- [ ] Add user-driven year input
- [ ] Add turns-per-year selector
- [ ] Add nation count input
- [ ] Add speed controls (0.5x - Max)
- [ ] Add progress bar
- [ ] Implement initialize/start/pause/stop/step
- [ ] Add preset configurations (optional)

#### 2.2 Enhanced RegionalMapViewer
- [ ] Add `<SimulationControlPanel>` section
- [ ] Add view mode toggle (Terrain/Political/Nation)
- [ ] Add nation selector dropdown
- [ ] Integrate simulation updates → map re-render
- [ ] Add event handlers (hex/city/unit clicks)

#### 2.3 HexMapRenderer (Unciv Graphics)
- [ ] Create `src/lib/components/simulation/HexMapRenderer.svelte`
- [ ] Implement 9-layer SVG rendering:
  - Layer 1: Terrain sprites (Unciv assets)
  - Layer 2: Feature sprites (forests, etc.)
  - Layer 3: Resource sprites
  - Layer 4: Improvement sprites
  - Layer 5: Nation border overlays (30% opacity)
  - Layer 6: City sprites + labels
  - Layer 7: Unit sprites + health bars
  - Layer 8: Selection highlight
  - Layer 9: Continent borders (optional)
- [ ] Add click handlers for each layer
- [ ] Add hover tooltips
- [ ] Integrate with existing pan/zoom

#### 2.4 Supporting UI
- [ ] Create `EventLogViewer.svelte` (filterable list)
- [ ] Create `NationStatsPanel.svelte` (nation list with stats)
- [ ] Create `TimelineSlider.svelte` (scrubbing, optional Phase 3)

### **PHASE 3: Entity Viewers** (Week 3)

#### 3.1 Create CityViewer
- [ ] Create `src/lib/components/entities/viewers/CityViewer.svelte`
- [ ] Implement dual-mode rendering (RPG vs Simulation)
- [ ] Add sections:
  - Overview (name, owner, population, founded)
  - Yields (food, production, gold, etc.)
  - Population (growth, food storage)
  - Production (queue, progress)
  - Buildings list
  - Territory map (mini-map of owned hexes)
  - Military (garrisoned units)
  - History (events, conquests)
- [ ] Add EntityList for units/buildings
- [ ] Add click handlers → open sub-entities

#### 3.2 Create NationViewer
- [ ] Create `src/lib/components/entities/viewers/NationViewer.svelte`
- [ ] Add sections:
  - Overview (leader, government, era, status)
  - Resources & Yields (gold, science, culture per turn)
  - Culture Traits (bar chart)
  - Technology (researched, current progress)
  - Social Policies (adopted, next cost)
  - Cities (EntityList with click to open)
  - Military (unit list, total strength)
  - Diplomacy (relations with other nations)
  - History (events, timeline)

#### 3.3 Create UnitViewer
- [ ] Create `src/lib/components/entities/viewers/UnitViewer.svelte`
- [ ] Add sections:
  - Overview (type, owner, location)
  - Combat Stats (strength, health, movement)
  - Experience & Promotions
  - Status (fortified, embarked, garrisoned)
  - History (battles, cities captured)

#### 3.4 Update EntityViewer Router
- [ ] Add City case (handle both RPG & simulation)
- [ ] Add Nation case
- [ ] Add Unit case
- [ ] Update SettlementViewer → redirect to CityViewer

### **PHASE 4: Planet → RegionalMap Workflow** (Week 3)

#### 4.1 Update PlanetViewer
- [ ] Add "Expand to Regional Map" button when hex selected
- [ ] Implement `generateRegionalMap(planetaryHex)`:
  - Create RegionalMap using RegionalMapCreator
  - Link planetaryHex.regionalMapId
  - Save RegionalMap entity
  - Save all RegionalHexTile entities
  - Update planet entity
  - Open RegionalMapViewer
- [ ] Add "Open Regional Map" button if already expanded
- [ ] Test: Click hex → generate map → open viewer

#### 4.2 Update ContinentViewer
- [ ] Show which hexes have regional maps
- [ ] Add buttons to expand hexes to regional maps
- [ ] Display regional map links

### **PHASE 5: Combat System** (Week 4)

#### 5.1 Unit Production
- [ ] Add unit production to CityProductionManager
- [ ] Integrate unit creation in SimulationEngine.processCities()
- [ ] Create Unit entities when production completes
- [ ] Add units to nation.unitIds[]
- [ ] Create unit production events

#### 5.2 Unit Movement
- [ ] Add `processUnits()` phase to SimulationEngine
- [ ] Implement AI unit movement (toward objectives)
- [ ] Add movement point restoration each turn
- [ ] Update unit positions on map
- [ ] Handle embarkation (land ↔ water)

#### 5.3 Combat Resolution
- [ ] Implement `resolveCombat(attacker, defender)` in SimulationEngine
- [ ] Use existing Unit.calculateDamage() formulas
- [ ] Apply damage to both units
- [ ] Remove defeated units
- [ ] Award XP to survivors
- [ ] Create battle entities
- [ ] Create battle events

#### 5.4 City Capture
- [ ] Implement `attackCity(unit, city)` in SimulationEngine
- [ ] Reduce city HP
- [ ] Handle city counterattack
- [ ] Implement `captureCity(unit, city)` when HP reaches 0
- [ ] Transfer city ownership
- [ ] Update nation cityIds[]
- [ ] Create conquest events
- [ ] Check for nation elimination

#### 5.5 AI Expansion
- [ ] Expand BasicAIController:
  - `chooseProduction(city)` - build units/buildings
  - `chooseTech(nation)` - research priorities
  - `shouldDeclareWar(nation, target)` - war decisions
  - `getUnitObjective(unit)` - movement goals
- [ ] Integrate AI decisions into SimulationEngine.processAIDecisions()
- [ ] Test: AI builds units, declares war, captures cities

### **PHASE 6: Content Definitions** (Week 5)

#### 6.1 Technology Tree
- [ ] Create `src/lib/simulation/content/technologies.ts`
- [ ] Define 30-40 core techs across all eras
- [ ] Add prerequisites, costs, unlocks
- [ ] Integrate with TechManager

#### 6.2 Social Policies
- [ ] Create `src/lib/simulation/content/policies.ts`
- [ ] Define 5-10 policy trees (Tradition, Liberty, Honor, etc.)
- [ ] Add policy effects
- [ ] Integrate with PolicyManager

#### 6.3 Buildings
- [ ] Create `src/lib/simulation/content/buildings.ts`
- [ ] Define 20-30 core buildings
- [ ] Add costs, effects, required techs
- [ ] Integrate with CityProductionManager

#### 6.4 Units
- [ ] Create `src/lib/simulation/content/units.ts`
- [ ] Define unit stats (already have 60+ types in Unit class)
- [ ] Add production costs, required techs
- [ ] Integrate with production system

### **PHASE 7: Advanced Features** (Week 6)

#### 7.1 Simulation Export
- [ ] Create `src/lib/simulation/export/SimulationExporter.ts`
- [ ] Implement `generateHistoricalSummary()`
- [ ] Implement `exportAsCampaignBackstory()`
- [ ] Implement `exportNationAsFaction()`
- [ ] Add export UI to RegionalMapViewer

#### 7.2 Timeline Playback (Optional)
- [ ] Create `SimulationStateManager` for snapshots
- [ ] Implement turn restoration
- [ ] Add timeline scrubbing UI
- [ ] Add playback controls (forward/back)

#### 7.3 Polish
- [ ] Add keyboard shortcuts (space = pause, arrow keys = speed)
- [ ] Add tooltips to all UI elements
- [ ] Add animations (unit movement, city founding)
- [ ] Add sound effects (optional)
- [ ] Optimize rendering for 1000+ turn simulations

### **PHASE 8: Testing & Documentation** (Week 6)

#### 8.1 Integration Tests
- [ ] Test full workflow: Planet → RegionalMap → Simulation → Export
- [ ] Test combat scenarios (unit vs unit, unit vs city)
- [ ] Test AI behavior (city founding, war, tech choices)
- [ ] Test long simulations (1000+ years)
- [ ] Test entity persistence (save/load)

#### 8.2 Documentation
- [ ] Update user guide with simulation instructions
- [ ] Add example scenarios
- [ ] Document API for extending (custom techs, buildings)
- [ ] Create video tutorial (optional)

---

## 🗂️ FILE STRUCTURE

### New Files

```
src/lib/
├── simulation/
│   ├── SimulationEntityBridge.ts (NEW)
│   ├── content/
│   │   ├── technologies.ts (NEW)
│   │   ├── policies.ts (NEW)
│   │   ├── buildings.ts (NEW)
│   │   └── units.ts (NEW)
│   └── export/
│       └── SimulationExporter.ts (NEW)
│
├── components/
│   └── simulation/
│       ├── SimulationControlPanel.svelte (NEW)
│       ├── HexMapRenderer.svelte (NEW)
│       ├── EventLogViewer.svelte (NEW)
│       ├── NationStatsPanel.svelte (NEW)
│       └── TimelineSlider.svelte (NEW - optional)
│
├── entities/
│   ├── location/
│   │   ├── city.ts (MODIFY - add RPG properties)
│   │   ├── cityCreator.ts (MODIFY - add dual modes)
│   │   └── settlement.ts (DEPRECATE)
│   └── military/
│       └── unitCreator.ts (NEW)
│
└── migration/
    └── migrateSettlementsToCities.ts (NEW)
```

### Files to Modify

```
src/lib/
├── types/entity.ts (update Settlement → City references)
├── entities/entityRegistry.ts (remove settlement, keep city)
├── stores/entityStore.ts (no changes needed)
├── components/
│   ├── entities/
│   │   ├── EntityViewer.svelte (add City/Nation/Unit cases)
│   │   └── viewers/
│   │       ├── PlanetViewer.svelte (add "Expand to Regional Map")
│   │       ├── RegionalMapViewer.svelte (add simulation sections)
│   │       ├── CityViewer.svelte (NEW - replaces SettlementViewer)
│   │       ├── NationViewer.svelte (NEW)
│   │       └── UnitViewer.svelte (NEW)
│   └── EntityNavigator.svelte (update sections)
└── simulation/
    ├── SimulationEngine.ts (add unit movement, combat, entity sync)
    └── ai/BasicAIController.ts (expand AI decisions)
```

---

## ✅ NEXT STEPS

### Immediate Actions:

1. **Review Unciv architecture** (check cloned repo)
   - Look at `core/src/com/unciv/logic/GameInfo.kt` (SimulationEngine equivalent)
   - Look at `core/src/com/unciv/logic/city/CityConstructions.kt` (CityProductionManager)
   - Look at `core/src/com/unciv/logic/battle/Battle.kt` (Combat system)

2. **Start Phase 1.1**: Merge Settlement → City
   - Modify City class
   - Update CityCreator
   - Create migration script
   - Test migration

3. **Then Phase 1.2**: SimulationEntityBridge
   - Create bridge class
   - Test entity sync

4. **Then Phase 2.1**: SimulationControlPanel
   - Create component
   - Test in RegionalMapViewer

**Want me to start implementing Phase 1.1 now?** 🚀
