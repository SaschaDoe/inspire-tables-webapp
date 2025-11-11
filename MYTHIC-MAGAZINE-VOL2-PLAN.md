# Mythic Magazine Volume 2 Implementation Plan

## 📖 Source Material Analysis

**Source**: Mythic Magazine Volume 2 (January 2021)
**Contents**: Two major feature sets from official Mythic GME expansions

---

## 🎯 Feature Overview

### Feature Set A: Altered Scenes Enhancement
**Pages 3-7 of Magazine**

The magazine provides multiple approaches to handle Altered Scenes more creatively:

1. **Meaning Tables Inspiration** ✅ (Already have tables)
   - Roll on Description or Action Meaning Tables
   - Apply word pair to inspire scene alteration

2. **Scene Adjustment Table** ✅ (Already implemented)
   - Current implementation: d10 table with 7 results
   - Remove/Add: Character, Activity, Object
   - Special: "Make 2 Adjustments" (roll twice more)

3. **A Tweak** (Conceptual guidance)
   - Framework for thinking about minimal scene changes
   - Documentation/help text improvement

4. **Random Event Graft** 🆕 (NEW FEATURE)
   - Generate Random Event AND keep Expected Scene
   - Combine both into Altered Scene

5. **Alternate Scenes** 🆕 (NEW FEATURE - Complex)
   - Pre-made list of scenes you want to potentially occur
   - Roll on list for Altered Scene instead of adjusting
   - Can have triggers/conditions
   - Remove after use or keep for recurrence

### Feature Set B: Randomized Location Crafter
**Pages 8-24 of Magazine**

Complete procedural location generation system (extension to Location Crafter):

**Core Components**:

1. **Region Descriptors Table** 🆕
   - d100, roll twice
   - 3 columns: Wilderness / City / Structure
   - Gives first impression of region

2. **Area Elements Table** 🆕
   - d10 + Progress Points
   - 3 columns: Locations (Large) / Locations (Small) / Encounters & Objects
   - Elements: None, Expected, Random, Known, Special, Complete, Expected PP-6

3. **Random Element Descriptors Table** 🆕
   - d100, roll twice
   - 3 columns: Locations / Encounters / Objects
   - 100 descriptive words each

4. **Special Elements Table** 🆕
   - d100 subtable
   - 10 special results (Supersize, This Is Bad, Exit Here, etc.)

5. **Known Elements Tracking** 🆕
   - Track specific elements known to exist in region
   - Can roll to encounter them again

6. **Progress Points System** 🆕
   - Tracks depth of exploration
   - Eventually leads to "Complete" (region fully explored)

---

## 🎨 Design Philosophy

### Consistent with Existing Plan

Continue progressive disclosure approach:
- **Simple features**: Available immediately, minimal UI
- **Complex features**: Behind "Advanced" toggle or separate panel
- **Contextual help**: Tooltips and "ℹ️" icons
- **Optional usage**: Nothing forces user to use new features

### Integration Points

1. **Altered Scene Handling** → Already in Scene Manager
2. **Location Generation** → NEW dedicated panel/workspace section
3. **Meaning Tables** → Already implemented, just surface better

---

## 📦 Implementation Roadmap

---

## PHASE 1: Enhanced Altered Scene Handling (5 hours)

### 1A: Improved Altered Scene Guidance (2h)

**What**: Better help text and workflow for Altered Scenes

**Location**: `SceneManager.svelte`

**Changes**:
```svelte
<!-- After "Altered" result -->
<div class="altered-scene-guide">
  <h4>How to Alter This Scene</h4>
  <p>Choose one approach:</p>

  <div class="approach-options">
    <button onclick={() => showSceneAdjustment = true}>
      🎲 Scene Adjustment Table
      <small>Randomly determine what to adjust</small>
    </button>

    <button onclick={() => showMeaningInspiration = true}>
      💡 Meaning Tables Inspiration
      <small>Roll for word pair to inspire change</small>
    </button>

    <button onclick={() => showRandomEventGraft = true}>
      ⚡ Random Event Graft
      <small>Add a Random Event to Expected Scene</small>
    </button>

    <button onclick={() => showManualTweak = true}>
      ✍️ Manual Tweak
      <small>Adjust one element yourself</small>
    </button>
  </div>
</div>
```

**State additions**:
- Track which approach used (for history)
- Show appropriate tool based on choice

**Effort**: 2 hours

---

### 1B: Random Event Graft Feature (3h)

**What**: Option to generate Random Event that grafts INTO Expected Scene

**Location**: New component `RandomEventGraftModal.svelte`

**Flow**:
1. User gets "Altered Scene" result
2. Chooses "Random Event Graft" approach
3. Modal opens: "Generate Random Event to add to scene"
4. Uses existing Random Event generator
5. Shows both Expected Scene + Random Event together
6. User interprets how they combine
7. Creates Altered Scene with both elements

