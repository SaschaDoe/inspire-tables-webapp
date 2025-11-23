# Dexie.js Migration Plan
## From localStorage to IndexedDB

**Created:** 2025-11-23
**Updated:** 2025-11-23 (Svelte 5 Runes Patterns Added)
**Status:** Ready for Implementation
**Reason:** localStorage quota exceeded (5-10MB limit) when storing continents with hex tiles

---

## ⚡ Key Updates (2025-11-23)

This plan has been **updated with Svelte 5 runes integration patterns**:

✅ **Hybrid In-Memory + Async Pattern** - Synchronous API maintained, no component changes needed
✅ **SSR-Safe** - Proper browser guards for SvelteKit
✅ **Correct Dexie Schema** - Fixed compound indexes
✅ **Error Handling** - IndexedDB feature detection, graceful degradation
✅ **Multi-Tab Strategy** - Focus-based refresh or BroadcastChannel
✅ **Fixed Migration Code** - Corrected tab storage structure

**Critical Insight:** The soloRpgStore.svelte.ts pattern is already correct! Other stores will follow similar debounced async persistence.

---

## Executive Summary

The application currently uses localStorage for all data persistence. With the addition of world map generation and continents containing hundreds/thousands of hex tiles, we've exceeded localStorage's ~5-10MB quota limit. This plan outlines the migration to **Dexie.js** (IndexedDB wrapper) which provides 50MB-100MB+ storage with better performance for large datasets.

**Migration Strategy:** Keep state synchronous in-memory (Svelte `$state`/`writable`), persist asynchronously to Dexie with debouncing. This maintains existing component APIs while gaining IndexedDB storage capacity.

---

## Current localStorage Usage Analysis

### 1. Entity Store (`src/lib/stores/entityStore.ts`)
**Storage Keys:**
- `entities` - **PRIMARY BOTTLENECK** - JSON array of all entities
  - Contains full entity objects with nested data
  - Includes `customFields.generatedEntity` with complete Planet/Continent objects
  - **Continents include `hexTiles[]` arrays with hundreds/thousands of tiles**
  - Size grows exponentially with world generation
- `campaigns` - Legacy campaign objects (smaller)
- `recentlyUsed` - Array of entity IDs (20 items max)
- `favorites` - Array of entity IDs (unbounded but typically small)

**Operations:**
- CRUD on entities
- Filtering by type, campaign, parent
- Search by name/description/tags
- Cascading deletes
- Recently used tracking
- Favorites management

### 2. Tab Store (`src/lib/stores/tabStore.ts`)
**Storage Keys:**
- `tabs` - Array of open tabs with navigation history (50 items max)

**Operations:**
- Open/close/switch tabs
- Pin tabs
- Navigation history (forward/back)

### 3. Storyboard Store (`src/lib/stores/storyboardStore.ts`)
**Storage Keys:**
- `storyboards` - Map of storyboard objects with nodes, connections, drawings

**Operations:**
- Create/update/delete storyboards
- Manage nodes, connections, drawings
- Undo/redo history

### 4. Solo RPG Store (`src/lib/stores/soloRpgStore.svelte.ts`)
**Storage Keys:**
- `soloRpgSessions` - Solo RPG session data
- `soloRpgCurrentSessionId` - Current session ID

**Operations:**
- Save/load sessions
- Track current session

### 5. Entity ID Counter (`src/lib/entities/base/entity.ts`)
**Storage Keys:**
- `entityIdCounter` - Numeric counter for generating entity IDs

**Operations:**
- Read current counter
- Increment and save

---

## Proposed Dexie.js Architecture

### Database Schema

