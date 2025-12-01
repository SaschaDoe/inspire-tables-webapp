# Unciv Simulation Integration Plan
## Merging Turn-Based Strategy Simulation with RPG Entity System

---

## 🎯 GOAL

Integrate the Unciv-inspired simulation engine into the RPG content generation web app so users can:

1. **Create a regional map** from a planetary hex tile
2. **Initialize a simulation** with nations on that map
3. **Run the simulation** and watch nations found cities, expand, research tech, and fight
4. **View in real-time**: See cities appear, units move, battles occur, borders change
5. **Review the history**: Scrub through timeline, view event log, see nation stats
6. **Generate RPG content**: Export nations, cities, battles as permanent entities for RPG campaigns

---

## 📋 CURRENT STATE SUMMARY

### ✅ **Working:**
- SimulationEngine (turn processing, managers)
- City systems (growth, production, expansion)
- Nation systems (tech, policies, diplomacy)
- AI city founding
- RegionalMap generation
- Event tracking
- RegionalMapViewer (static map display)

### ⚠️ **Partially Working:**
- EntityType already has: Nation, City, Unit, HistoricalEvent, Battle
- NationCreator exists
- Unit entity defined but not integrated
- Combat mechanics exist but not in simulation loop

### ❌ **Missing:**
- Simulation UI controls (start/stop/speed/timeline)
- Nation/City viewers with Unciv graphics
- Unit creation and movement in simulation
- Combat integration in simulation
- Event log viewer UI
- Nation borders on map display
- City/unit icons on map
- Integration into Planet → RegionalMap workflow

---

## 🗺️ ARCHITECTURE OVERVIEW

### Entity Hierarchy for Simulation

```
Planet
  └─ PlanetaryHexTile (continental hex)
       └─ RegionalMap (simulation container)
            ├─ RegionalHexTiles[] (terrain hexes)
            ├─ Nations[] (permanent entities)
            │    ├─ Cities[] (permanent entities)
            │    └─ Units[] (permanent entities)
            ├─ HistoricalEvents[] (permanent entities)
            └─ Battles[] (permanent entities)
```

### Simulation Workflow

```
User Flow:
  Planet Viewer
    → Click planetary hex → "Expand to Regional Map"
      → RegionalMapCreator generates terrain
        → Save RegionalMap entity
          → Open RegionalMapViewer
            → [SIMULATION SECTION]
              ├─ Setup: Configure simulation (nations, years, settings)
              ├─ Initialize: Create Nation entities, place starting cities
              ├─ Run: Process turns with live updates
              ├─ View: Toggle between views (Continent/Nation/City)
              ├─ Review: Event log, timeline slider, nation stats
              └─ Export: Save simulation results as RPG content
```

---

## 📝 DETAILED IMPLEMENTATION PLAN

---

## **PHASE 1: Entity System Integration** (Foundation)

### 1.1 Update Entity Types & Interfaces

**File:** `src/lib/types/entity.ts`

✅ **Already exists:** Nation, City, Unit, HistoricalEvent, Battle

**Add specific interfaces:**

```typescript
export interface NationEntity extends Entity {
  type: EntityType.Nation;
  // Link to simulation Nation class data
  simulationData: {
    foundingYear: number;
    currentEra: string;
    isActive: boolean;
    isEliminated: boolean;
    capitalCityId?: string;
    resources: { gold: number; science: number; culture: number };
  };
  cityIds: string[]; // City entity IDs
  unitIds: string[]; // Unit entity IDs
}

export interface CityEntity extends Entity {
  type: EntityType.City;
  simulationData: {
    ownerNationId: string;
    foundedYear: number;
    population: number;
    isCapital: boolean;
    hexTileId: string; // RegionalHexTile ID
    coordinates: { x: number; y: number };
  };
  unitIds: string[]; // Garrisoned units
}

export interface UnitEntity extends Entity {
  type: EntityType.Unit;
  simulationData: {
    ownerNationId: string;
    unitType: string; // 'warrior', 'archer', etc.
    hexTileId: string;
    coordinates: { x: number; y: number };
    combatStrength: number;
    health: number;
  };
}

export interface BattleEntity extends Entity {
  type: EntityType.Battle;
  simulationData: {
    year: number;
    turn: number;
    attackerNationId: string;
    defenderNationId: string;
    hexTileId: string;
    attackerUnits: string[];
    defenderUnits: string[];
    outcome: 'attacker_victory' | 'defender_victory' | 'draw';
    casualties: { attacker: number; defender: number };
  };
}
```

### 1.2 Create City/Unit Creators

**Files to create:**

**`src/lib/entities/location/cityCreator.ts`**
```typescript
import { Creator } from '../base/creator';
import { City } from './city';

export class CityCreator extends Creator<City> {
  // For simulation-generated cities
  static createFromSimulation(
    name: string,
    ownerNationId: string,
    hexTileId: string,
    coordinates: { x: number; y: number },
    foundedYear: number
  ): City {
    const city = new City();
    city.name = name;
    city.ownerNationId = ownerNationId;
    city.founderNationId = ownerNationId;
    city.hexTileId = hexTileId;
    city.coordinates = coordinates;
    city.foundedYear = foundedYear;
    city.population = 1;
    return city;
  }

  // For manual RPG city creation (existing SettlementCreator pattern)
  create(): City {
    const city = new City();
    // Generate RPG-style city with random name, characteristics
    city.name = this.generateCityName();
    city.population = this.dice.rollDice(1, 10) + 5;
    // ... other RPG generation logic
    return city;
  }
}
```

**`src/lib/entities/military/unitCreator.ts`**
```typescript
export class UnitCreator extends Creator<Unit> {
  static createFromSimulation(
    unitType: string,
    ownerNationId: string,
    hexTileId: string,
    coordinates: { x: number; y: number }
  ): Unit {
    const unit = new Unit();
    unit.unitType = unitType;
    unit.ownerNationId = ownerNationId;
    unit.hexTileId = hexTileId;
    unit.coordinates = coordinates;
    // ... set combat strength, movement, etc.
    return unit;
  }

  create(): Unit {
    // Manual RPG unit creation
  }
}
```

### 1.3 Register Entities

**File:** `src/lib/entities/entityRegistry.ts`

**Add to registry:**
```typescript
city: {
  name: 'city',
  displayName: 'City',
  icon: '🏛️',
  description: 'A city with population, buildings, and production',
  creator: () => new CityCreator(),
  category: 'Locations'
},
unit: {
  name: 'unit',
  displayName: 'Military Unit',
  icon: '⚔️',
  description: 'A military unit with combat strength and movement',
  creator: () => new UnitCreator(),
  category: 'Simulation'
}
```

### 1.4 Add Derived Stores

**File:** `src/lib/stores/entityStore.ts`

**Add:**
```typescript
export const cityEntities = derived(allEntities, $all =>
  $all.filter(e => e.type === 'city')
);

export const unitEntities = derived(allEntities, $all =>
  $all.filter(e => e.type === 'unit')
);

export const battleEntities = derived(allEntities, $all =>
  $all.filter(e => e.type === 'battle')
);

export const historicalEventEntities = derived(allEntities, $all =>
  $all.filter(e => e.type === 'historicalEvent')
);
```

---

## **PHASE 2: SimulationEngine ↔ EntityStore Integration**

### 2.1 Create SimulationEntityBridge

**New file:** `src/lib/simulation/SimulationEntityBridge.ts`

**Purpose:** Sync simulation objects ↔ entityStore entities

