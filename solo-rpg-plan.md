# Solo RPG Integration Plan - Mythic GME (Comprehensive)

## Overview
Integrate the Mythic Game Master Emulator 2nd Edition system into the Inspire Tables webapp to support solo RPG gameplay. This will add a dedicated solo RPG section with tools for managing adventures, plus incorporate all Mythic tables into the existing table system with proper tagging.

## Goals
1. **Solo RPG Player Support** - Create a dedicated UI to help players run solo adventures using Mythic GME
2. **Table Integration** - Add all 42+ Mythic tables to the existing table browser with "mythic-solo-rpg" tags
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

### 1.2 Complete Table Enumeration

All 42+ Mythic Tables to implement:

#### Core Mechanic Tables (3)
1. **Fate Chart Table** - 2D lookup (Odds × Chaos Factor) → percentages
2. **Event Focus Table** - 1d100 → 12 event types
3. **Scene Adjustment Table** - 1d10 → 7 adjustment types

#### Meaning Tables - Actions (2)
4. **Actions Table 1** - 1d100 → action words
5. **Actions Table 2** - 1d100 → action/concept words

#### Meaning Tables - Descriptions (2)
6. **Descriptions Table 1** - 1d100 → descriptive adverbs
7. **Descriptions Table 2** - 1d100 → descriptive adjectives

#### Meaning Tables - Core Elements (3)
8. **Locations Elements** - 1d100 → location descriptors
9. **Characters Elements** - 1d100 → character descriptors
10. **Objects Elements** - 1d100 → object descriptors

#### Meaning Tables - Character Elements (11)
11. **Character Appearance** - Physical description
12. **Character Background** - History and upbringing
13. **Character Conversations** - How they speak/what they discuss
14. **Character Descriptors** - Personality and demeanor
15. **Character Identity** - Role/archetype
16. **Character Motivations** - What drives them
17. **Character Personality** - Core traits
18. **Character Skills** - What they're good at
19. **Character Traits & Flaws** - Strengths and weaknesses
20. **Character Actions, Combat** - What they do in battle
21. **Character Actions, General** - General actions

#### Meaning Tables - Location/Environment Elements (10)
22. **Cavern Descriptors** - Underground/cave features
23. **City Descriptors** - Urban environment
24. **Civilization Descriptors** - Cultural/societal traits
25. **Domicile Descriptors** - Buildings/homes
26. **Dungeon Descriptors** - Fortresses/dungeons
27. **Forest Descriptors** - Woodland features
28. **Terrain Descriptors** - General landscape
29. **Wasteland Descriptors** - Desolate areas
30. **Starship Descriptors** - Sci-fi spacecraft

#### Meaning Tables - Creature/Entity Elements (4)
31. **Animal Actions** - Wild animal behavior
32. **Creature Descriptors** - Monsters/beasts
33. **Undead Descriptors** - Undead creatures
34. **Alien Species Descriptors** - Sci-fi aliens

#### Meaning Tables - Military/Combat (1)
35. **Army Descriptors** - Military forces

#### Meaning Tables - Objects/Items (2)
36. **Magic Item Descriptors** - Enchanted items
37. **Mutation Descriptors** - Physical mutations

#### Meaning Tables - Meta/Narrative (2)
38. **Adventure Tone** - Overall adventure mood
39. **Plot Twists** - Major narrative changes

#### Optional/Variations Tables (3)
40. **NPC Behavior Table** - Quick NPC action determination
41. **Fate Check Modifiers** - Alternative method reference
42. **Chaos Flavor Variants** - Alternative Fate Charts (Mid/Low/No-Chaos)

**Total: 42 tables minimum**

### 1.3 Core Data Structures

**File:** `src/lib/tables/mythicTables/types.ts`

#### Odds Level Enumeration
```typescript
export enum OddsLevel {
  Impossible = 'Impossible',
  NearlyImpossible = 'Nearly Impossible',
  VeryUnlikely = 'Very Unlikely',
  Unlikely = 'Unlikely',
  FiftyFifty = '50/50',
  Likely = 'Likely',
  VeryLikely = 'Very Likely',
  NearlyCertain = 'Nearly Certain',
  Certain = 'Certain'
}

// Ordered array for UI dropdowns
export const ODDS_LEVELS = [
  OddsLevel.Impossible,
  OddsLevel.NearlyImpossible,
  OddsLevel.VeryUnlikely,
  OddsLevel.Unlikely,
  OddsLevel.FiftyFifty,
  OddsLevel.Likely,
  OddsLevel.VeryLikely,
  OddsLevel.NearlyCertain,
  OddsLevel.Certain
];
```

