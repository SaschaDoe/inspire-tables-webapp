# StoryBoard Feature - Design & Implementation Plan

## 🎯 Vision

A **visual narrative planning canvas** that allows GMs to spatially arrange and connect story elements (characters, scenes, plot beats, locations) for their adventures. Think of it as a hybrid between a mind map, a flowchart, and a director's storyboard - but specifically designed for RPG storytelling.

---

## 🔍 Analysis of Original Implementation

### ✅ What Worked Well
1. **Free positioning** - Spatial arrangement has inherent meaning
2. **Visual connections** - Canvas drawing for relationships
3. **Mixed content** - Different entity types on same board
4. **Quick generation** - Story engine integration for rapid prototyping
5. **Persistent state** - LocalStorage-backed for saving work

### ❌ Weaknesses to Address
1. **Poor UX** - Plain white boxes, basic borders, no visual hierarchy
2. **Svelte 3 patterns** - Old reactivity model, not using runes
3. **Limited canvas** - Only 400x400px, fixed size
4. **No zoom/pan** - Can't handle complex stories
5. **Basic drawing** - No arrows, shapes, or text labels
6. **No organization** - No layers, grouping, or swim lanes
7. **Weak integration** - GOTO button uses context, not proper routing
8. **No collaboration** - Single board per adventure
9. **No templates** - Starting from scratch every time

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

1. **Add Elements**
   - Click "Add Entity" → Dropdown of existing entities
   - Click "Generate" → Random table-based suggestions
   - Drag from sidebar → Existing entities

2. **Positioning**
   - Drag cards freely
   - Snap to grid (optional)
   - Auto-arrange by timeline
   - Magnetic grouping

3. **Connections**
   - Click card → Click another → Creates arrow
   - Right-click connection → Edit label
   - Different line styles: Solid (causes), Dashed (related), Dotted (time)

4. **Editing**
   - Double-click card → Inline edit
   - Click badge → Navigate to entity detail
   - Hover → Show quick info

5. **Organization**
   - Swim lanes (Act 1, Act 2, Act 3)
   - Groups/clusters
   - Layers (Background, Entities, Connections, Notes)

---

## 🏗️ Technical Architecture

### Component Structure (Svelte 5 Runes)

```
src/lib/components/storyboard/
├── StoryBoard.svelte              # Main container
├── StoryBoardToolbar.svelte       # Top toolbar with actions
├── StoryBoardCanvas.svelte        # SVG canvas with pan/zoom
├── StoryBoardNode.svelte          # Individual draggable entity card
├── StoryBoardConnection.svelte    # Arrow/line between nodes
├── StoryBoardGrid.svelte          # Background grid overlay
├── StoryBoardMinimap.svelte       # Overview navigation
└── StoryBoardSidebar.svelte       # Entity palette/library
```

### Data Model

```typescript
// src/lib/types/storyboard.ts

export interface StoryBoardNode {
  id: string;
  entityId: string;           // Reference to Entity
  entityType: EntityType;     // Campaign, Character, Location, etc.

  // Positioning
  x: number;                  // Canvas coordinates
  y: number;
  width: number;
  height: number;

  // Visual
  color?: string;             // Override default color
  icon?: string;              // Override default icon

  // Content
  label?: string;             // Override entity name
  notes?: string;             // Quick notes

  // Metadata
  layer: number;              // Z-index layer
  locked: boolean;            // Prevent accidental moves

  // State
  collapsed: boolean;         // Show minimal info
  metadata: {
    createdAt: Date;
    updatedAt: Date;
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

  // Canvas state
  viewport: {
    x: number;                 // Pan offset
    y: number;
    zoom: number;              // 0.5 - 2.0
  };

  // Organization
  swimLanes?: SwimLane[];
  groups?: NodeGroup[];

  // Settings
  settings: {
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
    autoArrange: boolean;
    theme: 'dark' | 'light';
  };

  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
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

    // Node operations
    addNode(boardId: string, node: StoryBoardNode) { /* ... */ },
    updateNode(boardId: string, nodeId: string, updates: Partial<StoryBoardNode>) { /* ... */ },
    deleteNode(boardId: string, nodeId: string) { /* ... */ },
    moveNode(boardId: string, nodeId: string, x: number, y: number) { /* ... */ },

    // Connection operations
    addConnection(boardId: string, connection: StoryBoardConnection) { /* ... */ },
    updateConnection(boardId: string, connectionId: string, updates: Partial<StoryBoardConnection>) { /* ... */ },
    deleteConnection(boardId: string, connectionId: string) { /* ... */ },

    // Viewport operations
    setViewport(boardId: string, viewport: StoryBoard['viewport']) { /* ... */ },
    zoomIn(boardId: string) { /* ... */ },
    zoomOut(boardId: string) { /* ... */ },
    resetViewport(boardId: string) { /* ... */ },

    // Auto-arrange
    autoArrangeTimeline(boardId: string) { /* ... */ },
    autoArrangeCircular(boardId: string) { /* ... */ },
    autoArrangeHierarchical(boardId: string) { /* ... */ },

    // Utility
    getNodesByEntity(entityId: string): StoryBoardNode[] { /* ... */ },
    getBoardsByAdventure(adventureId: string): StoryBoard[] { /* ... */ },
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

export const activeConnections = derived(
  activeBoard,
  ($board) => $board?.connections || []
);
```

