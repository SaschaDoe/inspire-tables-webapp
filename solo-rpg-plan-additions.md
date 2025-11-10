# Solo RPG Plan - Deep Dive Additions

## Missing Components & Details

After reviewing the original Mythic GME rules in depth, here are the critical additions and clarifications needed for the implementation plan.

---

## 1. COMPLETE TABLE ENUMERATION

### All 50+ Mythic Tables to Implement

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

#### Meaning Tables - Character Elements (10)
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
30. **Starship Descriptors** - Sci-fi spacecraft (for sci-fi games)

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

**Total: 42 tables minimum, expandable to 45+ with variants**

---

## 2. MISSING DATA STRUCTURES

### 2.1 Odds Level Enumeration
**File:** `src/lib/tables/mythicTables/types.ts`

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

### 2.2 Event Focus Enumeration
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

### 2.3 Scene Adjustment Types
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

### 2.4 Enhanced Session State
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

interface FirstSceneCreationMethod {
  method: 'inspired' | 'randomEvent' | 'meaningTables' | '4w';
  details?: any;
}
```

---

## 3. MISSING COMPONENTS

### 3.1 Scene Bookkeeping Component
**File:** `SceneBookkeeping.svelte`

Component for structured end-of-scene workflow:

**Features:**
- Scene summary input
- Chaos Factor adjustment with reasoning
  - Radio buttons: Increase (chaotic) / No Change / Decrease (controlled)
  - Auto-suggest based on scene events
- Quick Threads management
  - Mark threads as completed
  - Add new threads
  - Remove irrelevant threads
- Quick Characters management
  - Add new NPCs/elements
  - Remove inactive elements
- Scene statistics display
  - Fate Questions asked: X
  - Random Events: X
  - Threads progress: X/Y
- "Complete Scene & Continue" button

### 3.2 First Scene Creator Component
**File:** `FirstSceneCreator.svelte`

Modal/panel for creating the first scene with 4 methods:

**Method 1: Inspired Idea**
- Free text input
- Optional seed from Meaning Tables

**Method 2: Random Event**
- Event Focus roller
- Meaning Tables roller
- Interpretation guide

**Method 3: Meaning Tables**
- Choose table(s)
- Roll twice
- Combine results

**Method 4: 4W Method**
- Who: Roll on character-related table
- What: Roll on action table
- Where: Roll on location table
- Why: Roll on motivation/purpose table
- Combine into scene concept

### 3.3 Context Tracker Component
**File:** `ContextTracker.svelte`

**Displays:**
- Current scene summary
- Active threads (top 3-5)
- Recent NPCs (last 3-5 mentioned)
- Last 3 Random Events
- Last 2 Fate Questions
- Current situation at a glance

**Purpose:** Help player remember context when making decisions

### 3.4 Meaning Table Picker Component
**File:** `MeaningTablePicker.svelte`

**Features:**
- Smart suggestions based on Event Focus
  - NPC Action → suggest Character Actions tables
  - New Location → suggest Location tables
  - Object focus → suggest Objects tables
- Category browser
  - Actions
  - Descriptions
  - Characters
  - Locations
  - Creatures
  - etc.
- Favorites/Recent tables
- Multi-table rolling workflow
  - Roll on Table A + Table B → combine results
- Visual display of rolled results

### 3.5 Adventure Journal Component
**File:** `AdventureJournal.svelte`

**Features:**
- Timeline view of all scenes
- Expandable scene entries showing:
  - Scene type and description
  - Chaos Factor changes
  - Fate Questions asked
  - Random Events
  - Threads/Characters changes
- Search and filter
  - By scene type
  - By thread
  - By character
  - By date
- Export options
  - Markdown
  - Plain text
  - JSON
- Print-friendly view

### 3.6 Fate Check Calculator Component
**File:** `FateCheckCalculator.svelte`

Alternative to Fate Chart for players who prefer 2d10 method:

**Features:**
- 2d10 roller
- Odds modifier selector
- Chaos Factor modifier display
- Calculation breakdown:
  - Roll: 2d10 = [X] + [Y] = Z
  - Odds modifier: +/-X
  - CF modifier: +/-Y
  - Total: Z
  - Result: Yes/No/Exceptional
- Random Event detection (doubles check)
- Toggle to switch between Chart and Check method

### 3.7 List Roller Component
**File:** `ListRoller.svelte`

**Features:**
- Display list (Threads or Characters)
- Show active sections
- Auto-determine dice needed
  - 1-5 items: d10 only
  - 6-10: d4 + d10
  - 11-15: d6 + d10
  - 16-20: d8 + d10
  - 21-25: d10 + d10
- Animated dice roll
- Highlight selected entry
- Handle "Choose" results (empty lines)
  - Option to reroll
  - Option to manually select

### 3.8 Dice Visualizer Component
**File:** `DiceVisualizer.svelte`

**Features:**
- Animated 3D or 2D dice rolling
- Support for d4, d6, d8, d10, d100
- Visual feedback for special results:
  - Doubles (potential Random Event)
  - Exceptional results
- Percentage bar for Fate Questions
  - Show threshold
  - Show where roll landed
  - Color code: green (success), red (failure)

---

## 4. DETAILED WORKFLOWS

### 4.1 Complete Fate Question Workflow

**Step-by-step implementation:**

1. **Input Phase**
   - Player enters question (textarea)
   - Player selects Odds from dropdown
   - Display current Chaos Factor
   - Show estimated probability

2. **Roll Phase**
   - Click "Ask Fate" button
   - Animate dice roll (d100 or 2d10)
   - Calculate result

3. **Random Event Detection**
   - Check if doubles (11, 22, 33, etc.)
   - Check if single digit ≤ Chaos Factor
   - If both true → pause for Random Event

4. **Random Event Handling** (if triggered)
   - Display "Random Event!" notification
   - Open Random Event Generator in modal
   - Player generates and interprets event
   - Log event to history
   - Return to Fate Question result

5. **Answer Determination**
   - Look up percentage threshold
   - Determine: Yes, No, Exceptional Yes, or Exceptional No
   - Display answer with visual emphasis

6. **Interpretation Phase**
   - Show interpretation guide based on answer
   - Optional notes textarea
   - Add to question history

7. **Logging**
   - Save complete question to session history
   - Update session stats

### 4.2 Complete Random Event Workflow

**Step-by-step implementation:**

1. **Context Input**
   - Auto-populate current scene context
   - Allow player to edit/clarify

2. **Event Focus Determination**
   - Choice: Roll or Choose?
   - If Roll: d100 → look up Event Focus
   - If Choose: Dropdown with suggestions based on context

3. **List Rolling** (if needed)
   - NPC Action/Negative/Positive → roll on Characters List
   - Move Toward/Away/Close Thread → roll on Threads List
   - Display list roller component
   - Handle "Choose" results
   - Show selected entry

4. **Meaning Table Selection**
   - Smart suggestions based on Event Focus
     - NPC Action → Character Actions
     - New NPC → Character Descriptors + Identity
     - PC Positive → Descriptions + Actions
     - etc.
   - Player chooses 1-2 tables

5. **Meaning Rolling**
   - Roll d100 twice on selected table(s)
   - Display both results prominently
   - Show word pairs

6. **Interpretation**
   - Large textarea for player interpretation
   - Helper prompts:
     - "Combine: [Context] + [Focus] + [Meaning]"
     - "What does this mean for the story?"
   - Save interpretation

7. **Application**
   - Suggest updates to Lists
   - Suggest Chaos Factor changes
   - Log event to history

### 4.3 Scene Transition Workflow

**Step-by-step implementation:**

1. **End Current Scene**
   - Open Scene Bookkeeping modal
   - Player completes checklist:
     - [ ] Update Threads
     - [ ] Update Characters
     - [ ] Adjust Chaos Factor
     - [ ] Journal notes
   - Save scene to history

2. **Create Expected Scene**
   - Textarea: "What do you expect to happen next?"
   - Auto-suggest based on active Threads

3. **Test Scene**
   - Display: "Roll d10 vs Chaos Factor [X]"
   - Animate d10 roll
   - Compare result

4. **Determine Scene Type**
   - If roll > CF → Expected Scene
   - If roll ≤ CF and odd → Altered Scene
   - If roll ≤ CF and even → Interrupt Scene

5. **Handle Altered Scene**
   - Display Scene Adjustment Table
   - Roll d10 → get adjustment type
   - If "Make 2 Adjustments" → roll twice more
   - Guide player through adjustments
   - Updated Expected Scene becomes actual

6. **Handle Interrupt Scene**
   - Generate Random Event
   - Use Event as basis for scene
   - Ignore Expected Scene

7. **Begin New Scene**
   - Increment scene counter
   - Display scene description
   - Start play

### 4.4 First Scene Creation Workflow

**Implementation for each method:**

**Method 1: Inspired Idea**
```
1. Player types scene concept
2. Optional: "Need inspiration?" → roll on Meaning Tables
3. Set initial Threads (optional)
4. Set initial Characters (optional)
5. Confirm Chaos Factor = 5
6. Begin scene
```

**Method 2: Random Event**
```
1. Roll Event Focus (or choose)
2. Roll Meaning Tables (2x)
3. Player interprets into scene concept
4. Pre-populate relevant Threads/Characters
5. Begin scene
```

**Method 3: Meaning Tables**
```
1. Player selects 1-2 tables
2. Roll d100 twice per table
3. Display word pairs
4. Player combines into scene concept
5. Begin scene
```

**Method 4: 4W Method**
```
1. WHO: Roll on Character Identity or similar
2. WHAT: Roll on Actions Table
3. WHERE: Roll on Locations Table
4. WHY: Roll on Motivations or similar
5. Display all 4 results
6. Player combines into scene concept
7. Pre-populate Thread based on Why
8. Pre-populate Character based on Who
9. Begin scene
```

---

## 5. ENHANCED UI/UX DETAILS

### 5.1 Fate Question Interface

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

### 5.2 Random Event Interface

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

### 5.3 Lists Panel Design

**Visual Structure:**
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
│                     │                     │
│ Dice needed: d10    │ Dice needed: d10    │
└─────────────────────┴─────────────────────┘
```

