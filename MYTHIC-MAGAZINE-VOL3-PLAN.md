# Mythic Magazine Volume 3 Implementation Plan

## Overview

Mythic Magazine Volume 3 introduces two major feature sets:
1. **Published Adventures Mode** - System for using Mythic with pre-written adventures
2. **Random Dungeon Crawl Generation** - Specialized Location Crafter for dungeons

This plan builds on the existing Location Crafter implementation and adds support for both published adventure play and procedural dungeon generation.

---

## Current State Analysis

### Already Implemented ✅
- Location Crafter system (Wilderness/City/Structure regions)
- Area generation with progress points
- Known Elements system
- Region/Area data structures
- **Peril Points** (already exists as optional feature)
- Scene management system
- Random Event generation
- Thread/Character lists

### Gaps Identified
- No Published Adventure mode
- No dungeon-specific region types
- No Adventure Features list
- No dungeon-specific descriptor tables
- No connector mechanics

---

## Phase 1: Published Adventures Mode (Core Infrastructure)

**Duration**: 6 hours
**Priority**: High
**Dependencies**: None

### 1.1 Data Model Updates (1 hour)

**File**: `src/lib/stores/soloRpgStore.svelte.ts`

Add to `SoloRpgSession` interface:
```typescript
// Published Adventure Mode
publishedAdventureMode: boolean;
adventureFeatures: AdventureFeature[];
```

New interface:
```typescript
export interface AdventureFeature {
  id: string;
  description: string;
  position: number; // 1-25
  active: boolean;
  createdInScene: number;
}
```

Store methods to add:
```typescript
// Adventure Features Management
addAdventureFeature(description: string, position?: number): AdventureFeature
removeAdventureFeature(id: string): void
updateAdventureFeature(id: string, updates: Partial<AdventureFeature>): void
toggleAdventureFeatureActive(id: string): void
duplicateAdventureFeature(id: string): void // For list weighting
```

### 1.2 Published Adventure Focus Table (1 hour)

**File**: `src/lib/tables/mythicTables/publishedAdventureFocusTable.ts`

Create new table with 6 focus types:
- Adventure Feature (1-12)
- NPC Action (13-48)
- PC Negative (49-66)
- PC Positive (67-78)
- NPC Negative (79-88)
- NPC Positive (89-100)

**File**: `src/lib/utils/eventFocus.ts`

Add `publishedAdventureFocusTypes` array and helper functions.

### 1.3 Scaling Calculator Utility (1.5 hours)

**File**: `src/lib/utils/scalingCalculator.ts`

Create utility for scaling encounters:
```typescript
export interface ScalingConfig {
  partySize: number;       // Target party size (e.g., 4-6)
  partyLevel: number;      // Target level range (e.g., 3-5)
  soloCharLevel: number;   // Solo character's level
  scalingFactor: number;   // Calculated multiple (2, 3, 4, etc.)
}

export function calculateScalingFactor(config: Partial<ScalingConfig>): number
export function scaleValue(value: number, factor: number): number
export function suggestCharacterLevel(partySize: number, partyLevel: number): number
```

### 1.4 Adventure Features List Component (1.5 hours)

**File**: `src/lib/components/solorpg/AdventureFeaturesPanel.svelte`

Similar to ListsPanel but for Adventure Features:
- Display list of up to 25 adventure features
- Add/remove/edit features
- Toggle active status
- Duplicate for list weighting
- Collapsible section in main UI

### 1.5 Published Adventure Settings (1 hour)

**File**: `src/lib/components/solorpg/SessionManager.svelte`

Add to session creation/settings:
- Checkbox: "Published Adventure Mode"
- If enabled, show:
  - Adventure title field
  - Scaling calculator inputs
  - Peril Points initial value (suggested: 2-4)

---

## Phase 2: Published Adventures UI Integration (3 hours)

**Duration**: 3 hours
**Priority**: High
**Dependencies**: Phase 1

### 2.1 Modified Scene Handling (1 hour)

**File**: `src/lib/components/solorpg/SceneManager.svelte`

When `publishedAdventureMode === true`:
- Scene testing less frequent (document in help)
- On roll ≤ CF: Generate Random Event instead of Altered/Interrupt
- Show banner indicating Published Adventure Mode active
- Adjusted workflow messaging

### 2.2 Random Event Integration (1 hour)

**File**: `src/lib/components/solorpg/RandomEventGenerator.svelte`

Add mode detection:
```typescript
let isPublishedAdventure = $derived(
  soloRpgStore.currentSession?.publishedAdventureMode || false
);
```