---

## 🎬 Implementation Phases

### Phase 1: Core Canvas (MVP) 🟢

**Goal:** Basic draggable nodes on canvas

**Tasks:**
1. Create `StoryBoard.svelte` container with pan/zoom
2. Implement `StoryBoardNode.svelte` with Svelte 5 runes
3. Add drag-and-drop positioning
4. Create `storyboardStore` with persistence
5. Add basic toolbar (Add Node, Delete, Clear)
6. Integrate with Adventure entity

**Deliverables:**
- Can create board for adventure
- Can add nodes (manually)
- Can drag nodes around
- State persists in localStorage
- Access from workspace/adventure view

**Time Estimate:** 2-3 days

---

### Phase 2: Connections & Visual Polish 🟡

**Goal:** Connect nodes with styled arrows, improve visuals

**Tasks:**
1. Implement `StoryBoardConnection.svelte` with SVG paths
2. Add connection creation UI (click-to-connect)
3. Style nodes with entity-specific gradients
4. Add grid background
5. Implement connection labels
6. Add node collapse/expand

**Deliverables:**
- Visual arrows between nodes
- Styled, theme-consistent UI
- Connection editing
- Better visual hierarchy

**Time Estimate:** 2 days

---

### Phase 3: Entity Integration 🟡

**Goal:** Deep integration with existing entities

**Tasks:**
1. Add entity selector dropdown
2. Create nodes from existing entities
3. Quick-add from entity detail pages
4. Navigate to entity on node click
5. Sync entity updates to nodes
6. Add entity quick-info on hover

**Deliverables:**
- Can add any entity to board
- Bidirectional navigation entity ↔ board
- Entity changes reflect on board
- Quick preview without navigation

**Time Estimate:** 2 days

---

### Phase 4: Story Engine Integration 🟢

**Goal:** Generate story elements on board

**Tasks:**
1. Add "Generate Plot Beat" button
2. Add "Generate Character Motivation" button
3. Create `StoryEngineModal.svelte` for table selection
4. Generate nodes from table rolls
5. Add scene/beat templates
6. Quick-generate starter boards

**Deliverables:**
- Random generation integrated
- Table-based node creation
- Template boards (3-act, hero's journey, etc.)

**Time Estimate:** 2 days

---

### Phase 5: Auto-Layout & Organization 🔵

**Goal:** Smart organization features

**Tasks:**
1. Implement auto-arrange algorithms:
   - Timeline (left-to-right)
   - Circular (relationships)
   - Hierarchical (cause-effect)
2. Add swim lanes
3. Add grouping/clustering
4. Implement minimap
5. Add search/filter

**Deliverables:**
- One-click organization
- Structured layouts
- Better navigation for large boards

**Time Estimate:** 3 days

---

### Phase 6: Collaboration & Export 🔵

**Goal:** Sharing and export capabilities

**Tasks:**
1. Export to PNG/SVG
2. Export to markdown/text
3. Share board (read-only link)
4. Print layout
5. Multiple boards per adventure

**Deliverables:**
- Exportable boards
- Shareable planning
- Print-friendly views

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

## 📐 Key Design Decisions

### Why SVG over Canvas?
- Better for UI elements (DOM-based)
- Easier hover states, tooltips
- Accessible
- Can mix HTML (foreignObject) for rich content

### Why Separate Store?
- Large data structure (positions, connections)
- Different persistence strategy
- Can have multiple boards per adventure
- Independent lifecycle from entities

### Why Layers?
- Background decorations don't interfere with dragging
- Connections always behind nodes
- Notes/annotations on top layer

### Why Not Real-time Collaboration?
- Adds significant complexity
- Would need backend/WebSocket
- Can add later if needed (Phase 7+)

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

- [ ] Can create storyboard for adventure
- [ ] Can add nodes with entity data
- [ ] Can drag nodes around canvas
- [ ] Can pan/zoom canvas
- [ ] State persists to localStorage
- [ ] Basic visual design matches app theme
- [ ] Accessible from adventure/workspace
- [ ] No console errors
- [ ] Responsive (desktop only for MVP)
- [ ] Documentation updated

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
**Effort:** 🟡 Medium (2-3 weeks for full implementation)
**Impact:** 🟢 High (unique differentiator, improves story planning)
**Risk:** 🟢 Low (can ship incrementally, doesn't affect existing features)

---

*Last Updated: 2025-11-10*
*Author: Claude Code*
*Status: Planning → Ready for Implementation*