**State additions to Scene**:
```typescript
export interface Scene {
  // ... existing fields
  alteredSceneApproach?: 'adjustment' | 'meaning' | 'graft' | 'manual' | 'alternate';
  graftedEvent?: RandomEvent; // If using graft approach
}
```

**Component structure**:
```svelte
<script>
  let { expectedSceneDescription, onComplete } = $props();

  let randomEventGenerated = $state(false);
  let eventDetails = $state<RandomEvent | null>(null);

  async function generateEvent() {
    // Use existing Random Event generation logic
    eventDetails = await generateRandomEvent();
    randomEventGenerated = true;
  }
</script>

<Modal title="🔀 Random Event Graft">
  <div class="graft-explanation">
    <p>A Random Event will be generated and combined with your
       Expected Scene to create an Altered Scene.</p>
  </div>

  <div class="expected-scene">
    <h4>Expected Scene:</h4>
    <p>{expectedSceneDescription}</p>
  </div>

  {#if !randomEventGenerated}
    <button onclick={generateEvent}>Generate Random Event</button>
  {:else}
    <div class="random-event">
      <h4>Random Event:</h4>
      <EventDisplay event={eventDetails} />
    </div>

    <div class="combination-notes">
      <label>How do these combine?</label>
      <textarea bind:value={combinationNotes} />
    </div>

    <button onclick={onComplete}>Create Altered Scene</button>
  {/if}
</Modal>
```

**Effort**: 3 hours

---

## PHASE 2: Alternate Scenes System (8 hours)

### 2A: Alternate Scenes Data Model (1h)

**What**: Add Alternate Scenes to session state

**Location**: `soloRpgStore.svelte.ts`

**Types**:
```typescript
export interface AlternateScene {
  id: string;
  title: string;
  description: string;
  triggerType: 'manual' | 'thread' | 'chaos' | 'scene-count' | 'auto';
  triggerCondition?: {
    threadId?: string; // Specific thread active
    chaosMin?: number; // CF >= X
    chaosMax?: number; // CF <= X
    sceneMin?: number; // Scene # >= X
  };
  recurring: boolean; // Can trigger multiple times?
  used: boolean;
  usedInScene?: number;
  createdInScene: number;
  position: number; // For rolling
}

// Add to SoloRpgSession interface
export interface SoloRpgSession {
  // ... existing
  alternateScenes: AlternateScene[];
}
```

**Store methods**:
```typescript
addAlternateScene(title: string, description: string, ...): AlternateScene
removeAlternateScene(id: string): void
updateAlternateScene(id: string, updates: Partial<AlternateScene>): void
markAlternateSceneUsed(id: string): void
checkAlternateScenesTriggered(): AlternateScene[] // Check if any should trigger now
rollOnAlternateScenes(): AlternateScene | null // Random roll on unused scenes
```

**Effort**: 1 hour

---

### 2B: Alternate Scenes Manager UI (4h)

**What**: Panel to manage Alternate Scenes list

**Location**: New component `AlternateScenesPanel.svelte`

**UI Structure**:
```svelte
<div class="alternate-scenes-panel">
  <header>
    <h3>🔑 Alternate Scenes</h3>
    <p class="description">
      Pre-planned scenes you want to potentially occur during your adventure.
    </p>
    <button onclick={() => showAddForm = true}>+ Add Scene</button>
  </header>

  <!-- List of alternate scenes -->
  <div class="scenes-list">
    {#each alternateScenes as scene}
      <div class="alternate-scene-card {scene.used ? 'used' : ''}">
        <div class="scene-header">
          <h4>{scene.title}</h4>
          <span class="badge">{scene.recurring ? 'Recurring' : 'One-time'}</span>
          {#if scene.used}
            <span class="badge used">Used in Scene {scene.usedInScene}</span>
          {/if}
        </div>

        <p class="description">{scene.description}</p>

        <div class="trigger-info">
          <strong>Trigger:</strong>
          {#if scene.triggerType === 'manual'}
            Manual only
          {:else if scene.triggerType === 'thread'}
            When thread "{getThreadName(scene.triggerCondition.threadId)}" active
          {:else if scene.triggerType === 'chaos'}
            CF {scene.triggerCondition.chaosMin}-{scene.triggerCondition.chaosMax}
          {/if}
        </div>

        <div class="actions">
          <button onclick={() => playScene(scene)}>▶ Play Now</button>
          <button onclick={() => editScene(scene)}>✏️ Edit</button>
          <button onclick={() => deleteScene(scene)}>🗑️ Delete</button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Add/Edit Form Modal -->
  {#if showAddForm}
    <AlternateSceneFormModal onClose={...} onSave={...} />
  {/if}
</div>
```