```typescript
/**
 * Bridge between SimulationEngine and EntityStore
 * Converts simulation classes (Nation, City, Unit) to/from Entity wrappers
 */
export class SimulationEntityBridge {
  constructor(
    private regionalMapId: string,
    private entityStore: typeof entityStore
  ) {}

  /**
   * Create Nation entity from simulation Nation class
   */
  saveNation(nation: Nation): string {
    const existingEntity = this.entityStore.getEntity(nation.id);

    if (existingEntity) {
      // Update existing
      this.entityStore.updateEntity(nation.id, {
        name: nation.name,
        description: `${nation.adjective} civilization led by ${nation.leaderName}`,
        customFields: {
          generatedEntity: nation,
          simulationData: this.extractNationData(nation)
        }
      });
    } else {
      // Create new
      const entity: Entity = {
        id: nation.id,
        type: EntityType.Nation,
        name: nation.name,
        description: `${nation.adjective} civilization led by ${nation.leaderName}`,
        tags: ['simulation', 'nation', nation.currentEra],
        parentId: this.regionalMapId,
        metadata: { createdAt: new Date(), updatedAt: new Date() },
        relationships: [],
        customFields: {
          generatedEntity: nation,
          simulationData: this.extractNationData(nation)
        }
      };
      this.entityStore.createEntity(entity);
    }

    return nation.id;
  }

  /**
   * Similar methods for City, Unit, HistoricalEvent, Battle
   */
  saveCity(city: City): string { /* ... */ }
  saveUnit(unit: Unit): string { /* ... */ }
  saveEvent(event: HistoricalEvent): string { /* ... */ }
  saveBattle(battle: Battle): string { /* ... */ }

  /**
   * Load simulation Nation from entity
   */
  loadNation(entityId: string): Nation | null {
    const entity = this.entityStore.getEntity(entityId);
    if (!entity || entity.type !== EntityType.Nation) return null;
    return entity.customFields.generatedEntity as Nation;
  }

  /**
   * Sync all simulation entities to store
   */
  syncToStore(engine: SimulationEngine): void {
    // Save all nations
    for (const nationId of engine.nationIds) {
      const nation = this.entityStore.getEntity(nationId) as Nation;
      this.saveNation(nation);
    }

    // Save all cities
    for (const cityId of engine.cityIds) {
      const city = this.entityStore.getEntity(cityId) as City;
      this.saveCity(city);
    }

    // Save all units (when implemented)
    // Save all events
    // Update RegionalMap with IDs
  }

  /**
   * Extract simplified data for quick access (without full object)
   */
  private extractNationData(nation: Nation) {
    return {
      foundingYear: nation.foundingYear,
      currentEra: nation.currentEra,
      isActive: nation.isActive,
      isEliminated: nation.isEliminated,
      capitalCityId: nation.capitalCityId,
      resources: { ...nation.resources },
      yields: { ...nation.yields },
      cityCount: nation.cityIds.length
    };
  }
}
```

### 2.2 Modify SimulationEngine

**File:** `src/lib/simulation/SimulationEngine.ts`

**Add:**
```typescript
import { SimulationEntityBridge } from './SimulationEntityBridge';

export class SimulationEngine {
  // Add bridge
  private entityBridge?: SimulationEntityBridge;

  constructor(
    config?: Partial<SimulationConfig>,
    regionalMapId?: string // NEW
  ) {
    // ... existing code ...

    if (regionalMapId) {
      this.entityBridge = new SimulationEntityBridge(regionalMapId, entityStore);
    }
  }

  /**
   * Process turn with entity sync
   */
  processTurn(): void {
    if (!this.isRunning || this.isPaused) return;

    // ... existing turn processing ...

    // NEW: Sync to entity store after each turn
    if (this.entityBridge) {
      this.entityBridge.syncToStore(this);
    }
  }

  /**
   * Initialize simulation from entity store
   */
  initializeFromEntities(regionalMapEntity: Entity): void {
    const regionalMap = regionalMapEntity.customFields.generatedEntity as RegionalMap;

    // Load existing nations/cities/units if resuming
    this.nationIds = regionalMap.nationIds || [];
    this.cityIds = regionalMap.cityIds || [];
    this.regionalMapIds = [regionalMap.id];

    // Load objects from entity store
    // ... initialization logic ...

    this.isRunning = true;
  }
}
```

### 2.3 Update RegionalMap Entity

**File:** `src/lib/entities/location/regionalMap.ts`

**Already has these fields - just ensure they're used:**
```typescript
// Simulation state (already exists)
nationIds: string[] = [];
cityIds: string[] = [];
unitIds: string[] = [];
historicalEventIds: string[] = [];
battleIds: string[] = [];

isSimulationRunning: boolean = false;
simulationProgress: number = 0;
lastSimulatedYear: number = 0;

simulationConfig = {
  startYear: -10000,
  yearsPerTurn: 1,
  maxTurns: 1000,
  numberOfNations: 3,
  fantasyMode: false,
  magicEnabled: false
};
```

---

## **PHASE 3: UI Components - Simulation Controls**

### 3.1 Create SimulationControlPanel Component

**New file:** `src/lib/components/simulation/SimulationControlPanel.svelte`

**Features:**
- **State indicator**: Not Started / Initializing / Running / Paused / Completed
- **Initialize button**: Sets up nations on the map
- **Controls**:
  - Play/Pause button
  - Step (1 turn) button
  - Speed selector: 1x, 2x, 5x, 10x, Max speed
  - Stop/Reset button
- **Progress**:
  - Current year display
  - Current turn / max turns
  - Progress bar
- **Settings** (collapsible):
  - Number of nations (2-8)
  - Start year
  - Years per turn
  - Max turns
  - Fantasy mode toggle
  - Magic enabled toggle

**Props:**
```typescript
interface Props {
  regionalMap: RegionalMap;
  parentEntity: Entity; // RegionalMap wrapper entity
  onSimulationUpdate: (engine: SimulationEngine) => void;
}
```

**State:**
```typescript
let engine: SimulationEngine | null = $state(null);
let isInitialized = $state(false);
let isRunning = $state(false);
let isPaused = $state(false);
let currentYear = $state(-10000);
let currentTurn = $state(0);
let speed = $state(1); // 1x, 2x, 5x, 10x, or 0 (max)
let animationFrame: number | null = $state(null);
```

**Key methods:**
```typescript
async function initializeSimulation() {
  // 1. Create simulation engine
  engine = new SimulationEngine(
    regionalMap.simulationConfig,
    parentEntity.id
  );

  // 2. Generate initial nations using AI
  const nations = await generateInitialNations(
    regionalMap.simulationConfig.numberOfNations,
    regionalMap
  );

  // 3. Save nations to entity store
  for (const nation of nations) {
    entityStore.createEntity(wrapNationAsEntity(nation, parentEntity.id));
    engine.nationIds.push(nation.id);
  }

  // 4. Place starting settlers/cities
  for (const nation of nations) {
    const city = placeStartingCity(nation, regionalMap);
    entityStore.createEntity(wrapCityAsEntity(city, nation.id));
    engine.cityIds.push(city.id);
  }

  // 5. Update RegionalMap entity
  regionalMap.nationIds = nations.map(n => n.id);
  regionalMap.cityIds = nations.map(n => n.cityIds).flat();
  updateRegionalMapEntity(parentEntity, regionalMap);

  isInitialized = true;
}

function startSimulation() {
  if (!engine) return;
  engine.start();
  isRunning = true;
  isPaused = false;
  runSimulationLoop();
}

function runSimulationLoop() {
  if (!engine || !isRunning || isPaused) return;

  // Process turn
  engine.processTurn();

  // Update UI
  currentYear = engine.currentYear;
  currentTurn = engine.currentTurn;

  // Notify parent to re-render map
  onSimulationUpdate(engine);

  // Schedule next turn based on speed
  const delay = speed === 0 ? 0 : 1000 / speed; // 0 = max speed
  animationFrame = setTimeout(() => runSimulationLoop(), delay);
}

function pauseSimulation() {
  isPaused = true;
  if (animationFrame) clearTimeout(animationFrame);
}

function stepSimulation() {
  if (!engine) return;
  engine.processTurn();
  currentYear = engine.currentYear;
  currentTurn = engine.currentTurn;
  onSimulationUpdate(engine);
}

function stopSimulation() {
  if (engine) engine.stop();
  isRunning = false;
  isPaused = false;
  if (animationFrame) clearTimeout(animationFrame);
}
```