```typescript
// src/lib/db/database.ts

import Dexie, { type Table } from 'dexie';
import type { Entity } from '$lib/types/entity';
import type { Campaign } from '$lib/entities/campaign';
import type { Tab } from '$lib/stores/tabStore';
import type { StoryBoard } from '$lib/types/storyboard';
import { browser } from '$app/environment';

export interface DbEntity extends Entity {
  // Already has these fields from Entity type
  // type: string;
  // campaignId?: string;
  // parentId?: string;
  // metadata: { createdAt: Date, updatedAt: Date }
}

export interface DbMetadata {
  key: string;
  value: any;
}

export class InspireTablesDatabase extends Dexie {
  // Entity tables
  entities!: Table<DbEntity, string>; // Primary key: id
  campaigns!: Table<Campaign, string>; // Legacy campaigns

  // UI state tables
  tabs!: Table<Tab, string>; // Primary key: id
  storyboards!: Table<StoryBoard, string>; // Primary key: id

  // Solo RPG tables
  soloRpgSessions!: Table<any, string>; // Primary key: id

  // Metadata table (for counters, current IDs, etc.)
  metadata!: Table<DbMetadata, string>; // Primary key: key

  constructor() {
    super('InspireTablesDB');

    this.version(1).stores({
      // Entities: compound index format [field1+field2]
      // Primary: id
      // Indexes: type, campaignId, parentId
      entities: 'id, type, campaignId, parentId',

      // Legacy campaigns
      campaigns: 'id',

      // UI state
      tabs: 'id, entityId',
      storyboards: 'id',

      // Solo RPG
      soloRpgSessions: 'id',

      // Metadata (key-value store)
      metadata: 'key'
    });
  }
}

// Only create database instance in browser (SSR-safe)
export const db = browser ? new InspireTablesDatabase() : (null as any as InspireTablesDatabase);
```

### Why These Indexes?

**entities table:**
- `id` - Primary key for direct lookups
- `type` - Filter entities by type (planets, continents, etc.)
- `campaignId` - Get all entities in a campaign
- `parentId` - Get child entities
- `metadata.updatedAt` - Sort by last updated

**tabs table:**
- `id` - Primary key
- `entityId` - Find tab for specific entity

**Other tables:**
- Simple primary key lookups sufficient

---

## Svelte 5 Runes + Dexie Integration Pattern

### Key Principle: Hybrid In-Memory + Async Persistence

**The Solution:** Keep state synchronous in memory using `$state`, persist asynchronously to Dexie using `$effect`.

### Pattern 1: Traditional Stores (entityStore, tabStore, storyboardStore)

These stores use Svelte 4 pattern with `writable()`. The strategy:

1. **Keep in-memory Map/Array** with `$state` semantics
2. **Maintain synchronous API** for components
3. **Debounced `$effect` for persistence** to Dexie
4. **Load from Dexie on init** before first render

```typescript
// Example: Hybrid entityStore pattern
import { writable } from 'svelte/store';
import { db } from '$lib/db/database';

interface EntityState {
  entities: Map<string, Entity>;
  // ... other state
}

function createEntityStore() {
  // In-memory state (synchronous)
  const { subscribe, set, update } = writable<EntityState>({
    entities: new Map(),
    campaigns: [],
    recentlyUsed: [],
    favorites: new Set()
  });

  // Load from Dexie on init
  async function loadFromDexie() {
    const [entities, campaigns, metadata] = await Promise.all([
      db.entities.toArray(),
      db.campaigns.toArray(),
      db.metadata.bulkGet(['recentlyUsed', 'favorites'])
    ]);

    update(state => ({
      entities: new Map(entities.map(e => [e.id, e])),
      campaigns,
      recentlyUsed: metadata[0]?.value || [],
      favorites: new Set(metadata[1]?.value || [])
    }));
  }

  // Persist to Dexie (debounced)
  let saveTimeout: number | null = null;
  function saveToDexie(state: EntityState) {
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = window.setTimeout(async () => {
      try {
        // Batch all writes in single transaction
        await db.transaction('rw', [db.entities, db.campaigns, db.metadata], async () => {
          await db.entities.bulkPut(Array.from(state.entities.values()));
          await db.campaigns.bulkPut(state.campaigns);
          await db.metadata.bulkPut([
            { key: 'recentlyUsed', value: state.recentlyUsed },
            { key: 'favorites', value: Array.from(state.favorites) }
          ]);
        });
      } catch (error) {
        console.error('Failed to save to Dexie:', error);
      }
    }, 500); // Debounce 500ms
  }

  // Initialize
  if (typeof window !== 'undefined') {
    loadFromDexie();
  }

  return {
    subscribe,

    // SYNCHRONOUS API (immediate in-memory updates)
    createEntity(entity: Entity) {
      update(state => {
        const newEntities = new Map(state.entities);
        newEntities.set(entity.id, entity);
        const newState = { ...state, entities: newEntities };
        saveToDexie(newState); // Async persist
        return newState;
      });
    },

    // All other methods stay synchronous...
    getEntity(id: string): Entity | undefined {
      let entity: Entity | undefined;
      subscribe(state => {
        entity = state.entities.get(id);
      })();
      return entity;
    },
    // ... rest of API unchanged
  };
}
```