**Form fields**:
- Title (text)
- Description (textarea)
- Trigger type (select: Manual, Thread-based, Chaos-based, Scene count, Always check)
- Trigger conditions (conditional fields based on type)
- Recurring? (checkbox)

**Effort**: 4 hours

---

### 2C: Alternate Scene Integration with Scene Manager (3h)

**What**: Check for triggered alternate scenes before scene setup

**Location**: `SceneManager.svelte`

**Flow**:
1. User clicks "New Scene"
2. Before showing Expected Scene form, check: `checkAlternateScenesTriggered()`
3. If matches found, show prompt:

```svelte
{#if triggeredScenes.length > 0}
  <div class="alternate-scene-prompt">
    <h4>⚡ Alternate Scenes Available</h4>
    <p>The following pre-planned scenes are ready to trigger:</p>

    {#each triggeredScenes as scene}
      <div class="triggered-scene">
        <h5>{scene.title}</h5>
        <p>{scene.description}</p>
        <button onclick={() => useAlternateScene(scene)}>
          Use This Scene
        </button>
      </div>
    {/each}

    <button onclick={() => skipAlternateScenes()}>
      Skip - Use Normal Scene Setup
    </button>
  </div>
{/if}
```

4. For "Altered Scene" results, add option to roll on Alternate Scenes:

```svelte
{#if sceneTestResult === 'Altered'}
  <!-- Existing approach buttons -->

  {#if hasUnusedAlternateScenes}
    <button onclick={() => rollAlternateScene()}>
      🎲 Roll on Alternate Scenes
      <small>Replace with pre-planned scene</small>
    </button>
  {/if}
{/if}
```

**Effort**: 3 hours

---

## PHASE 3: Randomized Location Crafter Tables (10 hours)

### 3A: Create Table Definitions (6h)

**What**: TypeScript classes for all Location Crafter tables

**Files to create**:

#### File 1: `src/lib/tables/mythicTables/regionDescriptorsTable.ts`

```typescript
import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';
import { DiceRole } from '../diceRole';

/**
 * Region Descriptors Table from Mythic Magazine Vol 2
 * Roll twice for region characteristics
 */
export class RegionDescriptorsWildernessTable extends Table {
  constructor() {
    const entries = [
      new TableEntry('Dry and arid').withRoleInterval(1, 5),
      new TableEntry('Wet').withRoleInterval(6, 10),
      new TableEntry('Dense vegetation').withRoleInterval(11, 15),
      new TableEntry('Rocky').withRoleInterval(16, 20),
      new TableEntry('Lots of open space').withRoleInterval(21, 25),
      // ... all 20 entries from magazine
    ];

    super(entries, TableTitles.RegionDescriptorsWilderness, TableType.LocationCrafter, new DiceRole(1, 100));
  }
}

export class RegionDescriptorsCityTable extends Table {
  // Similar structure, City column
}

export class RegionDescriptorsStructureTable extends Table {
  // Similar structure, Structure column
}
```

**Effort**: 2 hours (3 tables × 20 entries each)

---

#### File 2: `src/lib/tables/mythicTables/areaElementsTable.ts`

```typescript
/**
 * Area Elements Table from Mythic Magazine Vol 2
 * Determines elements for each area during exploration
 * Uses d10 + Progress Points
 */
export class AreaElementsLocationsLargeTable extends Table {
  constructor() {
    const entries = [
      new TableEntry('Expected').withRoleInterval(1, 5),
      new TableEntry('Expected').withRoleInterval(6, 8),
      new TableEntry('Random').withRoleInterval(9, 10),
      new TableEntry('Known, or Random').withRoleInterval(11, 11),
      new TableEntry('Known, or Expected').withRoleInterval(12, 12),
      new TableEntry('Special').withRoleInterval(13, 13),
      new TableEntry('Complete').withRoleInterval(14, 14),
      new TableEntry('Complete').withRoleInterval(15, 15),
      new TableEntry('Expected, PP-6').withRoleInterval(16, 100), // Handle overflow
    ];

    super(entries, TableTitles.AreaElementsLocationsLarge, TableType.LocationCrafter, new DiceRole(1, 10));
  }
}

// LocationsSmall, EncountersObjects variants
```

**Effort**: 1 hour (3 table variants)

---

#### File 3: `src/lib/tables/mythicTables/randomElementDescriptorsTable.ts`

```typescript
/**
 * Random Element Descriptors Table from Mythic Magazine Vol 2
 * Used when "Random" element rolled
 * Roll twice for descriptor pair
 */
export class RandomElementDescriptorsLocationsTable extends Table {
  constructor() {
    const entries = [
      new TableEntry('Abandoned').withRoleInterval(1, 1),
      new TableEntry('Amusing').withRoleInterval(2, 2),
      new TableEntry('Ancient').withRoleInterval(3, 3),
      // ... 100 entries from Locations column
    ];

    super(entries, TableTitles.RandomElementDescriptorsLocations, TableType.LocationCrafter, new DiceRole(1, 100));
  }
}

// Encounters and Objects variants (100 entries each)
```

