# StoryBoard Feature - Design & Implementation Plan

## 🎯 Vision

A **creative brainstorming canvas** for GMs to visually plan narratives. Like a digital corkboard where you:
- Pin sticky notes (story elements, characters, plot beats)
- Draw connections, arrows, circles, and annotations freehand
- Arrange elements spatially to reflect relationships, timelines, or structure
- Generate ideas using random tables
- Edit inline and navigate to full entity details

Think **Miro/FigJam for RPG story planning** - not a rigid flowchart tool, but a flexible creative workspace where spatial arrangement has meaning and hand-drawn annotations capture spontaneous ideas.

---

## 🔍 Analysis of Original Implementation

### ✅ What Worked Well
1. **Free positioning** - Spatial arrangement has inherent meaning (timeline, relationships, hierarchy)
2. **Freehand drawing layer** - Canvas for hand-drawn arrows, circles, annotations, connections
3. **Inline editing** - Click card to edit name, no separate edit mode
4. **Mixed content** - Add existing entities OR generate new ideas from tables
5. **Quick generation** - "wants to [overcome a fear of]" from WantTable creates instant plot hooks
6. **Simple interaction model** - Drag to move, click to edit, draw to annotate
7. **Persistent state** - LocalStorage saves board between sessions
8. **Color coding** - Different entity types have different colors
9. **GOTO navigation** - Jump from card to entity details
10. **Eraser functionality** - White pen (thick) acts as eraser for drawings

### ❌ Weaknesses to Address

**Critical Missing Features:**
1. **No undo/redo** - Accidental deletes/moves are permanent
2. **No multi-select** - Can't move/delete groups
3. **No keyboard shortcuts** - Delete key, copy/paste, arrow keys
4. **No search** - Hard to find cards in large boards
5. **Drawing not persistent** - Canvas drawings likely don't save properly
6. **No drawing tools** - Only freehand (no shapes, text, colors)

**UX Problems:**
7. **Poor visual design** - Plain white boxes, basic borders
8. **Tiny canvas** - Only 400x400px, fixed size
9. **No zoom/pan** - Can't navigate large boards
10. **No alignment tools** - Hard to organize neatly
11. **No layers** - Drawings interfere with dragging
12. **HTML Canvas limitations** - Can't export easily, print issues

**Technical Debt:**
13. **Svelte 3 patterns** - Old reactivity model
14. **Context API for navigation** - Should use proper routing
15. **No performance optimization** - Every drag repaints everything
16. **Drawing on wrong layer** - Canvas below cards means can't draw on top

**Feature Gaps:**
17. **Only one board type** - No templates (timeline, relationship web, etc.)
18. **Limited generation** - Only WantTable, need more story engine integration
19. **No card variants** - Can't add notes, images, or different card types
20. **No export** - Can't share or print boards
21. **No entity sync** - If entity name changes, card doesn't update

---

## 🎨 Improved UX Design

### Visual Design (Consistent with App Theme)

**Color Palette:**
- Background: `bg-slate-950` (dark canvas like workspace)
- Cards: Gradient borders matching entity types
  - Campaign: `purple-500 → pink-500`
  - Character: `green-500 → emerald-500`
  - Location: `blue-500 → cyan-500`
  - Scene: `yellow-500 → orange-500`
  - Plot Beat: `red-500 → rose-500`
- Canvas grid: Subtle `purple-500/10` dots
- Connections: Themed colored lines with arrows

**Card Design:**
```
┌─────────────────────────┐
│ 🎭 Character Name       │ ← Icon + Entity type badge
│ ─────────────────────   │
│ "wants to escape..."    │ ← Primary info
│                         │
│ [Connected to: 2]   ⚡  │ ← Connection count + status
└─────────────────────────┘
```

**Board Layout:**
```
┌──────────────────────────────────────────────────────┐
│ [Timeline View] [Relationship View] [Custom]         │ ← View modes
├──────────────────────────────────────────────────────┤
│  🎭 Add Entity  |  🎲 Generate  |  ✏️ Draw  |  🔍 Zoom │ ← Toolbar
├──────────────────────────────────────────────────────┤
│                                                      │
│     ┌────┐      ┌────┐                             │
│     │ 🧙 │─────→│ 👹 │                             │ ← Canvas
│     └────┘      └────┘                             │
│         ↓                                           │
│     ┌────┐                                         │
│     │ 🏰 │                                         │
│     └────┘                                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Interaction Patterns

**1. Add Elements**
- Click "Add Card" → New blank card appears at center
- Click "Generate Plot Beat" → Random table roll creates card with suggestion
- Select from dropdown → Existing entity becomes card
- Drag entity from sidebar → Quick add

**2. Edit Cards (Inline Pattern)**
- **Click card once** → Enters edit mode:
  - Border highlights (blue glow)
  - Name becomes text input
  - Quick actions appear (Delete, GOTO, Color)
  - Can edit text inline
- **Click outside** → Deselects, saves changes
- **Keyboard:**
  - Delete key → Remove selected card(s)
  - Escape → Deselect
  - Arrow keys → Nudge position

**3. Positioning**
- **Drag card** → Move freely
- **Shift+drag** → Constrain to axis (horizontal/vertical)
- **Drag selection box** → Multi-select
- **Shift+click** → Add to selection
- **Ctrl+drag selected** → Duplicate
- **Optional: Snap to grid** (toggle)

**4. Drawing Layer**
- **Click "Draw" mode** → Activates drawing
  - Draw freehand arrows, circles, lines
  - Color picker (not just black/white)
  - Line thickness slider
  - Shape tools: Line, Arrow, Rectangle, Circle, Text
- **Click "Select" mode** → Back to card manipulation
- **Eraser tool** → Remove parts of drawings
- **Drawing shortcuts:**
  - D key → Toggle draw mode
  - Hold Shift while drawing → Straight lines
  - Double-click → Add text annotation

**5. Navigation**
- **Middle-mouse drag** or **Space+drag** → Pan canvas
- **Ctrl+scroll** → Zoom in/out
- **Minimap** → Click to jump to area
- **Search** → Find and zoom to cards

**6. Quick Actions (on selected card)**
- **GOTO button** → Navigate to entity tab
- **Color picker** → Change card color
- **Size handles** → Resize card
- **Pin icon** → Lock position
- **Link icon** → Create visual arrow to another card

**7. Organization Tools**
- **Auto-arrange:** Timeline, Circular, Hierarchical
- **Align:** Left, Center, Right, Top, Middle, Bottom
- **Distribute:** Horizontally, Vertically
- **Group:** Select multiple → Right-click → Group

---

## 🏗️ Technical Architecture

### Component Structure (Svelte 5 Runes)

```
src/lib/components/storyboard/
├── StoryBoard.svelte              # Main container, mode management
├── StoryBoardToolbar.svelte       # Top toolbar (Add, Generate, Draw, Arrange)
├── StoryBoardCanvas.svelte        # Main canvas wrapper with pan/zoom
├── StoryBoardNode.svelte          # Draggable card with inline editing
├── StoryBoardConnection.svelte    # Visual arrow between nodes (SVG)
├── StoryBoardDrawingLayer.svelte  # Freehand drawing canvas (SVG)
├── StoryBoardDrawingTools.svelte  # Drawing toolbar (pen, shapes, colors)
├── StoryBoardGrid.svelte          # Background grid pattern
├── StoryBoardMinimap.svelte       # Overview navigation
├── StoryBoardSidebar.svelte       # Entity selector + recent
├── StoryBoardSearch.svelte        # Search/filter cards
└── StoryBoardGenerator.svelte     # Table-based content generation modal
```

### Data Model

```typescript
// src/lib/types/storyboard.ts