### Pattern 2: Svelte 5 Runes Stores (soloRpgStore.svelte.ts)

The Solo RPG store uses Svelte 5 class-based pattern with `$state`. Strategy:

1. **Use `$state` for reactive class fields**
2. **Keep synchronous methods**
3. **Auto-save with debouncing** in private method
4. **Load in constructor** (async initialization)

```typescript
// Example: soloRpgStore pattern (already correct!)
import { db } from '$lib/db/database';

class SoloRpgStore {
  // Reactive state (synchronous access)
  currentSession = $state<SoloRpgSession | null>(null);
  allSessions = $state<SoloRpgSession[]>([]);
  isLoading = $state(false);

  constructor() {
    // Load from Dexie on init (client-side only)
    if (typeof window !== 'undefined') {
      this.loadAllSessions();
    }
  }

  // Async load (called once on init)
  private async loadAllSessions() {
    this.isLoading = true;
    try {
      const sessions = await db.soloRpgSessions.toArray();
      const currentId = await db.metadata.get('soloRpgCurrentSessionId');

      this.allSessions = sessions;
      if (currentId?.value) {
        this.currentSession = sessions.find(s => s.id === currentId.value) || null;
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Synchronous methods (update state immediately)
  createSession(name: string) {
    const session = {
      id: crypto.randomUUID(),
      adventureName: name,
      // ... other fields
    };

    this.currentSession = session;
    this.allSessions.push(session);
    this.autoSave(); // Async persist (debounced)

    return session;
  }

  // Debounced auto-save
  private autoSaveTimeout: number | null = null;

  private autoSave() {
    if (this.autoSaveTimeout) clearTimeout(this.autoSaveTimeout);

    this.autoSaveTimeout = window.setTimeout(async () => {
      try {
        await db.soloRpgSessions.bulkPut(this.allSessions);
        if (this.currentSession) {
          await db.metadata.put({
            key: 'soloRpgCurrentSessionId',
            value: this.currentSession.id
          });
        }
      } catch (error) {
        console.error('Failed to save:', error);
      }
    }, 500);
  }
}

export const soloRpgStore = new SoloRpgStore();
```

### Pattern 3: Using $effect for Reactive Persistence (Advanced)

For cases where you want persistence to react to specific state changes:

```typescript
// Example: .svelte.js file with reactive persistence
import { db } from '$lib/db/database';

export const userPreferences = $state({
  theme: 'dark',
  fontSize: 16,
  /* ... */
});

// Persist changes reactively
if (typeof window !== 'undefined') {
  let saveTimeout: number | null = null;

  $effect(() => {
    // Track all preference changes
    const prefs = { ...userPreferences };

    // Debounced save
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(async () => {
      await db.metadata.put({ key: 'userPreferences', value: prefs });
    }, 500);
  });
}
```

### Why This Pattern Works