**Behavior:**
- Sections with entries show filled circle ●
- Empty sections show empty circle ○
- "Roll" button auto-determines dice
- Drag handles to reorder
- Click to edit
- Checkbox to mark Thread complete
- Toggle to mark Character inactive

---

## 6. SMART FEATURES & HELPERS

### 6.1 Context-Aware Suggestions

**Fate Question Odds Suggestions:**
Based on context, suggest likely odds:
- "Is [NPC] hostile?" → Check NPC description
  - If "Enemy" → Very Likely
  - If "Ally" → Very Unlikely
  - If unknown → 50/50

**Event Focus Suggestions:**
- Scene just started → suggest "Current Context" or "Ambiguous Event"
- Multiple Threads active → suggest "Move Toward/Away Thread"
- Few NPCs → suggest "New NPC"
- Lots of NPCs → suggest "NPC Action"

**Meaning Table Suggestions:**
- Event Focus = New NPC → Character Descriptors + Identity
- Event Focus = PC Negative → Actions Table + Descriptions
- Event Focus = Remote Event → Locations + Actions

### 6.2 Auto-Logging Features

**Automatic tracking:**
- Time spent per scene
- Fate Questions per scene
- Random Events per scene
- Thread completion rate
- Most used Meaning Tables
- Chaos Factor trend graph

