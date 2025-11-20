# Workspace Performance Optimization Plan

## Executive Summary

This plan addresses critical performance bottlenecks in the workspace page that cause slow loading times. The solution implements lazy loading, pre-grouped entity indexing, and batched operations while maintaining clear patterns for future development.

**Key Principle:** Make performance patterns EXPLICIT in the code so future AI assistants and developers immediately understand what must be maintained when adding new entities or features.

---

## Current Performance Bottlenecks

### 🔴 Critical Issues
1. **Synchronous localStorage Parse** - All entities loaded before UI renders (entityStore.ts:79)
2. **Entity Scanning on Mount** - `loadAllEntities()` scans ALL entities synchronously (workspace/+page.svelte:54)
3. **Repeated Type Grouping** - Manual grouping by entity type on every load (workspace/+page.svelte:64-82)
4. **Unbatched Saves** - `saveToStorage()` serializes ALL entities after EVERY mutation (entityStore.ts:65)
5. **Nested Entity Recursion** - Each nested entity save triggers full store serialization (nestedEntityExtractor.ts:110-111)
6. **No Data Indexing** - Linear scans through all entities for filtering/searching

### 📊 Impact
- **Initial Load**: 2-5 seconds with 1000+ entities
- **Entity Creation**: 100-500ms per entity with nested children
- **UI Blocking**: User cannot interact until all data loads

---

## Optimization Strategy

### Phase 1: Immediate UI Responsiveness (PRIORITY)
**Goal:** Show UI in <50ms, load data progressively

### Phase 2: Store Architecture Refactor (FOUNDATION)
**Goal:** Pre-group entities, eliminate redundant scanning

### Phase 3: Save Operation Batching (PERFORMANCE)
**Goal:** Reduce localStorage writes by 90%

### Phase 4: Advanced Optimizations (ENHANCEMENT)
**Goal:** Virtual scrolling, incremental loading

---

# PHASE 1: Immediate UI Responsiveness

## 1.1 Defer Entity Loading in Workspace Page

**File:** `src/routes/workspace/+page.svelte`

### Changes Required

#### Current Code (Lines 26-51):
```svelte
onMount(() => {
  campaigns = entityStore.getCampaigns();
  loadAllEntities();  // BLOCKS UI
  // ...
});
```

#### New Pattern:
```svelte
onMount(() => {
  // Phase 1: Show UI immediately
  showSkeletonUI = true;

  // Phase 2: Load data asynchronously
  setTimeout(() => {
    campaigns = entityStore.getCampaigns();
    loadAllEntities();
    showSkeletonUI = false;
  }, 0);

  // Phase 3: Handle URL parameters after initial render
  // ...
});
```

### Implementation Tasks
- [ ] Add `showSkeletonUI` reactive variable
- [ ] Wrap data loading in `setTimeout(..., 0)` to defer to next tick
- [ ] Add skeleton/loading states to EntityNavigator component
- [ ] Ensure URL parameter handling works with deferred loading

---

## 1.2 Progressive Entity Loading in EntityNavigator

**File:** `src/lib/components/EntityNavigator.svelte`

### New Loading Strategy

#### Current Behavior:
- All entity type stores subscribed on mount
- All sections rendered immediately (even collapsed)

#### New Behavior:
- Subscribe to entity type stores ONLY when section expanded
- Lazy load entity counts for collapsed sections
- Unsubscribe when section collapsed (optional memory optimization)

### Implementation Pattern

```svelte
<script>
  import { onMount } from 'svelte';

  // Track which sections are expanded
  let expandedSections = new Set(['campaigns', 'adventures']); // Default expanded

  // Track which sections have loaded data
  let loadedSections = new Set();

  // Lazy entity store subscriptions
  let entityStores = {
    campaigns: null,
    adventures: null,
    characters: null,
    // ... etc
  };

  function toggleSection(sectionKey) {
    if (expandedSections.has(sectionKey)) {
      expandedSections.delete(sectionKey);
    } else {
      expandedSections.add(sectionKey);
      // Load data when first expanded
      if (!loadedSections.has(sectionKey)) {
        loadSectionData(sectionKey);
      }
    }
    expandedSections = expandedSections; // Trigger reactivity
  }

  async function loadSectionData(sectionKey) {
    // Subscribe to appropriate store
    // Mark as loaded
    loadedSections.add(sectionKey);
  }
</script>
```