✅ **Synchronous API** - Components get immediate values (no `await` needed)
✅ **Reactive** - Svelte tracks dependencies normally
✅ **Performant** - Debounced writes, bulk operations
✅ **SSR-Safe** - Guards prevent server-side errors
✅ **No Breaking Changes** - Existing component code works unchanged

---

## Files to Modify

### Phase 1: Core Database Setup

#### 1.1 Install Dependencies
**File:** `package.json`
```bash
npm install dexie
npm install -D @types/dexie
```

#### 1.2 Create Database Module
**New File:** `src/lib/db/database.ts`
- Define Dexie database class
- Set up schema and indexes
- Export singleton instance

#### 1.3 Create Migration Utilities
**New File:** `src/lib/db/migration.ts`
- Migrate localStorage data to IndexedDB on first load
- Handle version upgrades
- Provide rollback safety

### Phase 2: Entity Store Migration

#### 2.1 Update Entity Store
**File:** `src/lib/stores/entityStore.ts`
- Replace localStorage calls with Dexie queries
- Update `loadFromStorage()` → async
- Update `saveToStorage()` → async batched writes
- Convert synchronous operations to async where needed
- Keep derived stores reactive

**Key Changes:**
- `createEntity()` → `db.entities.add()`
- `getEntity()` → `db.entities.get()`
- `updateEntity()` → `db.entities.put()`
- `deleteEntity()` → `db.entities.delete()`
- `getEntitiesByType()` → `db.entities.where('type').equals()`
- `searchEntities()` → filter in memory (IndexedDB doesn't support full-text search)

#### 2.2 Component Migration (No Changes Needed!)

**Good News:** Because we're keeping the synchronous API with in-memory state, **components don't need to change**.

**Why Components Still Work:**
```svelte
<!-- This code works exactly the same -->
<script>
  import { entityStore } from '$lib/stores/entityStore';

  // Still synchronous!
  const entity = entityStore.getEntity(id);

  // Still works!
  entityStore.createEntity(newEntity);
</script>
```

**Optional: Add Loading State for Initial Load**

You may want to show a loading indicator while Dexie loads initial data:

```svelte
<!-- +layout.svelte or +page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { entityStore } from '$lib/stores/entityStore';

  let loaded = $state(false);

  onMount(async () => {
    // Wait for initial Dexie load
    await new Promise(resolve => setTimeout(resolve, 100));
    loaded = true;
  });
</script>

{#if loaded}
  <slot />
{:else}
  <div>Loading...</div>
{/if}
```

But this is **optional** - the app will work without it.

### Phase 3: Other Stores Migration

#### 3.1 Tab Store
**File:** `src/lib/stores/tabStore.ts`
- Replace localStorage with `db.tabs` table
- Store `navigationHistory` as JSON in metadata
- Keep operations async

#### 3.2 Storyboard Store
**File:** `src/lib/stores/storyboardStore.ts`
- Replace localStorage with `db.storyboards` table
- Keep current Map structure in memory
- Persist to IndexedDB on changes

#### 3.3 Solo RPG Store
**File:** `src/lib/stores/soloRpgStore.svelte.ts`
- Replace localStorage with `db.soloRpgSessions` table
- Store current session ID in `db.metadata`

#### 3.4 Entity ID Counter
**File:** `src/lib/entities/base/entity.ts`
- Replace localStorage with `db.metadata.get('entityIdCounter')`
- Update counter atomically using Dexie transactions

### Phase 4: Data Migration

#### 4.1 First Load Detection
**New File:** `src/lib/db/migrationStatus.ts`
- Check if migration needed
- Track migration version

#### 4.2 Migration Logic
**File:** `src/lib/db/migration.ts`

```typescript
export async function migrateFromLocalStorage() {
  // Check if already migrated
  const migrationStatus = await db.metadata.get('migrationVersion');
  if (migrationStatus?.value >= 1) {
    return; // Already migrated
  }

  console.log('[Migration] Starting localStorage → IndexedDB migration...');

  // 1. Migrate entities
  const entitiesJson = localStorage.getItem('entities');
  if (entitiesJson) {
    const entities = JSON.parse(entitiesJson);
    await db.entities.bulkAdd(entities);
    console.log(`[Migration] Migrated ${entities.length} entities`);
  }

  // 2. Migrate campaigns
  const campaignsJson = localStorage.getItem('campaigns');
  if (campaignsJson) {
    const campaigns = JSON.parse(campaignsJson);
    await db.campaigns.bulkAdd(campaigns);
  }

  // 3. Migrate tabs
  const tabsJson = localStorage.getItem('tabs');
  if (tabsJson) {
    const tabsData = JSON.parse(tabsJson);
    // The entire tabs object is stored as one entry
    if (Array.isArray(tabsData.tabs)) {
      await db.tabs.bulkAdd(tabsData.tabs);
    }
    // Store tab navigation state in metadata
    await db.metadata.put({
      key: 'tabState',
      value: {
        activeTabId: tabsData.activeTabId,
        navigationHistory: tabsData.navigationHistory || [],
        currentHistoryIndex: tabsData.currentHistoryIndex ?? -1
      }
    });
  }

  // 4. Migrate recently used & favorites
  await db.metadata.put({
    key: 'recentlyUsed',
    value: JSON.parse(localStorage.getItem('recentlyUsed') || '[]')
  });
  await db.metadata.put({
    key: 'favorites',
    value: JSON.parse(localStorage.getItem('favorites') || '[]')
  });

  // 5. Migrate storyboards
  const storyboardsJson = localStorage.getItem('storyboards');
  if (storyboardsJson) {
    const data = JSON.parse(storyboardsJson);
    if (data.boards) {
      const boards = Object.values(data.boards);
      await db.storyboards.bulkAdd(boards);
    }
    await db.metadata.put({
      key: 'activeStoryboardId',
      value: data.activeBoardId
    });
  }

  // 6. Migrate solo RPG
  const sessionsJson = localStorage.getItem('soloRpgSessions');
  if (sessionsJson) {
    const sessions = JSON.parse(sessionsJson);
    await db.soloRpgSessions.bulkAdd(sessions);
  }
  await db.metadata.put({
    key: 'soloRpgCurrentSessionId',
    value: localStorage.getItem('soloRpgCurrentSessionId')
  });

  // 7. Migrate entity counter
  await db.metadata.put({
    key: 'entityIdCounter',
    value: parseInt(localStorage.getItem('entityIdCounter') || '0')
  });

  // Mark migration complete
  await db.metadata.put({
    key: 'migrationVersion',
    value: 1
  });

  console.log('[Migration] Migration complete!');

  // Optionally clear localStorage (or keep as backup)
  // We'll keep it for safety initially
}
```

#### 4.3 App Initialization
**File:** `src/routes/+layout.svelte`

Run migration on first client-side load:

```svelte
<script>
  import { onMount } from 'svelte';
  import { migrateFromLocalStorage } from '$lib/db/migration';
  import { browser } from '$app/environment';

  let migrationStatus = $state<'pending' | 'running' | 'complete' | 'error'>('pending');
  let migrationError = $state<string | null>(null);

  onMount(async () => {
    if (!browser) return;

    try {
      migrationStatus = 'running';
      await migrateFromLocalStorage();
      migrationStatus = 'complete';
    } catch (error) {
      console.error('Migration failed:', error);
      migrationStatus = 'error';
      migrationError = error instanceof Error ? error.message : 'Unknown error';
    }
  });
</script>

{#if migrationStatus === 'running'}
  <div class="migration-overlay">
    <p>Upgrading storage... Please wait.</p>
  </div>
{:else if migrationStatus === 'error'}
  <div class="migration-error">
    <p>Storage upgrade failed: {migrationError}</p>
    <button onclick={() => location.reload()}>Retry</button>
  </div>
{:else}
  <!-- Normal app content -->
  <slot />
{/if}
```

### Phase 5: Testing & Validation

#### 5.1 Test Files
**New File:** `src/lib/db/__tests__/database.test.ts`
- Test CRUD operations
- Test queries and filters
- Test migration logic

#### 5.2 Manual Testing Checklist
- [ ] Create entities (all types)
- [ ] Update entities
- [ ] Delete entities (with cascading)
- [ ] Filter entities by type
- [ ] Search entities
- [ ] Recently used tracking
- [ ] Favorites management
- [ ] Tab operations
- [ ] Storyboard operations
- [ ] Solo RPG operations
- [ ] Migration from existing localStorage data
- [ ] Browser refresh persistence
- [ ] Multiple browser tabs sync (IndexedDB is per-origin)

---

## Performance Considerations

### Optimization Strategies

1. **Batch Writes**
   - Use `bulkAdd()`, `bulkPut()`, `bulkDelete()` for multiple operations
   - Reduces IndexedDB transaction overhead

2. **Lazy Loading**
   - Don't load all entities on app start
   - Load entities on-demand when needed
   - Use pagination for large lists

3. **Indexing**
   - Carefully chosen indexes for common queries
   - Avoid over-indexing (slows writes)

4. **Caching**
   - Keep frequently accessed entities in memory (Svelte store)
   - Use Dexie's built-in caching

5. **Derived Stores**
   - Keep current derived store pattern
   - Update stores when IndexedDB changes
   - Use Dexie live queries for reactivity

### Dexie Live Queries (Future Enhancement)

```typescript
import { liveQuery } from 'dexie';

// Auto-updates when database changes
export const continentEntities = liveQuery(
  () => db.entities.where('type').equals('continent').toArray()
);
```

---

## Backwards Compatibility

### Migration Strategy

1. **Detect first load** - Check for `migrationVersion` in IndexedDB
2. **Migrate data** - Copy from localStorage to IndexedDB
3. **Keep localStorage** - Don't delete immediately (safety backup)
4. **Dual-write period** - Optionally write to both for safety (1 version)
5. **Full cutover** - Remove localStorage code after stable

### Rollback Plan

If issues arise:
1. Keep localStorage data intact during migration
2. Add feature flag to toggle storage backend
3. Can revert to localStorage if needed

---

## Bundle Size Impact

**Dexie.js:** ~20KB gzipped
**IndexedDB:** Native browser API (0KB)

Total impact: ~20KB bundle increase

---

## Browser Compatibility

**IndexedDB Support:**
- ✅ Chrome/Edge 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ All modern browsers

**Dexie.js Support:**
- Same as IndexedDB
- Graceful fallback to WebSQL (deprecated but works on older Safari)

---

## Implementation Timeline

### Sprint 1: Setup & Core Migration (2-3 days)
- Install Dexie
- Create database schema
- Migrate entity store
- Basic CRUD operations

### Sprint 2: Store Migration (2 days)
- Migrate tab store
- Migrate storyboard store
- Migrate solo RPG store
- Update entity counter

### Sprint 3: Data Migration (1-2 days)
- Implement migration logic
- Add migration UI/progress
- Test with real data
- Handle edge cases

### Sprint 4: Testing & Polish (2 days)
- Comprehensive testing
- Performance optimization
- Error handling
- Documentation

**Total: ~7-9 days**

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data loss during migration | HIGH | Keep localStorage intact, test thoroughly, add rollback |
| Performance regression | MEDIUM | Use indexes, batch operations, lazy loading |
| Breaking changes in components | MEDIUM | Make stores async-compatible, add loading states |
| Browser compatibility issues | LOW | Dexie handles polyfills, test on all browsers |
| IndexedDB quota limits | LOW | 50MB+ quota, much larger than localStorage |

---

## Success Criteria

- ✅ No localStorage quota errors
- ✅ All existing functionality works
- ✅ Migration completes successfully
- ✅ No data loss
- ✅ Performance same or better
- ✅ All tests pass
- ✅ Works in all major browsers

---

## Future Enhancements

1. **Import/Export**
   - Export entire database to JSON
   - Import from backup file
   - Sync between devices (via file)

2. **Compression**
   - Compress large entities before storage
   - Use LZ-string or similar

3. **Cloud Sync**
   - Optional PouchDB integration
   - Sync to CouchDB/remote
   - Multi-device support

4. **Offline Support**
   - Already works offline (IndexedDB is local)
   - Add service worker for full PWA

5. **Advanced Queries**
   - Full-text search using separate index
   - Complex filtering
   - Aggregations

---

## Error Handling & Feature Detection

### IndexedDB Availability Check

```typescript
// src/lib/db/database.ts
import { browser } from '$app/environment';

function isIndexedDBAvailable(): boolean {
  if (!browser) return false;

  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

export const db = isIndexedDBAvailable()
  ? new InspireTablesDatabase()
  : (null as any as InspireTablesDatabase);

// Fallback mode detection
export const useIndexedDB = isIndexedDBAvailable();
```

### Graceful Degradation

If IndexedDB is unavailable (private browsing in some browsers):

```typescript
// Fallback to localStorage (original behavior)
if (!useIndexedDB) {
  console.warn('IndexedDB not available, using localStorage fallback');
  // Keep original localStorage implementation
}
```

### Migration Error Recovery

```typescript
export async function migrateFromLocalStorage() {
  try {
    // Check if already migrated
    const migrationStatus = await db.metadata.get('migrationVersion');
    if (migrationStatus?.value >= 1) {
      return { success: true, alreadyMigrated: true };
    }

    // Attempt migration
    await performMigration();

    return { success: true, alreadyMigrated: false };
  } catch (error) {
    console.error('[Migration] Failed:', error);

    // Don't clear localStorage on failure
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      canRetry: true
    };
  }
}
```

---

## Multi-Tab Coordination

IndexedDB is shared across tabs, but in-memory state is not. Strategy:

### Option 1: Accept Eventual Consistency (Simplest)
- Each tab maintains its own in-memory cache
- Periodic refresh from Dexie on focus/visibility change
- Good enough for most use cases

```typescript
// Refresh from DB when tab gains focus
if (typeof window !== 'undefined') {
  window.addEventListener('focus', async () => {
    await loadFromDexie();
  });
}
```

### Option 2: BroadcastChannel API (Advanced)
For real-time sync between tabs:

```typescript
const channel = new BroadcastChannel('inspire-tables-sync');

// Send updates to other tabs
function notifyOtherTabs(action: string, data: any) {
  channel.postMessage({ action, data });
}

// Receive updates from other tabs
channel.onmessage = (event) => {
  const { action, data } = event.data;
  if (action === 'entity-updated') {
    // Update in-memory cache
    update(state => {
      state.entities.set(data.id, data);
      return state;
    });
  }
};
```

**Recommendation:** Start with Option 1, add Option 2 if needed.

---

## Questions for Review

1. ✅ **Keep localStorage as backup?** YES - Don't delete during migration, remove in future version
2. ✅ **Migration UI?** YES - Simple overlay shown in +layout.svelte
3. ⏳ **Lazy loading?** LATER - Hybrid pattern loads all on init (same as before), optimize later if needed
4. ⏳ **Performance requirements?** Same or better than current localStorage performance
5. ✅ **Older browsers?** NO - Dexie supports all modern browsers, IndexedDB is widely available

---

## Next Steps

1. ✅ Create this migration plan
2. ⏳ Review plan with team/user
3. ⏳ Get approval to proceed
4. ⏳ Begin Sprint 1 implementation

---

## References

- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Dexie.js Tutorial](https://dexie.org/docs/Tutorial/Getting-started)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)
