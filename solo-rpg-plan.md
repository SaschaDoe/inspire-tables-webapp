# Solo RPG Integration Plan - Mythic GME

## Overview
Integrate the Mythic Game Master Emulator 2nd Edition system into the Inspire Tables webapp to support solo RPG gameplay. This will add a dedicated solo RPG section with tools for managing adventures, plus incorporate all Mythic tables into the existing table system with proper tagging.

## Goals
1. **Solo RPG Player Support** - Create a dedicated UI to help players run solo adventures using Mythic GME
2. **Table Integration** - Add all Mythic tables to the existing table browser with "mythic-solo-rpg" tags
3. **Seamless Experience** - Integrate solo RPG features naturally into the existing webapp structure
4. **Reference Documentation** - Make rules and tables easily accessible during play

---

## Phase 1: Foundation & Data Structure

### 1.1 Add New Table Type
**File:** `src/lib/tables/tableType.ts`

Add new enum value:
```typescript
export enum TableType {
  // ... existing types
  SoloRPG = 'Solo RPG'  // or 'Mythic GME'
}
```

### 1.2 Create Mythic Table Classes
**Location:** `src/lib/tables/mythicTables/`

Create table classes for all Mythic tables:

#### Core Mechanic Tables
- `fateChartTable.ts` - The main Fate Chart (special handling needed for 2D structure)
- `eventFocusTable.ts` - Random Event Focus (1d100)
- `sceneAdjustmentTable.ts` - Scene Adjustment (1d10)

#### Meaning Tables - Actions
- `actionsTable1.ts` - Action Table 1 (1d100)
- `actionsTable2.ts` - Action Table 2 (1d100)

#### Meaning Tables - Descriptions
- `descriptionsTable1.ts` - Descriptor Table 1 (1d100)
- `descriptionsTable2.ts` - Descriptor Table 2 (1d100)

#### Meaning Tables - Core Elements
- `locationsElementsTable.ts` - Locations (1d100)
- `charactersElementsTable.ts` - Characters (1d100)
- `objectsElementsTable.ts` - Objects (1d100)

#### Meaning Tables - Specialized Elements (45+ tables)
Character-focused:
- `characterDescriptorsTable.ts`
- `characterIdentityTable.ts`
- `characterActionsCombatTable.ts`
- `characterActionsGeneralTable.ts`
- `characterConversationsTable.ts`
- `characterBackgroundTable.ts`
- `characterMotivationsTable.ts`
- `characterAppearanceTable.ts`

Location-focused:
- `cavernDescriptorsTable.ts`
- `dungeonDescriptorsTable.ts`
- `forestDescriptorsTable.ts`
- `urbanDescriptorsTable.ts`
- `wastelandDescriptorsTable.ts`

Creature-focused:
- `animalActionsTable.ts`
- `creatureDescriptorsTable.ts`
- `alienSpeciesDescriptorsTable.ts`

Military/Combat:
- `armyDescriptorsTable.ts`
- `combatDescriptorsTable.ts`

Magic & Fantasy:
- `magicDescriptorsTable.ts`
- `divineDescriptorsTable.ts`

Adventure & Plot:
- `adventureToneTable.ts`
- `plotTwistsTable.ts`

Other Specialized:
- `scavengingResultsTable.ts`
- `trapDescriptorsTable.ts`
- `npcBehaviorTable.ts`

### 1.3 Update Table Metadata
**File:** `src/lib/data/tableMetadata.ts`

Add new category with all Mythic tables:
```typescript
{
  type: TableType.SoloRPG,
  tables: [
    // Core Mechanics
    { title: 'Fate Chart', type: TableType.SoloRPG, importPath: 'mythicTables/fateChartTable', className: 'FateChartTable' },
    { title: 'Event Focus', type: TableType.SoloRPG, importPath: 'mythicTables/eventFocusTable', className: 'EventFocusTable' },
    { title: 'Scene Adjustment', type: TableType.SoloRPG, importPath: 'mythicTables/sceneAdjustmentTable', className: 'SceneAdjustmentTable' },

    // Meaning Tables - Actions
    { title: 'Actions Table 1', type: TableType.SoloRPG, importPath: 'mythicTables/actionsTable1', className: 'ActionsTable1' },
    { title: 'Actions Table 2', type: TableType.SoloRPG, importPath: 'mythicTables/actionsTable2', className: 'ActionsTable2' },

    // ... all other tables
  ]
}
```