When in Published Adventure mode:
- Use Published Adventure Focus Table
- Show Adventure Features list for rolling
- Adjusted UI messaging

### 2.3 Main UI Updates (1 hour)

**File**: `src/routes/solo-rpg/+page.svelte`

- Show Adventure Features Panel in Play tab (when mode active)
- Add visual indicator for Published Adventure Mode
- Add Peril Points to Session Stats card
- Add "Scaling Helper" modal button

**New File**: `src/lib/components/solorpg/ScalingHelper.svelte`

Modal for quick reference:
- Input fields for party size/level
- Calculate scaling factor
- Show adjusted values (HP, damage, quantities)
- Quick reference for applying scale

---

## Phase 3: Dungeon Crawl System - Data Layer (4 hours)

**Duration**: 4 hours
**Priority**: High
**Dependencies**: None (can run parallel to Phase 1-2)

### 3.1 Dungeon Region Types (30 minutes)

**File**: `src/lib/utils/locationCrafterTables.ts`

Update `RegionType`:
```typescript
export type RegionType =
  | 'Wilderness'
  | 'City'
  | 'Structure'
  | 'Cavern Dungeon'
  | 'Ancient Dungeon'
  | 'Palatial Dungeon';
```

### 3.2 Dungeon Story Descriptors Table (1 hour)

**File**: `src/lib/tables/mythicTables/dungeonStoryDescriptorsTable.ts`

Implement 3-column table (d100):
- Cavern Dungeon column (20 entries)
- Ancient Dungeon column (20 entries)
- Palatial Dungeon column (20 entries)

Each entry is a story hook like:
- "Home to something powerful and evil"
- "Originally built for evil purposes"
- "The source of monsters plaguing nearby towns"

Include cross-references (e.g., 81-85: "Roll on Ancient column")

### 3.3 Dungeon Region Descriptors Tables (1.5 hours)

**File**: `src/lib/tables/mythicTables/dungeonRegionDescriptorsTable.ts`

Implement 3-column table (d100):
- Cavern descriptors: "Wet or moist", "Stalactites and stalagmites", "Cold"
- Ancient descriptors: "Cobwebs", "Crumbling, in ruins", "Within ancient ruins"
- Palatial descriptors: "Grand and imposing", "In good shape", "A once regal and opulent place"

70 unique entries across 3 columns with cross-references.

### 3.4 Dungeon Connectors Table (1 hour)

**File**: `src/lib/tables/mythicTables/dungeonConnectorsTable.ts`

Implement 3-column table (d100):
- Cavern connectors: "Simple cavern tunnel", "Natural downward slope", "Shaft going down"
- Ancient connectors: "Simple hallway", "Stairs going down", "Rickety bridge"
- Palatial connectors: "Grand, wide hallway", "Balcony or gallery", "Bridge"

Special results:
- 21-30: Leads directly to another Area
- 31-40: Expected
- 41-65: Same (as last connector)
- 66-75: Same, with intersection
- 76-80: Same, with a curve or turn
- 81-90: Same, with a side Area
- 91-100: Roll on Descriptions Meaning Tables

---

## Phase 4: Dungeon Crawl System - UI Layer (5 hours)

**Duration**: 5 hours
**Priority**: High
**Dependencies**: Phase 3

### 4.1 Region Generator Updates (1.5 hours)

**File**: `src/lib/components/solorpg/RegionGenerator.svelte`

Add dungeon type selection:
- Update Step 1: Region type selection now includes 6 types
- Add Step 1.5 (for dungeons only): Roll Story Descriptors
  - Roll 2x on Dungeon Story Descriptors Table
  - Show word pair with interpretation textarea
  - Optional step with skip button
- Update Step 2: Roll Region Descriptors
  - Use dungeon-specific table if dungeon type selected
  - Show appropriate column based on type
- Step 3: Known Elements (unchanged)

Visual indicators:
- Icon changes based on type (🏰 dungeon, 🌲 wilderness, etc.)
- Color coding for dungeon types

### 4.2 Area Generator - Connector Support (2 hours)

**File**: `src/lib/components/solorpg/AreaGenerator.svelte`

Add connector mechanics:
- After generating area, show "Move to Next Area" section
- Button: "Roll for Connector"
- Display connector result with interpretation
- Special handling for:
  - "Same" - tracks last connector
  - "Expected" - suggests most logical
  - "Side Area" - creates branch in navigation
  - Meaning Tables roll - shows word pair

Data structure update needed in `Area`:
```typescript
export interface Area {
  // ... existing fields
  connectorFromPrevious?: string;  // Connector that led here
  connectorDescription?: string;   // User interpretation
}
```