export interface StoryBoardNode {
  id: string;
  entityId: string | null;    // Reference to Entity (null for free-form cards)
  entityType?: EntityType;    // Campaign, Character, Location, etc.

  // Positioning
  x: number;                  // Canvas coordinates
  y: number;
  width: number;              // Default: 150
  height: number;             // Auto-size based on content

  // Visual
  color?: string;             // Override default color
  icon?: string;              // Override default icon

  // Content
  label?: string;             // Override entity name
  notes?: string;             // Quick notes (multiline)

  // State
  selected: boolean;          // Currently selected for editing
  locked: boolean;            // Prevent accidental moves
  collapsed: boolean;         // Show minimal info
  layer: number;              // Z-index layer (0 = back, 10 = front)

  // Entity sync
  entityError?: 'deleted' | 'not-found';  // Track broken references

  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface StoryBoardDrawing {
  id: string;
  type: 'freehand' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text';

  // Path data (for freehand, line, arrow)
  points?: { x: number; y: number }[];

  // Shape data (for rectangle, circle)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;

  // Text data
  text?: string;
  fontSize?: number;
  fontFamily?: string;

  // Style
  stroke: string;             // Color
  strokeWidth: number;        // Thickness
  fill?: string;              // For shapes
  opacity: number;            // 0-1

  // Rendering
  layer: number;              // Z-index (can draw behind or in front of cards)
  smoothing?: number;         // Curve smoothing (0-1)

  metadata: {
    createdAt: Date;
  };
}

export interface StoryBoardConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;

  // Style
  lineType: 'solid' | 'dashed' | 'dotted';
  color?: string;

  // Labels
  label?: string;             // e.g., "leads to", "causes"

  // Visual
  startMarker?: 'none' | 'arrow' | 'circle';
  endMarker?: 'arrow' | 'circle';

  // Routing
  points?: { x: number; y: number }[];  // For curved/manual routing

  metadata: {
    createdAt: Date;
  };
}

export interface StoryBoard {
  id: string;
  adventureId: string;         // Which adventure this board belongs to
  name: string;                // E.g., "Main Plot", "Character Relationships"

  // Content
  nodes: StoryBoardNode[];
  connections: StoryBoardConnection[];
  drawings: StoryBoardDrawing[];  // Freehand annotations

  // Canvas state
  viewport: {
    x: number;                 // Pan offset
    y: number;
    zoom: number;              // 0.5 - 2.0
  };

  // Interaction state
  mode: 'select' | 'draw' | 'pan';  // Current tool mode
  selectedNodeIds: string[];        // Multi-select

  // History for undo/redo
  history: BoardSnapshot[];
  historyIndex: number;            // Current position in history
  maxHistory: number;              // Keep last N snapshots (default 20)

  // Organization
  swimLanes?: SwimLane[];
  groups?: NodeGroup[];