### Implementation Tasks
- [ ] Add `expandedSections` Set to track UI state
- [ ] Add `loadedSections` Set to track loaded data
- [ ] Implement `loadSectionData()` for lazy store subscription
- [ ] Update section rendering to check `loadedSections`
- [ ] Add loading spinner for individual sections
- [ ] Optimize entity count display for collapsed sections (use pre-computed counts)

---

# PHASE 2: Use Existing Derived Stores (Simplified Approach)

## Overview

**BETTER APPROACH AFTER SVELTE MCP REVIEW:**

Instead of adding complex dual data structures, we discovered that **the solution already exists**! The codebase has derived stores (`campaignEntities`, `adventureEntities`, etc.) that automatically handle reactivity and filtering. The problem is that the workspace page is **manually doing the same work** that these stores do automatically.

### The Real Problem

**File:** `src/routes/workspace/+page.svelte` (Lines 60-87)

```typescript
function loadAllEntities() {
  const allEntities = entityStore.searchEntities(''); // ❌ Scans ALL entities

  // Manually filtering by type (❌ adventureEntities store already does this!)
  adventures = new Map(
    allEntities.filter(e => e.type === 'adventure')...
  );

  // Manually grouping by type (❌ Derived stores already do this!)
  allEntities.forEach(entity => {
    groupedEntities.set(type, [...]);
  });
}
```

Meanwhile, **EntityNavigator is doing it correctly** (Line 163):
```typescript
function getEntitiesForSection(type: string): Entity[] {
  if (type === 'recent') return $recentlyUsedEntities; // ✅ Uses derived store
  if (type === 'favorites') return $favoriteEntities; // ✅ Uses derived store

  switch (type) {
    case EntityType.Campaign: return $campaignEntities; // ✅ Uses derived store
    case EntityType.Adventure: return $adventureEntities; // ✅ Uses derived store
    // ...
  }
}
```

## Why This is Better Than Dual Structures

**❌ Original Phase 2 Plan (Dual Structures):**
- Maintain `entities` Map AND `entitiesByType` Map
- Every mutation must update BOTH
- Error-prone, fragile, complex
- Requires helper functions, documentation, constant vigilance

**✅ New Phase 2 Plan (Use Existing Stores):**
- Single source of truth: `entities` Map
- Svelte's derived stores handle filtering automatically
- Can't make synchronization mistakes
- Uses framework correctly, idiomatic Svelte
- Less code, simpler, more maintainable

## Svelte Best Practices (from Svelte MCP)

1. **Push-pull reactivity**: Changes notify immediately, but derived values only recalculate when read
2. **Efficient derived stores**: Skip updates if value doesn't change (referential equality check)
3. **Stores are still valid**: Though runes preferred in Svelte 5, stores work great for existing code
4. **Use the framework**: Don't manually replicate what Svelte does automatically

---

## 2.1 Remove Redundant Manual Work

**⚠️ IMPORTANT FOR AI ASSISTANTS AND DEVELOPERS:**

The workspace page is **manually scanning and grouping** entities. This is redundant because:

1. **Derived stores already exist** - `adventureEntities`, `campaignEntities`, etc. (entityStore.ts:380-466)
2. **They're already reactive** - Auto-update when base store changes
3. **EntityNavigator uses them correctly** - No manual scanning needed
4. **Workspace duplicates this work** - Causing unnecessary performance overhead

### Solution: Delete Manual Scanning Code

**Remove these from `workspace/+page.svelte`:**
- ❌ `adventures` state variable (line 22) - Use `$adventureEntities` store instead
- ❌ `allOtherEntities` state variable (line 23) - Not needed
- ❌ `loadAllEntities()` function (lines 60-87) - Redundant
- ❌ All calls to `loadAllEntities()` - Derived stores update automatically

**Replace with:**
- ✅ Direct subscription to derived stores like EntityNavigator does

### Implementation Tasks

#### 2.1.1 Remove Redundant State Variables
**File:** `src/routes/workspace/+page.svelte`

```typescript
// ❌ REMOVE THESE:
let adventures = $state(new Map<string, AdventureEntity>());
let allOtherEntities = $state<Map<string, Entity[]>>(new Map());
```

These are redundant because:
- `adventures` → Use `$adventureEntities` store instead
- `allOtherEntities` → Not needed, use type-specific stores

#### 2.1.2 Remove `loadAllEntities()` Function
**File:** `src/routes/workspace/+page.svelte` (Lines 60-87)