### 3.2 Create TimelineSlider Component

**New file:** `src/lib/components/simulation/TimelineSlider.svelte`

**Features:**
- Slider from turn 0 → current max turn
- Play/pause timeline playback
- Year labels at key points
- Event markers on timeline (dots for battles, city foundings)
- Scrub to any turn (reconstructs state)

**Props:**
```typescript
interface Props {
  engine: SimulationEngine;
  onTurnChange: (turn: number) => void;
}
```

### 3.3 Create EventLogViewer Component

**New file:** `src/lib/components/simulation/EventLogViewer.svelte`

**Features:**
- Scrollable list of all historical events
- Filters:
  - Event type (city founded, war declared, tech discovered, etc.)
  - Nation (show only events for selected nation)
  - Significance (minor/normal/major/critical/historic)
  - Year range
- Event cards with:
  - Icon based on event type
  - Title and description
  - Year and turn
  - Participants (clickable → open entity)
  - Location (clickable → zoom to hex)
- Click event → highlight on map
- Click participant → open Nation/City/Unit entity

**Props:**
```typescript
interface Props {
  eventIds: string[]; // HistoricalEvent entity IDs
  onEventClick: (event: HistoricalEvent) => void;
  onParticipantClick: (entityId: string) => void;
}
```

### 3.4 Create NationStatsPanel Component

**New file:** `src/lib/components/simulation/NationStatsPanel.svelte`

**Features:**
- List of all nations with:
  - Flag/color swatch
  - Name and leader
  - Cities count
  - Military power (unit count)
  - Tech/culture progress
  - Status (active/eliminated)
- Sort by: cities, military, science, culture
- Click nation → open Nation entity
- Color-coded by status (active green, eliminated red)

**Props:**
```typescript
interface Props {
  nationIds: string[];
  onNationClick: (nationId: string) => void;
}
```

---

## **PHASE 4: Map Visualization Enhancements**

### 4.1 Enhance RegionalMapViewer

**File:** `src/lib/components/entities/viewers/RegionalMapViewer.svelte`

**Add new sections:**

```svelte
<script lang="ts">
  import SimulationControlPanel from '$lib/components/simulation/SimulationControlPanel.svelte';
  import EventLogViewer from '$lib/components/simulation/EventLogViewer.svelte';
  import NationStatsPanel from '$lib/components/simulation/NationStatsPanel.svelte';
  import TimelineSlider from '$lib/components/simulation/TimelineSlider.svelte';

  let viewMode = $state<'terrain' | 'political' | 'nation'>('terrain');
  let selectedNation: Nation | null = $state(null);
  let simulationEngine: SimulationEngine | null = $state(null);

  function handleSimulationUpdate(engine: SimulationEngine) {
    simulationEngine = engine;
    // Trigger map re-render
    mapKey++;
  }
</script>

<!-- Existing overview cards -->
<Section title="Simulation" startOpen={true}>
  <SimulationControlPanel
    {regionalMap}
    {parentEntity}
    onSimulationUpdate={handleSimulationUpdate}
  />
</Section>

<!-- View mode toggle -->
<Section title="View">
  <div class="view-mode-toggle">
    <button onclick={() => viewMode = 'terrain'}>Terrain View</button>
    <button onclick={() => viewMode = 'political'}>Political View</button>
    <button onclick={() => viewMode = 'nation'}>Nation View</button>
  </div>

  {#if viewMode === 'nation'}
    <select bind:value={selectedNation}>
      {#each regionalMap.nationIds as nationId}
        <option value={entityStore.getEntity(nationId)}>
          {entityStore.getEntity(nationId)?.name}
        </option>
      {/each}
    </select>
  {/if}
</Section>

<!-- Enhanced hex map with overlays -->
<Section title="Map Visualization">
  <HexMapRenderer
    {regionalMap}
    {viewMode}
    {selectedNation}
    {simulationEngine}
    showNationBorders={viewMode === 'political' || viewMode === 'nation'}
    showCities={true}
    showUnits={viewMode === 'nation'}
    {selectedHex}
    on:hexClick={handleHexClick}
    on:cityClick={handleCityClick}
    on:unitClick={handleUnitClick}
  />
</Section>

{#if simulationEngine}
  <Section title="Timeline">
    <TimelineSlider
      engine={simulationEngine}
      onTurnChange={handleTurnChange}
    />
  </Section>

  <Section title="Nations">
    <NationStatsPanel
      nationIds={regionalMap.nationIds}
      onNationClick={handleNationClick}
    />
  </Section>

  <Section title="Event Log">
    <EventLogViewer
      eventIds={regionalMap.historicalEventIds}
      onEventClick={handleEventClick}
      onParticipantClick={handleParticipantClick}
    />
  </Section>
{/if}
```

### 4.2 Create HexMapRenderer Component

**New file:** `src/lib/components/simulation/HexMapRenderer.svelte`

**Purpose:** Enhanced hex map with simulation overlays

**Features:**
- Base terrain rendering (reuse existing SVG hex code)
- **Nation borders overlay**:
  - Colored hex fills based on owner nation
  - Border lines between nations (thick lines)
- **City markers**:
  - Icon at city hex center
  - City name label
  - Capital star icon
  - Size indicator (population)
- **Unit markers**:
  - Unit icon at hex center
  - Stack count if multiple units
  - Movement animation (optional)
- **Resource indicators**: Existing resource icons
- **Interactive**:
  - Click hex → show details
  - Click city → dispatch cityClick event
  - Click unit → dispatch unitClick event
  - Hover → highlight hex + tooltip

**Rendering layers (SVG groups):**
```svelte
<svg>
  <g id="terrain-layer"><!-- Base hex colors --></g>
  <g id="features-layer"><!-- Rivers, forests, etc. --></g>
  <g id="resources-layer"><!-- Resource icons --></g>
  <g id="borders-layer"><!-- Nation border lines --></g>
  <g id="nation-overlay"><!-- Semi-transparent nation colors --></g>
  <g id="cities-layer"><!-- City icons and labels --></g>
  <g id="units-layer"><!-- Unit icons --></g>
  <g id="selection-layer"><!-- Selected hex highlight --></g>
</svg>
```

### 4.3 Unciv Graphics Integration

**Use existing Unciv assets:** `static/civ5-assets/`

**Needed graphics:**
- City icons (by size: 1-5, 6-10, 11-15, 16-20, 21+)
- Capital city icon (star)
- Unit icons (warrior, archer, spearman, etc.)
- Terrain (already have: terrain/, features/, resources/)