### 6.3 Quick Actions Sidebar

**Always-visible buttons:**
- 🎲 Quick Fate Question
- ⚡ Quick Random Event
- 📝 Quick Note (add to journal)
- ➕ Quick Add (Thread or Character)
- 📊 Session Stats

**Keyboard shortcuts:**
- `F` - Fate Question
- `R` - Random Event
- `N` - New Scene
- `S` - Scene Bookkeeping
- `J` - Journal

---

## 7. DATA VALIDATION & ERROR HANDLING

### 7.1 Validation Rules

**Chaos Factor:**
- Must be 1-9
- Show warning if at extremes (1 or 9)
- Prevent going out of bounds

**Lists:**
- Max 25 entries enforced
- Warn at 20 entries
- Cannot add to section 2-5 if previous sections not in use

**Fate Questions:**
- Question cannot be empty
- Must select Odds
- Roll must be 1-100

**Scenes:**
- Must have description
- Scene number auto-increments
- Cannot skip scene numbers

### 7.2 Error States

**Empty Lists:**
- If Characters List empty when "NPC Action" rolled
  - Prompt: "No characters in list. Add one or choose different Event Focus."

**No Active Threads:**
- If Threads List empty when "Move Toward Thread" rolled
  - Prompt: "No active threads. Add a goal or choose different Event Focus."

**Invalid Rolls:**
- If player enters manual roll outside range
  - Error: "Roll must be 1-100"

### 7.3 Loading States

**During Dice Rolls:**
- Animated dice rolling (1-2 seconds)
- Disable buttons during animation
- Show "Rolling..." text

**During Session Load:**
- Loading spinner
- Show progress: "Loading scenes... X/Y"

