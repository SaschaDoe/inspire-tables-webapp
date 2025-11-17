# Story Engine Integration Plan

## Context

The Story Engine is a card-based storytelling system with 5 core card types, each containing multiple "cues" (prompts):
- **Agents** (🟠): 4 cues per card - characters who make choices
- **Engines** (🟣): 2 cues per card - motivations and relationships
- **Anchors** (🔵): 4 cues per card - objects, locations, events
- **Conflicts** (🔴): 2 cues per card - obstacles and consequences
- **Aspects** (🟢): 4 cues per card - descriptive adjectives

Cards are designed to be rotated to show different cues, creating flexibility in storytelling.

## Current Storyboard State

The storyboard currently supports:
- ✅ Generic cards with label + notes
- ✅ Entity references (character, location, etc.)
- ✅ Random table generation → "generated" cards
- ✅ Drag-and-drop, selection, undo/redo
- ✅ Visual theming by entity type (gradient colors)
- ✅ Connections between cards
- ✅ Drawing layer for annotations

**What's missing for Story Engine**:
- ❌ Story Engine card data loading
- ❌ 5 Story Engine card types (Agent, Engine, Anchor, Conflict, Aspect)
- ❌ Multi-cue system (rotating to show different prompts)
- ❌ Story Engine-specific visual design
- ❌ Story Engine generator integration
- ❌ Expansion support (Curio, Dreamer, Founder, Starter)

---

## Phase 1: Data Structure & Loading

### Goal
Load Story Engine card data and make it accessible throughout the app.

### 1.1 Create Story Engine Types

**New file**: `src/lib/types/storyEngine.ts`

```typescript
export type StoryEngineCardType = 'agent' | 'engine' | 'anchor' | 'conflict' | 'aspect';

export interface StoryEngineCard {
  type: StoryEngineCardType;
  cues: string[]; // 2 or 4 cues depending on type
  expansion?: 'main' | 'curio-backstory' | 'curio-mystery' | 'curio-items' | 'dreamer-gothic' | etc;
}

export interface StoryEngineDeck {
  name: string;
  description?: string;
  cards: {
    agents: StoryEngineCard[];
    engines: StoryEngineCard[];
    anchors: StoryEngineCard[];
    conflicts: StoryEngineCard[];
    aspects: StoryEngineCard[];
  };
}
```

### 1.2 Create Story Engine Data Loader

**New file**: `src/lib/data/storyEngineLoader.ts`

```typescript
import storyEngineData from '$lib/../resources/Story Engine/story-engine-cards.json';

export function loadStoryEngineMainDeck(): StoryEngineDeck {
  // Parse story-engine-cards.json
  // Convert to StoryEngineDeck format
  // Return structured deck
}

export function getAllStoryEngineCards(): StoryEngineCard[] {
  // Return flat list of all cards across all types
}

export function getCardsByType(type: StoryEngineCardType): StoryEngineCard[] {
  // Return all cards of specific type
}

export function getRandomCard(type?: StoryEngineCardType): StoryEngineCard {
  // Return random card, optionally filtered by type
}
```

### 1.3 Update StoryBoardNode Type

**File**: `src/lib/types/storyboard.ts`

Add Story Engine-specific fields to `StoryBoardNode`:

```typescript
export interface StoryBoardNode {
  // ... existing fields ...

  // Story Engine fields
  storyEngineCard?: {
    type: StoryEngineCardType;
    cues: string[];
    activeCueIndex: number; // Which cue is currently visible (0-3)
    expansion?: string;
  };
}
```

---

## Phase 2: Visual Design for Story Engine Cards

### Goal
Make Story Engine cards visually distinct and recognizable by type.

### 2.1 Card Type Visual Styling

**Color scheme** (matching Story Engine documentation):
- **Agent** (🟠): Orange gradient `from-orange-500 to-amber-500`
- **Engine** (🟣): Purple gradient `from-purple-500 to-violet-500`
- **Anchor** (🔵): Blue gradient `from-blue-500 to-cyan-500`
- **Conflict** (🔴): Red gradient `from-red-500 to-rose-500`
- **Aspect** (🟢): Green gradient `from-green-500 to-emerald-500`