```typescript
// ❌ DELETE THIS ENTIRE FUNCTION:
function loadAllEntities() {
  const allEntities = entityStore.searchEntities('');
  // ... manual scanning/grouping code ...
}
```

**Why:** Derived stores update automatically via Svelte reactivity. No manual reload needed!

#### 2.1.3 Remove All Calls to `loadAllEntities()`
**File:** `src/routes/workspace/+page.svelte`

Find and remove:
- Line 32: `loadAllEntities();` in onMount
- Line 50: `loadAllEntities();` in entity-created handler
- Line 458: `loadAllEntities();` after nested entity save
- Line 466: `loadAllEntities();` after nested refresh
- Line 480: `loadAllEntities();` after entity update

**Why:** Svelte's reactivity triggers derived store updates automatically. Calling this function causes redundant work!

#### 2.1.4 Use Derived Stores Directly (If Needed)
**File:** `src/routes/workspace/+page.svelte`

If workspace needs direct access to entity lists:

```typescript
// ✅ Import the stores
import { adventureEntities } from '$lib/stores/entityStore';

// ✅ Use with $ prefix (auto-subscribes)
{#if $adventureEntities.length > 0}
  {#each $adventureEntities as adventure}
    <!-- ... -->
  {/each}
{/if}
```

**Note:** EntityNavigator already does this correctly, so workspace might not even need direct access!

---

# PHASE 3: Save Operation Batching

## 3.1 Debounced localStorage Writes

**File:** `src/lib/stores/entityStore.ts`

### Problem
`saveToStorage()` called after EVERY mutation:
- Creating entity with 10 nested children = 11 full serializations
- Each serialization = `JSON.stringify(Array.from(entities.values()))`

### Solution: Batch Writes with Debounce

```typescript
/**
 * =============================================================================
 * SAVE BATCHING PATTERN
 * =============================================================================
 *
 * localStorage writes are EXPENSIVE - each write serializes ALL entities.
 * We batch multiple mutations and save once after activity stops.
 *
 * ⚠️ PATTERN FOR AI ASSISTANTS:
 *
 * DO NOT call saveToStorage() directly in entity mutation functions!
 * Instead, call scheduleSave() which batches writes.
 *
 * EXCEPTION: Only call saveToStorage() directly if:
 * - User explicitly clicked "Save" button
 * - App is closing/navigating away
 * - Import/export operations
 *
 * Normal entity creation/update/delete should use scheduleSave().
 * =============================================================================
 */

let saveTimeout: number | null = null;
let pendingSave = false;

/**
 * Schedule a batched save operation.
 * Multiple calls within 500ms will be merged into single save.
 */
function scheduleSave(): void {
  pendingSave = true;

  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = window.setTimeout(() => {
    if (pendingSave) {
      saveToStorage();
      pendingSave = false;
    }
    saveTimeout = null;
  }, 500); // Wait 500ms after last mutation
}

/**
 * Immediate save - only for critical operations.
 * Use scheduleSave() for normal mutations.
 */
function saveToStorage(): void {
  // Existing implementation
  localStorage.setItem('entities', JSON.stringify(Array.from(entities.values())));
  // ...
}

/**
 * Force immediate save (for app shutdown, etc)
 */
export function flushPendingSaves(): void {
  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  if (pendingSave) {
    saveToStorage();
    pendingSave = false;
  }
}
```

### Implementation Tasks

#### 3.1.1 Add Batching Infrastructure
- [ ] Add `saveTimeout` and `pendingSave` state variables
- [ ] Implement `scheduleSave()` function
- [ ] Implement `flushPendingSaves()` function
- [ ] Add documentation comment block (above)

#### 3.1.2 Update All Mutation Callsites
- [ ] `createEntity()` - Change `saveToStorage()` to `scheduleSave()`
- [ ] `updateEntity()` - Change `saveToStorage()` to `scheduleSave()`
- [ ] `deleteEntity()` - Change `saveToStorage()` to `scheduleSave()`
- [ ] Keep `saveToStorage()` direct calls for:
  - `importEntities()`
  - Any explicit save buttons
  - Browser unload handlers

#### 3.1.3 Add Flush on Navigation
**File:** `src/routes/+layout.svelte`

```svelte
<script>
  import { onDestroy } from 'svelte';
  import { flushPendingSaves } from '$lib/stores/entityStore';

  onDestroy(() => {
    flushPendingSaves();
  });

  // Also flush on beforeunload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushPendingSaves);
  }
</script>
```