  // Settings
  settings: {
    gridSize: number;            // Default: 20
    snapToGrid: boolean;         // Default: false
    showGrid: boolean;           // Default: true
    autoArrange: boolean;
    theme: 'dark' | 'light';
    drawingColor: string;        // Current drawing color
    drawingWidth: number;        // Current stroke width
  };

  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface BoardSnapshot {
  timestamp: Date;
  nodes: StoryBoardNode[];
  connections: StoryBoardConnection[];
  drawings: StoryBoardDrawing[];
  action: string;              // Description for undo UI: "Add card", "Move 3 cards"
}

export interface SwimLane {
  id: string;
  name: string;
  y: number;                   // Y position on canvas
  height: number;
  color: string;
}

export interface NodeGroup {
  id: string;
  name: string;
  nodeIds: string[];
  color: string;
  collapsed: boolean;
}
```

### Store Architecture

```typescript
// src/lib/stores/storyboardStore.ts

import { writable, derived } from 'svelte/store';
import type { StoryBoard, StoryBoardNode, StoryBoardConnection } from '$lib/types/storyboard';

interface StoryBoardState {
  boards: Map<string, StoryBoard>;  // boardId -> StoryBoard
  activeBoardId: string | null;
}

function createStoryBoardStore() {
  const { subscribe, set, update } = writable<StoryBoardState>({
    boards: new Map(),
    activeBoardId: null
  });

  // Load from localStorage on init
  function loadFromStorage() { /* ... */ }
  function saveToStorage(state: StoryBoardState) { /* ... */ }

  return {
    subscribe,

    // Board operations
    createBoard(adventureId: string, name: string): StoryBoard { /* ... */ },
    deleteBoard(boardId: string) { /* ... */ },
    setActiveBoard(boardId: string) { /* ... */ },

    // Node operations (with auto-snapshot)
    addNode(boardId: string, node: StoryBoardNode, action?: string) {
      /* Create snapshot before adding */
      /* Add node, save, return node */
    },
    updateNode(boardId: string, nodeId: string, updates: Partial<StoryBoardNode>) { /* ... */ },
    deleteNode(boardId: string, nodeId: string) { /* Create snapshot, delete */ },
    deleteNodes(boardId: string, nodeIds: string[]) { /* Multi-delete with snapshot */ },
    moveNode(boardId: string, nodeId: string, x: number, y: number, skipSnapshot?: boolean) {
      /* Skip snapshot during drag for performance, commit on mouseup */
    },
    moveNodes(boardId: string, nodeIds: string[], deltaX: number, deltaY: number) {
      /* Move multiple nodes together */
    },
    duplicateNodes(boardId: string, nodeIds: string[]) { /* Copy and paste */ },

    // Selection operations
    selectNode(boardId: string, nodeId: string, addToSelection: boolean) { /* ... */ },
    deselectAll(boardId: string) { /* ... */ },
    selectAll(boardId: string) { /* ... */ },

    // Connection operations
    addConnection(boardId: string, connection: StoryBoardConnection) { /* ... */ },
    updateConnection(boardId: string, connectionId: string, updates: Partial<StoryBoardConnection>) { /* ... */ },
    deleteConnection(boardId: string, connectionId: string) { /* ... */ },

    // Drawing operations
    addDrawing(boardId: string, drawing: StoryBoardDrawing, action?: string) { /* ... */ },
    updateDrawing(boardId: string, drawingId: string, updates: Partial<StoryBoardDrawing>) { /* ... */ },
    deleteDrawing(boardId: string, drawingId: string) { /* ... */ },
    clearDrawings(boardId: string) { /* Delete all drawings with snapshot */ },

    // History operations
    undo(boardId: string) {
      /* Restore previous snapshot, update historyIndex */
    },
    redo(boardId: string) {
      /* Restore next snapshot if available */
    },
    createSnapshot(boardId: string, action: string) {
      /* Save current state to history, clear redo stack */
    },
    canUndo(boardId: string): boolean { /* historyIndex > 0 */ },
    canRedo(boardId: string): boolean { /* historyIndex < history.length - 1 */ },

    // Viewport operations
    setViewport(boardId: string, viewport: StoryBoard['viewport']) { /* No snapshot */ },
    zoomIn(boardId: string, focusX?: number, focusY?: number) { /* Zoom toward point */ },
    zoomOut(boardId: string, focusX?: number, focusY?: number) { /* Zoom away from point */ },
    resetViewport(boardId: string) { /* Reset to default */ },
    panTo(boardId: string, x: number, y: number) { /* Pan to specific coordinates */ },
    fitToContent(boardId: string) { /* Zoom/pan to show all nodes */ },

    // Mode operations
    setMode(boardId: string, mode: 'select' | 'draw' | 'pan') { /* ... */ },

    // Auto-arrange (with snapshot)
    autoArrangeTimeline(boardId: string) {
      /* Arrange nodes left-to-right by creation date or explicit order */
      /* Use simple algorithm: sort by date, space evenly */
    },
    autoArrangeCircular(boardId: string) {
      /* Arrange nodes in circle for relationship visualization */
    },
    autoArrangeHierarchical(boardId: string) {
      /* Top-down tree layout based on connections */
      /* May need library like elkjs */
    },

    // Alignment tools
    alignLeft(boardId: string, nodeIds: string[]) { /* Align to leftmost node */ },
    alignCenter(boardId: string, nodeIds: string[]) { /* Align centers */ },
    alignRight(boardId: string, nodeIds: string[]) { /* ... */ },
    distributeHorizontally(boardId: string, nodeIds: string[]) { /* Even spacing */ },
    distributeVertically(boardId: string, nodeIds: string[]) { /* ... */ },

    // Search
    searchNodes(boardId: string, query: string): StoryBoardNode[] {
      /* Search by label, notes, entity name */
    },

    // Utility
    getNodesByEntity(entityId: string): StoryBoardNode[] { /* ... */ },
    getBoardsByAdventure(adventureId: string): StoryBoard[] { /* ... */ },
    syncEntityName(entityId: string, newName: string) {
      /* Update all nodes referencing this entity */
    },
    validateEntityReferences(boardId: string) {
      /* Check all entityIds exist, mark errors */
    },
  };
}

export const storyboardStore = createStoryBoardStore();

// Derived stores
export const activeBoard = derived(
  storyboardStore,
  ($store) => $store.activeBoardId ? $store.boards.get($store.activeBoardId) : null
);

export const activeNodes = derived(
  activeBoard,
  ($board) => $board?.nodes || []
);

export const selectedNodes = derived(
  activeNodes,
  ($nodes) => $nodes.filter(n => n.selected)
);

export const activeConnections = derived(
  activeBoard,
  ($board) => $board?.connections || []
);

export const activeDrawings = derived(
  activeBoard,
  ($board) => $board?.drawings || []
);

export const canUndo = derived(
  activeBoard,
  ($board) => ($board?.historyIndex || 0) > 0
);

export const canRedo = derived(
  activeBoard,
  ($board) => {
    if (!$board) return false;
    return $board.historyIndex < $board.history.length - 1;
  }
);

export const boardMode = derived(
  activeBoard,
  ($board) => $board?.mode || 'select'
);
```

---

## 📊 Current Progress

### Completed Phases ✅
- **Phase 1: Core Canvas (MVP)** - Functional canvas with pan/zoom, undo/redo, keyboard shortcuts
- **Phase 2: Drawing Layer & Visual Polish** - Freehand drawing, color tools, search functionality
- **Phase 3: Entity Integration & Connections** - Entity sidebar, visual arrows, copy/paste, tooltips
- **Phase 4: Story Engine Generation** - Random table integration with generator modal and promote-to-entity

### What's Working Now 🎯
- Infinite canvas with pan (middle-click or space+drag) and zoom (ctrl+scroll)
- Drag cards to position, inline editing with click
- Full undo/redo with keyboard shortcuts (Ctrl+Z/Y)
- Multi-select with box selection and Shift+Click
- Keyboard shortcuts: Delete, Arrow keys (nudge), Ctrl+A (select all), Escape
- Freehand drawing with 8 colors and 5 stroke widths (press D to toggle)
- Ctrl+F search to find and zoom to cards
- Entity selector sidebar with type filters and search
- Alt+Click to create curved arrow connections between cards
- Entity sync: cards auto-update when entity name changes
- Hover tooltips showing full entity details
- GOTO button to navigate from card to entity workspace
- Copy/paste (Ctrl+C/V) and duplicate (Ctrl+D)
- localStorage persistence of all boards
- **Generate button** in toolbar opens modal with 10 table categories
- Roll on 100+ random tables (adventure, character, monster, location, etc.)
- Generated cards have **yellow theme** with ⚡ badge and special styling
- Right-click generated cards to **promote to entities** (character, location, scene, adventure)

---

## 🎬 Implementation Phases

### Phase 1: Core Canvas (MVP) ✅ COMPLETE

**Goal:** Functional brainstorming canvas with essential editing features

**Status:** ✅ Completed - All features implemented and working

**Tasks:**
1. **Data Models** - Create TypeScript interfaces (StoryBoard, StoryBoardNode, etc.)
2. **Store Setup** - Implement storyboardStore with localStorage persistence
3. **Main Container** - Build StoryBoard.svelte with mode management
4. **Canvas** - Implement StoryBoardCanvas.svelte with SVG, pan (space+drag), zoom (ctrl+scroll)
5. **Cards** - Build StoryBoardNode.svelte with:
   - Inline editing (click to edit)
   - Drag to move
   - Entity color-coding
6. **Undo/Redo** - Implement history system with snapshots
7. **Keyboard Shortcuts:**
   - Delete key → Remove selected
   - Ctrl+Z / Ctrl+Y → Undo/redo
   - Escape → Deselect
   - Arrow keys → Nudge position
8. **Multi-select:**
   - Shift+click to add to selection
   - Drag selection box
   - Move/delete multiple cards
9. **Toolbar:**
   - Add Card (blank)
   - Delete Selected
   - Undo/Redo buttons
   - Clear All (with confirmation)
10. **Integration** - Connect to Adventure entity, add "StoryBoard" tab type

**Deliverables:**
- ✅ Create board for adventure
- ✅ Add blank cards
- ✅ Drag cards, pan canvas, zoom
- ✅ Click card to edit inline
- ✅ Multi-select with Shift+click or drag box
- ✅ Delete key removes selected
- ✅ Undo/redo works (20 levels)
- ✅ State persists in localStorage
- ✅ Accessible from workspace tabs

**Time Estimate:** 3-4 days

**Critical Success Factors:**
- Undo MUST work from day one (prevents data loss anxiety)
- Keyboard shortcuts essential for productivity
- Performance: drag must be smooth even with 20+ cards

---

### Phase 2: Drawing Layer & Search ✅ COMPLETE

**Goal:** Freehand annotation and findability

**Status:** ✅ Completed - All features implemented and working

**Tasks:**
1. **Drawing Layer** - Implement StoryBoardDrawingLayer.svelte (SVG-based)
2. **Drawing Tools** - Build StoryBoardDrawingTools.svelte:
   - Pen mode (freehand)
   - Color picker (not just black/white)
   - Stroke width slider
   - Eraser tool
   - Clear drawings button
3. **Mode Toggle** - D key or toolbar button to switch between Select/Draw modes
4. **Drawing Persistence** - Save/load drawings with board state
5. **Search** - Implement StoryBoardSearch.svelte:
   - Text search across card labels and notes
   - Filter by entity type
   - Highlight/zoom to results
6. **Visual Polish:**
   - Entity-specific gradient borders on cards
   - Grid background (subtle dots)
   - Hover effects and shadows

**Deliverables:**
- ✅ Draw freehand lines, shapes, annotations
- ✅ Choose colors and stroke width
- ✅ Eraser works
- ✅ Drawings saved and restored
- ✅ Search finds cards by name/content
- ✅ Beautiful theme-consistent styling

**Time Estimate:** 2-3 days

**Critical Success Factors:**
- Drawing must feel natural (low latency)
- Drawings on separate layer so they don't block card interaction
- Search must be fast even with 50+ cards

---

### Phase 3: Entity Integration & Connections ✅ COMPLETED

**Goal:** Add existing entities and create visual connections

**Status:** ✅ Completed

**Tasks:**
1. **Entity Selector** - Build StoryBoardSidebar.svelte:
   - Dropdown of all entities (Characters, Locations, Adventures, etc.)
   - Filter by type
   - Drag-to-add from sidebar
   - Show entity counts
2. **Entity Sync:**
   - Watch entityStore for changes
   - Update card labels when entity names change
   - Mark cards with broken references (entity deleted)
   - GOTO button navigates to entity tab
3. **Visual Connections** - Implement StoryBoardConnection.svelte:
   - Click card → Click another → Creates straight arrow
   - Connection labels (edit on double-click)
   - Delete connections
   - Different line styles (solid, dashed, dotted)
4. **Entity Preview** - Hover card shows quick info tooltip
5. **Copy/Paste:**
   - Ctrl+C on selected cards
   - Ctrl+V pastes at mouse position
   - Duplicate command (Ctrl+D)

**Deliverables:**
- ✅ Add any existing entity as card
- ✅ Entity name updates propagate to cards
- ✅ GOTO button works
- ✅ Create arrows between cards
- ✅ Copy/paste cards
- ✅ Broken entity references marked visually

**Time Estimate:** 2-3 days

---

### Phase 4: Story Engine Generation 🔜 NEXT

**Goal:** AI-assisted brainstorming with random tables

**Status:** 🔜 Planned - Ready to implement next

**Tasks:**
1. **Generation Modal** - Build StoryBoardGenerator.svelte:
   - Select table category (Character, Plot, Location, etc.)
   - Show available tables (WantTable, ConflictTable, etc.)
   - Roll button generates result
   - "Add to Board" creates card with result
2. **Quick Generation Buttons:**
   - "Generate Plot Beat" → Uses key plot tables
   - "Generate Character" → Creates character with motivation
   - "Generate Location" → Random place description
3. **Generated Card Styling:**
   - Different color for generated vs. entity cards (e.g., yellow for ideas)
   - "Generated" badge
   - Can promote to full entity (click badge → create entity)
4. **Board Templates:**
   - "Blank Canvas" (default)
   - "Three Act Structure" (pre-made swim lanes)
   - "Character Web" (circular layout prompt)
   - "Timeline" (horizontal layout guide)

**Deliverables:**
- ✅ Generate random plot beats, characters, locations
- ✅ One-click generation from toolbar
- ✅ Generated cards visually distinct
- ✅ Can convert generated card to entity
- ✅ Start with pre-made templates

**Time Estimate:** 2 days

**Example:**
Click "Generate Plot Beat" → Card appears: "The hero wants to overcome a fear of dark magic" (from WantTable)

---

### Phase 5: Auto-Layout & Organization 🔵

**Goal:** Smart organization and alignment tools

**Tasks:**
1. **Auto-Arrange Algorithms:**
   - **Timeline** - Arrange left-to-right by creation date or explicit order
     - Simple algorithm: sort by date, space evenly (200px apart)
   - **Circular** - Arrange in circle for relationship visualization
     - Calculate radius based on node count
   - **Grid** - Snap all nodes to grid positions
   - **Hierarchical** - Top-down tree (needs elkjs library)
2. **Alignment Tools:**
   - Align Left/Center/Right (relative to selection)
   - Align Top/Middle/Bottom
   - Distribute Horizontally/Vertically (even spacing)
   - Right-click menu or toolbar buttons
3. **Minimap** - Build StoryBoardMinimap.svelte:
   - Shows entire board scaled down
   - Current viewport highlighted
   - Click to jump to area
   - Drag viewport rectangle to pan
4. **Swim Lanes:**
   - Add horizontal zones (Act 1, Act 2, Act 3)
   - Different background colors
   - Resize lanes
5. **Context Menu:**
   - Right-click card → Delete, Duplicate, Lock, Change Color
   - Right-click canvas → Paste, Add Card, Arrange

**Deliverables:**
- ✅ One-click auto-arrange (3+ algorithms)
- ✅ Alignment and distribution tools
- ✅ Minimap for navigation
- ✅ Swim lanes for structure
- ✅ Context menus

**Time Estimate:** 3 days

---

### Phase 6: Export & Sharing 🔵

**Goal:** Share and export boards

**Tasks:**
1. **Export to Image:**
   - PNG export (use html2canvas or similar)
   - SVG export (native SVG, clean and editable)
   - "Fit to Content" before export
   - Include/exclude drawings toggle
2. **Export to Text:**
   - **Markdown format:**
     ```markdown
     # Story Board: Main Plot