#### Event Focus Enumeration
```typescript
export enum EventFocus {
  RemoteEvent = 'Remote Event',
  AmbiguousEvent = 'Ambiguous Event',
  NewNPC = 'New NPC',
  NPCAction = 'NPC Action',
  NPCNegative = 'NPC Negative',
  NPCPositive = 'NPC Positive',
  MoveTowardThread = 'Move Toward A Thread',
  MoveAwayFromThread = 'Move Away From A Thread',
  CloseThread = 'Close A Thread',
  PCNegative = 'PC Negative',
  PCPositive = 'PC Positive',
  CurrentContext = 'Current Context'
}

// Event Focus with roll ranges
export const EVENT_FOCUS_RANGES = [
  { range: [1, 5], focus: EventFocus.RemoteEvent },
  { range: [6, 10], focus: EventFocus.AmbiguousEvent },
  { range: [11, 20], focus: EventFocus.NewNPC },
  { range: [21, 40], focus: EventFocus.NPCAction },
  { range: [41, 45], focus: EventFocus.NPCNegative },
  { range: [46, 50], focus: EventFocus.NPCPositive },
  { range: [51, 55], focus: EventFocus.MoveTowardThread },
  { range: [56, 65], focus: EventFocus.MoveAwayFromThread },
  { range: [66, 70], focus: EventFocus.CloseThread },
  { range: [71, 80], focus: EventFocus.PCNegative },
  { range: [81, 85], focus: EventFocus.PCPositive },
  { range: [86, 100], focus: EventFocus.CurrentContext }
];
```

#### Scene Adjustment Types
```typescript
export enum SceneAdjustment {
  RemoveCharacter = 'Remove A Character',
  AddCharacter = 'Add A Character',
  ReduceRemoveActivity = 'Reduce/Remove An Activity',
  IncreaseActivity = 'Increase An Activity',
  RemoveObject = 'Remove An Object',
  AddObject = 'Add An Object',
  MakeTwoAdjustments = 'Make 2 Adjustments'
}
```

### 1.4 Update Table Metadata
**File:** `src/lib/data/tableMetadata.ts`

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

Add new category with all Mythic tables:
```typescript
{
  type: TableType.SoloRPG,
  tables: [
    // Core Mechanics
    {
      title: 'Fate Chart',
      type: TableType.SoloRPG,
      importPath: 'mythicTables/fateChartTable',
      className: 'FateChartTable',
      tags: ['mythic', 'solo-rpg', 'gme', 'core'],
      system: 'mythic-gme-2e'
    },
    {
      title: 'Event Focus',
      type: TableType.SoloRPG,
      importPath: 'mythicTables/eventFocusTable',
      className: 'EventFocusTable',
      tags: ['mythic', 'solo-rpg', 'gme', 'core'],
      system: 'mythic-gme-2e'
    },
    // ... all 42 tables with tags
  ]
}
```

### 1.5 Example Table Implementations

#### Fate Chart Table (Special 2D Lookup)
```typescript
export class FateChartTable extends Table {
  constructor() {
    super(
      'Fate Chart',
      new DiceRole(DiceTypes.D100),
      []  // Special handling, no regular entries
    );
  }

  // Override for 2D lookup
  getFateResult(odds: OddsLevel, chaosFactor: number): {
    exceptionalYes: number,
    yes: number,
    exceptionalNo: number
  } {
    // Return thresholds from 2D data structure
    return FATE_CHART_DATA[odds][chaosFactor];
  }
}
```

#### Standard Meaning Table
```typescript
export class ActionsTable1 extends Table {
  constructor() {
    super(
      'Actions Table 1',
      new DiceRole(DiceTypes.D100),
      [
        new TableEntry([1, 1], 'Abandon'),
        new TableEntry([2, 2], 'Accompany'),
        new TableEntry([3, 3], 'Activate'),
        // ... all 100 entries
      ]
    );
  }
}
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

### 2.2 Session State Management
**File:** `src/lib/stores/soloRpgStore.ts`

Complete session state interface:

```typescript
interface SoloRpgSession {
  id: string;
  adventureName: string;
  adventureDescription?: string;
  chaosFactor: number;  // 1-9

  // Lists
  threads: Thread[];
  characters: CharacterListEntry[];

  // Scenes
  scenes: Scene[];
  currentSceneNumber: number;

  // History
  fateQuestionHistory: FateQuestion[];
  randomEventHistory: RandomEvent[];

  // Settings
  useFateCheck: boolean;  // Use 2d10 instead of d100
  chaosFlavor: 'standard' | 'mid' | 'low' | 'none';

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastPlayedAt: Date;
}

interface Thread {
  id: string;
  text: string;
  position: number;  // 1-25
  completed: boolean;
  createdInScene: number;
  completedInScene?: number;
}

interface CharacterListEntry {
  id: string;
  name: string;
  description: string;
  position: number;  // 1-25
  active: boolean;
  isNPC: boolean;
  createdInScene: number;
}

interface Scene {
  number: number;
  type: 'First' | 'Expected' | 'Altered' | 'Interrupt';
  expectedDescription?: string;  // What player expected
  actualDescription: string;     // What actually happened
  chaosFactorBefore: number;
  chaosFactorAfter: number;
  fateQuestionsAsked: number;
  randomEventsOccurred: number;
  threadsAdded: string[];
  threadsRemoved: string[];
  charactersAdded: string[];
  charactersRemoved: string[];
  notes: string;
  timestamp: Date;
}