**Effort**: 2 hours (3 tables × 100 entries each) - **This is tedious but straightforward**

---

#### File 4: `src/lib/tables/mythicTables/specialElementsTable.ts`

```typescript
/**
 * Special Elements Table from Mythic Magazine Vol 2
 * Sub-table when "Special" rolled on Area Elements
 */
export class SpecialElementsTable extends Table {
  constructor() {
    const entries = [
      new TableEntry('SUPERSIZE: Roll again and enhance element').withRoleInterval(1, 10),
      new TableEntry('BARELY THERE: Roll again and minimize element').withRoleInterval(11, 20),
      new TableEntry('THIS IS BAD: Roll again, bad for PCs').withRoleInterval(21, 30),
      new TableEntry('THIS IS GOOD: Roll again, good for PCs').withRoleInterval(31, 40),
      new TableEntry('MULTI-ELEMENT: Roll twice, combine both').withRoleInterval(41, 50),
      new TableEntry('EXIT HERE: Area contains exit from region').withRoleInterval(51, 65),
      new TableEntry('RETURN: Access to previous area').withRoleInterval(66, 80),
      new TableEntry('GOING DEEPER: Add 3 Progress Points').withRoleInterval(81, 90),
      new TableEntry('COMMON GROUND: Eliminate 3 Progress Points').withRoleInterval(91, 100),
    ];

    super(entries, TableTitles.SpecialElements, TableType.LocationCrafter, new DiceRole(1, 100));
  }
}
```

**Effort**: 0.5 hours

---

#### File 5: Update `src/lib/tables/tableTitles.ts`

Add new table titles enum values:
```typescript
export enum TableTitles {
  // ... existing
  RegionDescriptorsWilderness = 'Region Descriptors: Wilderness',
  RegionDescriptorsCity = 'Region Descriptors: City',
  RegionDescriptorsStructure = 'Region Descriptors: Structure',
  AreaElementsLocationsLarge = 'Area Elements: Locations (Large)',
  AreaElementsLocationsSmall = 'Area Elements: Locations (Small)',
  AreaElementsEncountersObjects = 'Area Elements: Encounters & Objects',
  RandomElementDescriptorsLocations = 'Random Element Descriptors: Locations',
  RandomElementDescriptorsEncounters = 'Random Element Descriptors: Encounters',
  RandomElementDescriptorsObjects = 'Random Element Descriptors: Objects',
  SpecialElements = 'Special Elements',
}
```

**Effort**: 0.5 hours

---

**Total Phase 3A: 6 hours**

---

### 3B: Location Crafter State Management (4h)

**What**: Add region/area tracking to store

**Location**: `soloRpgStore.svelte.ts`

**Types**:
```typescript
export type RegionType = 'Wilderness' | 'City' | 'Structure';

export interface RegionDescriptor {
  descriptor1: string;
  descriptor2: string;
  interpretation?: string;
}

export interface KnownElement {
  id: string;
  category: 'Location' | 'Encounter' | 'Object';
  text: string;
  position: number; // 1-10
  canRemove: boolean; // false if unique
}

export interface Area {
  number: number;
  locationElement: string;
  locationRoll: number;
  encounterElement: string;
  encounterRoll: number;
  objectElement: string;
  objectRoll: number;
  interpretation: string;
  notes?: string;
  timestamp: Date;
}

export interface Region {
  id: string;
  name: string;
  type: RegionType;
  descriptors: RegionDescriptor;
  isLargeRegion: boolean;

  // Exploration state
  areas: Area[];
  currentAreaNumber: number;
  progressPoints: {
    locations: number;
    encounters: number;
    objects: number;
  };
  knownElements: KnownElement[];
  isComplete: boolean;

  // Metadata
  createdInScene: number;
  completedInScene?: number;
  parentRegionId?: string; // For nested regions
}

// Add to SoloRpgSession
export interface SoloRpgSession {
  // ... existing
  regions: Region[];
  currentRegionId?: string;
}
```

**Store methods**:
```typescript
// Region management
createRegion(name: string, type: RegionType, isLarge: boolean): Region
setCurrentRegion(id: string): void
completeRegion(id: string): void

// Known Elements
addKnownElement(regionId: string, category, text): KnownElement
removeKnownElement(regionId: string, elementId: string): void

// Area generation
generateArea(regionId: string): Area
addArea(regionId: string, area: Area): void
incrementProgressPoints(regionId: string, category): void
decrementProgressPoints(regionId: string, category, amount): void

// Rolling helpers
rollRegionDescriptors(type: RegionType): RegionDescriptor
rollAreaElement(category, progressPoints): string
rollRandomElement(category): [string, string] // Two words
rollSpecialElement(): string
```