     ## Cards
     - **Hero** (Character) - Position: Act 1
       - Notes: wants to overcome fear
     - **Dark Temple** (Location)

     ## Connections
     - Hero → Dark Temple (travels to)
     ```
   - **Mermaid diagram:**
     ```mermaid
     graph LR
       Hero -->|travels to| DarkTemple
     ```
3. **Print View:**
   - Clean print CSS
   - Page breaks respect cards
   - Black & white mode
4. **Multiple Boards:**
   - Create additional boards for same adventure
   - Tab switcher between boards
   - "Relationships", "Timeline", "Locations", etc.
5. **JSON Export/Import:**
   - Export board as JSON file
   - Import to restore or share

**Deliverables:**
- ✅ Export as PNG/SVG
- ✅ Export as Markdown
- ✅ Print-friendly view
- ✅ Multiple boards per adventure
- ✅ Import/export JSON

**Time Estimate:** 2 days

---

## 🎨 Component Details

### StoryBoard.svelte (Main)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { storyboardStore, activeBoard } from '$lib/stores/storyboardStore';
  import StoryBoardToolbar from './StoryBoardToolbar.svelte';
  import StoryBoardCanvas from './StoryBoardCanvas.svelte';
  import StoryBoardSidebar from './StoryBoardSidebar.svelte';

  interface Props {
    adventureId: string;
  }

  let { adventureId }: Props = $props();
  let sidebarOpen = $state(true);

  onMount(() => {
    // Load or create board for this adventure
    const boards = storyboardStore.getBoardsByAdventure(adventureId);
    if (boards.length === 0) {
      storyboardStore.createBoard(adventureId, 'Story Board');
    } else {
      storyboardStore.setActiveBoard(boards[0].id);
    }
  });
</script>

<div class="storyboard-container">
  <StoryBoardToolbar />

  <div class="storyboard-main">
    {#if sidebarOpen}
      <StoryBoardSidebar />
    {/if}

    <StoryBoardCanvas />
  </div>
</div>

<style>
  .storyboard-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(to bottom right, rgb(15 23 42), rgb(88 28 135), rgb(15 23 42));
  }

  .storyboard-main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
</style>
```

### StoryBoardCanvas.svelte

```svelte
<script lang="ts">
  import { activeBoard, activeNodes, activeConnections } from '$lib/stores/storyboardStore';
  import StoryBoardNode from './StoryBoardNode.svelte';
  import StoryBoardConnection from './StoryBoardConnection.svelte';
  import StoryBoardGrid from './StoryBoardGrid.svelte';

  let canvasElement = $state<HTMLDivElement>();
  let viewport = $derived($activeBoard?.viewport || { x: 0, y: 0, zoom: 1 });

  // Pan state
  let isPanning = $state(false);
  let panStart = $state({ x: 0, y: 0 });

  function handleMouseDown(e: MouseEvent) {
    if (e.button === 1 || e.ctrlKey) { // Middle mouse or Ctrl+click
      isPanning = true;
      panStart = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (isPanning) {
      storyboardStore.setViewport($activeBoard!.id, {
        ...viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }

  function handleMouseUp() {
    isPanning = false;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(2, viewport.zoom * delta));
    storyboardStore.setViewport($activeBoard!.id, { ...viewport, zoom: newZoom });
  }
</script>

<div
  class="canvas-container"
  bind:this={canvasElement}
  onmousedown={handleMouseDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onwheel={handleWheel}
>
  <svg
    class="canvas-svg"
    style="transform: translate({viewport.x}px, {viewport.y}px) scale({viewport.zoom})"
  >
    <StoryBoardGrid />

    <!-- Connections (behind nodes) -->
    {#each $activeConnections as connection (connection.id)}
      <StoryBoardConnection {connection} />
    {/each}

    <!-- Nodes -->
    {#each $activeNodes as node (node.id)}
      <StoryBoardNode {node} />
    {/each}
  </svg>
</div>

<style>
  .canvas-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    cursor: grab;
  }

  .canvas-container:active {
    cursor: grabbing;
  }

  .canvas-svg {
    width: 100%;
    height: 100%;
  }
</style>
```

### StoryBoardNode.svelte

```svelte
<script lang="ts">
  import { storyboardStore, activeBoard } from '$lib/stores/storyboardStore';
  import { entityStore } from '$lib/stores/entityStore';
  import type { StoryBoardNode } from '$lib/types/storyboard';

  interface Props {
    node: StoryBoardNode;
  }

  let { node }: Props = $props();

  // Get entity details
  let entity = $derived(entityStore.getEntity(node.entityId));

  // Drag state
  let isDragging = $state(false);
  let dragStart = $state({ x: 0, y: 0 });
  let nodeStart = $state({ x: 0, y: 0 });

  function handleMouseDown(e: MouseEvent) {
    e.stopPropagation();
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    nodeStart = { x: node.x, y: node.y };
  }

  function handleMouseMove(e: MouseEvent) {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      storyboardStore.moveNode(
        $activeBoard!.id,
        node.id,
        nodeStart.x + dx,
        nodeStart.y + dy
      );
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleClick(e: MouseEvent) {
    if (e.detail === 2) { // Double-click
      // Navigate to entity detail
      // tabStore.openTab(entity);
    }
  }

  const iconForType = {
    campaign: '🎭',
    adventure: '🗺️',
    character: '👤',
    location: '📍',
    scene: '🎬'
  };

  const colorForType = {
    campaign: 'from-purple-500 to-pink-500',
    adventure: 'from-blue-500 to-cyan-500',
    character: 'from-green-500 to-emerald-500',
    location: 'from-yellow-500 to-orange-500',
    scene: 'from-red-500 to-rose-500'
  };
</script>

<foreignObject
  x={node.x}
  y={node.y}
  width={node.width}
  height={node.height}
>
  <div
    class="node {isDragging ? 'dragging' : ''}"
    onmousedown={handleMouseDown}
    onclick={handleClick}
  >
    <!-- Glow effect -->
    <div class="node-glow bg-gradient-to-r {colorForType[node.entityType]}"></div>

    <!-- Content -->
    <div class="node-content">
      <div class="node-header">
        <span class="node-icon">{iconForType[node.entityType]}</span>
        <span class="node-title">{node.label || entity?.name || 'Unnamed'}</span>
      </div>

      {#if node.notes}
        <p class="node-notes">{node.notes}</p>
      {/if}

      {#if !node.collapsed}
        <div class="node-footer">
          <span class="node-type">{node.entityType}</span>
        </div>
      {/if}
    </div>
  </div>
</foreignObject>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<style>
  .node {
    position: relative;
    background: rgb(30 27 75 / 0.9);
    border: 1px solid rgb(168 85 247 / 0.3);
    border-radius: 0.75rem;
    padding: 0.75rem;
    cursor: move;
    transition: all 0.2s;
    user-select: none;
    backdrop-filter: blur(8px);
  }

  .node:hover {
    border-color: rgb(168 85 247 / 0.6);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgb(168 85 247 / 0.3);
  }

  .node.dragging {
    opacity: 0.7;
    cursor: grabbing;
  }

  .node-glow {
    position: absolute;
    inset: -2px;
    border-radius: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    filter: blur(8px);
  }

  .node:hover .node-glow {
    opacity: 0.3;
  }

  .node-content {
    position: relative;
    z-index: 1;
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .node-icon {
    font-size: 1.25rem;
  }

  .node-title {
    font-weight: 600;
    color: white;
    font-size: 0.875rem;
  }

  .node-notes {
    color: rgb(216 180 254);
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .node-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .node-type {
    font-size: 0.625rem;
    text-transform: uppercase;
    color: rgb(168 85 247);
    background: rgb(168 85 247 / 0.2);
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
  }
</style>
```

---

## 🚀 Getting Started (Phase 1)

### User Flow

1. **Create Campaign** → Add Adventure
2. **Open Adventure** in workspace
3. **Click "Story Board" tab** (new tab type)
4. **Empty canvas** with quick-start options:
   - "Add existing entity"
   - "Generate plot beat"
   - "Start with template"
5. **Add nodes** and arrange visually
6. **Connect nodes** by clicking + clicking
7. **Navigate** back to entities via double-click

### Integration Points

**Adventure Card Component:**
Add button: "📋 Open Story Board"

**Workspace:**
New tab type: `storyboard`

**Entity Detail Pages:**
Add button: "Add to Story Board"

---

## ⌨️ Keyboard Shortcuts Reference

Essential for productivity - implement in Phase 1:

| Shortcut | Action | Notes |
|----------|--------|-------|
| **Selection & Editing** |||
| Click | Select card | Enters edit mode, shows actions |
| Shift+Click | Add to selection | Multi-select |
| Drag | Multi-select box | Select multiple cards at once |
| Escape | Deselect all | Exits edit mode |
| Ctrl+A | Select all | All cards on board |
| **Movement** |||
| Drag card | Move | While selected |
| Arrow keys | Nudge 1px | Fine positioning |
| Shift+Arrow | Nudge 10px | Faster movement |
| **Editing** |||
| Delete / Backspace | Delete selected | Confirms if > 3 cards |
| Ctrl+C | Copy | Copies selected cards |
| Ctrl+V | Paste | At mouse position |
| Ctrl+D | Duplicate | Copy + paste in place |
| Ctrl+X | Cut | Copy + delete |
| **History** |||
| Ctrl+Z | Undo | Up to 20 levels |
| Ctrl+Y / Ctrl+Shift+Z | Redo | Restore undone action |
| **Canvas** |||
| Space+Drag | Pan canvas | Or middle-mouse drag |
| Ctrl+Scroll | Zoom | Toward mouse cursor |
| Ctrl+0 | Reset zoom | 100% zoom, center |
| Ctrl+1 | Fit to content | Show all cards |
| **Tools** |||
| D | Toggle draw mode | Switch Select ↔ Draw |
| V | Select mode | Default mode |
| **Creation** |||
| Ctrl+N | New card | At canvas center |
| Ctrl+G | Generate plot beat | Random table |
| Ctrl+E | Add entity | Opens entity selector |

**Accessibility:**
- Tab navigation for toolbar
- Enter/Space to activate buttons
- Screen reader labels on all interactive elements

---

## 📐 Key Design Decisions

### Why SVG over HTML5 Canvas for Drawing?

**SVG Drawing Layer Benefits:**
- DOM-based: Each stroke is an element (can select, delete individually)
- Resolution-independent: Scales perfectly with zoom
- Export-friendly: Native SVG export
- Mixed content: foreignObject allows HTML cards inside SVG
- Accessible: Can add labels and descriptions

**HTML5 Canvas Limitations:**
- Raster-based: Pixelates when zoomed
- No individual element manipulation
- Export requires html2canvas conversion
- Can't mix with DOM (cards would be separate layer)
- Print preview issues in browsers

**Chosen Approach:** SVG for entire board (cards + drawings)
- Drawings use `<path>` elements
- Cards use `<foreignObject>` with HTML inside
- Everything transforms together with viewport

### Why Separate Store from entityStore?

- **Size:** Boards can have 100+ nodes + drawings (large data)
- **Persistence:** Different strategy (single large JSON vs. many small entities)
- **Lifecycle:** Board state changes frequently (drag updates), entity changes rarely
- **Isolation:** StoryBoard bugs don't affect core entity system
- **Multiple boards:** Same adventure can have multiple board views

### Why Snapshot-based Undo Instead of Command Pattern?

**Snapshot Approach:**
- Simple to implement: Just deep-clone state
- Works for any change (move, add, delete, draw)
- Easy to serialize (already JSON)
- 20 snapshots ≈ 200KB (acceptable for localStorage)

**Command Pattern Would Require:**
- Command class for every operation type
- More complex to maintain
- Harder to serialize
- May not capture all state changes

**Trade-off:** Memory for simplicity

### Why Skip Snapshots During Drag?

**Performance Optimization:**
```typescript
function onMouseMove(e: MouseEvent) {
  // DON'T snapshot every mouse pixel
  moveNode(boardId, nodeId, x, y, skipSnapshot: true);
}

function onMouseUp() {
  // Snapshot ONCE when done
  createSnapshot(boardId, "Move card");
}
```

**Reasoning:**
- Dragging generates 100+ mousemove events
- Each snapshot copies entire board state
- Would create massive undo stack
- Single "Move" action in undo history is more intuitive

### Why Layer System?

**3 Layers:**
1. **Background** (z-index: 0) - Grid, swim lanes
2. **Drawings** (z-index: 1-5) - Can choose to draw behind or in front of cards
3. **Cards** (z-index: 6-10) - Draggable, always interactive
4. **Connections** (z-index: 5) - Between drawings and cards

**Benefits:**
- Draw circles behind cards to group them
- Draw arrows in front to highlight relationships
- Cards always draggable (no pointer-events conflict)

### Why Not Real-time Collaboration (Phase 1-6)?

**Complexity:**
- Needs WebSocket server or CRDTs
- Conflict resolution for simultaneous edits
- Cursor positions, selection state
- Significant architecture change

**Future Path:**
- Phase 1-6: Single-user, localStorage
- Phase 7+: Optional sync via WebSocket
- Export/import JSON for async collaboration

---

## 🎯 Success Metrics

**Adoption:**
- 50%+ of adventures have at least one board
- Average 5+ nodes per board
- 80% of boards have connections

**Usability:**
- Users create first board in < 2 minutes
- Average session time: 10+ minutes
- Return usage: 3+ times per campaign

**Value:**
- Users report "better story planning"
- Reduced prep time
- More coherent narratives

---

## 🔮 Future Enhancements (Post-MVP)

### Phase 7+: Advanced Features
- **AI Integration:** Generate connections based on entity relationships
- **Animation:** Timeline playback, sequence visualization
- **Templates:** Pre-made story structures (Hero's Journey, etc.)
- **Import/Export:** JSON, GraphML, other tools
- **Mobile:** Touch-optimized gestures
- **Collaboration:** Multi-user editing
- **Version Control:** Board history, undo/redo
- **Smart Suggestions:** "Characters near this location", "Related plot beats"

---

## 📚 Technical References

**Libraries to Consider:**
- `d3-force` - Auto-layout algorithms
- `rough.js` - Hand-drawn style (optional theme)
- `html2canvas` - Export to image
- `elkjs` - Graph layout engine

**Inspiration:**
- Miro (collaboration)
- FigJam (casual design)
- Obsidian Canvas (note connections)
- Trello (card-based)
- XMind (mind mapping)

---

## ✅ Definition of Done (Phase 1)

**Core Functionality:**
- [ ] Can create storyboard for adventure
- [ ] Can add blank cards
- [ ] Can drag cards to reposition
- [ ] Can inline-edit card text (click to edit)
- [ ] Can delete cards

**Multi-Select:**
- [ ] Shift+click adds cards to selection
- [ ] Drag selection box to multi-select
- [ ] Can move multiple cards together
- [ ] Can delete multiple cards at once

**Undo/Redo:**
- [ ] Undo works (Ctrl+Z) - 20 levels
- [ ] Redo works (Ctrl+Y)
- [ ] Undo/redo buttons in toolbar work
- [ ] One undo action per card move (not per pixel)

**Keyboard Shortcuts:**
- [ ] Delete key removes selected cards
- [ ] Escape deselects all
- [ ] Arrow keys nudge selected cards
- [ ] Ctrl+A selects all

**Canvas Navigation:**
- [ ] Space+drag pans canvas
- [ ] Ctrl+scroll zooms in/out
- [ ] Middle-mouse drag pans (optional)
- [ ] Zoom centers on mouse cursor

**Persistence & Integration:**
- [ ] State persists to localStorage
- [ ] Load works correctly on page refresh
- [ ] Accessible from workspace as tab type
- [ ] Adventure entity has "Story Board" button

**Visual Design:**
- [ ] Theme-consistent colors and styling
- [ ] Entity-type color coding on cards
- [ ] Hover effects and shadows
- [ ] Grid background (subtle)
- [ ] Selected cards have highlighted border

**Performance:**
- [ ] Drag is smooth with 20+ cards (60fps)
- [ ] No console errors or warnings
- [ ] localStorage doesn't exceed 5MB

**Documentation:**
- [ ] Keyboard shortcuts documented
- [ ] User guide updated
- [ ] Code comments for complex logic

---

## 📖 Common Workflows & Use Cases

### Workflow 1: Brainstorm Plot Beats

**Scenario:** GM needs to plan a 5-session adventure

1. Create board "Main Plot"
2. Click "Generate Plot Beat" → Gets "wants to overcome fear of dark magic"
3. Create blank card, write "Villain: Lord Shadowbane"
4. Create another card "Location: Haunted Tower"
5. Drag cards into timeline (left to right = session order)
6. Draw arrows showing causality
7. Draw circle around Act 1 cards to group them
8. Generate more plot beats as inspiration hits

**Result:** Visual timeline of story beats with connections

### Workflow 2: Map Character Relationships

**Scenario:** Complex political intrigue campaign

1. Create board "Character Web"
2. Add existing character entities from dropdown
3. Arrange in circle
4. Draw lines between allies (solid green)
5. Draw lines between enemies (dashed red)
6. Add notes on each connection ("secret lovers", "owes debt")
7. Generate character motivations with "wants to..." tables
8. Add new intrigue cards as plot develops

**Result:** Relationship map showing alliances, conflicts, secrets

### Workflow 3: Location-Based Adventure

**Scenario:** Dungeon crawl with multiple locations

1. Create board "Dungeon Map"
2. Add Location entities (rooms)
3. Arrange spatially (rough map layout)
4. Draw lines showing connections
5. Add Monster entities to rooms
6. Draw treasure icon in each room
7. Add encounter notes
8. Draw path showing intended player route

**Result:** Visual dungeon map with encounters

### Workflow 4: Quick Session Prep

**Scenario:** Need to prep tonight's session in 10 minutes

1. Open existing campaign board
2. Select cards relevant to tonight (Shift+click)
3. Ctrl+C, Ctrl+V to copy to "Session 5" board
4. Generate 2-3 random encounters
5. Arrange by likely order
6. Add quick notes on cards
7. Export as PNG, print

**Result:** One-page session plan

### Workflow 5: Recover from Player Chaos

**Scenario:** Players went completely off-script

1. Open main board
2. Cross out (draw X) on invalidated plot beats
3. Generate new plot beats to adapt
4. Draw new connections to improvised content
5. Undo if idea doesn't work (Ctrl+Z)
6. Quickly iterate until coherent path emerges

**Result:** Adapted plot that incorporates player choices

---

## 🎬 Next Steps

1. **Review & Approve Plan** (this document)
2. **Create TypeScript types** (`storyboard.ts`)
3. **Implement store** (`storyboardStore.ts`)
4. **Build StoryBoard.svelte** (container)
5. **Build StoryBoardCanvas.svelte** (pan/zoom)
6. **Build StoryBoardNode.svelte** (draggable)
7. **Integrate with Adventure entity**
8. **Test & iterate**

---

**Priority:** 🟢 High
**Effort:** 🟡 Medium (2-3 weeks for Phases 1-4, 4 weeks for all phases)
**Impact:** 🟢 High (unique differentiator, enables visual storytelling)
**Risk:** 🟢 Low (incremental phases, isolated from core features)

**Phase Breakdown:**
- Phase 1 (MVP): 3-4 days - Draggable cards, undo/redo, keyboard shortcuts
- Phase 2 (Drawing): 2-3 days - Freehand drawing layer, search
- Phase 3 (Integration): 2-3 days - Entity linking, connections, copy/paste
- Phase 4 (Generation): 2 days - Random tables, templates
- Phase 5 (Layout): 3 days - Auto-arrange, alignment tools, minimap
- Phase 6 (Export): 2 days - PNG/SVG/Markdown export

**Total MVP (Phases 1-2):** ~1 week
**Full Feature Set (Phases 1-6):** ~3 weeks

---

## 🎉 What Makes This Plan Better

**Compared to original RandomTables implementation:**
1. ✅ **Undo/Redo** - No more data loss anxiety
2. ✅ **Multi-select** - Work with groups efficiently
3. ✅ **Keyboard shortcuts** - Power user productivity
4. ✅ **Search** - Find cards in large boards
5. ✅ **SVG drawing** - Scalable, exportable annotations
6. ✅ **Entity sync** - Changes propagate automatically
7. ✅ **Modern UX** - Theme-consistent, beautiful
8. ✅ **Performance** - Smooth with 100+ elements
9. ✅ **Export** - Share and print boards
10. ✅ **Svelte 5** - Latest reactivity patterns

**Key Innovation:** Combines structured entities with freeform brainstorming - the best of both worlds.

---

*Last Updated: 2025-11-10 (Revised)*
*Author: Claude Code*
*Status: Comprehensive Plan → Ready for Implementation*
*Revision Notes: Added drawing layer, undo/redo, keyboard shortcuts, multi-select, performance optimizations, workflow examples*