interface FateQuestion {
  id: string;
  sceneNumber: number;
  question: string;
  odds: OddsLevel;
  chaosFactor: number;
  roll: number;  // 1-100 or 2-20 for Fate Check
  method: 'chart' | 'check';
  answer: 'Yes' | 'No' | 'Exceptional Yes' | 'Exceptional No';
  threshold: number;  // The percentage threshold
  randomEvent: boolean;
  randomEventDetails?: RandomEvent;
  playerInterpretation?: string;
  timestamp: Date;
}

interface RandomEvent {
  id: string;
  sceneNumber: number;
  context: string;  // Player's notes about current situation
  focus: EventFocus;
  focusRoll?: number;
  focusChosen: boolean;  // Was it chosen or rolled?

  // For NPC/Thread focuses
  involvedThread?: string;
  involvedCharacter?: string;
  listRoll?: string;  // e.g., "d6: 3, d10: 7"

  // Meaning
  meaningTable1: string;  // e.g., "Actions Table 1"
  meaningRoll1: number;
  meaningResult1: string;
  meaningTable2?: string;
  meaningRoll2?: number;
  meaningResult2?: string;

  playerInterpretation: string;
  timestamp: Date;
}
```

**Store Functions:**
- `createSession(name, description)` - Start new game
- `loadSession(id)` - Load existing game
- `saveSession()` - Persist to localStorage (debounced 500ms)
- `updateChaosFactor(delta)` - Adjust CF with bounds checking
- `addThread(text)` - Add goal
- `removeThread(id)` - Remove goal
- `completeThread(id)` - Mark complete
- `addCharacter(name, description)` - Add NPC
- `removeCharacter(id)` - Remove NPC
- `rollFateQuestion(question, odds)` - Execute fate roll
- `generateRandomEvent(context, focus?)` - Generate event
- `addScene(scene)` - Record scene
- `endScene(notes)` - Complete current scene

### 2.3 Core Components
**Location:** `src/lib/components/solorpg/`

#### GameSession.svelte
Main container component:
- Orchestrates all sub-components
- Manages active tab state
- Displays session header (name, save/load buttons)
- Quick action buttons sidebar

#### ChaosFactorPanel.svelte
Chaos Factor management:
- Large visual display of current CF (1-9)
- Circular gauge or slider visualization
- +/- increment buttons with keyboard support
- Tooltip: "Higher = more chaos and surprises"
- Warning indicators at extremes (1 or 9)
- Shows impact on Fate Questions

#### ListsPanel.svelte
Container for both lists with sub-components:

**ThreadsList.svelte:**
- Visual sections 1-5 (5 entries each)
- Filled/empty circle indicators per section
- Add new thread (text input + position)
- Mark complete (checkbox)
- Delete thread
- Roll dice to select random thread
- Auto-determine dice (d10, d4+d10, d6+d10, etc.)

**CharactersList.svelte:**
- Same structure as Threads
- Name + description fields
- Mark inactive (toggle)
- Roll to select random character

**Visual Design:**
```
┌─────────────────────┬─────────────────────┐
│ THREADS             │ CHARACTERS          │
├─────────────────────┼─────────────────────┤
│ Section 1 (1-5) ●   │ Section 1 (1-5) ●   │
│ ┌─────────────────┐ │ ┌─────────────────┐ │
│ │1. Find artifact │ │ │1. Guard Captain │ │
│ │2. Escape castle │ │ │2. Rival thief   │ │
│ │3. [empty]       │ │ │3. Wizard ally   │ │
│ │4. [empty]       │ │ │4. [empty]       │ │
│ │5. [empty]       │ │ │5. [empty]       │ │
│ └─────────────────┘ │ └─────────────────┘ │
│                     │                     │
│ Section 2 (6-10) ○  │ Section 2 (6-10) ○  │
│                     │                     │
│ [+ Add] [🎲 Roll]   │ [+ Add] [🎲 Roll]   │
│ Dice needed: d10    │ Dice needed: d10    │
└─────────────────────┴─────────────────────┘
```

#### FateQuestion.svelte
Interactive Fate Question interface:

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Fate Question                               │
├─────────────────────────────────────────────┤
│ Your Question:                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Is the guard hostile?                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Odds: [Dropdown: Likely ▼]                 │
│ Chaos Factor: 5                             │
│ Estimated Probability: ~65%                 │
│                                             │
│ [ Ask Fate ]                                │
│                                             │
│ Result: YES                                 │
│ ┌───────────────────────────────────────┐   │
│ │ ████████████████░░░░░░░░░░ 65%       │   │
│ │ You rolled: 47                        │   │
│ │ Threshold: ≤ 65                       │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ Interpretation:                             │
│ ┌─────────────────────────────────────────┐ │
│ │ The guard sees us and draws his sword  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Complete Workflow (7 steps):**
1. **Input Phase**: Question + Odds + show CF + estimated probability
2. **Roll Phase**: Animate d100 roll
3. **Random Event Detection**: Check doubles AND single digit ≤ CF
4. **Random Event Handling**: If triggered, open modal, generate, return to question
5. **Answer Determination**: Look up threshold, determine Yes/No/Exceptional
6. **Interpretation Phase**: Show guide, optional notes
7. **Logging**: Save to history, update stats

#### RandomEventGenerator.svelte
Random Event generation interface:

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Random Event                                │
├─────────────────────────────────────────────┤
│ Context:                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ Sneaking through castle at night...    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Event Focus:  [Roll] [Choose]              │
│ Result: NPC Action → "Castle Guard"        │
│                                             │
│ Meaning:                                    │
│ Table 1: Actions Table 1                   │
│ Rolled: 34 → "Destroy"                     │
│                                             │
│ Table 2: Objects Elements                  │
│ Rolled: 56 → "Light"                       │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Combine: Guard + Destroy + Light       │ │
│ │                                         │ │
│ │ Interpretation:                         │ │
│ │ The guard smashes a nearby lantern to  │ │
│ │ plunge the corridor into darkness...   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [ Log Event ] [ Generate Another ]          │
└─────────────────────────────────────────────┘
```