### 1.4 Add Table Tags/Annotations
**File:** `src/lib/data/tableMetadata.ts` (modify interface)

Extend the `TableMetadata` interface to support tags:
```typescript
export interface TableMetadata {
  title: string;
  type: TableType;
  importPath: string;
  className: string;
  tags?: string[];  // NEW: Add tags for better filtering
  system?: string;  // NEW: e.g., "mythic-gme-2e", "inspire-tables"
}
```

Tag all Mythic tables with:
```typescript
tags: ['mythic', 'solo-rpg', 'gme'],
system: 'mythic-gme-2e'
```

---

## Phase 2: Solo RPG Game Session UI

### 2.1 Create New Route
**Location:** `src/routes/solo-rpg/+page.svelte`

Main solo RPG interface with tabs/sections:
1. **Game Session** - Active play area
2. **Quick Tables** - Fast access to common Mythic tables
3. **Rules Reference** - Quick access to solo-rpg.md content
4. **Full Tables** - Link to all Mythic tables in table browser

### 2.2 Game Session Components
**Location:** `src/lib/components/solorpg/`

#### Core Session Manager
**File:** `GameSession.svelte`
- Main container for the active game session
- Manages session state (Chaos Factor, Lists, Scene tracking)
- Displays current scene information
- Quick action buttons

#### Chaos Factor Manager
**File:** `ChaosFactorPanel.svelte`
- Display current Chaos Factor (1-9)
- Visual indicator (gauge/slider)
- +/- buttons to adjust
- Tooltip explaining what it means

#### Lists Manager
**File:** `ListsPanel.svelte`
Two sub-components:
- `ThreadsList.svelte` - Manage PC goals/threads
- `CharactersList.svelte` - Manage NPCs and important elements

Features:
- Add/remove/edit entries
- Roll dice to select random entry (d4/d6/d8/d10 based on count)
- Visual grouping by sections (1-5, 6-10, etc.)
- Drag-to-reorder
- Mark items as active/inactive

#### Fate Question Tool
**File:** `FateQuestion.svelte`
Interactive fate question roller:
- Input field for the question
- Dropdown for Odds selection (Impossible → Certain)
- Current Chaos Factor display
- "Ask Fate" button
- Results display:
  - Yes/No answer
  - Exceptional indicator
  - Random Event indicator (if doubles rolled)
  - Percentage rolled and threshold
- Question history (last 5-10 questions)

#### Random Event Generator
**File:** `RandomEventGenerator.svelte`
- "Generate Random Event" button
- Event Focus selection (auto-roll or manual choice)
- Context input field
- Meaning table roller (2x rolls)
- Result interpretation area (user notes)
- Event history

#### Scene Manager
**File:** `SceneManager.svelte`
- Scene number tracker
- Expected Scene input
- "Test Scene" button (roll d10 vs Chaos Factor)
- Scene type result (Expected/Altered/Interrupt)
- Scene Adjustment tool (for Altered scenes)
- Scene history/journal

#### Quick Reference Panel
**File:** `QuickReference.svelte`
Collapsible panels with:
- Fate Chart quick view
- Odds examples
- Event Focus quick reference
- Common workflows

### 2.3 Session State Management
**File:** `src/lib/stores/soloRpgStore.ts`

