# Entity Hierarchy Implementation Plan

## Overview
This document tracks the implementation of hierarchical entity relationships with lazy loading and navigation.

## Goals
1. Auto-generate nested entities one level deep when creating parent entities
2. Display nested entities as clickable items in the navigator and detail view
3. Allow manual addition of single nested entities via "+" buttons
4. Enable opening nested entities in new tabs
5. Implement recently used and favorites tracking

## Implementation Status

### ✅ Phase 1: Core Infrastructure (COMPLETED)
- [x] Create `entityRelationships.ts` configuration
  - Defines parent-child relationships
  - Specifies auto-generation rules
  - Provides count ranges for generation
- [x] Enhance entity store with favorites and recently used
  - Added `recentlyUsed` array (max 20 items)
  - Added `favorites` Set
  - Added methods: `markAsRecentlyUsed()`, `toggleFavorite()`, `isFavorite()`, `getFavoriteEntities()`, `getRecentlyUsedEntities()`
  - Added derived stores for all entity types
- [x] Create EntityNavigator component
  - Collapsible categories (Campaign, Locations, Celestial, Dungeons, Characters)
  - Expandable sections with entity counts
  - Quick Access section (Recently Used, Favorites)
  - "+" buttons to create new entities

### 🔧 Phase 2: Type System Updates (IN PROGRESS)
- [ ] Expand `EntityType` enum to include all entity types
  - Need to add: sphere, galaxy, solarSystem, planet, continent, nation, region, settlement, building, dungeon, entrance, room, trap, treasure, quest, villain, ritual, spell, magicSystem, etc.
- [ ] Update entity type interfaces to match new types
- [ ] Ensure entity creators return correct types

### 📋 Phase 3: Entity Viewer Enhancements (PENDING)
- [ ] Add nested entity sections to EntityViewer
  - Show child entities grouped by relationship type
  - Display as clickable cards/buttons
  - Show count badge (e.g., "Adventures (3)")
- [ ] Add "+" buttons for manual entity creation
  - One button per relationship type
  - Opens creator modal pre-configured with parent relationship
  - Automatically links to parent entity
- [ ] Add "Generate Multiple" button
  - Rolls for random count based on relationship config
  - Creates multiple entities at once
- [ ] Add favorite toggle button to entity header
  - Star icon that toggles favorite status
  - Syncs with entity store

### 🔗 Phase 4: Creator Integration (PENDING)
- [ ] Update all Creator classes to use `entityRelationships`
  - Check for auto-generating relationships in config
  - Generate child entities automatically on parent creation
  - Set proper `parentId` on child entities
- [ ] Add manual entity creation with parent context
  - EntityGeneratorModal accepts `parentId` and `parentType` props
  - Automatically sets parent relationship
  - Shows parent entity name in modal header

### 📑 Phase 5: Tab System (PENDING)
- [ ] Create TabManager component/store
  - Track open tabs with entity IDs
  - Support multiple tabs
  - Tab switching
  - Tab closing
- [ ] Integrate tabs into main layout
  - Tab bar at top
  - Active tab highlighting
  - Close buttons on tabs
- [ ] Make entity cards/buttons open in tabs
  - Click handler opens new tab or switches to existing tab
  - Updates recently used on tab open

### 🎨 Phase 6: Layout Integration (PENDING)
- [ ] Update main layout to include EntityNavigator
  - Add left sidebar (250px width, collapsible)
  - Adjust main content area width
  - Ensure responsive behavior
- [ ] Add navigator toggle button
  - Hamburger menu or similar
  - Persists open/closed state
- [ ] Style consistency
  - Match existing color scheme
  - Consistent spacing and typography

### 🧪 Phase 7: Testing & Refinement (PENDING)
- [ ] Test full workflow
  - Create Campaign → auto-generates Adventures + World
  - Click World → opens in tab → shows Galaxies section
  - Click "+" on Galaxies → creates one Galaxy
  - Click "Generate Multiple" → creates multiple Galaxies
  - Click Galaxy name → opens Galaxy in new tab
- [ ] Test navigation
  - Categories expand/collapse correctly
  - Entity counts update in real-time
  - Recently used updates on entity open
  - Favorites toggle works