**Complete Workflow (7 steps):**
1. **Context Input**: Auto-populate, allow editing
2. **Event Focus**: Roll or Choose with suggestions
3. **List Rolling**: If NPC/Thread focus, roll on list, handle "Choose"
4. **Meaning Table Selection**: Smart suggestions, choose 1-2 tables
5. **Meaning Rolling**: Roll d100 twice, show word pairs
6. **Interpretation**: Large textarea with helper prompts
7. **Application**: Suggest list updates, log event

#### SceneManager.svelte
Scene management interface:
- Scene number display
- "Expected Scene" input textarea
- "Test Scene" button (rolls d10 vs CF)
- Scene type result display
- Scene Adjustment roller (for Altered)
- Scene history timeline

**Scene Transition Workflow (7 steps):**
1. **End Current Scene**: Open bookkeeping modal
2. **Create Expected Scene**: Textarea with auto-suggestions
3. **Test Scene**: Roll d10, animate
4. **Determine Type**: Expected/Altered/Interrupt based on roll
5. **Handle Altered**: Roll on Scene Adjustment Table
6. **Handle Interrupt**: Generate Random Event
7. **Begin New Scene**: Increment counter, display

#### SceneBookkeeping.svelte
End-of-scene checklist modal:
- Scene summary textarea
- Chaos Factor adjustment (radio: Increase/No Change/Decrease)
- Quick threads checkboxes (mark complete, add new)
- Quick characters management
- Stats: "Fate Questions: X, Random Events: X"
- "Complete Scene & Continue" button

#### FirstSceneCreator.svelte
Modal for first scene with 4 methods:

**Method 1: Inspired Idea**
- Free text input
- Optional "Need inspiration?" button → rolls Meaning Tables

**Method 2: Random Event**
- Event Focus roller
- Meaning Tables roller
- Interpretation guide

**Method 3: Meaning Tables**
- Table picker (choose 1-2)
- Roll d100 twice per table
- Display word pairs

**Method 4: 4W Method**
- WHO: Roll on Character Identity
- WHAT: Roll on Actions
- WHERE: Roll on Locations
- WHY: Roll on Motivations
- Combine into scene concept

#### ContextTracker.svelte
Current situation at-a-glance:
- Current scene summary
- Active threads (top 3-5)
- Recent NPCs (last 3-5)
- Last 3 Random Events
- Last 2 Fate Questions

Purpose: Help player remember context for decisions

#### MeaningTablePicker.svelte
Smart table selection:
- Category browser (Actions, Descriptions, Characters, etc.)
- Smart suggestions based on Event Focus:
  - NPC Action → Character Actions
  - New NPC → Character Descriptors + Identity
  - PC Negative → Actions + Descriptions
- Favorites/Recent tables
- Multi-table workflow
- Visual result display

#### AdventureJournal.svelte
Complete session history:
- Timeline view of all scenes
- Expandable entries with full details
- Search and filter (by type, thread, character, date)
- Export options (Markdown, Plain Text, JSON)
- Print-friendly view

#### FateCheckCalculator.svelte
Alternative 2d10 method:
- 2d10 roller display
- Odds modifier selector
- CF modifier display
- Calculation breakdown
- Random Event detection
- Toggle between Chart/Check methods

#### ListRoller.svelte
Intelligent list rolling:
- Display list with sections
- Auto-determine dice needed
- Animated roll
- Highlight selected entry
- Handle "Choose" (empty lines)

#### DiceVisualizer.svelte
Animated dice rolling:
- 3D or 2D dice animations
- Support d4, d6, d8, d10, d100
- Visual feedback for special results
- Percentage bar for Fate Questions
- Color coding (green/red)

#### QuickReference.svelte
Collapsible quick reference panels:
- Fate Chart quick view
- Odds examples
- Event Focus reference
- Common workflows

#### RulesReference.svelte
Embedded rules documentation:
- Parse solo-rpg.md
- Collapsible sections
- Search functionality
- Links to tables

#### TablesReference.svelte
Embedded tables documentation:
- Parse solo-rpg-tables.md
- Quick lookup
- Compact table display

### 2.4 Layout Design

**Desktop (> 1024px) - Three-column:**
```
┌─────┬─────────┬──────┐
│Lists│  Main   │Quick │
│ &   │  Play   │ Ref  │
│Chaos│  Area   │      │
└─────┴─────────┴──────┘
```