### 4.3 Secret Door Mechanics (1 hour)

**File**: `src/lib/components/solorpg/AreaGenerator.svelte`

Add "Search for Secret Door" section (for dungeons only):
- Button: "Search for Secret Door"
- Prompts Fate Question: "Is a secret door found?"
- If yes:
  - Mark next area as "Secret Area"
  - Apply +1 modifier to next area rolls (Location, Encounter, Object)
  - Visual indicator in area history

Store method:
```typescript
markAreaAsSecret(regionId: string, areaId: string): void
```

### 4.4 Dungeon-Specific UI Enhancements (30 minutes)

**File**: `src/lib/components/solorpg/AreaGenerator.svelte`

Visual differentiation for dungeons:
- Different header icon based on dungeon type (⛰️🏚️🏰)
- Show story descriptors at top when dungeon type
- Connector section only appears for dungeons
- "Secret Door" section only for Ancient/Palatial dungeons

**File**: `src/lib/components/solorpg/AreaHistoryTimeline.svelte`

Add connector info to timeline:
- Show connector between areas
- Visual arrow/line connecting areas
- Connector description on hover

---

## Phase 5: Help & Documentation (2 hours)

**Duration**: 2 hours
**Priority**: Medium
**Dependencies**: Phase 2, 4

### 5.1 Published Adventures Help (1 hour)

**File**: `src/lib/components/solorpg/PublishedAdventureHelp.svelte`

Modal explaining:
- Philosophy (Mythic as co-GM)
- How to use scaling
- When to use Peril Points
- Scene handling differences
- Reading strategy
- Adventure Features examples

### 5.2 Dungeon Crawl Help (1 hour)

**File**: `src/lib/components/solorpg/DungeonCrawlHelp.svelte`

Modal explaining:
- Three dungeon types
- Story vs Region descriptors
- How connectors work
- Secret door mechanics
- Mapping tips

Update `LocationCrafterHelp.svelte` with link to dungeon-specific help.

---

## Phase 6: Polish & Testing (3 hours)

**Duration**: 3 hours
**Priority**: Medium
**Dependencies**: All previous phases

### 6.1 Integration Testing (1.5 hours)

Test workflows:
1. Create published adventure session → Add features → Generate events → Use scaling
2. Create dungeon region → Roll story → Generate areas → Use connectors
3. Search for secret doors → Apply modifiers → Complete dungeon
4. Mixed mode: Dungeon in published adventure mode

### 6.2 UI Polish (1 hour)

- Consistent styling across new components
- Proper responsive layout
- Loading states for table rolls
- Error handling for edge cases
- Empty states for new lists

### 6.3 Documentation Updates (30 minutes)

Update README/docs with:
- Published Adventure Mode overview
- Dungeon Crawl features
- New tables list
- Example workflows

---

## Implementation Order & Timeline

### Sprint 1: Published Adventures (9 hours)
- Day 1-2: Phase 1 (Data Model) + Phase 2 (UI)
- Deliverable: Working Published Adventure Mode with scaling

### Sprint 2: Dungeon Crawls (9 hours)
- Day 3-4: Phase 3 (Tables) + Phase 4 (UI)
- Deliverable: Complete Dungeon Crawl system

### Sprint 3: Polish (5 hours)
- Day 5: Phase 5 (Help) + Phase 6 (Testing)
- Deliverable: Polished, tested, documented features

**Total Estimated Time**: 23 hours over 5 days

---

## Technical Considerations

### Backward Compatibility
- `publishedAdventureMode` defaults to `false`
- `adventureFeatures` defaults to `[]`
- Existing regions continue to work (type checking in UI)
- Peril Points already optional

### Data Migration
- No migration needed (new optional fields)
- Existing sessions unaffected

### Performance
- New tables add ~300 entries total
- Minimal impact (tables loaded on demand)
- Connector tracking adds 2 fields per area (negligible)

### Testing Strategy
1. Unit tests for table lookups
2. Integration tests for Published Adventure workflow
3. Integration tests for Dungeon generation workflow
4. E2E test: Create dungeon → Explore → Complete

---

## File Changes Summary