**Effort**: 4 hours

---

## PHASE 4: Location Crafter UI Components (15 hours)

### 4A: Region Generator Component (4h)

**What**: Modal/panel to create a new region

**Location**: `src/lib/components/solorpg/locationcrafter/RegionGenerator.svelte`

**UI Flow**:
```svelte
<Modal title="🗺️ Create New Region">
  <div class="region-creation">
    <!-- Step 1: Basic Info -->
    <div class="step">
      <h4>1. Basic Information</h4>
      <input bind:value={regionName} placeholder="Region name..." />

      <div class="region-type-select">
        <button class={selectedType === 'Wilderness' ? 'selected' : ''}
                onclick={() => selectedType = 'Wilderness'}>
          🌲 Wilderness
        </button>
        <button class={selectedType === 'City' ? 'selected' : ''}
                onclick={() => selectedType = 'City'}>
          🏘️ City
        </button>
        <button class={selectedType === 'Structure' ? 'selected' : ''}
                onclick={() => selectedType = 'Structure'}>
          🏰 Structure
        </button>
      </div>

      <label>
        <input type="checkbox" bind:checked={isLargeRegion} />
        Large Region (longer exploration)
      </label>
    </div>

    <!-- Step 2: Generate Descriptors -->
    <div class="step">
      <h4>2. Generate Region Descriptors</h4>
      <p>Roll twice on Region Descriptors table</p>

      {#if !descriptorsRolled}
        <button onclick={rollDescriptors}>🎲 Roll Descriptors</button>
      {:else}
        <div class="descriptors-result">
          <div class="descriptor">
            <span class="die">🎲 {roll1}</span>
            <span class="text">{descriptor1}</span>
          </div>
          <div class="descriptor">
            <span class="die">🎲 {roll2}</span>
            <span class="text">{descriptor2}</span>
          </div>

          <button onclick={rollDescriptors} class="reroll">
            ↻ Reroll
          </button>
        </div>

        <div class="interpretation">
          <label>Your Interpretation</label>
          <textarea bind:value={descriptorInterpretation}
                    placeholder="How do you interpret these descriptors?" />
          <p class="hint">
            Combine these descriptors to envision what this region looks like
          </p>
        </div>
      {/if}
    </div>

    <!-- Step 3: Known Elements (Optional) -->
    <div class="step">
      <h4>3. Known Elements (Optional)</h4>
      <p>Add any elements you know exist in this region</p>

      <div class="known-elements-entry">
        <div class="category-section">
          <h5>Locations</h5>
          {#each knownLocations as loc}
            <div class="known-item">
              {loc.text}
              <button onclick={() => removeKnown('location', loc.id)}>✕</button>
            </div>
          {/each}
          <input placeholder="Add known location..."
                 onkeydown={(e) => e.key === 'Enter' && addKnown('location', e.target.value)} />
        </div>

        <!-- Similar for Encounters and Objects -->
      </div>
    </div>

    <!-- Create Button -->
    <div class="actions">
      <button onclick={createRegion}
              disabled={!regionName || !descriptorsRolled}
              class="primary">
        Create Region & Begin Exploration
      </button>
      <button onclick={onCancel}>Cancel</button>
    </div>
  </div>
</Modal>
```

**Effort**: 4 hours

---

### 4B: Area Generator Component (5h)

**What**: Main interface for generating and exploring areas

**Location**: `src/lib/components/solorpg/locationcrafter/AreaGenerator.svelte`