**Tablet (768px - 1024px) - Two-column:**
```
┌──────────┬──────────┐
│ Lists &  │          │
│ Controls │  Main    │
│          │  Area    │
└──────────┴──────────┘
```

**Mobile (< 768px) - Stacked:**
```
┌─────────────────┐
│ Chaos Factor: 5 │
├─────────────────┤
│ Tabs:           │
│ [Play][Lists][History]
├─────────────────┤
│  Active Tab     │
│  Content        │
└─────────────────┘
```

---

## Phase 3: Smart Features & Helpers

### 3.1 Context-Aware Suggestions

**Fate Question Odds Suggestions:**
- Analyze NPC description: "Enemy" → Very Likely hostile
- Check relationships: "Ally" → Very Unlikely hostile
- Default to 50/50 for unknowns

**Event Focus Suggestions:**
- Scene just started → Current Context/Ambiguous Event
- Multiple active threads → Move Toward/Away Thread
- Few NPCs → New NPC
- Many NPCs → NPC Action

**Meaning Table Suggestions:**
- NPC Action → Character Actions tables
- New NPC → Character Descriptors + Identity
- PC Negative → Actions + Descriptions
- Remote Event → Locations + Actions

### 3.2 Auto-Logging Features
Automatic tracking:
- Time spent per scene
- Fate Questions per scene
- Random Events per scene
- Thread completion rate
- Most used Meaning Tables
- Chaos Factor trend graph

### 3.3 Quick Actions Sidebar
Always-visible buttons:
- 🎲 Quick Fate Question
- ⚡ Quick Random Event
- 📝 Quick Note
- ➕ Quick Add (Thread/Character)
- 📊 Session Stats

**Keyboard Shortcuts:**
- `F` - Fate Question
- `R` - Random Event
- `N` - New Scene
- `S` - Scene Bookkeeping
- `J` - Journal

---

## Phase 4: Data Validation & Error Handling

### 4.1 Validation Rules

**Chaos Factor:**
- Must be 1-9 (enforce bounds)
- Show warning at extremes
- Prevent out-of-bounds

**Lists:**
- Max 25 entries enforced
- Warn at 20 entries
- Cannot add to sections 2-5 if previous empty

**Fate Questions:**
- Question cannot be empty
- Must select Odds
- Roll must be 1-100

**Scenes:**
- Must have description
- Auto-increment scene number
- Cannot skip numbers

### 4.2 Error States

**Empty Lists:**
- "No characters in list. Add one or choose different Event Focus."

**No Active Threads:**
- "No active threads. Add a goal or choose different Event Focus."

**Invalid Rolls:**
- "Roll must be 1-100"

### 4.3 Loading States

**Dice Rolls:**
- Animated rolling (1-2 seconds)
- Disable buttons during animation
- Show "Rolling..." text

**Session Load:**
- Loading spinner
- Progress: "Loading scenes... X/Y"

**Table Load:**
- Lazy load
- Skeleton UI while loading

---

## Phase 5: Utility Functions

### 5.1 Dice Utilities
**File:** `src/lib/utils/mythicDice.ts`

```typescript
export function rollD10(): number;
export function rollD100(): number;
export function roll2D10(): { dice1: number, dice2: number, total: number };
export function isDoubles(roll: number): boolean;
export function getSingleDigit(roll: number): number;
export function checkRandomEvent(roll: number, chaosFactor: number): boolean;
export function getFateResult(roll: number, threshold: number, exceptionalLow: number, exceptionalHigh: number): FateAnswer;
export function rollOnList(elementCount: number): { section: number, line: number, total: number };
```

### 5.2 Fate Chart Utilities
**File:** `src/lib/utils/fateChart.ts`

```typescript
export function getFateThreshold(odds: OddsLevel, chaosFactor: number): {
  exceptionalYes: number,
  yes: number,
  exceptionalNo: number
};

export function calculateFateCheck(
  dice1: number,
  dice2: number,
  oddsModifier: number,
  cfModifier: number
): {
  total: number,
  answer: FateAnswer
};

export const FATE_CHART_DATA: Record<OddsLevel, Record<number, {low: number, mid: number, high: number}>>;
```

### 5.3 Event Focus Utilities
**File:** `src/lib/utils/eventFocus.ts`

```typescript
export function getEventFocus(roll: number): EventFocus;
export function needsListRoll(focus: EventFocus): 'threads' | 'characters' | null;
export function suggestMeaningTables(focus: EventFocus): string[];
```

---

## Phase 6: Table Browser Integration

### 6.1 Add Filter by Tags
**File:** `src/routes/tables/+page.svelte`

Add filtering capabilities:
- "Filter by System" dropdown (All, Inspire Tables, Mythic GME)
- Tag filter chips (mythic, solo-rpg, gme, core, character, location, etc.)
- Search by table name

### 6.2 Visual Indicators
Add badges/icons to tables:
- "Mythic GME" badge on all Mythic tables
- System indicator in table cards
- Tag display in table detail view

### 6.3 Mythic Category
Ensure "Solo RPG" appears in category sidebar with count.

---

## Phase 7: Special Table Handling