**Load patterns:**
```svelte
<script>
  const cityIconPath = $derived(
    `/civ5-assets/cities/city-${getCitySizeCategory(city.population)}.png`
  );

  const unitIconPath = $derived(
    `/civ5-assets/units/${unit.unitType}.png`
  );
</script>

{#if graphicsMode}
  <image href={cityIconPath} x={hexX} y={hexY} width={32} height={32} />
{:else}
  <circle cx={hexX} cy={hexY} r={8} fill="white" stroke="black" />
{/if}
```

---

## **PHASE 5: Entity Viewers for Simulation Objects**

### 5.1 Create NationViewer Component

**New file:** `src/lib/components/entities/viewers/NationViewer.svelte`

**Follow pattern from PlanetViewer/ContinentViewer**

**Sections:**

1. **Overview**:
   - Flag/color preview
   - Leader name and title
   - Government type
   - Current era
   - Founding year
   - Status (active/eliminated)

2. **Resources & Yields**:
   - InfoGrid with gold, science, culture, happiness
   - Per-turn yields (gold/turn, science/turn, etc.)

3. **Culture Traits**:
   - Bar chart showing 6 traits (militaristic, expansionist, etc.)

4. **Technology**:
   - Researched techs list
   - Current research progress
   - Era progression

5. **Social Policies**:
   - Adopted policies list
   - Available culture
   - Next policy cost

6. **Cities** (EntityList):
   - All cities owned by this nation
   - Click → open City entity
   - Add button (for manual city creation)

7. **Military** (EntityList):
   - All units owned by this nation
   - Grouped by type
   - Total military power

8. **Diplomacy**:
   - Relations with other nations
   - Treaties and wars
   - Opinion modifiers

9. **History**:
   - Historical events involving this nation
   - Timeline of major events
   - Conquest history

**Props:**
```typescript
interface Props {
  nation: Nation;
  parentEntity?: Entity; // RegionalMap entity
}
```

### 5.2 Create CityViewer Component

**New file:** `src/lib/components/entities/viewers/CityViewer.svelte`

**Sections:**

1. **Overview**:
   - City name
   - Population
   - Founded year
   - Capital status
   - Owner nation (link)
   - Location coordinates

2. **Yields**:
   - Food, production, gold, science, culture
   - Breakdown (from tiles, from buildings, from specialists)

3. **Population Management**:
   - Current population
   - Food stored / food needed
   - Growth rate (turns to next pop)
   - Starvation status

4. **Production**:
   - Current production item
   - Progress bar
   - Turns remaining
   - Production queue

5. **Buildings** (list):
   - Constructed buildings
   - Building effects
   - Wonders (if any)

6. **Territory**:
   - Owned hex tiles count
   - Culture stored / next expansion cost
   - Mini-map of city territory

7. **Military**:
   - Garrisoned units
   - Combat strength
   - Defense bonuses

8. **History**:
   - City events
   - Conquest history
   - Previous owners

**Props:**
```typescript
interface Props {
  city: City;
  parentEntity?: Entity; // Nation entity
}
```

### 5.3 Create UnitViewer Component

**New file:** `src/lib/components/entities/viewers/UnitViewer.svelte`

**Sections:**

1. **Overview**:
   - Unit type and name
   - Owner nation (link)
   - Location (hex coordinates + mini-map)

2. **Combat Stats**:
   - Combat strength
   - Ranged strength (if applicable)
   - Movement points
   - Health (HP bar)

3. **Experience & Promotions**:
   - Current XP / next promotion
   - Promotions earned
   - Veteran status

4. **Status**:
   - Fortified status
   - Embarked (on water)
   - Garrisoned (in city)

5. **History**:
   - Battles participated in
   - Cities captured
   - Units defeated

**Props:**
```typescript
interface Props {
  unit: Unit;
  parentEntity?: Entity; // Nation or City entity
}
```

### 5.4 Update EntityViewer Router

**File:** `src/lib/components/entities/EntityViewer.svelte`

**Add cases:**
```svelte
{#if entity.type === 'nation'}
  <NationViewer
    nation={entity.customFields.generatedEntity}
    parentEntity={entity}
    {onOpenEntity}
    {onEntityUpdated}
  />
{:else if entity.type === 'city'}
  <CityViewer
    city={entity.customFields.generatedEntity}
    parentEntity={entity}
    {onOpenEntity}
    {onEntityUpdated}
  />
{:else if entity.type === 'unit'}
  <UnitViewer
    unit={entity.customFields.generatedEntity}
    parentEntity={entity}
    {onOpenEntity}
    {onEntityUpdated}
  />
{/if}
```

---

## **PHASE 6: Combat System Integration**

### 6.1 Add Unit Production to SimulationEngine

**File:** `src/lib/simulation/SimulationEngine.ts`

**Add to `processCities()` method:**

```typescript
private processCities(): void {
  for (const cityId of this.cityIds) {
    const city = entityStore.getEntity(cityId) as City;
    if (!city) continue;

    // ... existing code ...

    // NEW: Handle unit production completion
    if (result.productionCompleted && result.productionItem) {
      if (result.productionItem.type === ProductionItemType.Unit) {
        // Create unit at city location
        const unit = UnitCreator.createFromSimulation(
          result.productionItem.itemId, // unit type
          city.ownerNationId,
          city.hexTileId,
          city.coordinates
        );

        // Save to entity store
        const unitEntity = this.entityBridge.saveUnit(unit);

        // Add to simulation tracking
        this.unitIds.push(unit.id);

        // Add to nation's unit list
        const nation = entityStore.getEntity(city.ownerNationId) as Nation;
        nation.unitIds.push(unit.id);

        // Create event
        this.createUnitProducedEvent(city, unit);
      }
    }
  }
}
```

### 6.2 Add Unit Movement Phase

**File:** `src/lib/simulation/SimulationEngine.ts`

**Add new phase to `processTurn()`:**

```typescript
processTurn(): void {
  // ... existing phases ...

  // Phase 3: Process cities
  this.processCities();

  // Phase 4: Process nations
  this.processNations();

  // NEW: Phase 4.5: Process unit movement
  this.processUnits();

  // Phase 5: AI decisions
  this.processAIDecisions();

  // ... rest of turn ...
}

/**
 * Process all units (movement, combat)
 */
private processUnits(): void {
  for (const unitId of this.unitIds) {
    const unit = entityStore.getEntity(unitId) as Unit;
    if (!unit) continue;

    // Restore movement points
    unit.movementPoints = unit.maxMovementPoints;

    // AI-controlled units move
    if (unit.isAIControlled) {
      this.aiMoveUnit(unit);
    }
  }
}
```

### 6.3 Add Combat Resolution

**File:** `src/lib/simulation/SimulationEngine.ts`

**Add method:**

