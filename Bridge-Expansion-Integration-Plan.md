# Bridge Expansion Integration Plan

## Overall Vision

The Bridge Expansion integration will eventually enable three interconnected systems:
1. **Story Engine Bridge cards** → reference Lore Master's Deck and Deck of Worlds (but work standalone)
2. **Deck of Worlds Bridge cards** → reference Lore Master's Deck and Story Engine
3. **Lore Master's Deck Bridge cards** → reference Deck of Worlds and Story Engine

Each system can work independently, with bridge cards serving as "placeholder" references until the connected decks are implemented. The integration will add:
- Card tucking (parent-child relationships)
- Visual indicators for bridge cards (⚙🌍, ⚙🐲, ⚙🌲 symbols)
- Link cue display showing referenced card types
- Optional expansion into clusters

---

## Phase 1: Story Engine Bridge Cards - Edge-Based Tucking

### Core Concept

Bridge cards use an **edge-based tucking system** where:
- Each bridge card has **4 possible contents** (one for each edge: top/right/bottom/left)
- When tucking a child card to a parent, the user selects which of the 4 contents is most relevant
- The child card is positioned on the chosen edge of the parent
- **Different colors indicate different card types** (e.g., Figure=blue, Location=green, Event=red)
- Only the selected edge's content is visible when tucked

### Visual Design

```
         ┌─────────────┐
         │ Location    │ ← Top-tucked (green)
         │             │
    ┌────┴─────────────┴────┐
    │                       │
    │      Parent          │ ← Left-tucked (blue)
    │   Bridge Card        │
    │                       │
    └───────────────────────┘
         │ Event         │ ← Bottom-tucked (red)
         └───────────────┘
```

### 1.1 Data Structure

```typescript
interface StoryBoardNode {
  // ... existing fields ...
  parentNodeId?: string | null;
  tuckedToSide?: 'top' | 'right' | 'bottom' | 'left'; // which edge of parent
  tuckedCards?: {
    top?: string[];    // IDs of cards tucked to top edge
    right?: string[];
    bottom?: string[];
    left?: string[];
  };
  activeContent?: number; // which of the 4 contents is visible (0-3)
  contents?: string[]; // 4 different content strings for each edge
  contentType?: string; // type indicated by color/position
  bridgeType?: 'story-lore' | 'story-world' | 'world-lore';
  links?: string[]; // e.g., ["figure", "location"]
}
```

### 1.2 Multi-Content Card System

**Bridge card structure**:
- Each bridge card can have up to 4 different "contents" or "cues"
- Each content is displayed on one edge (top/right/bottom/left)
- When tucking, user selects which content is most relevant
- Only that edge's content is visible when tucked

**Example: Story-Lore Engine Card**
```
         "WANTS TO HEIST"
              (top)
                |
    "SEEKS   [  CARD  ]   PROTECTS
    REVENGE"    CORE      A SECRET"
    (left)               (right)
                |
          "INVESTIGATES"
            (bottom)
```

### 1.3 Tucking Interaction Flow

**Step 1**: User drags child card near parent card
**Step 2**: Four drop zones highlight on parent's edges (top/right/bottom/left)
**Step 3**: User hovers over an edge → preview shows which content will be visible
**Step 4**: User drops → modal appears: "Which content fits best?" showing 4 options
**Step 5**: User selects content → child rotates/positions to show that edge
**Step 6**: Child card attaches to parent's edge with selected content visible

### 1.4 Visual Implementation

#### Layout Positioning

- **Top-tucked**: Child positioned above parent, bottom edge touching parent's top
- **Right-tucked**: Child positioned to right, left edge touching parent's right
- **Bottom-tucked**: Child positioned below parent, top edge touching parent's bottom
- **Left-tucked**: Child positioned to left, right edge touching parent's left

#### Color Coding by Type

Different card types use different colors to indicate their type:

- **Figure/Agent**: `#4A90E2` (Blue)
- **Location**: `#7ED321` (Green)
- **Event**: `#D0021B` (Red)
- **Material**: `#8B572A` (Brown)
- **Creature**: `#9013FE` (Purple)
- **Faction**: `#F5A623` (Orange)
- **Deity**: `#F8E71C` (Gold)
- **Object**: `#50E3C2` (Teal)
- **Origin**: `#B8E986` (Light Green)
- **Attribute**: `#BD10E0` (Magenta)
- **Advent**: `#417505` (Dark Green)