### 7.1 Fate Chart Special Renderer
**File:** `src/lib/components/tables/FateChartRenderer.svelte`

2D interactive grid:
- Select Odds + CF → show result range
- Hover highlights
- Click for details
- Show Exceptional thresholds

### 7.2 Dual Roll Tables
Many Meaning Tables need two rolls:
- "Roll Twice" button
- Display results side-by-side
- Combined interpretation area

### 7.3 Cascade to Meaning Tables
Smart cascading:
- "NPC Action" → auto-roll on Characters List → suggest Meaning Tables
- "Move Toward Thread" → select Thread → suggest tables

---

## Phase 8: Storage & Persistence

### 8.1 LocalStorage
**File:** `src/lib/utils/soloRpgStorage.ts`

Functions:
- `saveSessions(sessions)` - Save all
- `loadSessions()` - Load all
- `saveCurrentSession(session)` - Auto-save (debounced 500ms)
- `deleteSession(id)` - Remove
- `exportSession(id)` - JSON download
- `importSession(json)` - JSON upload

### 8.2 Session Management UI
**File:** `src/lib/components/solorpg/SessionManager.svelte`

Features:
- List all saved sessions
- Create new / Load / Delete
- Export/Import (JSON)
- Last played timestamps

### 8.3 Auto-save
Triggers:
- Chaos Factor change
- List updates
- Scene completion
- Every Fate Question
- Every Random Event

---

## Phase 9: Documentation Integration

### 9.1 Embed Rules Reference
Parse and render solo-rpg.md:
- Collapsible sections
- Search functionality
- Direct table links

### 9.2 Table Reference
Parse and render solo-rpg-tables.md:
- Quick percentage lookup
- Compact table display

### 9.3 Help Tooltips
Contextual help throughout:
- Chaos Factor: "What does this do?"
- Fate Questions: "How to phrase"
- Event Focus: "When to choose vs roll"
- Scene types: Explain each

---

## Phase 10: Navigation & Home Updates

### 10.1 Add to Main Navigation
**File:** `src/routes/+page.svelte`

New button:
```html
<a href="/solo-rpg"
   class="group relative px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 ...">
  <span class="text-3xl">🎭</span>
  <span>Solo RPG</span>
</a>
```

### 10.2 Featured Table
Add Mythic table to featured section (Event Focus or Actions)

### 10.3 Update Header
Include /solo-rpg link in app navigation

---

## Phase 11: Accessibility

### 11.1 Screen Reader Support
**ARIA Labels:**
- "Rolling d100... Result: 47"
- "Fate Question result: Yes"
- "Random Event: NPC Action"
- "New scene: Altered Scene"

**Focus Management:**
- After roll, focus moves to result
- After modal close, return to trigger
- Keyboard nav through all elements

### 11.2 Visual Accessibility
- High contrast mode (WCAG AA 4.5:1)
- Color not sole indicator (icons + text)
- Scalable fonts (100% to 200%)

### 11.3 Keyboard Navigation
- Tab through all controls
- Enter/Space to activate
- Arrow keys for lists
- Escape to close modals

---

## Phase 12: Performance Optimization

### 12.1 Lazy Loading
**Tables:** On-demand, cached in memory
**History:** Paginated (10 items at a time), virtual scrolling

### 12.2 Debouncing
**Auto-save:** 500ms after last change
**Search:** 300ms delay

### 12.3 Memoization
- Fate Chart lookups
- Event Focus suggestions
- Dice requirements for lists

---

## Phase 13: Testing Plan

### 13.1 Unit Tests

**Dice Tests:**
- `rollD100()` returns 1-100
- `isDoubles()` identifies 11, 22, 33, etc.
- `checkRandomEvent()` logic for all CF
- `rollOnList()` correct dice for counts

**Fate Chart Tests:**
- All 81 combinations (9 Odds × 9 CF)
- Exceptional thresholds correct
- Fate Check modifiers apply

**Event Focus Tests:**
- All ranges map correctly
- `needsListRoll()` identifies correctly

**List Tests:**
- Dice for 1, 5, 6, 10, 15, 20, 25 elements
- Empty line handling
- Position validation (1-25)

### 13.2 Integration Tests

**Complete Workflows:**
- First Scene (all 4 methods)
- Fate Question with Random Event
- Random Event with NPC Action (cascading)
- Scene transition (all 3 types)
- Scene Bookkeeping (full cycle)

**Session Persistence:**
- Save → reload → verify
- Auto-save triggers
- Export → import

### 13.3 E2E Tests

**Full Adventure Playthrough:**
1. Create session
2. Create first scene (4W)
3. Ask 3 Fate Questions (1 triggers event)
4. Complete scene
5. Expected → Altered
6. Apply adjustment
7. Play scene
8. Expected → Interrupt
9. Generate event
10. Save
11. Reload
12. Continue
13. Export journal

---

## Implementation Order (Refined)

### Sprint 1: Core Tables (3-4 weeks)
**Week 1: Foundation (9 tables)**
- Add TableType.SoloRPG
- Create types.ts with enums
- Fate Chart, Event Focus, Scene Adjustment
- Actions 1 & 2, Descriptions 1 & 2
- Core Elements: Locations, Characters, Objects
- **Deliverable:** 9 core tables functional

