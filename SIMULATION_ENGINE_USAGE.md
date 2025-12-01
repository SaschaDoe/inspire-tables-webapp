# SimulationEngine - Usage Guide

## Overview

The `SimulationEngine` is the core orchestrator for the Civilization 5-style turn-based simulation. It manages nations, cities, resources, events, and AI behavior.

---

## Quick Start

### 1. Create a Regional Map

First, generate a regional map with terrain, resources, and features:

```typescript
import { RegionalMapCreator } from '$lib/entities/location/regionalMapCreator';
import { PlanetaryHexTile } from '$lib/entities/location/planetaryHexTile';
import { entityStore } from '$lib/stores/entityStore';

// Create planetary hex (parent container)
const planetaryHex = new PlanetaryHexTile();
planetaryHex.x = 0;
planetaryHex.y = 0;
planetaryHex.parentPlanetId = 'my-planet';
planetaryHex.elevation = 5;
planetaryHex.temperature = 60;
planetaryHex.dryness = 40;

// Generate 50x50 regional map
const regionalMap = RegionalMapCreator.create(
    planetaryHex,
    'earth-like', // Planet type
    12345 // Seed for reproducibility
);

// Save to entity store
entityStore.setEntity(planetaryHex.id, planetaryHex);
entityStore.setEntity(regionalMap.id, regionalMap);
```

### 2. Create Nations

```typescript
import { Nation, Era } from '$lib/entities/location/nation';

const romans = new Nation();
romans.name = 'Romans';
romans.culturalIdentity = 'Roman';
romans.foundingYear = -10000;
romans.currentEra = Era.Prehistoric;
romans.isAIControlled = true;
romans.isActive = true;

// Set culture traits (affects AI behavior)
romans.cultureTraits = {
    militaristic: 70, // High tendency toward military
    expansionist: 60, // Moderate expansion desire
    commercial: 50,
    scientific: 40,
    seafaring: 30,
    diplomatic: 50
};

// Set base yields
romans.yields = {
    food: 0,
    production: 0,
    gold: 2, // Base gold per turn
    science: 0,
    culture: 0,
    happiness: 0
};

entityStore.setEntity(romans.id, romans);
```

### 3. Initialize and Run Simulation

```typescript
import { SimulationEngine } from '$lib/simulation/simulationEngine';

// Create simulation with configuration
const simulation = new SimulationEngine({
    startYear: -10000, // Start at 10,000 BCE
    yearsPerTurn: 1, // 1 year per turn
    autoSave: false,
    autoSaveInterval: 10 // Auto-save every 10 turns
});

// Initialize with regional maps and nations
simulation.initialize([regionalMap.id]);
simulation.nationIds = [romans.id, greeks.id, egyptians.id];

// Run for 50 turns
simulation.runForTurns(50);

// Get summary
console.log(simulation.getSummary());
```

---

## Simulation Configuration

```typescript
interface SimulationConfig {
    startYear: number; // Starting year (e.g., -10000 for 10,000 BCE)
    yearsPerTurn: number; // Years per turn (default: 1)
    autoSave: boolean; // Enable auto-save
    autoSaveInterval: number; // Save every N turns
    maxTurns?: number; // Optional maximum turns
}
```

---

## Turn Progression

Each turn consists of 5 phases:

### Phase 1: Update Nation Yields
- Calculate yields from all cities
- Accumulate food, production, gold, science, culture
- Update per-turn rates (sciencePerTurn, culturePerTurn)

### Phase 2: Process Cities
- **Growth**: Accumulate food → gain population
- **Starvation**: Negative food → lose population after 3 turns
- **Production**: Build units, buildings, wonders
- **Expansion**: Spend culture → expand borders

### Phase 3: Process Nations
- **Technology**: Accumulate science → discover techs
- **Policies**: Accumulate culture → unlock social policies
- **Diplomacy**: Update relations with other nations