### 1.5 Link Type Mapping to Edges

For bridge cards, map link types to suggested edges based on the `links` array:

- **Top edge**: Primary/First link (e.g., "figure" in ["figure", "location"])
- **Right edge**: Secondary link (e.g., "location")
- **Bottom edge**: Tertiary link
- **Left edge**: Quaternary link

When displaying a bridge card, show link icons on the corresponding edges:

```
         👤 (figure)
            |
    📅 [  WANTS TO  ] 📍
   (event)  HEIST   (location)
            |
         🧱 (material)
```

#### Icon Mapping

Link type icons based on bridge expansion guidebooks:

- 👤 = Figure/Agent
- 🐲 = Creature
- 📍 = Location/Landmark
- 🎭 = Faction
- 📅 = Event
- 🎲 = Object/Attribute
- 🧱 = Material
- ⚡ = Deity
- 📖 = Origin
- 🌸 = Advent

### 1.6 Data Loading

**Files to load**:
- `resources/Story Engine/Bridge Expansion Set/story-lore-bridge-expansion-cards.json`
- `resources/Story Engine/Bridge Expansion Set/story-world-bridge-expansion-cards.json`

**Processing**:
1. Load both bridge expansion JSONs
2. For cards with `links` array, assign link types to edges (top→first link, right→second link, etc.)
3. Generate 4 different contents for each edge based on the card's cue and link types
4. Merge bridge cards with existing Story Engine cards
5. Add `bridgeType` field to distinguish from regular cards

### 1.7 Placeholder Behavior (Without Other Decks)

**Challenge**: Bridge cards reference card types from Lore Master's Deck and Deck of Worlds, which don't exist yet.

**Solution**: Treat links as documentation/guidance rather than functional requirements:
- Display link icons as "suggested connections"
- Users can manually tuck ANY card under a bridge card (not restricted by type)
- When other decks are added later, we can add validation/auto-generation
- For now, it's a visual/organizational aid

**User Experience**:
- Bridge card shows: "This engine suggests linking to: 👤 Figure, 📍 Location"
- User can tuck existing Story Engine cards underneath to fulfill that suggestion
- No enforcement of types (freeform creative use)

---

## Implementation Checklist

### Phase 1a - Data & Multi-Content Cards
- [ ] Add 4-content support to card data structure
- [ ] Add `tuckedToSide` and edge-based `tuckedCards` to StoryBoardNode
- [ ] Add `activeContent`, `contents`, `contentType`, `bridgeType`, `links` fields
- [ ] Create color mapping for card types
- [ ] Load `story-lore-bridge-expansion-cards.json`
- [ ] Load `story-world-bridge-expansion-cards.json`
- [ ] Assign contents to edges based on links array
- [ ] Create icon mapping for link types

### Phase 1b - Visual Display
- [ ] Implement edge-based positioning (top/right/bottom/left)
- [ ] Add color coding by card type
- [ ] Show only the active edge content when tucked
- [ ] Display all 4 contents when card is standalone/selected
- [ ] Add edge drop zone highlights on parent cards
- [ ] Display link icons on card edges
- [ ] Add bridge expansion badge (⚙🌍 or ⚙🐲) to card rendering
- [ ] Style tucked cards with appropriate colors
- [ ] Add visual feedback for valid drop zones

### Phase 1c - Tucking Interactions
- [ ] Detect drag near parent card edges
- [ ] Highlight 4 drop zones on edges during drag
- [ ] Show content preview on edge hover
- [ ] Create modal for selecting which of 4 contents to use
- [ ] Rotate/position child to show selected edge
- [ ] Attach child to parent's edge with proper offset
- [ ] Handle multiple cards tucked to same edge (stacking)
- [ ] Add tooltip showing content options on hover

### Phase 1d - Untucking & Movement
- [ ] Right-click menu: "Detach from edge"
- [ ] When parent moves, all edge-tucked children move with it
- [ ] Maintain edge positions during parent resize
- [ ] Handle overlapping tucked cards on same edge
- [ ] Support dragging to untuck (drag away from parent)