---

## 3.2 Batch Nested Entity Creation

**File:** `src/lib/utils/nestedEntityExtractor.ts`

### Problem
Line 105 calls `entityStore.createEntity()` for each nested entity, triggering individual saves.

### Solution Pattern

Add a batch mode parameter to entity creation:

```typescript
/**
 * =============================================================================
 * BATCH CREATION PATTERN
 * =============================================================================
 *
 * When creating multiple related entities (nested, auto-generated, imported),
 * use batch mode to defer saves until all entities are created.
 *
 * ⚠️ PATTERN FOR AI ASSISTANTS:
 *
 * Single entity: entityStore.createEntity(entity)
 * Multiple entities:
 *   1. entityStore.beginBatch()
 *   2. entities.forEach(e => entityStore.createEntity(e))
 *   3. entityStore.endBatch() // Triggers single save
 *
 * The store will accumulate changes and save once at endBatch().
 * =============================================================================
 */

// In entityStore.ts
let batchMode = false;
let batchedEntities: Entity[] = [];

export function beginBatch(): void {
  batchMode = true;
  batchedEntities = [];
}

export function endBatch(): void {
  batchMode = false;
  if (batchedEntities.length > 0) {
    // Update stores with all batched entities at once
    entities.update(map => {
      batchedEntities.forEach(entity => map.set(entity.id, entity));
      return map;
    });

    entitiesByType.update(typeMap => {
      batchedEntities.forEach(entity => {
        if (!typeMap.has(entity.type)) {
          typeMap.set(entity.type, new Map());
        }
        typeMap.get(entity.type)!.set(entity.id, entity);
      });
      return typeMap;
    });

    batchedEntities = [];
    scheduleSave(); // Single save for entire batch
  }
}

export function createEntity(entity: Entity): void {
  if (batchMode) {
    batchedEntities.push(entity);
    return; // Don't save yet
  }

  // Normal single-entity creation
  addEntityToBothStructures(entity);
  scheduleSave();
}
```

### Implementation Tasks

#### 3.2.1 Add Batch Mode to EntityStore
- [ ] Add `batchMode` and `batchedEntities` state
- [ ] Implement `beginBatch()` function
- [ ] Implement `endBatch()` function
- [ ] Update `createEntity()` to check `batchMode`
- [ ] Add documentation comment block

#### 3.2.2 Update Nested Entity Extractor
**File:** `src/lib/utils/nestedEntityExtractor.ts`

```typescript
export async function extractAndSaveNestedEntities(/* ... */): Promise<void> {
  // Begin batch mode
  entityStore.beginBatch();

  try {
    // Existing nested entity logic (lines 83-112)
    // All createEntity() calls will be batched

    // ... existing code ...

  } finally {
    // End batch mode - triggers single save
    entityStore.endBatch();
  }
}
```

#### 3.2.3 Update Auto Generator
**File:** `src/lib/utils/entityAutoGenerator.ts`

```typescript
export async function autoGenerateChildEntities(/* ... */): Promise<void> {
  entityStore.beginBatch();

  try {
    // Existing generation logic (lines 20-61)
    // All createEntity() calls will be batched

    // ... existing code ...

  } finally {
    entityStore.endBatch();
  }
}
```

#### 3.2.4 Update Import Function
```typescript
export function importEntities(entities: Entity[]): void {
  entityStore.beginBatch();

  try {
    entities.forEach(entity => {
      entityStore.createEntity(entity);
    });
  } finally {
    entityStore.endBatch();
  }
}
```

---

# PHASE 4: Advanced Optimizations

## 4.1 Virtual Scrolling for Entity Lists

**File:** `src/lib/components/EntityNavigator.svelte`

### Implementation
Use Svelte virtual list library:

```bash
npm install svelte-virtual-list
```

```svelte
<script>
  import VirtualList from 'svelte-virtual-list';

  let items = []; // Entity list
  let start;
  let end;
</script>

<VirtualList items={items} height="600px" itemHeight={40} bind:start bind:end>
  <div slot="item" let:item>
    <EntityCard entity={item} />
  </div>
</VirtualList>
```

### Tasks
- [ ] Install `svelte-virtual-list` package
- [ ] Wrap entity lists in VirtualList component
- [ ] Tune itemHeight based on entity card design
- [ ] Test scrolling performance with 1000+ entities