Svelte store for managing game session state:
```typescript
interface SoloRpgSession {
  id: string;
  adventureName: string;
  chaosFactor: number;  // 1-9
  threads: Thread[];
  characters: Character[];
  scenes: Scene[];
  currentScene: number;
  fateQuestionHistory: FateQuestion[];
  randomEventHistory: RandomEvent[];
  createdAt: Date;
  updatedAt: Date;
}

interface Thread {
  id: string;
  text: string;
  position: number;  // 1-25
  completed: boolean;
}

interface Character {
  id: string;
  name: string;
  description: string;
  position: number;  // 1-25
  active: boolean;
}

interface Scene {
  number: number;
  type: 'First' | 'Expected' | 'Altered' | 'Interrupt';
  description: string;
  chaosFactorBefore: number;
  chaosFactorAfter: number;
  notes: string;
}

interface FateQuestion {
  question: string;
  odds: string;
  chaosFactor: number;
  roll: number;
  answer: 'Yes' | 'No' | 'Exceptional Yes' | 'Exceptional No';
  randomEvent: boolean;
  timestamp: Date;
}

interface RandomEvent {
  focus: string;
  meaning: [string, string];
  interpretation: string;
  timestamp: Date;
}
```

Functions:
- `createSession()` - Start new game
- `loadSession(id)` - Load existing game
- `saveSession()` - Persist to localStorage
- `updateChaosFactor(delta)` - Adjust CF
- `addThread(text)` - Add goal
- `addCharacter(name, description)` - Add NPC
- `rollFateQuestion(question, odds)` - Execute fate roll
- `generateRandomEvent()` - Generate event
- `addScene(scene)` - Record scene
- Session CRUD operations

### 2.4 Layout Design
**Overall Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Solo RPG Session] [Adventure Name]    [Save] [Load]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────┐  ┌──────────────────────────────────────┐  │
│ │             │  │                                      │  │
│ │  Chaos      │  │                                      │  │
│ │  Factor     │  │                                      │  │
│ │  [5]        │  │        MAIN PLAY AREA               │  │
│ │             │  │                                      │  │
│ │  [Quick     │  │  Tabs:                               │  │
│ │  Actions]   │  │  • Fate Questions                    │  │
│ │             │  │  • Random Events                     │  │
│ │  - Ask Fate │  │  • Scene Manager                     │  │
│ │  - Random   │  │  • Quick Tables                      │  │
│ │    Event    │  │                                      │  │
│ │  - New      │  │  [Active tab content displays here]  │  │
│ │    Scene    │  │                                      │  │
│ │             │  │                                      │  │
│ │  [Lists]    │  │                                      │  │
│ │             │  │                                      │  │
│ │  Threads    │  │                                      │  │
│ │  ┌────────┐ │  │                                      │  │
│ │  │  1-5   │ │  │                                      │  │
│ │  └────────┘ │  │                                      │  │
│ │             │  │                                      │  │
│ │  Characters │  │                                      │  │
│ │  ┌────────┐ │  │                                      │  │
│ │  │  1-5   │ │  │                                      │  │
│ │  └────────┘ │  │                                      │  │
│ │             │  │                                      │  │
│ └─────────────┘  └──────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 3: Table Browser Integration

### 3.1 Add Filter by Tags
**File:** `src/routes/tables/+page.svelte`

Add filtering capabilities:
- "Filter by System" dropdown (All, Inspire Tables, Mythic GME)
- Tag filter chips (mythic, solo-rpg, gme, etc.)
- Search by table name

### 3.2 Visual Indicators
Add badges/icons to tables:
- "Mythic GME" badge on all Mythic tables
- System indicator in table cards
- Tag display in table detail view

### 3.3 Mythic Category
Ensure "Solo RPG" or "Mythic GME" appears in the category sidebar with table count.

---

## Phase 4: Special Table Handling

### 4.1 Fate Chart Special Renderer
**File:** `src/lib/components/tables/FateChartRenderer.svelte`

The Fate Chart is 2D (Odds × Chaos Factor), not a simple 1D table:
- Custom component with interactive grid
- Hover highlights
- Click to see percentage range
- Show Exceptional thresholds
- Input: Select Odds + CF, output result range

### 4.2 Dual Roll Tables
Many Meaning Tables require rolling twice:
- Add "Roll Twice" button option
- Display both results side-by-side
- Show combined interpretation

### 4.3 Cascade to Meaning Tables
**Enhancement to existing table system:**

Allow Random Event results to cascade:
- "NPC Action" → auto-prompt to roll on Characters List → roll on Meaning Tables
- "Move Toward Thread" → prompt for Thread selection → roll on Meaning Tables
- Smart suggestions based on Event Focus

