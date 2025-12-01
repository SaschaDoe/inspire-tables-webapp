# Simulation Engine - SOLID Refactoring

## Overview

The simulation engine has been refactored to follow SOLID principles, making it **testable, maintainable, and extensible**.

---

## SOLID Principles Applied

### ✅ Single Responsibility Principle (SRP)

**Before**: `SimulationEngine` did everything (orchestration, AI logic, event creation, scoring, etc.)

**After**: Separated into focused components:
- `SimulationEngine` - Turn orchestration only
- `BasicAIController` - AI decision making
- `EventFactory` - Event creation (TODO)
- `CityLocationScorer` - City location evaluation (TODO)

### ✅ Open/Closed Principle (OCP)

**Before**: Adding new AI behaviors required modifying `SimulationEngine`

**After**: Implement `IAIController` interface to add new AI strategies:
```typescript
// Easy to add new AI without changing existing code
export class AggressiveAI implements IAIController {
    makeDecisions(nation, turn, year, store) {
        // Aggressive AI logic
    }
}

export class PacifistAI implements IAIController {
    makeDecisions(nation, turn, year, store) {
        // Pacifist AI logic
    }
}
```

### ✅ Liskov Substitution Principle (LSP)

Any `IAIController` implementation can be substituted without breaking the simulation:
```typescript
const basicAI = new BasicAIController();
const aggressiveAI = new AggressiveAI();

// Both work the same way
engine.setAI Controller(basicAI);  // or
engine.setAIController(aggressiveAI);
```

### ✅ Interface Segregation Principle (ISP)

**Before**: Large `SimulationEngine` class exposed everything

**After**: Small, focused interfaces:
- `IEntityStore` - Entity storage operations only
- `IAIController` - AI decision making only
- `IEventFactory` - Event creation only

### ✅ Dependency Inversion Principle (DIP)

**Before**: Direct dependency on concrete `entityStore`
```typescript
import { entityStore } from '$lib/stores/entityStore';
this.store = entityStore.getEntity.bind(entityStore);
```

**After**: Depends on `IEntityStore` abstraction
```typescript
constructor(
    config: SimulationConfig,
    private entityStore: IEntityStore, // Injected dependency
    private aiController: IAIController,
    private eventFactory: IEventFactory
) {
    // ...
}
```

---

## New Architecture

### Interfaces

#### `IEntityStore`
```typescript
interface IEntityStore {
    getEntity(id: string): IEntity | undefined;
    setEntity(id: string, entity: IEntity): void;
    deleteEntity(id: string): void;
    hasEntity(id: string): boolean;
}
```

Implementations:
- `EntityStoreAdapter` - Wraps the real entityStore
- `MockEntityStore` - For unit testing

#### `IAIController`
```typescript
interface IAIController {
    makeDecisions(nation, turn, year, store): AIDecision[];
    shouldFoundCity(nation, turn): boolean;
    findCityFoundingLocation(nation, mapIds, store): CityFoundingLocation | null;
}
```

Implementations:
- `BasicAIController` - Default AI logic
- (Future: `AggressiveAI`, `PacifistAI`, `ScientificAI`, etc.)

#### `IEventFactory`
```typescript
interface IEventFactory {
    createEvent(data): HistoricalEvent;
    createCityFoundedEvent(...): HistoricalEvent;
    createCityGrowthEvent(...): HistoricalEvent;
    // ... more event types
}
```

---

## Testing

### Unit Testing with Mocks

The refactored design enables **true unit tests** with mocked dependencies:

```typescript
import { BasicAIController } from '../ai/BasicAIController';
import { MockEntityStore } from '../interfaces/IEntityStore';

describe('BasicAIController', () => {
    let ai: BasicAIController;
    let mockStore: MockEntityStore;
    let testNation: Nation;

    beforeEach(() => {
        ai = new BasicAIController();
        mockStore = new MockEntityStore(); // Mock store

        testNation = new Nation();
        testNation.cultureTraits.expansionist = 60;
        mockStore.setEntity(testNation.id, testNation);
    });

    it('should found cities based on expansionist trait', () => {
        // Test with turn 9 (60 expansionist → every 9 turns)
        const result = ai.shouldFoundCity(testNation, 9);
        expect(result).toBe(true);
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test BasicAIController.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Example: Testing Simple Simulation

```typescript
import { MockEntityStore } from '$lib/simulation/interfaces/IEntityStore';
import { BasicAIController } from '$lib/simulation/ai/BasicAIController';
import { SimulationEngine } from '$lib/simulation/simulationEngine';

