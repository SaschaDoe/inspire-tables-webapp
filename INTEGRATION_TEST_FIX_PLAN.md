# Integration Test Fix Plan

## Diagnostic Results from TurnProcessing.diagnostic.test.ts

### 🔍 Root Causes Identified

## Issue 1: Tech Research System **BROKEN** ❌

**File:** `src/lib/entities/location/nation.ts:239`

**Problem:**
```typescript
const techResult = this.techManager.processTurn(this.sciencePerTurn, 100); // TODO: Get actual tech cost
```

**Hard-coded tech cost = 100** even though tests pass cost = 20!

**Impact:**
- Tech needs 20 science but system thinks it needs 100
- Research never completes
- Diagnostic showed: researchProgress stays at 10 across all turns (doesn't accumulate beyond first turn)

**Fix:**
1. Add `currentTechCost` property to TechManager
2. Store tech cost when `startResearching()` is called
3. Update `nation.processTurn()` to use actual stored cost

---

## Issue 2: TechManager Missing Tech Cost Storage

**File:** `src/lib/simulation/managers/TechManager.ts:56`

**Problem:**
```typescript
startResearching(techId: string, techCost: number): void {
    // ...
    this.currentResearch = techId;
    // techCost parameter is IGNORED!
}
```

The `techCost` parameter is never stored anywhere!

**Missing Property:**
- No `currentTechCost?: number` property exists in TechManager

**Fix:**
1. Add `currentTechCost?: number` property to TechManager class
2. Store it in `startResearching()`: `this.currentTechCost = techCost;`
3. Clear it when tech completes or research is cancelled

---

## Issue 3: City Population Growth Not Working

**Diagnostic Output:**
```
[BEFORE] City populationManager.foodNeeded: undefined  ⚠️
[BEFORE] City yields.food: 10
[AFTER] City yields.food: 2  ⚠️ Changed!
[AFTER] City populationManager.foodStored: 0  ❌
```

**Problems:**
1. `foodNeeded` is undefined (not calculated)
2. City yields.food changes from 10 → 2 (being reset somewhere)
3. Food not accumulating in `foodStored`

**Hypothesis:**
- City.processTurn() may not be called properly
- OR yields are being reset after processing
- OR PopulationManager.processTurn() has bugs

**Fix:**
1. Check if City.processTurn() receives correct yields
2. Ensure PopulationManager calculates foodNeeded properly
3. Trace where yields.food changes from 10 to 2

---

## Issue 4: Cultural Expansion Blocked

**Diagnostic Output:**
```
[CHECK] getAvailableTilesForExpansion returned: []
```

**Problem:**
The method returns empty array, so cities can NEVER expand!

**File:** `src/lib/simulation/SimulationEngine.ts:455-459`
```typescript
private getAvailableTilesForExpansion(city: City): string[] {
    // TODO: Implement proper tile ownership tracking
    // For now, return empty array
    return [];
}
```

**This is a stub implementation!**

**Fix:**
Either:
1. Implement proper tile expansion logic
2. OR return fake tiles for testing
3. OR skip these tests until implemented

---

## Issue 5: Research Progress Not Accumulating

**Diagnostic Output:**
```
[TURN 1] Nation techManager.researchProgress: 10
[TURN 2] Nation techManager.researchProgress: 10  ❌ Should be 20!
[TURN 3] Nation techManager.researchProgress: 10  ❌ Should be 30!
```

**Problem:**
Research progress accumulates on turn 1, but then stops!

**Hypothesis:**
- After first turn, entity might be losing its state
- OR nation.processTurn() returns early on subsequent turns
- OR `currentResearch` is being cleared

**Fix:**
- Add logging to TechManager.processTurn() to see what's happening
- Verify currentResearch persists across turns
- Check if entity retrieval from store breaks something

---

## 📋 Fix Implementation Plan

### Phase 1: Fix Tech Research System (Highest Priority)

**Step 1:** Add `currentTechCost` to TechManager
```typescript
// In TechManager class
currentTechCost?: number; // Cost of current research
```

**Step 2:** Update `startResearching()` to store cost
```typescript
startResearching(techId: string, techCost: number): void {
    if (this.hasTech(techId)) return;
    if (this.currentResearch === techId) return;

    this.currentResearch = techId;
    this.currentTechCost = techCost;  // ← ADD THIS
}
```

**Step 3:** Update Nation.processTurn() to use stored cost
```typescript
processTurn(currentTurn: number): {...} {
    // Get cost from manager, fallback to 100
    const techCost = this.techManager.currentTechCost ?? 100;
    const techResult = this.techManager.processTurn(this.sciencePerTurn, techCost);
    // ...
}
```

**Step 4:** Clear cost when research completes
```typescript
// In TechManager.processTurn()
if (this.researchProgress >= adjustedCost) {
    // ...
    this.currentResearch = undefined;
    this.currentTechCost = undefined;  // ← ADD THIS
    this.researchProgress = 0;
    // ...
}
```

---

### Phase 2: Fix City Population & Culture Issues

**Step 1:** Add diagnostic logging to City.processTurn()
- Log yields before/after
- Log what PopulationManager/ExpansionManager receive

**Step 2:** Fix `foodNeeded` calculation
- Ensure PopulationManager.calculateFoodNeeded() is called

**Step 3:** Find where yields are being reset
- Search for `yields.food = ` assignments
- Check if processNationYields() is resetting city yields

---

### Phase 3: Fix or Stub Expansion System

**Option A (Quick Fix):** Return dummy tiles for testing
```typescript
private getAvailableTilesForExpansion(city: City): string[] {
    const map = entityStore.getEntity(city.parentRegionalMapId) as RegionalMap;
    if (!map) return [];
    // Return first 6 adjacent tiles as available
    return map.hexTileIds.slice(0, 6);
}
```

**Option B (Skip):** Mark expansion tests as `.skip()` until implemented

---

### Phase 4: Investigate Research Progress Issue

**Add logging to see entity state:**
```typescript
// In SimulationEngine.processNations()
console.log(`[DEBUG] Before processTurn - currentResearch: ${nation.techManager.currentResearch}`);
const result = nation.processTurn(this.currentTurn);
console.log(`[DEBUG] After processTurn - currentResearch: ${nation.techManager.currentResearch}`);
```

---

## ✅ Success Criteria

After fixes, expect:
- ✅ Tech research completes after 2-3 turns (20 science / 10 per turn)
- ✅ Cities accumulate food in `foodStored`
- ✅ Cities accumulate culture in `cultureStored` (if tiles available)
- ✅ Research progress increases each turn (10 → 20 → 30)
- ✅ All 21 integration tests passing

---

## 🔧 Files to Modify

1. `src/lib/simulation/managers/TechManager.ts` - Add currentTechCost property
2. `src/lib/entities/location/nation.ts` - Fix hard-coded tech cost
3. `src/lib/simulation/SimulationEngine.ts` - Fix or stub getAvailableTilesForExpansion()
4. Add more diagnostic logging as needed

---

## ⏱️ Estimated Effort

- Phase 1 (Tech Fix): **15 minutes**
- Phase 2 (City Issues): **30 minutes**
- Phase 3 (Expansion): **10 minutes** (stub) or **2 hours** (full implementation)
- Phase 4 (Research Progress): **20 minutes**

**Total:** ~1.5 hours (with stubs) or ~3 hours (full implementation)