---

## Phase 5: Documentation Integration

### 5.1 Embed Rules Reference
**File:** `src/lib/components/solorpg/RulesReference.svelte`

Render the `solo-rpg.md` content:
- Parse markdown
- Create collapsible sections
- Search functionality
- Link directly to relevant tables

### 5.2 Table Reference
**File:** `src/lib/components/solorpg/TablesReference.svelte`

Render the `solo-rpg-tables.md` content:
- Quick lookup for percentages
- Fate Chart visual
- All tables in compact form

### 5.3 Help Tooltips
Add contextual help throughout the Solo RPG UI:
- Chaos Factor: "What does this do?"
- Fate Questions: "How to phrase questions"
- Event Focus: "When to choose vs roll"
- Scene types: "Expected, Altered, Interrupt"

---

## Phase 6: Storage & Persistence

### 6.1 LocalStorage
**File:** `src/lib/utils/soloRpgStorage.ts`

Functions:
- `saveSessions(sessions)` - Save all sessions
- `loadSessions()` - Load all sessions
- `saveCurrentSession(session)` - Auto-save current
- `deleteSession(id)` - Remove session

### 6.2 Session Management UI
**File:** `src/lib/components/solorpg/SessionManager.svelte`

Features:
- List all saved sessions
- Create new session
- Load session
- Delete session
- Export session (JSON download)
- Import session (JSON upload)

### 6.3 Auto-save
Implement auto-save on:
- Chaos Factor change
- List updates (add/remove/edit)
- Scene completion
- Every Fate Question
- Every Random Event

---

## Phase 7: Navigation & Home Page Updates

### 7.1 Add Solo RPG to Main Navigation
**File:** `src/routes/+page.svelte`

Add new quick action button:
```html
<a href="/solo-rpg"
   class="group relative px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 ...">
  <span class="text-3xl">🎭</span>
  <span>Solo RPG</span>
</a>
```

### 7.2 Featured Table
Add a Mythic table to the featured tables section (e.g., Event Focus or Actions Table 1)

### 7.3 Navigation Header
Update the app header/nav to include link to `/solo-rpg`

---

## Phase 8: Advanced Features (Future Enhancements)

### 8.1 Multiple Chaos Flavors
Support alternative Fate Charts:
- Mid-Chaos
- Low-Chaos
- No-Chaos
- Custom percentages

### 8.2 Thread Progress Tracks
Visual progress bars for threads with milestones

### 8.3 NPC Behavior Shortcuts
Quick NPC behavior rolls integrated with Characters List

### 8.4 Scene Journal Export
Export entire adventure journal as:
- Markdown
- PDF
- Plain text

### 8.5 Keyed Scenes
Pre-plan scene sequences with Mythic modifications

### 8.6 Mobile Optimization
Responsive design tweaks for phone/tablet solo play

### 8.7 Dice Sound Effects
Optional dice rolling sounds for immersion

### 8.8 Dark/Light Theme
Theme variants for different play preferences

---

## Implementation Order

### Sprint 1: Foundation (Tables Only)
1. Add TableType.SoloRPG
2. Create 10-15 core Mythic table classes (Fate Chart, Event Focus, Actions, Descriptions, Core Elements)
3. Update tableMetadata with new tables
4. Add tags/system to TableMetadata interface
5. Test tables appear in table browser
6. **Deliverable:** Mythic tables browsable in /tables with proper tags

### Sprint 2: Core Solo RPG UI
1. Create /solo-rpg route
2. Implement soloRpgStore for state management
3. Build basic GameSession.svelte
4. Build ChaosFactorPanel.svelte
5. Build ListsPanel.svelte (Threads + Characters)
6. Build FateQuestion.svelte
7. **Deliverable:** Basic solo RPG session playable

### Sprint 3: Events & Scenes
1. Build RandomEventGenerator.svelte
2. Build SceneManager.svelte
3. Implement scene testing logic
4. Implement scene adjustment
5. **Deliverable:** Full Mythic workflow functional