### Phase 1e - Store Actions
- [ ] `tuckCardToEdge(childId, parentId, edge, contentIndex)` action
- [ ] `untuckCard(childId)` action
- [ ] Update `moveNode()` to move edge-attached children
- [ ] Update `deleteNode()` to handle edge-attached children
- [ ] Add "Delete entire stack?" confirmation for parents with tucked children
- [ ] Undo/redo support for edge-tucking operations
- [ ] Update snapshot system to capture tucking state
- [ ] Add `changeTuckedContent(childId, newContentIndex)` to switch active content

### Phase 1f - Selection & Multi-Select
- [ ] Clicking tucked card selects it independently
- [ ] Shift+click to select entire stack (parent + all tucked children)
- [ ] Visual highlight for selected tucked cards
- [ ] Multi-select support for tucked cards
- [ ] Keyboard shortcuts (T+arrow key to tuck to edge: T+↑ for top, T+→ for right, etc.)

### Phase 1g - Polish & UX
- [ ] Smooth animations when tucking/untucking
- [ ] Transition animations when changing active content
- [ ] Edge glow effect when hovering during drag
- [ ] Snap-to-edge behavior for precise alignment
- [ ] Visual connector line between parent and tucked children (optional)
- [ ] Tooltip showing full content on tucked card hover
- [ ] Help tooltip explaining 4-content system on first use

### Phase 1h - Testing & Edge Cases
- [ ] Test with multiple cards tucked to same edge
- [ ] Test parent deletion with many tucked children
- [ ] Test undo/redo with complex tucking operations
- [ ] Test performance with 50+ tucked relationships
- [ ] Test edge-tucking with different card sizes
- [ ] Test tucking bridges to bridges (nested relationships)
- [ ] Test saving/loading storyboards with tucked cards
- [ ] Test keyboard navigation through tucked stacks

---

## Future Phases (Not Part of Phase 1)

### Phase 2: Lore Master's Deck Integration
- Load Lore Master's Deck data
- Enable bridge cards to reference actual Lore cards
- Add auto-generation: clicking a link icon generates and tucks appropriate card

### Phase 3: Deck of Worlds Integration
- Load Deck of Worlds data
- Enable World-Lore and Story-World bridge functionality
- Add cluster expansion feature (one card → network of connected cards)

### Phase 4: Advanced Features
- Smart suggestions based on tucked cards
- Template systems (save/load tucked structures)
- Export tucked storyboards as narrative outlines
- AI-assisted content generation using tucked relationships

---

## Technical Notes

### Files to Modify

**Type Definitions**:
- `src/lib/types/storyboard.ts` - Add tucking fields to StoryBoardNode

**Store**:
- `src/lib/stores/storyboardStore.ts` - Add tucking actions and update movement/deletion logic

**Components** (to be identified):
- Card rendering component - Add 4-content display, edge positions, colors
- Card interaction component - Add drag-to-tuck, edge drop zones
- Modal component - Content selection dialog
- Right-click menu - Add tuck/untuck options

**Data Loading**:
- Card loading logic - Load and merge bridge expansion JSONs

### Design Decisions

1. **Why edge-based over stacked?**
   - Semantic positioning (location matters)
   - Clearer visual hierarchy
   - Better use of canvas space
   - Natural "web" formation

2. **Why 4 contents per card?**
   - Maximizes flexibility
   - Maps naturally to 4 edges
   - Matches bridge card link arrays (typically 2-4 links)

3. **Why color-coded types?**
   - Instant visual recognition
   - No need to read text to identify type
   - Creates visual patterns in complex webs

4. **Why allow any card to tuck (no type restriction)?**
   - Other decks not yet implemented
   - Encourages creative use
   - Simplifies Phase 1 implementation
   - Can add validation later without breaking existing behavior

---

## Success Criteria

Phase 1 is complete when:
- [ ] Bridge expansion cards load and display correctly
- [ ] Users can tuck cards to any of 4 edges
- [ ] Users can select which of 4 contents to display
- [ ] Tucked cards are color-coded by type
- [ ] Moving parent moves all tucked children
- [ ] Undo/redo works for all tucking operations
- [ ] Storyboards with tucked cards save/load correctly
- [ ] Performance remains smooth with complex tucking structures
- [ ] All interactions feel intuitive and responsive