- [ ] Test edge cases
  - Empty entity lists
  - Very long entity names
  - Many open tabs
  - Parent entity deletion (should cascade to children)

## File Changes Required

### New Files
- ✅ `src/lib/config/entityRelationships.ts`
- ✅ `src/lib/components/entities/EntityNavigator.svelte`
- 📋 `src/lib/stores/tabStore.ts`
- 📋 `src/lib/components/TabBar.svelte` (or extend existing)

### Modified Files
- ✅ `src/lib/stores/entityStore.ts`
- 📋 `src/lib/types/entity.ts` - expand EntityType enum
- 📋 `src/lib/components/entities/EntityViewer.svelte` - add nested entity display
- 📋 `src/lib/components/entities/EntityGeneratorModal.svelte` - add parent context
- 📋 All Creator classes in `src/lib/entities/*/` - integrate auto-generation
- 📋 `src/routes/+layout.svelte` - integrate navigator and tabs
- 📋 Main page routes that display entities

## Entity Type Relationships

### Campaign Structure
```
Campaign
├── Adventure[] (1-3, auto-gen)
│   ├── Quest[] (1-5)
│   ├── Character[] (2-8 NPCs)
│   └── Villain[] (1-3)
└── Sphere (1, auto-gen)
    └── Galaxy[] (1-6)
        └── SolarSystem[] (2-12)
            ├── Planet[] (1-8)
            │   └── Continent[] (1-7)
            │       ├── Nation[] (1-10)
            │       └── Region[] (3-15)
            └── Star[] (1-3)
```

### Location Hierarchy
```
Continent
├── Nation[] (1-10)
│   ├── Settlement[] (1-20)
│   └── Region[] (1-12)
└── Region[] (3-15)
    ├── Settlement[] (1-5)
    └── Dungeon[] (0-3)
```

### Dungeon Structure (Already Implemented)
```
Dungeon
├── Entrance[] (1-3, auto-gen)
│   └── Trap[] (0-2, auto-gen)
├── Room[] (3-12, auto-gen)
└── Monster[] (2-4, auto-gen)
```

## Technical Notes

### Entity Linking Strategy
- Parent entities store references to child entity IDs in arrays
- Child entities have `parentId` field pointing to parent
- Deletion cascades: deleting parent deletes all children
- Entity store provides `getChildEntities(parentId)` method

### Auto-Generation Behavior
- Only happens on initial entity creation
- Respects `autoGenerate` flag in relationship config
- Uses random count within min/max range
- Can be disabled per-relationship in config

### Manual Generation Options
1. **"+" button**: Creates exactly 1 entity
2. **"Generate Multiple" button**: Rolls for random count
3. **Manual creation**: User creates entity and manually links

### Navigation State Persistence
- Expanded categories saved to localStorage
- Recently used list saved to localStorage
- Favorites saved to localStorage
- Tab state persists across sessions

## Next Steps (Priority Order)

1. ✅ Create relationship configuration
2. ✅ Enhance entity store
3. ✅ Build EntityNavigator component
4. 🔧 **CURRENT: Expand EntityType enum**
5. Update EntityViewer with nested entity display
6. Add "+" buttons and generation logic
7. Implement tab system
8. Integrate into main layout
9. Update all Creator classes
10. Testing and refinement

## Known Issues & Considerations

- **Performance**: Loading many entities may be slow
  - Solution: Implement virtual scrolling in navigator
  - Solution: Lazy load entity details

- **Type Safety**: EntityType enum must match creator registry
  - Solution: Generate types from registry automatically
  - Solution: Add runtime validation

- **State Management**: Complex state with nested entities
  - Solution: Use Svelte stores reactively
  - Solution: Consider Immer for immutable updates

- **Backward Compatibility**: Existing entities may not have relationships
  - Solution: Add migration script
  - Solution: Handle missing relationships gracefully

## Future Enhancements

- Drag & drop entities to change parent
- Bulk operations (delete multiple, move multiple)
- Entity templates
- Import/export entity trees
- Search within nested entities
- Entity relationship graph visualization
- Undo/redo support
- Collaborative editing (real-time sync)
