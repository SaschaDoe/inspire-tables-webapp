# Entity UX Plan - Inspire Tables

## Overview
A multi-entity management system with IDE-like navigation for handling interconnected campaign entities (campaigns, adventures, characters, locations, artifacts, etc.).

## Core UX Concepts

### 1. IDE-Style Tab System
Similar to VSCode/IntelliJ, where users can:
- Open multiple entities in tabs
- Pin important tabs
- Close tabs individually
- Reorder tabs by dragging
- Quick switcher (Ctrl/Cmd + P) to jump to any entity

### 2. Three-Panel Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Top Bar: Campaign Selector | Search | User Menu            │
├──────────────┬─────────────────────────────────┬────────────┤
│              │ ┌─ Tab 1 ─┐┌─ Tab 2 ─┐         │            │
│              │ │Campaign  ││Adventure│  [+]    │            │
│   Sidebar    │ └──────────┘└─────────┘         │  Inspector │
│              │                                  │            │
│  - Campaigns │                                  │  Quick     │
│  - Favorites │     Main Content Area            │  Actions   │
│  - Recent    │     (Entity Details)             │            │
│  - Search    │                                  │  Related   │
│  - Filters   │                                  │  Entities  │
│              │                                  │            │
│              │                                  │  Tags      │
└──────────────┴─────────────────────────────────┴────────────┘
```

---

## Detailed Components

### A. Top Navigation Bar

**Left Section:**
- **Logo/Home Button**: Returns to campaigns overview
- **Current Campaign Dropdown**: Shows active campaign, switch between campaigns
- **Breadcrumb Trail**: Shows entity hierarchy
  ```
  My Campaign > Winter's Tale Adventure > Aragorn (Character)
  ```

**Center Section:**
- **Global Search Bar** with filters:
  - Search across all entities by name, description, tags
  - Filter by type: Campaign, Adventure, Character, Location, Artifact, Plot, etc.
  - Filter by campaign
  - Recent searches dropdown

**Right Section:**
- **Quick Actions Button**: Create new entity dropdown
- **View Mode Toggle**: List/Grid/Hierarchy view
- **Settings Icon**
- **User Menu**

---

### B. Left Sidebar (Collapsible)

#### Navigation Sections:

1. **Favorites** ⭐
   - Pinned entities for quick access
   - Drag to reorder
   - Star icon to add/remove from favorites

2. **Open Tabs** 📑
   - List of currently open entity tabs
   - Click to switch
   - Close button (X) on hover
   - Pin icon to keep tab open

3. **Campaigns Tree** 🎭
   - Expandable tree structure:
     ```
     ▼ Campaign 1
       ▼ Adventures (3)
         ▼ Winter's Tale
           ▶ Characters (5)
           ▶ Locations (3)
           ▶ Artifacts (2)
         ▶ Summer's End
         ▶ Autumn's Fall
       ▶ Standalone Characters (2)
       ▶ World Locations (8)
     ▼ Campaign 2
       ...
     ```
   - Right-click context menu: Edit, Delete, Add Child, etc.
   - Badge counters showing entity counts

4. **Recent** ⏱️
   - Last 10 accessed entities
   - Timestamp display
   - Clear history button

5. **Filters** 🔍
   - Toggle visibility of entity types
   - Filter by tags
   - Filter by date created/modified
   - Filter by narrative medium

---

### C. Main Content Area (Tabs + Entity View)

#### Tab Bar Features:
- **Active Tab Highlighting**: Different color/border
- **Tab Close Button**: X on hover
- **Pin Icon**: Keep tab open permanently
- **Unsaved Changes Indicator**: Dot on tab when modified
- **Tab Overflow Menu**: When too many tabs, show "..." with dropdown
- **New Tab Button** (+): Quick create or open entity

#### Tab Keyboard Shortcuts:
- `Ctrl/Cmd + W`: Close current tab
- `Ctrl/Cmd + T`: New tab
- `Ctrl/Cmd + Tab`: Cycle through tabs
- `Ctrl/Cmd + P`: Quick switcher (fuzzy search all entities)
- `Ctrl/Cmd + Shift + F`: Global search

#### Entity View (Inside Tab):
Each entity type has a consistent structure:

**Header Section:**
- Entity icon + type badge
- Entity name (editable inline)
- Tags (clickable, editable)
- Quick actions: Edit, Delete, Duplicate, Export, Share
- Created/Updated timestamps

**Content Section:**
Layout varies by entity type but includes:
- Description/Summary
- Properties (specific to entity type)
- Rich text editor for notes
- Image/media upload
- Custom fields

**Relationships Section:**
- **Belongs To**: Parent entities (e.g., Adventure → Campaign)
- **Contains**: Child entities (e.g., Campaign → Adventures)
- **References**: Related entities (e.g., Character mentioned in Adventure)
- Click any linked entity to open in new tab
- Visual relationship graph (expandable)

---

### D. Right Inspector Panel (Collapsible)

#### 1. Quick Actions
- Generate new related entity
  - "Add Character to this Adventure"
  - "Create Location in this Campaign"
  - "Roll for Artifact"
- Roll on relevant tables
- Quick edit mode

#### 2. Related Entities
- Shows all entities linked to current entity
- Grouped by type:
  - Characters (3)
  - Locations (2)
  - Artifacts (1)
- Click to open in new tab
- Hover preview card

#### 3. Tags & Metadata
- Add/remove tags
- Entity statistics
- Creation log (if applicable)
- Revision history

#### 4. AI Assistant (Future)
- Context-aware suggestions
- "Generate adventure for this character"
- "Create location description"
- "Suggest plot twist"

---

## Specific Entity Types & Views

### Campaign View
**Sections:**
- Overview (genre mix, blend intensity, narrative medium)
- Campaign Statements
- Adventures (grid/list with thumbnails)
- World Building (locations, factions, timeline)
- Characters (all characters across adventures)
- Quick Stats: Total entities, creation date, last modified

**Actions:**
- Generate new adventure
- Add campaign statement
- Create world location
- Import/Export campaign data

---

### Adventure View
**Sections:**
- Overview (title, summary, status)
- Parent Campaign (breadcrumb link)
- Plot Structure (beginning, middle, end tropes)
- Characters (list with roles)
- Locations (map view option)
- Sessions/Chapters
- Key Items/Artifacts
- Events Timeline

**Actions:**
- Generate character for this adventure
- Roll for location
- Add plot event
- Create session notes

---

### Character View
**Sections:**
- Portrait (image upload)
- Basic Info: Name, race, profession, gender, alignment
- Attributes & Stats
- Background & Motivation
- Relationships (to other characters)
- Inventory (artifacts)
- Appears In: (list of adventures/campaigns)
- Character Arc / Development

**Actions:**
- Roll for motivation
- Generate backstory
- Add relationship
- Create character sheet (export)

---

### Location View
**Sections:**
- Map/Image
- Description
- Type (continent, landscape, building, etc.)
- Parent Location (e.g., City → Region → Continent)
- Sub-Locations (rooms in building, districts in city)
- NPCs Present
- Notable Features
- Appears In: (adventures)

**Actions:**
- Generate location details
- Add sub-location
- Create encounter here

---

### Artifact View
**Sections:**
- Image/Icon
- Type (weapon, armor, jewelry, magical item)
- Description
- Properties (magical/profane)
- Quality & Rarity
- Current Owner (character)
- History/Lore
- Enchantments

**Actions:**
- Roll for enchantment
- Generate lore
- Transfer to character

---

## Search & Discovery Features

### Global Search
**Search Algorithm:**
1. Fuzzy matching on names
2. Full-text search on descriptions
3. Tag matching
4. Entity type filtering
5. Campaign scoping

**Search Results Display:**
```
┌─────────────────────────────────────────┐
│ 🔍 Search: "dragon"                     │
├─────────────────────────────────────────┤
│ Campaigns (1)                           │
│   ▸ Dragon's Lair Campaign              │
│                                         │
│ Characters (3)                          │
│   ▸ Dragonborn Warrior (Winter's Tale) │
│   ▸ Dragon Slayer (Summer's End)       │
│   ▸ Young Dragon (NPC)                  │
│                                         │
│ Locations (2)                           │
│   ▸ Dragon Mountain                     │
│   ▸ Dragon's Nest Cave                  │
│                                         │
│ Artifacts (1)                           │
│   ▸ Dragonscale Armor                   │
└─────────────────────────────────────────┘
```

### Quick Switcher (Ctrl/Cmd + P)
- VSCode-style fuzzy finder
- Type to filter all entities
- Shows entity type icon
- Shows parent campaign/adventure
- Navigate with arrow keys, Enter to open
- Recent items at top

---

## Navigation Patterns

### Opening Entities
**Multiple Ways:**
1. Click from sidebar tree
2. Click link in another entity
3. Global search → select result
4. Quick switcher (Ctrl/Cmd + P)
5. Recent items list
6. Favorites list

**Open Behavior:**
- Default: Opens in new tab
- `Ctrl/Cmd + Click`: Opens in background tab
- `Alt + Click`: Opens in split view
- `Shift + Click`: Opens and closes current tab (replace)

### Breadcrumb Navigation
Shows hierarchy path at top:
```
🎭 My Campaign > 🗺️ Winter's Tale > 👤 Aragorn > ⚔️ Andúril
```
- Click any level to jump to that entity
- Dropdown on hover showing siblings at that level

### Back/Forward Buttons
- Browser-style navigation history
- `Alt + Left Arrow`: Go back
- `Alt + Right Arrow`: Go forward
- Shows tooltip of entity name on hover

---

## Entity Relationships & Linking

### Link Types:
1. **Parent-Child** (ownership):
   - Campaign → Adventures
   - Adventure → Characters, Locations

2. **References** (mentions):
   - Character appears in Adventure
   - Artifact owned by Character
   - Location visited in Adventure

3. **Cross-References**:
   - Character knows Character
   - Location connected to Location
   - Plot references Artifact

### Visual Relationship Graph
**Expandable section showing:**
- Node-based graph visualization
- Current entity in center
- Connected entities radiating outward
- Color-coded by entity type
- Click node to navigate
- Zoom in/out
- Filter by relationship type

---

## Favorites & Bookmarks

### Favorites System:
- **Star Icon** on every entity
- Stored per user
- Shows in sidebar "Favorites" section
- Drag to reorder
- Organize into folders/collections
- Export favorites list

### Collections (Optional Enhancement):
- Group related entities
- Example: "Boss Battle Prep" collection
  - Boss character
  - Arena location
  - Boss weapon
  - Boss backstory adventure

---

## Bulk Operations & Multi-Select

### Multi-Select Mode:
- Checkbox appears on hover in lists
- Select multiple entities
- Bulk actions toolbar appears:
  - Add to collection
  - Add tags
  - Export selected
  - Delete selected
  - Move to different campaign/adventure

---

## View Modes

### 1. List View
- Compact rows
- Sortable columns: Name, Type, Modified, Campaign
- Quick actions on hover
- Inline editing

### 2. Grid View
- Card-based layout
- Thumbnail/icon for each entity
- Hover for quick preview
- Better for visual browsing

### 3. Hierarchy View (Tree)
- Shows full entity relationships
- Expandable nodes
- Indent levels show depth
- Good for understanding structure

### 4. Graph View
- Network visualization
- Shows all relationships
- Interactive: drag nodes, zoom
- Filter by entity type
- Reveal connections

---

## Mobile Considerations

### Responsive Design:
- Collapsible sidebar (hamburger menu)
- Bottom tab bar instead of top tabs
- Swipe gestures:
  - Swipe left/right to change tabs
  - Swipe down to close tab
  - Pinch to zoom in graph view
- Simplified inspector panel (bottom sheet)

---

## Performance Optimizations

### Lazy Loading:
- Load entity details on-demand
- Virtualized lists for large collections
- Paginated search results

### Caching:
- Cache open entities
- Prefetch related entities
- Local storage for favorites/recent

### Database Considerations:
- IndexedDB for client-side storage
- Sync with cloud backend (optional)
- Offline mode with sync on reconnect

---

## Implementation Phases

### Phase 1: Foundation (MVP) ✅ COMPLETED
- [x] Campaign entity with localStorage
- [x] Tab system with open/close/pin functionality
- [x] TabBar component with visual interface
- [x] Entity store with CRUD operations
- [x] Entity type definitions and relationships
- [x] Sidebar with campaigns tree (collapsible)
- [x] Three-panel IDE-style layout (sidebar, content, inspector)
- [x] Inspector panel (collapsible) with quick actions
- [x] Basic entity views (Campaign placeholder)
- [x] Simple navigation (click to open in tab)
- [x] "Open Workspace" button on home page
- [ ] Search by name (in progress)
- [ ] Complete entity view components (in progress)

**Status**: Phase 1 is functionally complete! The workspace is operational with tab management, entity store, and basic navigation. Users can open campaigns in tabs, switch between them, pin important tabs, and see the foundation of the IDE-style interface.

**Access**: Navigate to `/workspace` or click "Open Workspace" from the home page.

### Phase 2: Enhanced Navigation (NEXT)
- [ ] Quick switcher (Ctrl+P) for fuzzy entity search
- [ ] Favorites system (star entities)
- [ ] Recent items tracking (last 10 accessed)
- [ ] Breadcrumb navigation with hierarchy
- [ ] Back/forward buttons with history
- [x] Collapsible panels (sidebar and inspector) ✅

### Phase 3: Entity Relationships
- [ ] Link entities together
- [ ] Relationship visualization
- [ ] Click-through navigation
- [ ] Related entities panel
- [ ] Entity creation from relationships
  - "Add character to this adventure"

### Phase 4: Advanced Features
- [ ] Multi-select & bulk operations
- [ ] Collections/folders
- [ ] Tag management
- [ ] Advanced filters
- [ ] Graph visualization
- [ ] Export/import
- [ ] Revision history

### Phase 5: Polish
- [ ] Keyboard shortcuts guide
- [ ] Drag-and-drop organization
- [ ] Split view for comparing entities
- [ ] Theme/customization options
- [ ] Tutorial/onboarding
- [ ] Mobile responsive design

---

## Technical Architecture Notes

### State Management:
- Global entity store (Svelte stores)
- Tab state (open tabs, active tab)
- Navigation history stack
- Search index

### Data Structure:
```typescript
interface Entity {
  id: string;
  type: EntityType;
  name: string;
  description: string;
  tags: string[];
  parentId?: string; // Parent entity
  campaignId: string; // Top-level campaign
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
  };
  relationships: Relationship[];
  customFields: Record<string, any>;
}

interface Relationship {
  targetId: string;
  type: 'parent' | 'child' | 'reference';
  label?: string; // e.g., "appears in", "owns", "located in"
}

enum EntityType {
  Campaign = 'campaign',
  Adventure = 'adventure',
  Character = 'character',
  Location = 'location',
  Artifact = 'artifact',
  Plot = 'plot',
  Faction = 'faction',
  Session = 'session',
  Event = 'event',
  Monster = 'monster'
}
```

### URL Routing:
- `/campaigns` - Campaign list
- `/entity/:entityId` - View any entity
- `/entity/:entityId/edit` - Edit mode
- `/search?q=dragon&type=character` - Search results
- `/campaign/:campaignId` - Campaign-scoped view

---

## UI Component Library Needs

### Custom Components to Build:
1. **TabBar Component**
   - Tab item
   - Tab overflow menu
   - Drag-to-reorder

2. **EntityCard Component**
   - Different layouts per entity type
   - Hover preview
   - Quick actions menu

3. **SearchBar Component**
   - Autocomplete
   - Filter chips
   - Recent searches

4. **EntityTree Component**
   - Expandable nodes
   - Drag-and-drop support
   - Context menu
   - Badge counters

5. **RelationshipGraph Component**
   - Canvas-based or SVG
   - Interactive nodes
   - Zoom/pan controls

6. **QuickSwitcher Component**
   - Modal overlay
   - Fuzzy search
   - Keyboard navigation

7. **Breadcrumb Component**
   - Clickable path
   - Overflow menu
   - Sibling navigation

---

## User Experience Principles

### 1. Discoverability
- Tooltips on hover
- Contextual help
- Empty states with guidance
- Suggested actions

### 2. Consistency
- Same patterns across entity types
- Predictable keyboard shortcuts
- Unified action buttons
- Consistent terminology

### 3. Performance
- Instant feedback on actions
- Optimistic UI updates
- Loading states
- Progressive enhancement

### 4. Flexibility
- Multiple ways to accomplish tasks
- Customizable layout
- Power user keyboard shortcuts
- Beginner-friendly UI

### 5. Data Integrity
- Auto-save
- Undo/redo
- Confirmation on destructive actions
- Backup/restore capabilities

---

## Next Steps for Implementation

1. **Start with Tab System**
   - Create TabBar component
   - Tab state management
   - Open/close/switch functionality

2. **Build Entity Store**
   - Svelte store for entities
   - CRUD operations
   - Persistence layer (localStorage → IndexedDB)

3. **Create Entity Views**
   - Generic entity view component
   - Specific components for each entity type
   - Form validation

4. **Implement Navigation**
   - Sidebar tree component
   - Click-to-open entity
   - Basic breadcrumb

5. **Add Search**
   - Search index (Fuse.js or similar)
   - Search UI component
   - Filter logic

This plan provides a comprehensive roadmap for building a robust, IDE-like entity management system that can scale as complexity grows!