### Sprint 4: Complete Tables + Special Handling
1. Create remaining 30+ specialized Meaning Tables
2. Build FateChartRenderer.svelte
3. Add dual-roll support for Meaning Tables
4. **Deliverable:** All Mythic tables available with special rendering

### Sprint 5: Polish & Documentation
1. Embed RulesReference.svelte
2. Embed TablesReference.svelte
3. Add help tooltips
4. Implement session save/load
5. Add to main navigation
6. **Deliverable:** Complete, polished solo RPG feature

### Sprint 6: Advanced Features (Optional)
1. Export/import sessions
2. Multiple chaos flavors
3. Journal export
4. Mobile optimizations

---

## File Structure Summary

```
src/
├── routes/
│   ├── solo-rpg/
│   │   └── +page.svelte          # Main solo RPG interface
│   ├── tables/
│   │   └── +page.svelte          # Updated with tag filtering
│   └── +page.svelte              # Updated home with solo RPG link
│
├── lib/
│   ├── components/
│   │   └── solorpg/
│   │       ├── GameSession.svelte
│   │       ├── ChaosFactorPanel.svelte
│   │       ├── ListsPanel.svelte
│   │       ├── ThreadsList.svelte
│   │       ├── CharactersList.svelte
│   │       ├── FateQuestion.svelte
│   │       ├── RandomEventGenerator.svelte
│   │       ├── SceneManager.svelte
│   │       ├── QuickReference.svelte
│   │       ├── RulesReference.svelte
│   │       ├── TablesReference.svelte
│   │       ├── SessionManager.svelte
│   │       └── FateChartRenderer.svelte
│   │
│   ├── stores/
│   │   └── soloRpgStore.ts       # Session state management
│   │
│   ├── utils/
│   │   └── soloRpgStorage.ts     # LocalStorage helpers
│   │
│   ├── tables/
│   │   ├── tableType.ts          # Updated with SoloRPG type
│   │   └── mythicTables/         # NEW FOLDER
│   │       ├── fateChartTable.ts
│   │       ├── eventFocusTable.ts
│   │       ├── sceneAdjustmentTable.ts
│   │       ├── actionsTable1.ts
│   │       ├── actionsTable2.ts
│   │       ├── descriptionsTable1.ts
│   │       ├── descriptionsTable2.ts
│   │       ├── locationsElementsTable.ts
│   │       ├── charactersElementsTable.ts
│   │       ├── objectsElementsTable.ts
│   │       ├── characterDescriptorsTable.ts
│   │       ├── characterIdentityTable.ts
│   │       ├── characterActionsCombatTable.ts
│   │       ├── characterActionsGeneralTable.ts
│   │       ├── cavernDescriptorsTable.ts
│   │       ├── dungeonDescriptorsTable.ts
│   │       ├── animalActionsTable.ts
│   │       ├── adventureToneTable.ts
│   │       └── ... (35+ more tables)
│   │
│   └── data/
│       └── tableMetadata.ts      # Updated with Mythic tables
│
└── ... (existing structure)
```

---

## Data Model Examples

### Example Fate Chart Table Entry
```typescript
// This table is special - 2D lookup not 1D roll
export class FateChartTable extends Table {
  constructor() {
    super(
      TableTitles.FateChart,
      new DiceRole(DiceTypes.D100), // Still need for compatibility
      [/* special 2D data structure */]
    );
  }

  // Override for 2D lookup
  getFateResult(odds: OddsLevel, chaosFactor: number): FateResult {
    // Return {exceptionalYes: number, yes: number, exceptionalNo: number}
  }
}
```

### Example Meaning Table
```typescript
export class ActionsTable1 extends Table {
  constructor() {
    super(
      'Actions Table 1',
      new DiceRole(DiceTypes.D100),
      [
        new TableEntry([1, 1], 'Abandon'),
        new TableEntry([2, 2], 'Accompany'),
        // ... all 100 entries
      ]
    );
  }
}
```