```typescript
/**
 * AI moves a unit (toward enemy cities or defensive positions)
 */
private aiMoveUnit(unit: Unit): void {
  const nation = entityStore.getEntity(unit.ownerNationId) as Nation;

  // Get adjacent hexes
  const adjacentHexes = this.getAdjacentHexes(unit.hexTileId);

  // Check for enemy units to attack
  for (const hexId of adjacentHexes) {
    const enemyUnit = this.getUnitAtHex(hexId);
    if (enemyUnit && enemyUnit.ownerNationId !== unit.ownerNationId) {
      // COMBAT!
      this.resolveCombat(unit, enemyUnit);
      return;
    }
  }

  // Check for enemy cities to attack
  for (const hexId of adjacentHexes) {
    const city = this.getCityAtHex(hexId);
    if (city && city.ownerNationId !== unit.ownerNationId) {
      // ATTACK CITY!
      this.attackCity(unit, city);
      return;
    }
  }

  // No combat → move toward objective
  this.aiMoveUnitToward(unit, this.getUnitObjective(unit));
}

/**
 * Resolve combat between two units
 */
private resolveCombat(attacker: Unit, defender: Unit): void {
  // Use existing combat formulas from Unit class
  const attackerDamage = attacker.calculateDamageToUnit(defender);
  const defenderDamage = defender.calculateDamageToUnit(attacker);

  // Apply damage
  defender.health -= attackerDamage;
  attacker.health -= defenderDamage;

  // Create battle entity
  const battle = this.createBattle(attacker, defender, attackerDamage, defenderDamage);

  // Create historical event
  this.createBattleEvent(attacker, defender, battle);

  // Remove defeated units
  if (defender.health <= 0) {
    this.destroyUnit(defender);
    attacker.experience += 5;
  }
  if (attacker.health <= 0) {
    this.destroyUnit(attacker);
  }
}

/**
 * Unit attacks city
 */
private attackCity(unit: Unit, city: City): void {
  const damage = unit.calculateDamageToCity(city);
  city.hitPoints -= damage;

  // City counterattack if has range
  if (city.rangedStrength > 0) {
    const counterDamage = city.calculateDamageToUnit(unit);
    unit.health -= counterDamage;
  }

  // City captured?
  if (city.hitPoints <= 0) {
    this.captureCity(unit, city);
  }

  // Create battle event
  this.createCitySiegeEvent(unit, city, damage);
}

/**
 * Capture city for new owner
 */
private captureCity(conquerorUnit: Unit, city: City): void {
  const oldOwner = entityStore.getEntity(city.ownerNationId) as Nation;
  const newOwner = entityStore.getEntity(conquerorUnit.ownerNationId) as Nation;

  // Transfer ownership
  oldOwner.cityIds = oldOwner.cityIds.filter(id => id !== city.id);
  newOwner.cityIds.push(city.id);
  city.ownerNationId = newOwner.id;

  // Reset city
  city.hitPoints = city.maxHitPoints;
  city.population = Math.max(1, city.population - 1); // Lose 1 pop

  // Record conquest
  city.conquestHistory.push({
    conquerorNationId: newOwner.id,
    year: this.currentYear,
    razed: false
  });

  // Create event
  this.createCityConqueredEvent(newOwner, oldOwner, city);

  // Check if capital was captured
  if (city.id === oldOwner.capitalCityId) {
    oldOwner.capitalCityId = oldOwner.cityIds[0]; // New capital
  }

  // Check if nation eliminated
  if (oldOwner.cityIds.length === 0) {
    oldOwner.isEliminated = true;
    oldOwner.isActive = false;
    this.createNationEliminatedEvent(oldOwner, newOwner);
  }

  // Update entities in store
  this.entityBridge.saveNation(oldOwner);
  this.entityBridge.saveNation(newOwner);
  this.entityBridge.saveCity(city);
}
```

### 6.4 Update AI Controller

**File:** `src/lib/simulation/ai/BasicAIController.ts`

**Expand to handle:**

```typescript
export class BasicAIController implements IAIController {
  // Existing city founding...

  /**
   * Choose production for a city
   */
  chooseProduction(city: City, nation: Nation, currentTurn: number): ProductionChoice {
    // Early game: build settlers and warriors
    if (nation.cityIds.length < 3 && currentTurn < 50) {
      return { type: 'unit', itemId: 'settler', cost: 50 };
    }

    // Militaristic: build military units
    if (nation.cultureTraits.militaristic > 60) {
      return this.chooseMilitaryUnit(city, nation);
    }

    // Otherwise: build buildings
    return this.chooseBuilding(city, nation);
  }

  /**
   * Choose tech to research
   */
  chooseTech(nation: Nation): string {
    // Scientific nations prioritize science techs
    // Militaristic nations prioritize military techs
    // ... logic ...
  }

  /**
   * Decide whether to declare war
   */
  shouldDeclareWar(nation: Nation, targetNation: Nation): boolean {
    // Based on militaristic trait, relative strength, relations
    const militaryRatio = this.calculateMilitaryPower(nation) /
                          this.calculateMilitaryPower(targetNation);

    return nation.cultureTraits.militaristic > 60 && militaryRatio > 1.5;
  }

  /**
   * Get movement objective for a unit
   */
  getUnitObjective(unit: Unit, nation: Nation): { x: number, y: number } {
    // Defensive: stay near cities
    // Offensive: move toward enemy cities
    // Explorer: explore unclaimed territory
  }
}
```

---

## **PHASE 7: Tech & Policy Content**

### 7.1 Create Technology Definitions

**New file:** `src/lib/simulation/content/technologies.ts`

```typescript
export interface TechDefinition {
  id: string;
  name: string;
  era: Era;
  cost: number;
  prerequisites: string[];
  unlocks: {
    units?: string[];
    buildings?: string[];
    abilities?: string[];
  };
  description: string;
}

export const TECHNOLOGIES: Record<string, TechDefinition> = {
  // Prehistoric
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    era: Era.Prehistoric,
    cost: 20,
    prerequisites: [],
    unlocks: {
      buildings: ['granary'],
      abilities: ['farm_improvement']
    },
    description: 'Allows basic farming and food storage'
  },

  animalHusbandry: {
    id: 'animalHusbandry',
    name: 'Animal Husbandry',
    era: Era.Prehistoric,
    cost: 25,
    prerequisites: [],
    unlocks: {
      units: ['horseman'],
      buildings: ['stable'],
      abilities: ['pasture_improvement']
    },
    description: 'Domestication of animals for food and labor'
  },

  mining: {
    id: 'mining',
    name: 'Mining',
    era: Era.Prehistoric,
    cost: 30,
    prerequisites: [],
    unlocks: {
      abilities: ['mine_improvement']
    },
    description: 'Extract valuable resources from the earth'
  },

  // Ancient
  bronzeWorking: {
    id: 'bronzeWorking',
    name: 'Bronze Working',
    era: Era.Ancient,
    cost: 50,
    prerequisites: ['mining'],
    unlocks: {
      units: ['spearman'],
      buildings: ['barracks']
    },
    description: 'Metallurgy enables stronger weapons and tools'
  },

  writing: {
    id: 'writing',
    name: 'Writing',
    era: Era.Ancient,
    cost: 50,
    prerequisites: [],
    unlocks: {
      buildings: ['library'],
      abilities: ['embassies']
    },
    description: 'Record keeping and knowledge transmission'
  },

  // ... define ~30-40 core techs across all eras
};
```

### 7.2 Create Policy Definitions

**New file:** `src/lib/simulation/content/policies.ts`

```typescript
export interface PolicyDefinition {
  id: string;
  name: string;
  tree: string; // 'tradition', 'liberty', 'honor', etc.
  position: number; // Position in tree
  prerequisites: string[]; // Other policies in same tree
  effects: PolicyEffect[];
  description: string;
}

export interface PolicyEffect {
  type: 'yield_bonus' | 'cost_reduction' | 'unit_bonus' | 'other';
  target?: string;
  value: number;
  description: string;
}

export const POLICY_TREES = {
  tradition: {
    name: 'Tradition',
    description: 'Focus on infrastructure and growth',
    policies: {
      aristocracy: {
        id: 'aristocracy',
        name: 'Aristocracy',
        effects: [
          { type: 'yield_bonus', target: 'production', value: 15, description: '+15% production when building wonders' }
        ]
      },
      // ... other tradition policies
    }
  },

  liberty: {
    name: 'Liberty',
    description: 'Rapid expansion and settlers',
    policies: {
      // ...
    }
  },

  // ... other policy trees
};
```