---

## 4.2 Incremental Search Indexing

**File:** `src/lib/stores/entityStore.ts`

### Add Search Index
```typescript
/**
 * =============================================================================
 * SEARCH INDEX PATTERN
 * =============================================================================
 *
 * Full-text search is expensive. We maintain a search index for O(1) lookups.
 *
 * ⚠️ PATTERN FOR AI ASSISTANTS:
 *
 * When entity name/description changes, update search index:
 *
 * createEntity() -> addToSearchIndex(entity)
 * updateEntity() -> updateSearchIndex(entity)
 * deleteEntity() -> removeFromSearchIndex(entityId)
 *
 * Use searchIndex.get(term) instead of scanning all entities.
 * =============================================================================
 */

const searchIndex = writable(new Map<string, Set<string>>()); // term -> entity IDs

function addToSearchIndex(entity: Entity): void {
  const terms = extractSearchTerms(entity);
  searchIndex.update(index => {
    terms.forEach(term => {
      if (!index.has(term)) {
        index.set(term, new Set());
      }
      index.get(term)!.add(entity.id);
    });
    return index;
  });
}

function extractSearchTerms(entity: Entity): string[] {
  const terms: string[] = [];

  // Name words
  if (entity.name) {
    terms.push(...entity.name.toLowerCase().split(/\s+/));
  }

  // Type
  terms.push(entity.type.toLowerCase());

  // Description words (first 50)
  if (entity.generatedEntity?.description) {
    const descWords = entity.generatedEntity.description
      .toLowerCase()
      .split(/\s+/)
      .slice(0, 50);
    terms.push(...descWords);
  }

  return terms;
}
```

### Tasks
- [ ] Add `searchIndex` writable store
- [ ] Implement `addToSearchIndex()` function
- [ ] Implement `updateSearchIndex()` function
- [ ] Implement `removeFromSearchIndex()` function
- [ ] Implement `extractSearchTerms()` function
- [ ] Update entity mutations to maintain index
- [ ] Replace `searchEntities()` implementation with index lookup
- [ ] Add documentation comment block

---

# Implementation Order & Checklist

## Sprint 1: Immediate Wins (Est. 4-6 hours)
- [ ] Phase 1.1: Defer workspace entity loading
- [ ] Phase 1.2: Progressive EntityNavigator loading
- [ ] Test: Measure initial render time (<50ms target)
- [ ] Test: Verify all entity sections load correctly

## Sprint 2: Store Refactor (Est. 6-8 hours)
- [ ] Phase 2.1.1: Add entitiesByType index structure
- [ ] Phase 2.1.1: Add helper functions and documentation
- [ ] Phase 2.1.2: Update all mutation functions
- [ ] Phase 2.1.3: Create index-based query functions
- [ ] Phase 2.1.4: Update workspace to use index
- [ ] Phase 2.2: Refactor derived stores
- [ ] Test: Verify entity CRUD operations maintain index
- [ ] Test: Measure loadAllEntities() elimination impact

## Sprint 3: Save Batching (Est. 4-6 hours)
- [ ] Phase 3.1.1: Add debouncing infrastructure
- [ ] Phase 3.1.2: Update all saveToStorage() callsites
- [ ] Phase 3.1.3: Add flush on navigation
- [ ] Phase 3.2.1: Add batch mode to EntityStore
- [ ] Phase 3.2.2: Update nested entity extractor
- [ ] Phase 3.2.3: Update auto generator
- [ ] Phase 3.2.4: Update import function
- [ ] Test: Create entity with 20 nested children (should be 1 save, not 21)
- [ ] Test: Verify no data loss on navigation

## Sprint 4: Advanced (Optional) (Est. 8-10 hours)
- [ ] Phase 4.1: Virtual scrolling for entity lists
- [ ] Phase 4.2: Incremental search indexing
- [ ] Test: Render 5000 entities without lag
- [ ] Test: Search 5000 entities in <50ms

---

# Testing Strategy

## Performance Metrics

### Before Optimization
- [ ] Measure initial page load time with 100 entities
- [ ] Measure initial page load time with 1000 entities
- [ ] Measure entity creation time (single entity)
- [ ] Measure entity creation time (entity with 10 nested children)
- [ ] Measure search time across all entities

### After Phase 1
- [ ] Measure time to first render (should be <50ms)
- [ ] Measure time to fully loaded (should be unchanged)
- [ ] Verify UI is interactive before data loads