**UI Structure**:
```svelte
<div class="area-generator">
  <header>
    <h3>🗺️ {currentRegion.name}</h3>
    <div class="region-info">
      <span>{currentRegion.type}</span>
      <span>{currentRegion.descriptors.descriptor1}, {currentRegion.descriptors.descriptor2}</span>
    </div>
  </header>

  <!-- Progress Tracking -->
  <div class="exploration-progress">
    <h4>Exploration Progress</h4>
    <div class="progress-bars">
      <div class="progress-item">
        <label>Locations: {progressPoints.locations} PP</label>
        <div class="progress-bar">
          <div class="fill" style="width: {progressPercent.locations}%"></div>
        </div>
      </div>
      <div class="progress-item">
        <label>Encounters: {progressPoints.encounters} PP</label>
        <div class="progress-bar">
          <div class="fill" style="width: {progressPercent.encounters}%"></div>
        </div>
      </div>
      <div class="progress-item">
        <label>Objects: {progressPoints.objects} PP</label>
        <div class="progress-bar">
          <div class="fill" style="width: {progressPercent.objects}%"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Current Area -->
  {#if currentArea}
    <div class="current-area">
      <h4>Area #{currentArea.number}</h4>

      <div class="elements">
        <div class="element location">
          <strong>Location:</strong>
          <span>{currentArea.locationElement}</span>
          <small>Roll: {currentArea.locationRoll} (d10+{progressPoints.locations - 1})</small>
        </div>

        <div class="element encounter">
          <strong>Encounter:</strong>
          <span>{currentArea.encounterElement}</span>
          <small>Roll: {currentArea.encounterRoll} (d10+{progressPoints.encounters - 1})</small>
        </div>

        <div class="element object">
          <strong>Object:</strong>
          <span>{currentArea.objectElement}</span>
          <small>Roll: {currentArea.objectRoll} (d10+{progressPoints.objects - 1})</small>
        </div>
      </div>

      <!-- Handle Special Results -->
      {#if needsRandomDescriptors}
        <RandomElementResolver
          category={needsDescriptorFor}
          onResolved={(result) => applyRandomResult(result)}
        />
      {/if}

      {#if needsKnownElement}
        <KnownElementResolver
          category={needsKnownFor}
          knownElements={getKnownForCategory(needsKnownFor)}
          onResolved={(element) => applyKnownElement(element)}
        />
      {/if}

      {#if needsSpecialResolution}
        <SpecialElementResolver
          specialType={specialResult}
          onResolved={() => resolveSpecialElement()}
        />
      {/if}

      <!-- Interpretation -->
      <div class="interpretation">
        <label>Area Interpretation</label>
        <textarea bind:value={currentArea.interpretation}
                  placeholder="Describe what this area is and what's happening here..." />
      </div>

      <div class="actions">
        {#if !areaComplete}
          <button onclick={completeArea}>
            ✓ Finish This Area
          </button>
        {:else}
          <button onclick={generateNextArea} class="primary">
            ➡️ Explore Next Area
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Start exploration -->
    <div class="start-exploration">
      <p>Ready to begin exploring {currentRegion.name}</p>
      <button onclick={generateFirstArea} class="primary">
        🎲 Generate First Area
      </button>
    </div>
  {/if}

  <!-- Region Complete -->
  {#if regionComplete}
    <div class="completion-notice">
      <h4>✓ Region Fully Explored</h4>
      <p>You've explored all there is to find in {currentRegion.name}</p>
      <button onclick={markRegionComplete}>Close Region</button>
    </div>
  {/if}
</div>
```

**Complex logic**:
- Roll on Area Elements table with PP
- Detect result type (Expected, Random, Known, Special, Complete, etc.)
- Show appropriate sub-component for resolution
- Handle Progress Points increment/decrement
- Track when "Complete" is reached

**Effort**: 5 hours

---

### 4C: Area History Timeline (2h)

**What**: Visual history of areas explored

**Location**: `src/lib/components/solorpg/locationcrafter/AreaHistoryTimeline.svelte`

```svelte
<div class="area-history">
  <h4>📜 Exploration History</h4>

  <div class="timeline">
    {#each areas.slice().reverse() as area}
      <div class="timeline-item {area.number === currentAreaNumber ? 'current' : ''}">
        <div class="area-marker">
          <span class="number">{area.number}</span>
        </div>

        <div class="area-summary">
          <div class="elements">
            <span class="location">📍 {area.locationElement}</span>
            {#if area.encounterElement !== 'None'}
              <span class="encounter">👤 {area.encounterElement}</span>
            {/if}
            {#if area.objectElement !== 'None'}
              <span class="object">📦 {area.objectElement}</span>
            {/if}
          </div>

          {#if area.interpretation}
            <p class="interpretation">{area.interpretation}</p>
          {/if}

          <button onclick={() => expandArea(area)}>View Details</button>
        </div>
      </div>
    {/each}
  </div>
</div>
```

**Effort**: 2 hours

---

### 4D: Known Elements Sheet Component (2h)

**What**: Manage the Known Elements list for a region

**Location**: `src/lib/components/solorpg/locationcrafter/KnownElementsSheet.svelte`

```svelte
<div class="known-elements-sheet">
  <h4>📋 Known Elements</h4>
  <p class="hint">Elements you know exist somewhere in this region</p>

  <div class="columns">
    <!-- Locations Column -->
    <div class="category-column">
      <h5>📍 Locations</h5>
      <div class="elements-list">
        {#each knownLocations as loc, index}
          <div class="element-item">
            <span class="position">{index + 1}.</span>
            <span class="text">{loc.text}</span>
            {#if loc.canRemove}
              <button onclick={() => removeElement(loc.id)}>✕</button>
            {:else}
              <span class="badge">Used</span>
            {/if}
          </div>
        {/each}

        {#if knownLocations.length < 10}
          <input placeholder="Add location..."
                 onkeydown={(e) => addElement('Location', e)} />
        {/if}
      </div>
    </div>

    <!-- Similar for Encounters and Objects -->
  </div>
</div>
```

**Effort**: 2 hours

---

### 4E: Location Crafter Main Panel (2h)

**What**: Container panel that orchestrates all Location Crafter features

