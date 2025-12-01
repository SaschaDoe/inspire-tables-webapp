# Simulation Testing Strategy

## Test Philosophy

We follow the **Testing Pyramid**:
- **70% Unit Tests** - Fast, isolated component tests
- **20% Integration Tests** - Multiple components working together
- **10% End-to-End Tests** - Full simulation runs

---

## Unit Tests

### 1. Entity Store Tests (`MockEntityStore.test.ts`)
**What**: Test the mock entity store implementation

**Tests**:
- ✅ Should store and retrieve entities
- ✅ Should return undefined for non-existent entities
- ✅ Should update existing entities
- ✅ Should delete entities
- ✅ Should track entity existence with hasEntity()
- ✅ Should return all entity IDs
- ✅ Should clear all entities
- ✅ Should return correct size

**Why**: Mock store is foundation for all other tests

---

### 2. AI Controller Tests (`BasicAIController.test.ts`)
**What**: Test AI decision making logic

**Tests**:
- ✅ Should determine city founding frequency based on expansionist trait
- ✅ Should not found cities when nation has 5+ cities
- ✅ Should find valid city locations
- ✅ Should prefer tiles with high scores (rivers, resources)
- ✅ Should reject mountains as city locations
- ✅ Should reject ocean as city locations
- ✅ Should enforce minimum 4-tile spacing between cities
- ✅ Should return null when no valid locations exist
- ✅ Should make appropriate decisions each turn
- ✅ Should handle multiple nations independently

**Why**: AI drives the simulation behavior

---

### 3. City Manager Tests (`CityPopulationManager.test.ts`)
**What**: Test city population growth and starvation

**Tests**:
- ✅ Should calculate food needed for growth (15 + 8*(pop-1))
- ✅ Should accumulate food toward growth
- ✅ Should grow when food threshold reached
- ✅ Should reset food storage on growth
- ✅ Should consume 2 food per population
- ✅ Should detect starvation (negative food)
- ✅ Should lose population after 3 turns of starvation
- ✅ Should not reduce below population 1
- ✅ Should calculate growth rate correctly
- ✅ Should apply food modifiers from buildings/policies

**Why**: City growth is core simulation mechanic

---

### 4. City Production Tests (`CityProductionManager.test.ts`)
**What**: Test city production queue and completion

**Tests**:
- ✅ Should add items to production queue
- ✅ Should accumulate production toward current item
- ✅ Should complete items when production met
- ✅ Should advance to next item in queue
- ✅ Should handle empty queue gracefully
- ✅ Should calculate turns remaining correctly
- ✅ Should apply production modifiers

**Why**: Production drives unit/building creation

---

### 5. City Expansion Tests (`CityExpansionManager.test.ts`)
**What**: Test cultural border expansion

**Tests**:
- ✅ Should accumulate culture toward expansion
- ✅ Should acquire new tiles when threshold met
- ✅ Should prefer high-value tiles (resources, yields)
- ✅ Should respect tile ownership
- ✅ Should handle no available tiles gracefully
- ✅ Should increase cost for each expansion
- ✅ Should track owned tiles

**Why**: Border expansion is key to territory control

---

### 6. Nation Manager Tests (`Nation.test.ts`)
**What**: Test nation resource accumulation and state

**Tests**:
- ✅ Should initialize with correct default values
- ✅ Should accumulate resources per turn
- ✅ Should calculate total yields from cities
- ✅ Should track discovered technologies
- ✅ Should track unlocked policies
- ✅ Should manage diplomacy relationships
- ✅ Should add and remove cities
- ✅ Should set capital correctly
- ✅ Should eliminate nation properly
- ✅ Should process turn and update managers

**Why**: Nations are the primary simulation actors

---

### 7. Tech Manager Tests (`TechManager.test.ts`)
**What**: Test technology research

**Tests**:
- ✅ Should accumulate science toward current tech
- ✅ Should complete tech when cost met
- ✅ Should reset progress on completion
- ✅ Should track researched techs
- ✅ Should update era based on techs
- ✅ Should handle no current research
- ✅ Should prevent researching already-discovered tech

**Why**: Tech progression is key to gameplay

---

### 8. Policy Manager Tests (`PolicyManager.test.ts`)
**What**: Test social policy unlocking

**Tests**:
- ✅ Should accumulate culture toward policy
- ✅ Should calculate policy cost correctly
- ✅ Should detect when policy is affordable
- ✅ Should track unlocked policies
- ✅ Should increase cost for each policy
- ✅ Should handle multiple policy trees

**Why**: Policies affect nation bonuses

---

### 9. Diplomacy Manager Tests (`DiplomacyManager.test.ts`)
**What**: Test diplomatic relations

**Tests**:
- ✅ Should initialize with neutral state
- ✅ Should declare war
- ✅ Should make peace
- ✅ Should form alliance
- ✅ Should modify opinion
- ✅ Should decay opinion over time
- ✅ Should track diplomatic history
- ✅ Should handle grievances

**Why**: Diplomacy affects inter-nation interactions

---

## Integration Tests

### 10. Turn Processing Tests (`TurnProcessing.test.ts`)
**What**: Test complete turn execution with multiple systems

**Tests**:
- ✅ Should process nation yields from cities
- ✅ Should process city growth across all cities
- ✅ Should process city production across all cities
- ✅ Should process nation tech research
- ✅ Should process nation policy accumulation
- ✅ Should execute AI decisions
- ✅ Should create appropriate historical events
- ✅ Should advance turn and year correctly
- ✅ Should handle multiple nations in one turn
- ✅ Should maintain consistent state

**Why**: Ensures all systems work together

---

### 11. AI City Founding Tests (`AICityFounding.test.ts`)
**What**: Test complete city founding flow