### 2.2 Card Layout

**Standard Story Engine card display**:

```
┌──────────────────────────┐
│ 🟠 AGENT        [1/4] ◄► │ ← Type icon + rotation indicator
├──────────────────────────┤
│                          │
│    A DETECTIVE           │ ← Active cue (large text)
│                          │
├──────────────────────────┤
│ • A Writer               │ ← All cues (small, faded)
│ • A Dancer               │
│ • A Musician             │
│ • An Artist              │
└──────────────────────────┘
```

**Compact mode** (when collapsed):
```
┌──────────────────┐
│ 🟠 A DETECTIVE ◄►│
└──────────────────┘
```

### 2.3 Rotation Indicator

- Add left/right arrows (◄►) to show card can be rotated
- Clicking arrows or pressing Left/Right when selected rotates cue
- Visual highlight on active cue
- Subtle animation when rotating

### 2.4 Update StoryBoardNode Component

**File**: `src/lib/components/storyboard/StoryBoardNode.svelte`

Add:
- Detect if node has `storyEngineCard` data
- Render Story Engine-specific layout
- Handle rotation clicks
- Show type-specific gradient
- Display cue rotation controls

---

## Phase 3: Card Rotation System

### Goal
Allow users to rotate Story Engine cards to show different cues.

### 3.1 Store Actions

**File**: `src/lib/stores/storyboardStore.ts`

Add actions:
```typescript
rotateStoryEngineCard(boardId: string, nodeId: string, direction: 'next' | 'prev') {
  // Find node
  // Increment/decrement activeCueIndex
  // Wrap around (0 → max, max → 0)
  // Update node
  // Save (don't create snapshot - rotation is lightweight)
}

setStoryEngineCue(boardId: string, nodeId: string, cueIndex: number) {
  // Set specific cue as active
}
```

### 3.2 UI Controls

**In StoryBoardNode.svelte**:
- Left arrow button: rotate to previous cue
- Right arrow button: rotate to next cue
- Cue indicator: "2/4" showing current position
- Keyboard: Left/Right arrows when card selected
- Click on inactive cue to make it active

### 3.3 Visual Feedback

- Smooth transition animation when rotating (fade out/in)
- Active cue in bold, white text
- Inactive cues in smaller, semi-transparent text
- Highlight effect on rotation

---

## Phase 4: Story Engine Generator Integration

### Goal
Add Story Engine card generation to the existing generator modal.

### 4.1 Add Story Engine to Generator

**File**: `src/lib/components/storyboard/StoryBoardGenerator.svelte`

Current structure:
- Categories (Character, Location, Quest, etc.) with random tables
- Select category → select table → roll → add to board

**Add Story Engine category**:
- New category: "📖 Story Engine" with icon
- Sub-options:
  - "Agent (Character)"
  - "Engine (Motivation)"
  - "Anchor (Object/Place/Event)"
  - "Conflict (Obstacle)"
  - "Aspect (Descriptor)"
  - "Story Seed (5-card prompt)" ← Special combo

### 4.2 Single Card Generation

**Flow**:
1. User selects "📖 Story Engine" → "Agent (Character)"
2. Generator shows: "Draw random Agent card"
3. Click "Generate"
4. Random agent card selected
5. All 4 cues shown
6. User clicks "Add to Storyboard"
7. Card appears with first cue active, rotation enabled

### 4.3 Story Seed Generation

**Special generator pattern** matching Story Engine documentation:

"Story Seed (5 cards)" generates:
1. 1 Agent
2. 1 Engine
3. 1 Anchor
4. 1 Conflict
5. 1 Aspect

All 5 cards added to storyboard in horizontal arrangement, automatically connected left-to-right.

**Example result**:
```
[Agent: A DETECTIVE] → [Engine: WANTS TO FIND] → [Anchor: A SHIP] → [Conflict: BUT TIME IS RUNNING OUT] → [Aspect: HAUNTED]
```

Creates the prompt: *"A detective wants to find a haunted ship but time is running out."*

### 4.4 Layout Patterns

Support for Story Engine prompt patterns:

**Circle of Fate** (2 characters, reciprocal motivations):
- Generates 2 Agents, 2 Engines, 2 Conflicts
- Arranges in circle with bidirectional connections

**Clash of Wills** (2 characters, same goal):
- Generates 2 Agents, 1 Anchor, 2 Engines, 2 Conflicts
- Anchor in center, Agents on sides, Engines pointing to center

**Soul Divided** (1 character, two desires):
- Generates 1 Agent, 2 Anchors, 2 Engines, 2 Conflicts
- Agent in center, branching paths to two different Anchors

---

## Phase 5: Story Engine Card Management

### Goal
Provide UI for managing Story Engine cards on the board.

### 5.1 Card Context Menu

Right-click on Story Engine card shows:
- 🔄 Rotate to next cue
- 🔁 Rotate to previous cue
- 📋 Show all cues
- 🎨 Change card color
- 🔗 Connect to another card
- 🗑️ Delete card

### 5.2 Bulk Actions

Select multiple Story Engine cards:
- Arrange in pattern (Story Seed, Circle of Fate, etc.)
- Connect sequentially (left-to-right)
- Align horizontally/vertically
- Auto-space evenly

### 5.3 Quick Add Menu

**New UI element**: Floating "+" button on canvas

Click → Quick menu:
- 📖 Add Story Engine card...
  - 🟠 Agent
  - 🟣 Engine
  - 🔵 Anchor
  - 🔴 Conflict
  - 🟢 Aspect
  - ✨ Story Seed (5 cards)

---

## Phase 6: Expansion Support (Future)

### Goal
Support Story Engine expansions.

**Expansions to support**:
- Curio Expansion Set (Backstories, Mystery, Unique Items)
- Dreamer Booster Set (Gothic, Superhero, Western, Fairy Tale, Pulp, Military)
- Founder Booster Set (Eldritch, Steampunk, Cyberpunk, Post-Apoc, Mythology, Dystopian)
- Starter Expansion Set (Fantasy, Horror, Sci-Fi)

**Implementation** (Phase 6a-6d):
- Load expansion data files
- Tag cards with expansion source
- Filter generator by expansion
- Visual badges for expansion cards (⏮ for backstory, etc.)
- Mix/match expansions in generator

---

## Implementation Checklist

### Phase 1: Data & Types
- [ ] Create `storyEngine.ts` types
- [ ] Create `storyEngineLoader.ts` data loader
- [ ] Load `story-engine-cards.json`
- [ ] Parse JSON to typed structure
- [ ] Add `storyEngineCard` field to `StoryBoardNode`
- [ ] Test data loading

### Phase 2: Visual Design
- [ ] Add Story Engine color gradients to node rendering
- [ ] Create Story Engine card layout template
- [ ] Add type icon (🟠🟣🔵🔴🟢) display
- [ ] Implement compact vs. expanded view
- [ ] Add rotation indicator (◄►)
- [ ] Show active cue prominently
- [ ] Show inactive cues (faded)
- [ ] Add cue index indicator (1/4, 2/2, etc.)

### Phase 3: Rotation System
- [ ] Add `rotateStoryEngineCard()` action to store
- [ ] Add `setStoryEngineCue()` action to store
- [ ] Implement left/right arrow buttons on card
- [ ] Handle keyboard Left/Right for rotation
- [ ] Add rotation animation (fade transition)
- [ ] Allow clicking inactive cue to activate it
- [ ] Update label when cue changes

### Phase 4: Generator Integration
- [ ] Add "📖 Story Engine" category to generator
- [ ] Add sub-categories for each card type
- [ ] Implement single card generation
- [ ] Add "Story Seed" special pattern
- [ ] Generate 5-card Story Seed with connections
- [ ] Position cards in logical layout
- [ ] Test all card types generation

### Phase 5: Card Management
- [ ] Add Story Engine context menu options
- [ ] Implement bulk arrange patterns
- [ ] Add quick-add floating button (optional)
- [ ] Add keyboard shortcut for quick-add (e.g., Shift+A for Agent)
- [ ] Test selection and manipulation