### New Files (10)
1. `src/lib/tables/mythicTables/publishedAdventureFocusTable.ts`
2. `src/lib/tables/mythicTables/dungeonStoryDescriptorsTable.ts`
3. `src/lib/tables/mythicTables/dungeonRegionDescriptorsTable.ts`
4. `src/lib/tables/mythicTables/dungeonConnectorsTable.ts`
5. `src/lib/utils/scalingCalculator.ts`
6. `src/lib/components/solorpg/AdventureFeaturesPanel.svelte`
7. `src/lib/components/solorpg/ScalingHelper.svelte`
8. `src/lib/components/solorpg/PublishedAdventureHelp.svelte`
9. `src/lib/components/solorpg/DungeonCrawlHelp.svelte`
10. `tests/dungeonCrawl.test.ts`

### Modified Files (8)
1. `src/lib/stores/soloRpgStore.svelte.ts` - Add adventure features, published mode
2. `src/lib/utils/locationCrafterTables.ts` - Add dungeon region types
3. `src/lib/utils/eventFocus.ts` - Add published adventure focus
4. `src/lib/components/solorpg/RegionGenerator.svelte` - Add dungeon support
5. `src/lib/components/solorpg/AreaGenerator.svelte` - Add connectors, secret doors
6. `src/lib/components/solorpg/AreaHistoryTimeline.svelte` - Show connectors
7. `src/lib/components/solorpg/SceneManager.svelte` - Published adventure mode logic
8. `src/lib/components/solorpg/RandomEventGenerator.svelte` - Published adventure focus
9. `src/routes/solo-rpg/+page.svelte` - Add new panels/modals

---

## Risk Assessment

### Low Risk
- Table additions (straightforward data)
- UI component additions (isolated)
- Help documentation

### Medium Risk
- Published Adventure mode scene logic (behavioral change)
- Connector system integration (new navigation concept)
- Secret door modifiers (affects rolls)

### Mitigation
- Feature flags for testing
- Thorough integration tests
- Beta testing with dungeon workflow
- Clear error messages

---

## Success Criteria

### Phase 1-2 Complete When:
- ✅ Can create Published Adventure session
- ✅ Adventure Features list functional
- ✅ Scaling calculator works
- ✅ Published Adventure Focus Table used in events
- ✅ Peril Points integrated into UI

### Phase 3-4 Complete When:
- ✅ Three dungeon types available in region creation
- ✅ Story descriptors generate for dungeons
- ✅ Dungeon-specific region descriptors work
- ✅ Connectors generate and display
- ✅ Secret doors can be found and affect rolls
- ✅ Can complete full dungeon exploration

### Phase 5-6 Complete When:
- ✅ Help documentation clear and accessible
- ✅ All workflows tested end-to-end
- ✅ UI polished and consistent
- ✅ No regressions in existing features

---

## Future Enhancements (Out of Scope)

These are nice-to-haves for future iterations:
- Visual dungeon mapping (auto-generate map from areas)
- Wandering monsters table (referenced in Vol 3)
- Published adventure import (from PDF/text)
- Connector graph visualization
- Dungeon difficulty calculator
- Pre-gen dungeon templates

---

## Notes

### Design Decisions

1. **Published Adventure Mode as Toggle**: Rather than separate session type, it's a mode flag. This allows using Location Crafter or other features while in published adventure mode.

2. **Connectors as Descriptive**: Connectors are tracked but not enforced. Players can interpret how areas connect. This maintains flexibility while adding structure.

3. **Secret Doors as Modifier**: Secret doors add +1 to next area rolls rather than being a separate area type. This keeps the system simple while providing mechanical benefit.

4. **Peril Points Reuse**: Rather than implement a new version, use the existing Peril Points system from Mythic Variations (already in store). This reduces code duplication.

5. **Story Descriptors as Optional**: For dungeons, story descriptors are optional (Step 1.5). Some players may already know the dungeon's story, others want to generate it.

### Integration with Existing Systems

- **Location Crafter**: Dungeons are a specialized region type within Location Crafter. All existing area generation mechanics work.
- **Random Events**: Published Adventure mode uses a different focus table but same event generation flow.
- **Scene Management**: Published Adventure mode affects scene testing frequency and outcome handling, but uses same underlying Scene data structure.

---

## Appendix: Table Sizes

### New Tables
- Published Adventure Focus: 6 entries (d100 distribution)
- Dungeon Story Descriptors: 60 entries (20 per column × 3)
- Dungeon Region Descriptors: 70 entries (varied per column × 3)
- Dungeon Connectors: 75 entries (25 per column × 3)

**Total New Table Entries**: ~210 entries

### Total Mythic Tables After Vol 3
- Volume 1 (Core): 40 tables
- Volume 2 (Location Crafter): 4 tables
- Volume 3 (Published Adventures + Dungeons): 4 tables
- **Total**: 48 Mythic tables implemented