**Tests**:
- ✅ Should found city at best location
- ✅ Should add city to nation
- ✅ Should create city entity in store
- ✅ Should create historical event
- ✅ Should set city as capital if first
- ✅ Should initialize city with correct values
- ✅ Should handle founding on different turn schedules
- ✅ Should found cities for multiple nations independently

**Why**: City founding is complex multi-step process

---

### 12. Multi-Nation Simulation Tests (`MultiNation.test.ts`)
**What**: Test simulation with competing nations

**Tests**:
- ✅ Should handle 2 nations expanding simultaneously
- ✅ Should prevent cities from overlapping territory
- ✅ Should allocate resources to correct nations
- ✅ Should create events for each nation
- ✅ Should handle different expansion rates
- ✅ Should track events per nation correctly
- ✅ Should handle nation elimination
- ✅ Should detect victory conditions

**Why**: Multi-nation is the core use case

---

## End-to-End Tests

### 13. Complete Simulation Tests (`FullSimulation.test.ts`)
**What**: Run actual 50-turn simulations

**Tests**:
- ✅ Should complete 50 turns without errors
- ✅ Should found at least 5 cities across 3 nations
- ✅ Should grow city populations
- ✅ Should expand nation territories
- ✅ Should create historical events (100+)
- ✅ Should accumulate nation resources
- ✅ Should discover at least one technology
- ✅ Should maintain data consistency throughout
- ✅ Should handle edge cases gracefully
- ✅ Should produce queryable event history

**Why**: Validates entire system works end-to-end

---

### 14. Edge Case Tests (`EdgeCases.test.ts`)
**What**: Test unusual or error conditions

**Tests**:
- ✅ Should handle map with no valid city locations
- ✅ Should handle nation with no cities (elimination)
- ✅ Should handle city starvation to death
- ✅ Should handle simultaneous city founding attempts
- ✅ Should handle empty production queue
- ✅ Should handle zero yields
- ✅ Should handle negative food (starvation)
- ✅ Should handle very small maps (5x5)
- ✅ Should handle very large maps (100x100)
- ✅ Should handle extremely high expansionist (100)

**Why**: Edge cases reveal bugs

---

### 15. Performance Tests (`Performance.test.ts`)
**What**: Test simulation performance

**Tests**:
- ✅ Should process 100 turns in < 5 seconds
- ✅ Should handle 10 nations efficiently
- ✅ Should handle 50x50 map efficiently
- ✅ Should not leak memory over 1000 turns
- ✅ Should query events efficiently
- ✅ Should handle large event history (10,000+ events)

**Why**: Ensures scalability

---

## Test Data Builders

Create helper functions for test data:

```typescript
// Test data builders
export function createTestNation(overrides?: Partial<Nation>): Nation;
export function createTestCity(overrides?: Partial<City>): City;
export function createTestMap(size: number): RegionalMap;
export function createTestTile(terrain: TerrainType): RegionalHexTile;
export function createTestSimulation(): { simulation, store, ai };
```

---

## Test Execution Plan

### Phase 1: Unit Tests (Day 1)
1. Write MockEntityStore tests → Run → Fix issues
2. Write BasicAIController tests → Run → Fix issues
3. Write CityPopulationManager tests → Run → Fix issues
4. Write CityProductionManager tests → Run → Fix issues
5. Write CityExpansionManager tests → Run → Fix issues

### Phase 2: Integration Tests (Day 2)
6. Write TurnProcessing tests → Run → Fix issues
7. Write AICityFounding tests → Run → Fix issues
8. Write MultiNation tests → Run → Fix issues

### Phase 3: E2E Tests (Day 3)
9. Write FullSimulation tests → Run → Fix issues
10. Write EdgeCases tests → Run → Fix issues
11. Write Performance tests → Run → Fix issues

### Phase 4: Coverage Analysis
12. Run coverage report
13. Identify untested code
14. Add tests for <80% coverage areas
15. Achieve 90%+ coverage goal

---

## Test Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test MockEntityStore.test.ts

# Run tests matching pattern
npm test -- AI

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on change)
npm test -- --watch

# Run integration tests only
npm test -- --testPathPattern=integration

# Run unit tests only
npm test -- --testPathPattern=unit
```

---

## Expected Issues to Fix

Based on the current code, we expect to find:

1. **MockEntityStore** might not properly handle entity IDs
2. **BasicAIController** might crash on empty maps
3. **CityPopulationManager** might allow population < 1
4. **SimulationEngine** might not handle nations with no cities
5. **Event indexing** might not properly update on entity deletion
6. **Turn progression** might not validate state transitions
7. **AI decisions** might conflict when two nations want same tile
8. **Resource calculation** might double-count city yields
9. **Border expansion** might acquire already-owned tiles
10. **Victory conditions** might false-trigger

---

## Success Criteria

- ✅ All tests pass (100% success rate)
- ✅ Code coverage > 90%
- ✅ No flaky tests (consistent results)
- ✅ Tests run in < 30 seconds
- ✅ Clear test descriptions
- ✅ Good error messages on failure
- ✅ Integration tests validate real scenarios
- ✅ Edge cases handled gracefully

---

## Next Steps

1. ✅ Create test plan (this document)
2. ⬜ Implement unit tests (Phase 1)
3. ⬜ Run tests and fix failures
4. ⬜ Implement integration tests (Phase 2)
5. ⬜ Run tests and fix failures
6. ⬜ Implement E2E tests (Phase 3)
7. ⬜ Run tests and fix failures
8. ⬜ Analyze coverage
9. ⬜ Fill coverage gaps
10. ⬜ Document findings

Let's build a robust, well-tested simulation! 🧪