**Location**: `src/lib/components/solorpg/LocationCrafterPanel.svelte`

```svelte
<div class="location-crafter-panel">
  <header>
    <h2>🗺️ Location Crafter</h2>
    <p>Procedurally generate regions and areas</p>
  </header>

  <!-- Region Selection -->
  {#if regions.length > 0}
    <div class="region-selector">
      <label>Current Region:</label>
      <select bind:value={selectedRegionId} onchange={switchRegion}>
        {#each regions as region}
          <option value={region.id}>
            {region.name} ({region.type})
            {region.isComplete ? '✓' : `${region.areas.length} areas`}
          </option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Action Buttons -->
  <div class="actions">
    <button onclick={() => showRegionGenerator = true} class="primary">
      + New Region
    </button>

    {#if currentRegion}
      <button onclick={() => showKnownElements = !showKnownElements}>
        📋 Known Elements
      </button>
      <button onclick={() => showHistory = !showHistory}>
        📜 History
      </button>
    {/if}
  </div>

  <!-- Main Content Area -->
  {#if currentRegion}
    <AreaGenerator region={currentRegion} />

    {#if showKnownElements}
      <KnownElementsSheet region={currentRegion} />
    {/if}

    {#if showHistory}
      <AreaHistoryTimeline region={currentRegion} />
    {/if}
  {:else}
    <div class="empty-state">
      <h3>No Region Active</h3>
      <p>Create a new region to start exploring</p>
      <button onclick={() => showRegionGenerator = true}>
        🗺️ Create First Region
      </button>
    </div>
  {/if}

  <!-- Modals -->
  {#if showRegionGenerator}
    <RegionGenerator onClose={() => showRegionGenerator = false} />
  {/if}
</div>
```

**Effort**: 2 hours

---

**Total Phase 4: 15 hours**

---

## PHASE 5: Integration & Polish (5 hours)

### 5A: Add Location Crafter to Workspace (2h)

**What**: Add Location Crafter as a workspace section

**Location**: `src/routes/solorpg/+page.svelte` (or wherever Solo RPG workspace lives)

**Changes**:
```svelte
<div class="workspace">
  <!-- Existing sections -->
  <SceneManager ... />
  <FateQuestion ... />
  <ListsPanel ... />

  <!-- NEW: Location Crafter Section -->
  <CollapsibleSection
    title="🗺️ Location Crafter"
    icon="🗺️"
    startExpanded={false}
    stateKey="location-crafter-section"
  >
    <LocationCrafterPanel />
  </CollapsibleSection>
</div>
```

**Effort**: 2 hours

---

### 5B: Help Documentation & Tooltips (2h)

**What**: Add comprehensive help text and tooltips

**Locations**: Various components

**Content to add**:
- What is Location Crafter? (modal or collapsible help)
- Region types explanation
- Progress Points explanation
- Element types (Expected, Random, Known, etc.) explanation
- Special Elements guide
- Best practices tips

**Effort**: 2 hours

---

### 5C: Testing & Bug Fixes (1h)

**What**: Manual testing and bug fixes

**Test cases**:
- Create all 3 region types
- Generate areas until Complete
- Roll Known Elements
- Trigger Special Elements
- Handle edge cases (no Known Elements, overflow PP, etc.)

**Effort**: 1 hour

---

**Total Phase 5: 5 hours**

---

## 📊 Total Implementation Effort

| Phase | Feature | Hours |
|-------|---------|-------|
| 1A | Improved Altered Scene Guidance | 2 |
| 1B | Random Event Graft | 3 |
| 2A | Alternate Scenes Data Model | 1 |
| 2B | Alternate Scenes Manager UI | 4 |
| 2C | Alternate Scene Integration | 3 |
| 3A | Location Crafter Tables | 6 |
| 3B | Location Crafter State Management | 4 |
| 4A | Region Generator Component | 4 |
| 4B | Area Generator Component | 5 |
| 4C | Area History Timeline | 2 |
| 4D | Known Elements Sheet | 2 |
| 4E | Location Crafter Main Panel | 2 |
| 5A | Workspace Integration | 2 |
| 5B | Help Documentation | 2 |
| 5C | Testing & Bug Fixes | 1 |
| **TOTAL** | | **43 hours** |

---

## 🎯 Recommended Implementation Order

### Priority 1: Quick Wins (5 hours)
- ✅ Phase 1A: Improved Altered Scene Guidance (2h)
- ✅ Phase 1B: Random Event Graft (3h)

**Benefit**: Immediate improvement to existing Altered Scene handling

---

### Priority 2: Alternate Scenes System (8 hours)
- Phase 2A: Data Model (1h)
- Phase 2B: Manager UI (4h)
- Phase 2C: Integration (3h)

**Benefit**: Powerful new feature for players who want more control

---