### After Phase 2
- [ ] Measure loadAllEntities() time (should be eliminated)
- [ ] Measure getEntitiesByType() time (should be <1ms)
- [ ] Verify derived store updates are faster

### After Phase 3
- [ ] Count localStorage writes during entity creation (should be 1 per batch)
- [ ] Measure total time to create 100 entities (should be 10x faster)
- [ ] Verify no data loss after rapid mutations

### After Phase 4
- [ ] Measure rendering 5000+ entities (should be smooth scrolling)
- [ ] Measure search with 5000+ entities (should be <50ms)

## Test Scenarios

### Scenario 1: Fresh User (Empty Database)
1. Load workspace page
2. Verify UI renders instantly
3. Create first entity
4. Verify entity appears immediately

### Scenario 2: Heavy User (1000+ Entities)
1. Import 1000 entities
2. Load workspace page
3. Verify UI renders in <50ms
4. Verify sections load progressively
5. Expand each section - verify smooth loading
6. Create entity with nested children
7. Verify single localStorage write

### Scenario 3: Power User (5000+ Entities)
1. Import 5000 entities
2. Load workspace page
3. Verify no browser freeze
4. Search for entity by name
5. Verify search returns in <100ms
6. Scroll entity list
7. Verify smooth 60fps scrolling

---

# Code Documentation Standards

## Pattern 1: Mutation Functions

Every function that modifies entities MUST include this comment:

```typescript
/**
 * Creates a new entity.
 *
 * ⚠️ MAINTAINS:
 * - entities Map
 * - entitiesByType index
 * - searchIndex (if Phase 4 implemented)
 *
 * ⚠️ TRIGGERS:
 * - scheduleSave() (batched write to localStorage)
 * - store subscriptions (UI updates)
 */
export function createEntity(entity: Entity): void {
  // Implementation
}
```

## Pattern 2: Batch Operations

Functions that create multiple entities MUST include this comment:

```typescript
/**
 * Creates multiple nested entities.
 *
 * ⚠️ USES BATCH MODE:
 * - Calls beginBatch() before creation loop
 * - Calls endBatch() after all entities created
 * - Results in single localStorage write instead of N writes
 *
 * ⚠️ DO NOT:
 * - Call saveToStorage() inside loop
 * - Call scheduleSave() inside loop
 * - Let endBatch() be skipped (use try/finally)
 */
export async function extractAndSaveNestedEntities(/* ... */): Promise<void> {
  entityStore.beginBatch();
  try {
    // ... creation loop ...
  } finally {
    entityStore.endBatch();
  }
}
```

## Pattern 3: New Entity Types

When adding a new entity type to the registry:

```typescript
/**
 * =============================================================================
 * ADDING NEW ENTITY TYPES - CHECKLIST FOR AI ASSISTANTS
 * =============================================================================
 *
 * When adding a new entity type (e.g., "spaceship"), complete these steps:
 *
 * 1. Create entity creator class in src/lib/entities/
 * 2. Register in entityRegistry.ts
 * 3. Add TypeScript type to EntityType union in src/lib/types/
 * 4. NO CHANGES NEEDED in entityStore.ts (Map handles new types automatically)
 * 5. Add derived store in entityStore.ts (optional, for convenience):
 *    export const spaceshipEntities = derived(entitiesByType, $byType => {
 *      const map = $byType.get('spaceship');
 *      return map ? Array.from(map.values()) : [];
 *    });
 * 6. Add section in EntityNavigator.svelte (if you want it in sidebar)
 *
 * ⚠️ COMMON MISTAKES:
 * - Forgetting to update EntityType union (causes TypeScript errors)
 * - Manually updating entitiesByType (automatic via helper functions)
 * - Not adding derived store (entity won't appear in EntityNavigator)
 *
 * ✅ TEST:
 * - Create entity of new type
 * - Verify it appears in EntityNavigator
 * - Verify getEntitiesByType('spaceship') returns it
 * - Verify it persists after page reload
 * =============================================================================
 */
```

---

# Migration Guide

## For Existing Databases

Users with existing entities in localStorage need migration:

**File:** `src/lib/stores/entityStore.ts`