### Session State Example
```typescript
const exampleSession: SoloRpgSession = {
  id: 'uuid-here',
  adventureName: 'The Lost Temple',
  chaosFactor: 5,
  threads: [
    { id: '1', text: 'Find the ancient artifact', position: 1, completed: false },
    { id: '2', text: 'Escape the jungle', position: 2, completed: false }
  ],
  characters: [
    { id: '1', name: 'Rival Explorer', description: 'Wants the artifact too', position: 1, active: true }
  ],
  scenes: [
    {
      number: 1,
      type: 'First',
      description: 'Arrive at temple entrance',
      chaosFactorBefore: 5,
      chaosFactorAfter: 5,
      notes: 'Found strange markings'
    }
  ],
  currentScene: 1,
  fateQuestionHistory: [],
  randomEventHistory: [],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

---

## Testing Plan

### Unit Tests
- Fate Chart lookups (all Odds × CF combinations)
- Chaos Factor adjustments (bounds checking 1-9)
- List dice rolling (correct dice for section counts)
- Session CRUD operations
- Storage save/load

### Integration Tests
- Complete Fate Question flow
- Random Event generation
- Scene testing workflow
- List management with dice rolls

### User Acceptance Testing
- Solo play a short adventure
- Use all core features
- Save and reload session
- Browse Mythic tables
- Reference rules during play

---

## Success Criteria

✅ All 45+ Mythic tables browsable in /tables with "mythic-solo-rpg" tags
✅ Solo RPG session UI functional at /solo-rpg
✅ Can ask Fate Questions with proper Chaos Factor integration
✅ Can generate Random Events with Event Focus + Meaning
✅ Can test Expected Scenes and handle Altered/Interrupt
✅ Can manage Threads and Characters Lists
✅ Sessions persist in localStorage
✅ Rules and table references accessible during play
✅ Tables have special rendering where needed (Fate Chart, dual rolls)
✅ Navigation updated with Solo RPG link

---

## Technical Considerations

### Table Implementation Strategy
- Mythic tables should extend the existing `Table` class
- Most tables are straightforward 1d100 → text
- Fate Chart needs custom logic (2D lookup)
- Dual-roll tables can use existing cascade system or special UI flag

### State Management
- Use Svelte 5 runes ($state, $derived, $effect)
- Store in localStorage for persistence
- Consider IndexedDB for larger sessions (future)

### Performance
- Lazy load Mythic tables (already supported by tableMetadata system)
- Session auto-save debounced (500ms delay)
- Limit history storage (last 50 fate questions, 50 events)

### Accessibility
- Keyboard navigation for all tools
- ARIA labels for dice rolls and results
- Screen reader friendly list management
- Focus management for modal/panel interactions

---

## Questions to Resolve

1. **Table Naming Convention** - Should Mythic tables have "Mythic:" prefix or rely on tags/category?
2. **Chaos Factor UI** - Slider, +/- buttons, or direct number input?
3. **List Capacity** - Should we enforce 25-item limit or allow more?
4. **Multiple Sessions** - How many simultaneous games should we support?
5. **Export Format** - What format for adventure journal export?
6. **Mobile Priority** - Should mobile UI be prioritized in initial release?

---

## Timeline Estimate

- **Sprint 1 (Foundation):** 1-2 weeks
- **Sprint 2 (Core UI):** 2-3 weeks
- **Sprint 3 (Events & Scenes):** 1-2 weeks
- **Sprint 4 (Complete Tables):** 2-3 weeks
- **Sprint 5 (Polish):** 1-2 weeks
- **Sprint 6 (Advanced - Optional):** 2-4 weeks

**Total:** 7-12 weeks for full implementation (excluding optional features)

**Minimum Viable Product (MVP):** Sprints 1-3 = 4-7 weeks

---

## Next Steps

1. ✅ Review and approve this plan
2. 🔲 Decide on open questions (naming, UI choices)
3. 🔲 Start Sprint 1: Create first 10 Mythic tables
4. 🔲 Update tableType and tableMetadata
5. 🔲 Verify tables appear in browser
6. 🔲 Begin Solo RPG UI mockups
7. 🔲 Implement core session state management

---

*This plan provides a roadmap for fully integrating Mythic GME into Inspire Tables, creating a powerful solo RPG play environment while maintaining the existing table browser functionality.*