describe('Simple Simulation', () => {
    it('should process one turn successfully', () => {
        const mockStore = new MockEntityStore();
        const ai = new BasicAIController();

        // Create minimal nation
        const nation = new Nation();
        nation.name = 'Test';
        nation.cityIds = [];
        nation.isActive = true;
        nation.cultureTraits.expansionist = 60;
        mockStore.setEntity(nation.id, nation);

        // Create minimal regional map
        const map = new RegionalMap();
        map.width = 10;
        map.height = 10;
        map.hexTileIds = [];

        // Add one valid tile
        const tile = new RegionalHexTile();
        tile.terrainType = TerrainType.Grass;
        tile.x = 5;
        tile.y = 5;
        tile.yields = { food: 2, production: 1, gold: 0, science: 0, culture: 0 };
        mockStore.setEntity(tile.id, tile);
        map.hexTileIds.push(tile.id);
        mockStore.setEntity(map.id, map);

        // Create simulation with mocked dependencies
        const simulation = new SimulationEngine(
            { startYear: -10000, yearsPerTurn: 1 },
            mockStore,
            ai,
            eventFactory
        );

        simulation.initialize([map.id]);
        simulation.nationIds = [nation.id];

        // Process one turn
        simulation.processTurn();

        // Assertions
        expect(simulation.currentTurn).toBe(1);
        expect(simulation.currentYear).toBe(-9999);
        expect(simulation.isRunning).toBe(true);
    });
});
```

---

## Benefits of SOLID Design

### 1. **Testability** ✅
- Mock dependencies easily
- Test components in isolation
- Fast unit tests (no database, no file system)

### 2. **Maintainability** ✅
- Each class has one reason to change
- Easy to understand and modify
- Clear separation of concerns

### 3. **Extensibility** ✅
- Add new AI strategies without modifying existing code
- Swap implementations easily
- Follow Open/Closed Principle

### 4. **Reusability** ✅
- Interfaces can be implemented by multiple classes
- Components can be used in different contexts
- Promotes composition over inheritance

---

## Migration Guide

### For Existing Code

The old `SimulationEngine` still works but is **deprecated**. To migrate:

**Before** (old way):
```typescript
const simulation = new SimulationEngine({ startYear: -10000 });
simulation.initialize([mapId]);
simulation.nationIds = [nation1Id, nation2Id];
simulation.runForTurns(50);
```

**After** (new way with dependency injection):
```typescript
import { EntityStoreAdapter } from '$lib/simulation/interfaces/IEntityStore';
import { BasicAIController } from '$lib/simulation/ai/BasicAIController';

const entityStore = new EntityStoreAdapter();
const aiController = new BasicAIController();

const simulation = new SimulationEngine(
    { startYear: -10000 },
    entityStore,
    aiController
    // eventFactory will be added later
);

simulation.initialize([mapId]);
simulation.nationIds = [nation1Id, nation2Id];
simulation.runForTurns(50);
```

---

## Future Improvements

### Phase 4: Event Factory
- Extract all event creation logic
- Implement `IEventFactory` interface
- Add event templates for consistency

### Phase 5: Turn Processors
- Extract each turn phase into a processor
- `YieldProcessor`, `CityProcessor`, `NationProcessor`, `VictoryProcessor`
- Pipeline pattern for turn execution

### Phase 6: Strategy Pattern for AI
- Multiple AI personalities (Aggressive, Defensive, Scientific, etc.)
- AI difficulty levels (Easy, Medium, Hard)
- Pluggable AI behaviors

---

## File Structure

```
src/lib/simulation/
├── simulationEngine.ts          # Main orchestrator (refactored)
├── interfaces/
│   ├── IEntityStore.ts          # Entity storage abstraction
│   ├── IAIController.ts         # AI decision making abstraction
│   └── IEventFactory.ts         # Event creation abstraction
├── ai/
│   ├── BasicAIController.ts     # Default AI implementation
│   ├── AggressiveAI.ts          # (Future) Aggressive AI
│   └── PacifistAI.ts            # (Future) Pacifist AI
├── factories/
│   └── EventFactory.ts          # (Future) Event creation
├── __tests__/
│   ├── BasicAIController.test.ts
│   ├── SimulationEngine.test.ts
│   └── integration.test.ts
└── examples/
    └── testSimulation.ts        # Example usage
```

---

## Conclusion

The refactored simulation engine now follows SOLID principles, making it:
- ✅ **Testable** with mocked dependencies
- ✅ **Maintainable** with clear separation of concerns
- ✅ **Extensible** through interfaces and strategies
- ✅ **Professional** architecture suitable for large-scale projects

**Next steps**: Add unit tests for all components and achieve >80% code coverage! 🎯