```typescript
function loadFromStorage(): void {
  try {
    // Load entities (existing code)
    const entitiesJson = localStorage.getItem('entities');
    if (entitiesJson) {
      const entitiesArray = JSON.parse(entitiesJson);
      const entitiesMap = new Map(entitiesArray.map((e: Entity) => [e.id, e]));
      entities.set(entitiesMap);

      // NEW: Build type index from loaded entities
      buildTypeIndex(entitiesMap);
    }

    // ... rest of existing code ...

  } catch (error) {
    console.error('Error loading from storage:', error);
  }
}

/**
 * Builds entitiesByType index from entities Map.
 * Called during initial load and after imports.
 */
function buildTypeIndex(entitiesMap: Map<string, Entity>): void {
  const typeMap = new Map<EntityType, Map<string, Entity>>();

  entitiesMap.forEach(entity => {
    if (!typeMap.has(entity.type)) {
      typeMap.set(entity.type, new Map());
    }
    typeMap.get(entity.type)!.set(entity.id, entity);
  });

  entitiesByType.set(typeMap);
}
```

### Migration Tasks
- [ ] Add `buildTypeIndex()` function
- [ ] Call `buildTypeIndex()` in `loadFromStorage()`
- [ ] Call `buildTypeIndex()` in `importEntities()`
- [ ] Test with existing localStorage data

---

# Success Criteria

## Phase 1 Success
- [ ] Workspace page renders UI in <50ms
- [ ] EntityNavigator shows skeleton while loading
- [ ] Sections load progressively without blocking
- [ ] User can click/interact before all data loads

## Phase 2 Success
- [ ] No more `loadAllEntities()` full scans
- [ ] `getEntitiesByType()` executes in <1ms
- [ ] Type index stays synchronized with entities
- [ ] All entity mutations maintain index correctly

## Phase 3 Success
- [ ] Creating entity with 20 nested children = 1 localStorage write (not 21)
- [ ] Rapid entity creation doesn't cause UI lag
- [ ] No data loss on page navigation
- [ ] Batch mode works with nested/auto-generated entities

## Phase 4 Success
- [ ] 5000+ entities render without browser freeze
- [ ] Smooth 60fps scrolling through entity lists
- [ ] Search across 5000+ entities in <50ms
- [ ] Virtual scrolling maintains scroll position

---

# Rollback Plan

If issues occur after each phase:

## Phase 1 Rollback
Remove `setTimeout(..., 0)` wrapper, return to synchronous loading.

## Phase 2 Rollback
Remove `entitiesByType` store, restore direct entity scanning.

## Phase 3 Rollback
Replace `scheduleSave()` with direct `saveToStorage()` calls.

## Phase 4 Rollback
Remove virtual scrolling, return to standard list rendering.

---

# Future Considerations

## IndexedDB Migration
If localStorage becomes too slow (>10MB data):
- Migrate from localStorage to IndexedDB
- Use same batching patterns
- Add background sync for large datasets

## Web Workers
For extremely large datasets (50k+ entities):
- Move entity filtering/search to Web Worker
- Keep UI thread responsive
- Use SharedArrayBuffer for efficient communication

## Server-Side Sync
If multi-device support needed:
- Add sync endpoint
- Implement conflict resolution
- Keep local-first architecture

---

# Questions for Developer

Before implementing, clarify:

1. **Performance Target**: What's acceptable initial load time? (Current: 2-5s, Target: <50ms?)
2. **Entity Scale**: Expected max entities per user? (100? 1000? 10,000?)
3. **Browser Support**: Need IE11 support? (Affects API choices)
4. **Breaking Changes**: OK to require users to refresh after update? (For index migration)
5. **Virtual Scrolling**: Install new dependency OK? (svelte-virtual-list)

---

# AI Assistant Instructions Summary

**When modifying entity-related code in the future, remember:**

1. ✅ **Update both structures**: `entities` Map AND `entitiesByType` index
2. ✅ **Use helpers**: `addEntityToBothStructures()`, `updateEntityInBothStructures()`, `deleteEntityFromBothStructures()`
3. ✅ **Batch operations**: Use `beginBatch()` / `endBatch()` for multiple entities
4. ✅ **Schedule saves**: Use `scheduleSave()` instead of direct `saveToStorage()`
5. ✅ **Document patterns**: Add `⚠️ MAINTAINS:` and `⚠️ TRIGGERS:` comments
6. ✅ **Check TODO comments**: Look for `// TODO: Update type index` markers
7. ✅ **Test synchronization**: Verify entity appears in correct type section
8. ✅ **No full scans**: Never iterate all entities when type is known

---

**END OF PLAN**