**During Table Load:**
- Lazy load tables
- Show skeleton UI while loading

---

## 8. RESPONSIVE DESIGN SPECIFICS

### 8.1 Mobile Layout (< 768px)

**Stack everything vertically:**
```
┌─────────────────┐
│ Chaos Factor: 5 │
├─────────────────┤
│ Tabs:           │
│ [Play][Lists][History]
├─────────────────┤
│                 │
│  Active Tab     │
│  Content        │
│                 │
└─────────────────┘
```

**Mobile-specific features:**
- Bottom navigation bar
- Swipe between tabs
- Collapsed sidebar (hamburger menu)
- Full-screen modals
- Simplified dice animations

### 8.2 Tablet Layout (768px - 1024px)

**Two-column layout:**
```
┌──────────┬──────────┐
│ Lists &  │          │
│ Controls │  Main    │
│          │  Area    │
│          │          │
└──────────┴──────────┘
```

### 8.3 Desktop Layout (> 1024px)

**Three-column layout:**
```
┌─────┬─────────┬──────┐
│Lists│  Main   │Quick │
│ &   │  Play   │ Ref  │
│Chaos│  Area   │      │
└─────┴─────────┴──────┘
```

---

## 9. ADDITIONAL UTILITIES

### 9.1 Dice Utilities
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

### 9.2 Fate Chart Utilities
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

### 9.3 Event Focus Utilities
**File:** `src/lib/utils/eventFocus.ts`

```typescript
export function getEventFocus(roll: number): EventFocus;
export function needsListRoll(focus: EventFocus): 'threads' | 'characters' | null;
export function suggestMeaningTables(focus: EventFocus): string[];
```

---

## 10. TESTING ADDITIONS

### 10.1 Unit Tests (Comprehensive)

**Dice Tests:**
- `rollD100()` returns 1-100
- `isDoubles()` correctly identifies 11, 22, 33, etc.
- `checkRandomEvent()` logic correct for all CF levels
- `rollOnList()` uses correct dice for element counts

**Fate Chart Tests:**
- All 81 combinations (9 Odds × 9 CF) return correct thresholds
- Exceptional thresholds calculated correctly
- Fate Check modifiers apply correctly

**Event Focus Tests:**
- All roll ranges map to correct Event Focus
- `needsListRoll()` identifies correct focuses

**List Tests:**
- Dice selection for 1, 5, 6, 10, 15, 20, 25 elements
- Empty line handling ("Choose")
- Position validation (1-25)

### 10.2 Integration Tests (Comprehensive)

**Complete Workflows:**
- First Scene creation (all 4 methods)
- Fate Question with Random Event
- Random Event with NPC Action (cascading to list)
- Scene transition (all 3 types)
- Scene Bookkeeping (full cycle)

**Session Persistence:**
- Save session → reload → verify all data intact
- Auto-save triggers at correct times
- Export → import session

### 10.3 E2E Tests

**Full Adventure Playthrough:**
```
1. Create new session
2. Create first scene (4W method)
3. Ask 3 Fate Questions (1 triggers Random Event)
4. Complete scene (bookkeeping)
5. Create Expected Scene → test → get Altered
6. Apply adjustment
7. Play scene
8. Complete scene
9. Create Expected Scene → test → get Interrupt
10. Generate Random Event for scene
11. Save session
12. Reload session
13. Continue play
14. Export journal
```

---

## 11. ACCESSIBILITY ENHANCEMENTS

### 11.1 Screen Reader Support

**ARIA Labels:**
- All dice rolls announced: "Rolling d100... Result: 47"
- Fate results announced: "Fate Question result: Yes"
- Random Events announced: "Random Event: NPC Action"
- Scene transitions announced: "New scene: Altered Scene"

**Focus Management:**
- After dice roll, focus moves to result
- After modal close, focus returns to trigger
- Keyboard navigation through all interactive elements

### 11.2 Visual Accessibility

**High Contrast Mode:**
- All text meets WCAG AA standards (4.5:1)
- Color not sole indicator (icons + text)

**Font Sizing:**
- Respects user's browser font size
- Scalable from 100% to 200%

### 11.3 Keyboard Navigation

**All actions accessible via keyboard:**
- Tab through all controls
- Enter/Space to activate buttons
- Arrow keys to navigate lists
- Escape to close modals

---

## 12. PERFORMANCE OPTIMIZATIONS

### 12.1 Lazy Loading