**Week 2: Character Tables (11 tables)**
- All Character Elements tables (Appearance through Actions)
- **Deliverable:** Full character generation

**Week 3: Location/Environment Tables (10 tables)**
- Cavern through Starship Descriptors
- **Deliverable:** Rich location descriptions

**Week 4: Remaining Tables (12 tables)**
- Creature, Military, Objects, Meta tables
- Testing, refinement, special renderers
- **Deliverable:** Complete 42-table library

### Sprint 2: Core UI (3-4 weeks)
**Week 1: Fate & Events**
- FateQuestion.svelte with full workflow
- RandomEventGenerator.svelte with cascading
- DiceVisualizer.svelte
- **Deliverable:** Basic Q&A gameplay

**Week 2: Chaos & Lists**
- ChaosFactorPanel.svelte
- ListsPanel.svelte (Threads + Characters)
- ListRoller.svelte
- **Deliverable:** Full list management

**Week 3: Scene Management**
- SceneManager.svelte
- SceneBookkeeping.svelte
- FirstSceneCreator.svelte (4 methods)
- **Deliverable:** Complete scene workflow

**Week 4: Session & State**
- soloRpgStore.ts with all state
- SessionManager.svelte
- GameSession.svelte orchestration
- **Deliverable:** Functional solo RPG MVP

### Sprint 3: Enhanced UI (2-3 weeks)
**Week 1: Context & Journal**
- ContextTracker.svelte
- AdventureJournal.svelte with export
- MeaningTablePicker.svelte
- **Deliverable:** Enhanced player tools

**Week 2: Special Features**
- FateCheckCalculator.svelte
- FateChartRenderer.svelte
- Quick Actions sidebar
- Keyboard shortcuts
- **Deliverable:** Polished experience

**Week 3: Polish & Refinement**
- Smart suggestions
- Auto-logging
- Error handling
- Loading states
- **Deliverable:** Production-quality UI

### Sprint 4: Persistence & Documentation (2 weeks)
**Week 1: Storage**
- soloRpgStorage.ts
- Auto-save implementation
- Export/Import sessions
- **Deliverable:** Full persistence

**Week 2: Documentation & Help**
- RulesReference.svelte
- TablesReference.svelte
- Help tooltips
- Tutorial system
- **Deliverable:** Complete documentation

### Sprint 5: Testing & Launch (1-2 weeks)
**Week 1: Testing**
- Unit tests
- Integration tests
- E2E tests
- **Deliverable:** Tested system