### 7.3 Create Building Definitions

**New file:** `src/lib/simulation/content/buildings.ts`

```typescript
export interface BuildingDefinition {
  id: string;
  name: string;
  era: Era;
  productionCost: number;
  goldCost: number;
  maintenanceCost: number;
  requiredTech?: string;
  effects: BuildingEffect[];
  description: string;
}

export const BUILDINGS: Record<string, BuildingDefinition> = {
  granary: {
    id: 'granary',
    name: 'Granary',
    era: Era.Ancient,
    productionCost: 60,
    goldCost: 300,
    maintenanceCost: 1,
    requiredTech: 'agriculture',
    effects: [
      { type: 'yield', stat: 'food', value: 2 },
      { type: 'growth', value: 15, description: '+15% food carried over on growth' }
    ],
    description: 'Stores food for the city'
  },
  // ... define ~20-30 core buildings
};
```

### 6.4 Integrate Content into Managers

**Update TechManager:**
```typescript
import { TECHNOLOGIES } from '../content/technologies';

processTurn(sciencePerTurn: number): TechCompletionResult {
  // ... existing code ...

  // On tech completion, apply unlocks
  if (completed) {
    const techDef = TECHNOLOGIES[this.currentTech];
    if (techDef) {
      return {
        completed: true,
        techId: this.currentTech,
        unlocks: techDef.unlocks // Return what this tech unlocked
      };
    }
  }
}
```

---

## **PHASE 8: Planet → RegionalMap Workflow**

### 8.1 Update PlanetViewer - Add Regional Map Creation

**File:** `src/lib/components/entities/viewers/PlanetViewer.svelte`

**Add button next to hex tiles:**

```svelte
<!-- In world map section, when a hex is selected -->
{#if selectedHex}
  <div class="hex-details-panel">
    <h3>Planetary Hex ({selectedHex.x}, {selectedHex.y})</h3>
    <InfoGrid items={hexDetailsInfo} />

    {#if selectedHex.hasRegionalMap}
      <button onclick={() => openRegionalMap(selectedHex.regionalMapId)}>
        Open Regional Map
      </button>
    {:else}
      <button onclick={() => generateRegionalMap(selectedHex)}>
        Expand to Regional Map (Simulation)
      </button>
    {/if}
  </div>
{/if}

<script>
  async function generateRegionalMap(planetaryHex: PlanetaryHexTile) {
    // 1. Generate regional map
    const regionalMap = RegionalMapCreator.create(
      planetaryHex,
      planet.type,
      Date.now()
    );

    // 2. Link planetary hex to regional map
    planetaryHex.hasRegionalMap = true;
    planetaryHex.regionalMapId = regionalMap.id;

    // 3. Wrap as entity
    const regionalMapEntity: Entity = {
      id: regionalMap.id,
      type: EntityType.RegionalMap,
      name: `${planet.name} - Region (${planetaryHex.x}, ${planetaryHex.y})`,
      description: `Detailed regional map for planetary hex`,
      tags: ['simulation', 'map', 'generated'],
      parentId: parentEntity.id, // Planet
      metadata: { createdAt: new Date(), updatedAt: new Date() },
      relationships: [
        { targetId: planetaryHex.id, type: 'reference', label: 'expands' }
      ],
      customFields: {
        generatedEntity: regionalMap,
        planetaryHexId: planetaryHex.id
      }
    };

    // 4. Save regional map entity
    entityStore.createEntity(regionalMapEntity);

    // 5. Save all hex tiles as entities
    for (const hexId of regionalMap.hexTileIds) {
      const hex = entityStore.getEntity(hexId) as RegionalHexTile;
      const hexEntity: Entity = {
        id: hex.id,
        type: EntityType.RegionalHexTile,
        name: `Hex (${hex.x}, ${hex.y})`,
        description: `${hex.terrainType} tile`,
        tags: ['hex', 'terrain'],
        parentId: regionalMap.id,
        metadata: { createdAt: new Date(), updatedAt: new Date() },
        relationships: [],
        customFields: { generatedEntity: hex }
      };
      entityStore.createEntity(hexEntity);
    }

    // 6. Update planet entity
    dispatch('entityUpdated', { entity: parentEntity });

    // 7. Open regional map in new tab
    dispatch('openEntity', { entity: regionalMapEntity });
  }

  function openRegionalMap(regionalMapId: string) {
    const entity = entityStore.getEntity(regionalMapId);
    if (entity) {
      dispatch('openEntity', { entity });
    }
  }
</script>
```

---

## **PHASE 9: Advanced Features**

### 9.1 Simulation Presets

**New file:** `src/lib/simulation/presets/simulationPresets.ts`

```typescript
export interface SimulationPreset {
  name: string;
  description: string;
  config: Partial<SimulationConfig>;
  nations: number;
  duration: 'short' | 'medium' | 'long' | 'epic';
}

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    name: 'Quick Conflict (50 years)',
    description: 'Short simulation for immediate RPG backstory',
    config: { startYear: -10000, yearsPerTurn: 1, maxTurns: 50 },
    nations: 3,
    duration: 'short'
  },
  {
    name: 'Age of Empires (500 years)',
    description: 'Medium simulation with nation building and wars',
    config: { startYear: -10000, yearsPerTurn: 2, maxTurns: 250 },
    nations: 5,
    duration: 'medium'
  },
  {
    name: 'Epic History (2000 years)',
    description: 'Long simulation for deep world history',
    config: { startYear: -10000, yearsPerTurn: 5, maxTurns: 400 },
    nations: 6,
    duration: 'long'
  },
  {
    name: 'Ancient to Modern (10,000 years)',
    description: 'Complete civilization arc from prehistoric to modern',
    config: { startYear: -10000, yearsPerTurn: 10, maxTurns: 1000 },
    nations: 8,
    duration: 'epic'
  }
];
```

**Add preset selector to SimulationControlPanel**

### 9.2 Export Simulation Results

**New file:** `src/lib/simulation/export/SimulationExporter.ts`

```typescript
/**
 * Export simulation results as RPG-ready content
 */
export class SimulationExporter {
  /**
   * Generate historical summary for RPG campaign
   */
  static generateHistoricalSummary(engine: SimulationEngine): string {
    const events = engine.historicalEventIds
      .map(id => entityStore.getEntity(id) as HistoricalEvent)
      .filter(e => e.significance >= EventSignificance.Major);

    return `
# Historical Summary

## The ${engine.currentYear - engine.config.startYear} Year Period

${this.groupEventsByEra(events)}

## Major Powers

${this.listNationSummaries(engine.nationIds)}

## Notable Battles

${this.listMajorBattles(events)}
    `.trim();
  }

  /**
   * Export as campaign backstory
   */
  static exportAsCampaignBackstory(
    engine: SimulationEngine,
    campaignId: string
  ): void {
    // Create campaign relationship to all simulation entities
    // Tag all entities with campaign ID
    // Generate summary text for campaign description
  }

  /**
   * Export specific nation as RPG faction
   */
  static exportNationAsFaction(nationId: string): FactionEntity {
    const nation = entityStore.getEntity(nationId) as Nation;

    // Convert simulation Nation → RPG Faction
    return {
      type: EntityType.Faction,
      name: nation.name,
      description: `${nation.culturalIdentity} civilization`,
      tags: ['simulation-generated', nation.currentEra],
      // ... convert resources, traits, etc.
    };
  }
}
```