### Phase 4: AI Decisions
- **City Founding**: AI evaluates terrain and founds new cities
- **Production Choices**: Choose what to build (TODO)
- **Tech Research**: Choose which tech to research (TODO)
- **Diplomacy**: Declare war, make peace (TODO)

### Phase 5: Victory Conditions
- Check if only one nation remains (Military Victory)
- Check other victory conditions (TODO)

---

## AI City Founding

### How AI Chooses City Locations

The AI scores each valid tile based on:

```typescript
// High-value terrain
Grassland: +10 points
Plains: +8 points

// Seafaring bonus
Coast: +(seafaring trait / 10) points

// Resources
Strategic Resource: +12 points
Luxury Resource: +10 points
Bonus Resource: +5 points
River: +15 points

// Yields
Food yield: ×3 points
Production yield: ×2 points
```

### Validity Checks

Cities cannot be founded if:
- Terrain is Mountain or Ocean
- Another city already exists on the tile
- Distance to nearest city < 4 tiles

### Expansion Rate

```typescript
// Expansionist cultures found cities more frequently
turnsPerCity = max(5, 15 - floor(expansionist / 10))

// Examples:
// expansionist=50 → city every 10 turns
// expansionist=80 → city every 7 turns
// expansionist=20 → city every 13 turns
```

---

## Historical Events

### Event Types

```typescript
enum HistoricalEventType {
    // Nation events
    NationFounded, NationEliminated, LeadershipChange,

    // City events
    CityFounded, CityConquered, CityRazed, CityGrew, CityStarved,

    // Military events
    WarDeclared, PeaceTreaty, BattleFought,

    // Technology and culture
    TechDiscovered, PolicyUnlocked, EraEntered, WonderCompleted,

    // Territory and exploration
    HexDiscovered, BorderExpansion, TerritoryLost
}
```

### Event Significance

```typescript
enum EventSignificance {
    Minor = 1,      // Routine events (unit moved, improvement built)
    Normal = 3,     // Standard events (city founded, tech discovered)
    Major = 5,      // Important events (war declared, wonder completed)
    Critical = 8,   // Very important (nation eliminated, era entered)
    Historic = 10   // Legendary events (victory achieved)
}
```

### Querying Events

```typescript
// Get all events in a specific year
const eventsIn1000BCE = simulation.getEventsByYear(-1000);

// Get all events for a nation
const romanEvents = simulation.getEventsByNation(romans.id);

// Get all events at a specific hex tile
const hexEvents = simulation.getEventsByHex('hex-tile-id');

// Get all events
const allEvents = simulation.historicalEventIds.map(id =>
    entityStore.getEntity(id)
);
```

---

## Example: Interactive Simulation

```typescript
import { createInteractiveSimulation } from '$lib/simulation/examples/testSimulation';

// Create simulation that can be controlled manually
const simulation = createInteractiveSimulation();

// Advance one turn at a time
simulation.processTurn();
console.log(simulation.getSummary());

// Check events in current year
const currentEvents = simulation.getEventsByYear(simulation.currentYear);
console.log(`Events this year: ${currentEvents.length}`);

// Pause and resume
simulation.pause();
// ... do something ...
simulation.resume();

// Run 10 more turns
simulation.runForTurns(10);
```

---

## Example: Long Simulation

```typescript
import { runLongSimulation } from '$lib/simulation/examples/testSimulation';

// Run 100 turns with 5 nations
const simulation = runLongSimulation(100);

// Inspect results
console.log(`Total events: ${simulation.historicalEventIds.length}`);

// Get nation with most cities
const nations = simulation.nationIds
    .map(id => entityStore.getEntity(id))
    .filter(Boolean)
    .sort((a, b) => b.cityIds.length - a.cityIds.length);

console.log(`Largest empire: ${nations[0].name} with ${nations[0].cityIds.length} cities`);
```

---

## City Management

### City Yields