**Week 2: Launch Prep**
- Bug fixes
- Performance optimization
- Mobile testing
- **Deliverable:** Launch-ready feature

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
│   │   ├── solorpg/
│   │   │   ├── GameSession.svelte
│   │   │   ├── ChaosFactorPanel.svelte
│   │   │   ├── ListsPanel.svelte
│   │   │   ├── ThreadsList.svelte
│   │   │   ├── CharactersList.svelte
│   │   │   ├── FateQuestion.svelte
│   │   │   ├── RandomEventGenerator.svelte
│   │   │   ├── SceneManager.svelte
│   │   │   ├── SceneBookkeeping.svelte
│   │   │   ├── FirstSceneCreator.svelte
│   │   │   ├── ContextTracker.svelte
│   │   │   ├── MeaningTablePicker.svelte
│   │   │   ├── AdventureJournal.svelte
│   │   │   ├── FateCheckCalculator.svelte
│   │   │   ├── ListRoller.svelte
│   │   │   ├── DiceVisualizer.svelte
│   │   │   ├── QuickReference.svelte
│   │   │   ├── RulesReference.svelte
│   │   │   ├── TablesReference.svelte
│   │   │   └── SessionManager.svelte
│   │   └── tables/
│   │       └── FateChartRenderer.svelte
│   │
│   ├── stores/
│   │   └── soloRpgStore.ts       # Session state management
│   │
│   ├── utils/
│   │   ├── soloRpgStorage.ts     # LocalStorage helpers
│   │   ├── mythicDice.ts         # Dice rolling utilities
│   │   ├── fateChart.ts          # Fate Chart lookups
│   │   └── eventFocus.ts         # Event Focus helpers
│   │
│   ├── tables/
│   │   ├── tableType.ts          # Updated with SoloRPG
│   │   └── mythicTables/         # NEW FOLDER - 42+ tables
│   │       ├── types.ts          # Enums and constants
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
│   │       ├── characterAppearanceTable.ts
│   │       ├── characterBackgroundTable.ts
│   │       ├── characterConversationsTable.ts
│   │       ├── characterDescriptorsTable.ts
│   │       ├── characterIdentityTable.ts
│   │       ├── characterMotivationsTable.ts
│   │       ├── characterPersonalityTable.ts
│   │       ├── characterSkillsTable.ts
│   │       ├── characterTraitsFlawsTable.ts
│   │       ├── characterActionsCombatTable.ts
│   │       ├── characterActionsGeneralTable.ts
│   │       ├── cavernDescriptorsTable.ts
│   │       ├── cityDescriptorsTable.ts
│   │       ├── civilizationDescriptorsTable.ts
│   │       ├── domicileDescriptorsTable.ts
│   │       ├── dungeonDescriptorsTable.ts
│   │       ├── forestDescriptorsTable.ts
│   │       ├── terrainDescriptorsTable.ts
│   │       ├── wastelandDescriptorsTable.ts
│   │       ├── starshipDescriptorsTable.ts
│   │       ├── animalActionsTable.ts
│   │       ├── creatureDescriptorsTable.ts
│   │       ├── undeadDescriptorsTable.ts
│   │       ├── alienSpeciesDescriptorsTable.ts
│   │       ├── armyDescriptorsTable.ts
│   │       ├── magicItemDescriptorsTable.ts
│   │       ├── mutationDescriptorsTable.ts
│   │       ├── adventureToneTable.ts
│   │       ├── plotTwistsTable.ts
│   │       ├── npcBehaviorTable.ts
│   │       ├── fateCheckModifiersTable.ts
│   │       └── chaosFlavorVariantsTable.ts
│   │
│   └── data/
│       └── tableMetadata.ts      # Updated with all Mythic tables
│
└── ... (existing structure)
```

---

## Success Criteria

✅ All 42+ Mythic tables browsable in /tables with "mythic-solo-rpg" tags
✅ Solo RPG session UI functional at /solo-rpg
✅ Can ask Fate Questions with proper Chaos Factor integration
✅ Can generate Random Events with Event Focus + Meaning + cascading
✅ Can test Expected Scenes and handle Altered/Interrupt
✅ Can manage Threads and Characters Lists with proper dice rolling
✅ Sessions persist in localStorage with auto-save
✅ Rules and table references accessible during play
✅ Tables have special rendering (Fate Chart 2D, dual rolls)
✅ Navigation updated with Solo RPG link
✅ Smart suggestions for Odds, Event Focus, and Meaning Tables
✅ Complete workflows for all 4 First Scene methods
✅ Context-aware helpers and auto-logging
✅ Full keyboard accessibility
✅ Responsive design (mobile/tablet/desktop)
✅ Export/Import sessions as JSON
✅ Adventure Journal with timeline and export

---

## Technical Considerations

### Table Implementation
- Extend existing `Table` class
- Most are 1d100 → text
- Fate Chart needs custom 2D logic
- Tag all with system identifier

### State Management
- Svelte 5 runes ($state, $derived, $effect)
- LocalStorage for persistence
- Future: IndexedDB for larger sessions

### Performance
- Lazy load tables (already supported)
- Debounce auto-save (500ms)
- Limit history (50 questions, 50 events)
- Memoize computed values
- Virtual scrolling for long lists

### Accessibility
- WCAG AA compliant
- Full keyboard navigation
- ARIA labels for all interactions
- Focus management
- Screen reader friendly

---

## Questions to Resolve

### Critical Decisions:

1. **Fate Chart Implementation:**
   - Store as 2D array or pre-calculated object?
   - Offer both d100 and 2d10 methods or just one initially?
   **Recommendation:** Pre-calculated object for speed, offer both methods with toggle

2. **List UI Design:**
   - Show all 5 sections always or collapse empty ones?
   - Allow free reordering or enforce section structure?
   **Recommendation:** Show only active sections, allow reordering within bounds

3. **Random Event Integration:**
   - Modal overlay or inline component?
   - Auto-generate or always require interpretation?
   **Recommendation:** Modal for focus, always require interpretation

4. **Mobile-First or Desktop-First:**
   - Which layout to build first?
   **Recommendation:** Desktop-first, then responsive adaptation

5. **Tutorial Approach:**
   - Interactive walkthrough, videos, or example adventure?
   **Recommendation:** Interactive walkthrough + example session

6. **Table Loading Strategy:**
   - Load all 42 on start, by category, or per table?
   **Recommendation:** Lazy load per table, preload core mechanics

---

## Timeline Estimate (Revised)

**Phase 1 (Tables): 3-4 weeks**
**Phase 2 (Core UI): 3-4 weeks**
**Phase 3 (Enhanced UI): 2-3 weeks**
**Phase 4 (Persistence & Docs): 2 weeks**
**Phase 5 (Testing & Launch): 1-2 weeks**

**Total: 11-15 weeks (3-4 months) for full implementation**
**MVP (Sprints 1-2): 6-8 weeks (1.5-2 months)**

---

## Next Steps

1. ✅ Review and approve this comprehensive plan
2. 🔲 Decide on critical questions (Fate Chart impl, List UI, etc.)
3. 🔲 Start Sprint 1, Week 1: Create 9 core tables
4. 🔲 Set up types.ts with all enums
5. 🔲 Update tableType and tableMetadata
6. 🔲 Verify tables appear in browser with tags
7. 🔲 Begin Sprint 1, Week 2: Character tables
8. 🔲 Continue iterative development per sprint plan

---

*This comprehensive plan provides a complete, implementation-ready specification for fully integrating Mythic GME into Inspire Tables, creating a powerful solo RPG play environment while maintaining the existing table browser functionality.*