### Phase 6: Expansions (Future)
- [ ] Load Curio expansion data
- [ ] Load Dreamer booster data
- [ ] Load Founder booster data
- [ ] Load Starter expansion data
- [ ] Add expansion filter to generator
- [ ] Add expansion badges to cards
- [ ] Support mixing expansions

---

## Design Decisions (User Confirmed)

### ✅ Decision 1: Cue Display Mode

**Selected: Option C** - Collapsed shows only active, expanded shows all

```
Collapsed (default):      Expanded (on select/hover):
┌─────────────┐           ┌──────────────────┐
│ 🟠 A DANCER ►│           │ 🟠 AGENT    2/4  │
└─────────────┘           ├──────────────────┤
                          │ • A Writer       │
                          │ ► A Dancer       │
                          │ • A Musician     │
                          │ • An Artist      │
                          └──────────────────┘
```

**Rationale**: Best balance of space efficiency and information visibility.

### ✅ Decision 2: Story Seed Generator

**Selected: Option B** - Generate 5 cards, let user add one-by-one

**Flow**:
1. User clicks "Story Seed" generator
2. Generator rolls all 5 cards (Agent, Engine, Anchor, Conflict, Aspect)
3. Shows preview of all 5
4. User clicks "Add" on each card they want (can skip some)
5. Cards are added at cursor position or viewport center

**Rationale**: Maximum user control, prevents board clutter, allows cherry-picking best results.

### ✅ Decision 3: Card Text Editing

**Selected: Story Engine cards are READ-ONLY prompts**

- Story Engine cards display the active cue from deck data (NOT editable)
- Users can only rotate to show different cues
- Cannot edit the text - it's fixed from the deck
- Regular storyboard cards remain fully editable
- If users want custom text, they create a regular card (not a Story Engine card)

**Rationale**: Story Engine cards are **prompts from the deck**, not custom content. Keeps the integrity of the deck intact.

### ✅ Decision 4: Connection Auto-Creation

**Selected: Option C** - No automatic connections, user creates manually

**Rationale**: Maximum flexibility. Users can arrange cards however they want and create connections that make sense for their story.

---

## Success Criteria

Phase 1-4 is complete when:
- [ ] Story Engine cards load from JSON
- [ ] All 5 card types display correctly with type-specific colors
- [ ] Cards can be rotated to show different cues
- [ ] Story Engine generator category works in generator modal
- [ ] Story Seed generates 5 connected cards in correct pattern
- [ ] Visual design matches Story Engine aesthetic
- [ ] Rotation is smooth and intuitive
- [ ] Keyboard shortcuts work (Left/Right to rotate)
- [ ] Cards save/load correctly with active cue preserved

---

## Technical Notes

### Files to Create
- `src/lib/types/storyEngine.ts` - Types
- `src/lib/data/storyEngineLoader.ts` - Data loading
- `src/lib/components/storyboard/StoryEngineCard.svelte` - Specialized card component (optional, or extend StoryBoardNode)

### Files to Modify
- `src/lib/types/storyboard.ts` - Add `storyEngineCard` to node
- `src/lib/components/storyboard/StoryBoardNode.svelte` - Add Story Engine rendering
- `src/lib/stores/storyboardStore.ts` - Add rotation actions
- `src/lib/components/storyboard/StoryBoardGenerator.svelte` - Add Story Engine category

### Design Decisions

1. **Why extend StoryBoardNode instead of new entity type?**
   - Story Engine cards are temporary creative prompts, not permanent entities
   - They exist only on the storyboard, not in the entity system
   - Similar to "generated" cards, but with richer structure

2. **Why support rotation vs. creating 4 separate cards?**
   - Matches the physical Story Engine deck experience
   - Keeps board less cluttered (1 card with 4 options vs. 4 cards)
   - Encourages exploration of different interpretations

3. **Why integrate into existing generator vs. separate modal?**
   - Consistent UX with existing table generation
   - Leverages existing infrastructure
   - Story Engine is another form of random generation

4. **Why Phase 6 (expansions) is separate?**
   - Core functionality must work first
   - Expansions are additive, not essential
   - Allows testing with base deck before adding complexity