Cities generate yields from:
1. **City Center**: Base 2 food, 1 production
2. **Worked Tiles**: Citizens work surrounding hex tiles
3. **Buildings**: Granary (+2 food), Library (+2 science), etc.
4. **Specialists**: Scientists (+3 science), Merchants (+3 gold), etc.

### City Growth Formula

```typescript
// Food needed for next population (Civ 5 formula)
foodNeeded = 15 + (8 × (population - 1))

// Examples:
// Pop 1 → Pop 2: 15 food
// Pop 2 → Pop 3: 23 food
// Pop 5 → Pop 6: 47 food
```

### Food Consumption

```typescript
// Each population consumes 2 food per turn
foodConsumption = population × 2

// Growth rate (food per turn)
growthRate = totalFood - foodConsumption

// Starvation
if (growthRate < 0) {
    starvationTurns++;
    if (starvationTurns >= 3) {
        population--; // Lose 1 population
    }
}
```

---

## Nation Management

### Resource Accumulation

```typescript
interface NationResources {
    food: number;       // Surplus food (for growth and trade)
    production: number; // Production capacity
    gold: number;       // Accumulated gold
    science: number;    // Accumulated science
    culture: number;    // Accumulated culture
    happiness: number;  // Total happiness
}
```

### Per-Turn Yields

```typescript
// Accumulated from all cities
nation.yields.food += city.yields.food;
nation.yields.production += city.yields.production;
nation.yields.gold += city.yields.gold;
nation.yields.science += city.yields.science;
nation.yields.culture += city.yields.culture;

// Applied each turn
nation.resources.gold += nation.yields.gold;
nation.resources.science += nation.yields.science;
nation.resources.culture += nation.yields.culture;
```

### Culture Traits

```typescript
interface CultureTraits {
    militaristic: number;  // 0-100: Military buildup tendency
    expansionist: number;  // 0-100: Settle new cities
    commercial: number;    // 0-100: Trade and economy focus
    scientific: number;    // 0-100: Tech research priority
    seafaring: number;     // 0-100: Naval units and coastal cities
    diplomatic: number;    // 0-100: Alliances and peace
}
```

---

## Manager Classes

The simulation uses Unciv-inspired manager classes for clean separation of concerns:

### City Managers

```typescript
// Population growth and food management
city.populationManager.processTurn(foodYield);

// Production queue and building completion
city.productionManager.processTurn(productionYield);

// Border expansion and tile acquisition
city.expansionManager.processTurn(cultureYield, currentTurn, availableTiles);
```

### Nation Managers

```typescript
// Technology research
nation.techManager.processTurn(sciencePerTurn, techCost);

// Social policy unlocking
nation.policyManager.processTurn(culturePerTurn);

// Diplomacy with other nations
const diplomacy = nation.getDiplomacyManager(otherNationId, otherNationName);
diplomacy.declareWar(currentTurn);
diplomacy.makePeace(currentTurn);
```

---

## Next Steps

### Phase 4: Technology & Culture Systems
- Implement tech tree with prerequisites
- Define all Civ 5 technologies
- Implement social policy trees
- Add culture-based AI tech/policy choices

### Phase 5: Combat & Diplomacy Systems
- Implement unit movement and combat
- City capture mechanics
- Diplomacy AI (war declarations, peace treaties)
- Battle event tracking

### Phase 6: Time Slider & Historical Visualization
- Create UI for scrubbing through simulation history
- Event timeline view
- Nation border visualization over time
- Playback animation

---

## Troubleshooting

**Cities not founding?**
- Check that AI nations have `isAIControlled = true`
- Verify regional map has valid founding locations
- Ensure minimum 4-tile spacing between cities

**No events being created?**
- Check that `entityStore` is properly initialized
- Verify simulation is running (`simulation.isRunning === true`)
- Use `simulation.getSummary()` to check turn progression

**Performance issues?**
- Reduce number of nations (5 max recommended for now)
- Use smaller regional maps (25×25 instead of 50×50)
- Enable auto-save less frequently

---

**Ready to explore civilization history!** 🏛️