### Priority 3: Location Crafter Foundation (10 hours)
- Phase 3A: Tables (6h) - **Can be done incrementally**
- Phase 3B: State Management (4h)

**Benefit**: Data layer for entire Location Crafter system

---

### Priority 4: Location Crafter UI (15 hours)
- Phase 4A-E: All UI components

**Benefit**: Complete Location Crafter feature

---

### Priority 5: Integration & Polish (5 hours)
- Phase 5A-C: Final touches

**Benefit**: Professional, complete experience

---

## 🚀 Phased Rollout Strategy

### Release 1: Altered Scenes Enhancement
**Scope**: Phases 1A, 1B (5 hours)
**Value**: Immediate improvement to existing feature
**Risk**: Low - isolated changes

### Release 2: Alternate Scenes
**Scope**: Phases 2A, 2B, 2C (8 hours)
**Value**: New optional feature for advanced users
**Risk**: Medium - new data model, but well-contained

### Release 3: Location Crafter (Part 1 - Tables)
**Scope**: Phase 3A (6 hours)
**Value**: Foundation for Location Crafter
**Risk**: Low - pure data, no UI changes yet

### Release 4: Location Crafter (Part 2 - Complete)
**Scope**: Phases 3B, 4A-E, 5A-C (25 hours)
**Value**: Full Location Crafter feature
**Risk**: Medium-High - major new subsystem

---

## 🎨 UI/UX Considerations

### Progressive Disclosure
- **Location Crafter**: Hidden by default (collapsible section)
- **Alternate Scenes**: Separate panel, not shown until user creates one
- **Altered Scene options**: Radio buttons, not overwhelming dropdown

### Mobile Responsiveness
- Area Generator: Stack elements vertically on mobile
- Known Elements: Single column on mobile
- Timeline: Simplified mobile view

### Visual Design
- **Location Crafter**: Blue/Teal color scheme (distinct from purple/orange)
- **Region cards**: Visual differentiation (🌲 green, 🏘️ gray, 🏰 brown)
- **Progress bars**: Clear visual indication of exploration depth

---

## 🔧 Technical Considerations

### Performance
- Lazy load Location Crafter components
- Virtualize Area History if >50 areas
- Debounce interpretation textarea autosave

### State Management
- Keep regions separate from scenes in store
- Allow multiple regions to exist (nested exploration)
- Auto-save after each area generated

### Data Integrity
- Validate Progress Points never go negative
- Handle "Complete" gracefully (don't allow further areas)
- Ensure Known Elements list never exceeds 10 per category

---

## ✅ Success Criteria

### Altered Scenes Enhancement
- [x] User can choose how to alter scene
- [x] Random Event Graft works correctly
- [x] Help text is clear and useful

### Alternate Scenes
- [ ] User can create, edit, delete alternate scenes
- [ ] Triggers work correctly (manual, thread, chaos, etc.)
- [ ] Alternate scenes can replace altered scenes
- [ ] Used scenes marked correctly, recurring scenes work

### Location Crafter
- [ ] All tables implemented correctly
- [ ] Region generation works for all 3 types
- [ ] Area generation handles all element types
- [ ] Progress Points system works correctly
- [ ] Known Elements can be added/used/removed
- [ ] Special Elements resolve correctly
- [ ] Complete status reached appropriately
- [ ] UI is intuitive and not overwhelming

---

## 📚 Documentation Needs

### User-Facing
1. "What is the Location Crafter?" explainer
2. "How to use Alternate Scenes" guide
3. "Altered Scene Approaches" comparison
4. Video/GIF walkthroughs of Location Crafter

### Developer
1. Table structure documentation
2. Region/Area state machine diagram
3. Progress Points calculation explanation
4. Element resolution flowchart

---

## 🎯 Next Steps

### Immediate Actions
1. **Read through this plan with user** - Get feedback/approval
2. **Decide on scope** - All features or phased approach?
3. **Start with Priority 1** - Quick wins (5 hours)
4. **Create detailed task breakdown** for chosen phase

### Questions for User
1. Do you want all features or prefer phased approach?
2. Which feature excites you most? (Prioritize that)
3. Do you use Location Crafter in your games? (If no, maybe skip it)
4. Timeline expectations?

---

## 🎉 Conclusion

This plan incorporates all content from **Mythic Magazine Volume 2** into the Solo RPG module:

**From Magazine**:
- ✅ Scene Adjustment Table (already done)
- 🆕 Meaning Tables for Altered Scenes (tables exist, just surface them)
- 🆕 Random Event Graft (new feature)
- 🆕 Alternate Scenes (new feature)
- 🆕 Complete Location Crafter System (major new feature)

**Total Effort**: 43 hours
**Minimum Viable**: 5 hours (Altered Scene improvements only)
**Recommended First Phase**: 13 hours (Altered Scenes + Alternate Scenes)

Ready to begin implementation when you are!