**Tables:**
- Load tables on-demand
- Cache loaded tables in memory
- Preload frequently used tables

**History:**
- Paginate history (10 items at a time)
- Virtual scrolling for long lists

### 12.2 Debouncing

**Auto-save:**
- Debounce 500ms after last change
- Don't save while player actively typing

**Search:**
- Debounce search input 300ms

### 12.3 Memoization

**Computed values:**
- Memoize Fate Chart lookups
- Memoize Event Focus suggestions
- Memoize dice requirements for lists

---

## 13. IMPLEMENTATION PRIORITY REFINEMENT

### Phase 1A: Core Tables (Week 1)
1. Fate Chart Table with lookup logic
2. Event Focus Table
3. Scene Adjustment Table
4. Actions Tables 1 & 2
5. Descriptions Tables 1 & 2
6. Core Elements: Locations, Characters, Objects

**Deliverable:** 9 core tables functional

### Phase 1B: Character Tables (Week 1-2)
7-16. All 10 Character-focused tables

**Deliverable:** Full character generation via tables

### Phase 1C: Location/Environment Tables (Week 2)
17-26. All 10 location/environment tables

**Deliverable:** Rich location descriptions

### Phase 1D: Remaining Tables (Week 2-3)
27-42. Creature, military, object, and meta tables

**Deliverable:** Complete table library (42+ tables)

### Phase 2A: Core UI Components (Week 3-4)
- FateQuestion.svelte
- RandomEventGenerator.svelte
- ChaosFactorPanel.svelte
- ListsPanel.svelte (basic)

**Deliverable:** Basic Q&A gameplay

### Phase 2B: Scene Management (Week 4-5)
- SceneManager.svelte
- SceneBookkeeping.svelte
- FirstSceneCreator.svelte

**Deliverable:** Full scene workflow

### Phase 2C: Enhanced UI (Week 5-6)
- ContextTracker.svelte
- MeaningTablePicker.svelte
- AdventureJournal.svelte
- DiceVisualizer.svelte

**Deliverable:** Polished player experience

### Phase 3: Persistence & Polish (Week 6-7)
- Session save/load
- Export/import
- Help system
- Tutorials

**Deliverable:** Production-ready feature

---

## 14. REVISED QUESTIONS TO RESOLVE

### Critical Decisions:

1. **Fate Chart Implementation:**
   - Store as 2D array or pre-calculated object?
   - Offer both d100 and 2d10 methods or just one initially?

2. **List UI Design:**
   - Show all 5 sections always or collapse empty ones?
   - Allow free reordering or enforce section structure?

3. **Random Event Integration:**
   - Modal overlay or inline component?
   - Auto-generate or always require interpretation?

4. **Mobile-First or Desktop-First:**
   - Which layout to build first?
   - Progressive enhancement or separate mobile components?

5. **Tutorial Approach:**
   - Interactive walkthrough?
   - Video tutorials?
   - Example adventure to follow?

6. **Table Loading Strategy:**
   - Load all 42 tables on app start?
   - Lazy load per category?
   - Lazy load per table?

---

## 15. REVISED TIMELINE

### Revised Estimates:

**Phase 1 (Tables): 3-4 weeks**
- Week 1: Core mechanics + Actions/Descriptions (9 tables)
- Week 2: Character + Location tables (20 tables)
- Week 3: Remaining tables (13 tables)
- Week 4: Testing, refinement, special renderers

**Phase 2 (Core UI): 3-4 weeks**
- Week 1: Fate Questions + Random Events
- Week 2: Chaos Factor + Lists (basic)
- Week 3: Scene Manager + Bookkeeping
- Week 4: First Scene Creator + testing

**Phase 3 (Enhanced UI): 2-3 weeks**
- Week 1: Context Tracker + Journal
- Week 2: Table Picker + Dice Visualizer
- Week 3: Polish + refinement

**Phase 4 (Persistence & Documentation): 2 weeks**
- Week 1: Save/load + export
- Week 2: Help system + tutorials

**Phase 5 (Testing & Launch): 1-2 weeks**
- Week 1: Full E2E testing
- Week 2: Bug fixes + launch prep

**Total: 11-15 weeks (3-4 months)**
**MVP (Phases 1-2): 6-8 weeks (1.5-2 months)**

---

This comprehensive addition document covers all the missing details from the original plan. When combined with the original plan, this provides a complete, implementation-ready specification for the Solo RPG feature.