### 9.3 Timeline/Playback System

**New file:** `src/lib/components/simulation/SimulationPlayback.svelte`

**Features:**
- Reconstruct simulation state at any turn
- Play forward/backward through history
- Speed controls for playback
- Snapshot system (save state every 10 turns)

```typescript
class SimulationStateManager {
  private snapshots: Map<number, SimulationState> = new Map();

  /**
   * Save state snapshot
   */
  saveSnapshot(turn: number, engine: SimulationEngine): void {
    const state = engine.getState();
    // Deep clone all entities at this turn
    this.snapshots.set(turn, this.cloneState(state));
  }

  /**
   * Restore to specific turn
   */
  async restoreToTurn(turn: number, engine: SimulationEngine): Promise<void> {
    // Find nearest snapshot <= turn
    const nearestSnapshot = this.findNearestSnapshot(turn);

    // Restore snapshot
    engine.loadState(nearestSnapshot.state);

    // Replay turns from snapshot to target turn
    for (let t = nearestSnapshot.turn; t < turn; t++) {
      engine.processTurn();
    }
  }
}
```

---

## **PHASE 10: Integration Testing & Polish**

### 10.1 Create Integration Example

**File:** `src/lib/simulation/examples/fullSimulationExample.ts`

```typescript
/**
 * Complete example: Planet → RegionalMap → Simulation → RPG Content
 */
export async function runFullSimulationExample() {
  // 1. Create planet
  const planet = new PlanetCreator().create();
  planet.worldMap = WorldMapCreator.create(planet);

  // 2. Pick a planetary hex
  const planetaryHex = planet.worldMap.tiles[5][5];

  // 3. Generate regional map
  const regionalMap = RegionalMapCreator.create(planetaryHex, planet.type, 12345);

  // 4. Initialize simulation
  const simulation = new SimulationEngine(
    { startYear: -10000, yearsPerTurn: 2, maxTurns: 500 },
    regionalMap.id
  );

  // 5. Create 4 nations
  const nations = [
    createNation('Romans', { militaristic: 70, expansionist: 60 }),
    createNation('Greeks', { scientific: 80, diplomatic: 70 }),
    createNation('Egyptians', { commercial: 75, expansionist: 65 }),
    createNation('Persians', { militaristic: 65, expansionist: 70 })
  ];

  // 6. Save to entity store
  for (const nation of nations) {
    entityStore.createEntity(wrapAsEntity(nation, regionalMap.id));
  }

  // 7. Run simulation for 500 turns (1000 years)
  console.log('Starting 1000-year simulation...');
  simulation.runForTurns(500);

  // 8. Export results
  console.log('\n=== SIMULATION RESULTS ===');
  console.log(simulation.getSummary());
  console.log(`\nTotal events: ${regionalMap.historicalEventIds.length}`);
  console.log(`Total battles: ${regionalMap.battleIds.length}`);
  console.log(`Surviving nations: ${nations.filter(n => n.isActive).length}`);

  // 9. Generate RPG content
  const backstory = SimulationExporter.generateHistoricalSummary(simulation);
  console.log('\n=== RPG BACKSTORY ===');
  console.log(backstory);

  return { simulation, regionalMap, nations };
}
```

### 10.2 Update EntityNavigator Sidebar

**File:** `src/lib/components/EntityNavigator.svelte`

**Add sections:**
```svelte
<!-- After Locations section -->
<Section title="Simulations" icon="🎮">
  <EntityList entities={$regionalMapEntities.filter(e => e.customFields.hasSimulation)} />
</Section>

<Section title="Nations" icon="🏴">
  <EntityList entities={$nationEntities} />
</Section>

<Section title="Cities" icon="🏛️">
  <EntityList entities={$cityEntities} />
</Section>

<Section title="Battles" icon="⚔️">
  <EntityList entities={$battleEntities} />
</Section>
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Week 1: Foundation**
- [ ] Phase 1: Entity types and interfaces (1 day)
- [ ] Phase 2: SimulationEntityBridge (2 days)
- [ ] Test: Entities save/load correctly (1 day)

### **Week 2: UI Components**
- [ ] Phase 3.1-3.2: SimulationControlPanel + TimelineSlider (2 days)
- [ ] Phase 3.3: EventLogViewer (1 day)
- [ ] Phase 3.4: NationStatsPanel (1 day)
- [ ] Phase 4.1: Enhance RegionalMapViewer (1 day)

### **Week 3: Visualization**
- [ ] Phase 4.2: HexMapRenderer with overlays (2 days)
- [ ] Phase 4.3: Unciv graphics integration (1 day)
- [ ] Phase 5: Create NationViewer, CityViewer, UnitViewer (2 days)

### **Week 4: Combat & AI**
- [ ] Phase 6.1-6.2: Unit production and movement (2 days)
- [ ] Phase 6.3: Combat resolution (2 days)
- [ ] Phase 6.4: Expand AI controller (1 day)

### **Week 5: Content & Polish**
- [ ] Phase 7: Tech/Policy/Building definitions (2 days)
- [ ] Phase 8: Planet → RegionalMap workflow (1 day)
- [ ] Phase 9: Presets and export (2 days)

### **Week 6: Testing & Documentation**
- [ ] Phase 10: Integration testing (2 days)
- [ ] Write user guide (1 day)
- [ ] Bug fixes and polish (2 days)

**Total: ~6 weeks for complete integration**

---

## 📦 **FILE STRUCTURE**

### New Files to Create

```
src/lib/
├── simulation/
│   ├── SimulationEngine.ts (✅ exists - modify)
│   ├── SimulationEntityBridge.ts (NEW)
│   ├── content/
│   │   ├── technologies.ts (NEW)
│   │   ├── policies.ts (NEW)
│   │   ├── buildings.ts (NEW)
│   │   └── units.ts (NEW)
│   ├── export/
│   │   └── SimulationExporter.ts (NEW)
│   └── playback/
│       └── SimulationStateManager.ts (NEW)
│
├── components/
│   └── simulation/
│       ├── SimulationControlPanel.svelte (NEW)
│       ├── TimelineSlider.svelte (NEW)
│       ├── EventLogViewer.svelte (NEW)
│       ├── NationStatsPanel.svelte (NEW)
│       ├── HexMapRenderer.svelte (NEW)
│       └── SimulationPlayback.svelte (NEW)
│
└── entities/
    ├── location/
    │   ├── cityCreator.ts (NEW)
    │   └── city.ts (✅ exists)
    └── military/
        ├── unitCreator.ts (NEW)
        └── unit.ts (✅ exists)
```

### Files to Modify

```
src/lib/
├── types/entity.ts (add NationEntity, CityEntity, UnitEntity interfaces)
├── entities/entityRegistry.ts (register city, unit)
├── stores/entityStore.ts (add derived stores)
├── components/
│   ├── entities/
│   │   ├── EntityViewer.svelte (add Nation/City/Unit cases)
│   │   └── viewers/
│   │       ├── PlanetViewer.svelte (add regional map generation)
│   │       ├── RegionalMapViewer.svelte (add simulation sections)
│   │       ├── NationViewer.svelte (NEW)
│   │       ├── CityViewer.svelte (NEW)
│   │       └── UnitViewer.svelte (NEW)
│   └── EntityNavigator.svelte (add simulation entity sections)
└── simulation/
    ├── SimulationEngine.ts (add unit movement, combat, entity sync)
    └── ai/BasicAIController.ts (expand AI decisions)
```

---

## 🎨 **UI/UX DESIGN**

### RegionalMapViewer Layout (Enhanced)

```
┌─────────────────────────────────────────────────────┐
│ Regional Map: Fertile Plains Region                 │
├─────────────────────────────────────────────────────┤
│ [Overview Cards: 20x20, 127 hexes, 15 rivers]      │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐  │
│ │ SIMULATION CONTROLS                            │  │
│ │ ○ Not Initialized                              │  │
│ │ [Initialize Simulation] [Configure...]         │  │
│ │                                                 │  │
│ │ Nations: [3 ▼] | Years: [-10000 to -9000]     │  │
│ │ Speed: [ 1x▼ ] | [▶ Start] [⏸ Pause] [⏭ Step]│  │
│ └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ View: [Terrain] [Political] [Nation: Romans ▼]     │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐  │
│ │         HEX MAP VISUALIZATION                  │  │
│ │  [Pan/Zoom controls] [Graphics: On/Off]        │  │
│ │                                                 │  │
│ │    🏛️ Rome (Pop 5)    🏛️ Athens (Pop 3)       │  │
│ │         ⚔️                  ⚔️⚔️              │  │
│ │    [Colored nation borders shown]              │  │
│ │                                                 │  │
│ │  [Selected Hex Details Panel on right →]       │  │
│ └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐  │
│ │ TIMELINE                                       │  │
│ │ |────●────●──●───●──────●─────●──────────○|  │  │
│ │ -10000  -9900  -9800  -9700  -9600  -9500    │  │
│ │          (events marked as dots)              │  │
│ └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────────────────────┐ │
│ │ NATIONS      │ │ EVENT LOG                     │ │
│ │ 🟢 Romans    │ │ 🏛️ Year -9995: Rome founded  │ │
│ │    5 cities  │ │ ⚔️ Year -9980: Romans vs ...│ │
│ │    18 units  │ │ 🔬 Year -9970: Greeks disc...│ │
│ │ 🟢 Greeks    │ │ [Filter: All Types ▼]        │ │
│ │    3 cities  │ │ [Nation: All ▼]              │ │
│ │ 🔴 Persians  │ │ [Significance: Major+ ▼]     │ │
│ │   Eliminated │ │                               │ │
│ └──────────────┘ └──────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### NationViewer Layout

```
┌─────────────────────────────────────────────────────┐
│ 🏴 Romans - Militaristic Empire                     │
├─────────────────────────────────────────────────────┤
│ Leader: Augustus Caesar (Emperor)                   │
│ Era: Classical | Founded: 10,000 BCE               │
│ Status: ● Active | Cities: 12 | Military: 45 units │
├─────────────────────────────────────────────────────┤
│ RESOURCES                                           │
│ 💰 Gold: 1,250 (+15/turn)                          │
│ 🔬 Science: 850 (+22/turn)                         │
│ 🎭 Culture: 620 (+18/turn)                         │
│ 😊 Happiness: +8                                    │
├─────────────────────────────────────────────────────┤
│ CULTURE TRAITS  [Bar chart]                        │
│ Militaristic  ████████████████░░ 80                │
│ Expansionist  ████████████░░░░░░ 60                │
│ Scientific    ██████░░░░░░░░░░░░ 30                │
├─────────────────────────────────────────────────────┤
│ TECHNOLOGY (Classical Era)                          │
│ Researched: Bronze Working, Writing, Mathematics   │
│ Researching: Philosophy (45 / 100) ████░░░░░      │
├─────────────────────────────────────────────────────┤
│ CITIES                                              │
│ [🏛️ Rome (Capital) - Pop 8]  [Open]               │
│ [🏛️ Antium - Pop 4]          [Open]               │
│ [🏛️ Cumae - Pop 3]           [Open]               │
│ [+ Add City]                                        │
├─────────────────────────────────────────────────────┤
│ DIPLOMACY                                           │
│ 🟢 Greeks: Allied (+45)                            │
│ 🟡 Egyptians: Friendly (+12)                       │
│ 🔴 Persians: At War (-80)                          │
├─────────────────────────────────────────────────────┤
│ HISTORY                                             │
│ [Timeline of events for this nation]                │
│ Year -9995: Nation founded                         │
│ Year -9980: Founded Rome                           │
│ Year -9850: Discovered Bronze Working              │
│ Year -9720: Declared war on Persians               │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 **TECHNICAL DETAILS**

### Reactive Updates Strategy

**Problem**: Simulation modifies objects in-place, Svelte needs to detect changes

**Solution**: Use `$state.raw()` + manual triggers

```typescript
// In RegionalMapViewer
let simulationTick = $state(0); // Increment to trigger reactivity

function handleSimulationUpdate(engine: SimulationEngine) {
  simulationTick++; // Force Svelte to re-render
}

// In HexMapRenderer
$effect(() => {
  // Re-render when simulationTick changes
  simulationTick;
  renderMap();
});
```

### Performance Optimization

**For 1000+ turn simulations:**

1. **Batch entity updates**:
   - Sync to entityStore every 10 turns (not every turn)
   - Use `entityStore.batchUpdate()` if available

2. **Snapshot system**:
   - Save full state every 50 turns
   - Allow quick restoration

3. **Render optimization**:
   - Only re-render visible hexes
   - Use canvas for base terrain, SVG for overlays
   - Lazy load unit/city icons

4. **Background processing**:
   - Run simulation in Web Worker for long runs
   - Post progress updates to main thread

---

## 🎯 **SUCCESS CRITERIA**

### Minimum Viable Product (MVP)

✅ **User can:**
1. Open a Planet → select a hex → "Expand to Regional Map"
2. Click "Initialize Simulation" → 3 nations appear on map
3. Click "Start" → watch cities appear, borders expand
4. See event log populate with city foundings, tech discoveries
5. Open a Nation entity → view cities, resources, history
6. Open a City entity → view population, buildings, owner
7. Export simulation as campaign backstory

### Full Feature Complete

✅ **User can:**
- Configure simulation (2-8 nations, time periods)
- Watch combat (units move, battles occur, cities conquered)
- Scrub timeline (replay history)
- Filter event log (by type, nation, significance)
- See nation borders on map (colored regions)
- See city icons with population size
- See unit icons with movement
- Export specific nation as RPG faction
- Use simulation results in campaign creation

---

## 🤔 **QUESTIONS FOR YOU**

Before I start implementing, please confirm:

1. **Unciv Clone**: You want me to clone Unciv repo now to `old examples/Unciv/`?

2. **Priority**: Which phase should I start with?
   - Option A: UI first (controls, map overlays) - see simulation visually
   - Option B: Combat first (complete simulation mechanics) - watch wars
   - Option C: Entity integration first (save/load) - everything is an entity

3. **Settlement vs City**:
   - Keep both? (Settlement = manual RPG, City = simulation)
   - Or merge into one entity type?

4. **Graphics Mode**:
   - Always show Unciv graphics?
   - Or toggle between colored hexes / Unciv assets?

5. **Simulation Presets**:
   - Do you want the 4 presets I proposed?
   - Or different time scales?

Let me know and I'll start implementing! 🚀
