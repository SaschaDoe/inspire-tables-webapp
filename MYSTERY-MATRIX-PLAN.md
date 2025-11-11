# Mystery Matrix Implementation Plan
## From Mythic Magazine Volume 6 - Creating Mystery Adventures

## Overview
The Mystery Matrix system adds a structured investigation mechanic to Mythic GME for mystery-genre adventures. It tracks Clues and Suspects, links them together, and guides players to solve mysteries through accumulating evidence.

## Core Concepts

### Mystery Matrix Structure
- **20 Clue Boxes** (outer ring, numbered 1-100 for d100 rolls)
- **10 Suspect Boxes** (center, numbered 1-10 for d10 rolls)
- **Links** between Clues and Suspects (visual lines with Clue Point values)
- **Clue Points** per Suspect (count of linked clues)
- **Progress Points** (separate counters for Clues and Suspects)
- **The Mystery** (Thread converted to special Mystery status)

### Key Mechanics

1. **Starting a Mystery**
   - Take a Thread from Threads list
   - Designate it as "The Mystery" (special status)
   - This Thread can ONLY be solved through Mystery Matrix
   - Cannot be resolved through normal Random Events/Scenes

2. **Finding Evidence** (Two Methods)
   - **Investigation**: Normal play, player decides what's a Clue/Suspect
   - **Discovery Check**: Earned check → Fate Question "Is anything discovered?"

3. **Discovery Check Flow**
   - Character performs action with risk/uncertainty
   - Ask Fate Question: "Is anything discovered?"
   - Results:
     - **YES**: Roll on Mystery Elements Table
     - **NO**: Nothing found
     - **EXCEPTIONAL YES**: Roll twice on table
     - **EXCEPTIONAL NO**: No more Discovery Checks this scene

4. **Mystery Elements Table** (1d10 + PP)
   ```
   1-5:   New Clue/Suspect
   6-8:   New Linked Clue/Suspect
   9-10:  Link Clue to Suspect OR New
   11:    Roll Twice OR Link
   12:    New Clue/Suspect
   13:    Special (Mystery Special Table)
   14-15: Clincher Clue / Link
   16+:   Link Clue to Suspect, PP-6
   ```

5. **Mystery Special Table** (1d100)
   - Unclinch, Remove Clue/Suspect, Intensify Clue, PP adjustments

6. **Solving the Mystery**
   - **Goal**: Roll a Clincher Clue OR reach 6 Clue Points on a Suspect
   - **Clincher Clue**: Links to Suspect with most Clue Points = SOLVED
   - **6 Clue Points**: That Suspect is guilty, last clue = Clincher

7. **Mystery Event Focus Table**
   - Replaces standard Event Focus during Mystery adventures
   - Adds "Clue Element" and "Suspect Element" results (free rolls)

## Implementation Plan

### Phase 1: Data Model (Store Updates)
**File**: `src/lib/stores/soloRpgStore.svelte.ts`

Add to SoloRpgSession:
```typescript
// Mystery Matrix
mysteryThread?: string;  // The Thread designated as "The Mystery"
mysteryClues: MysteryClue[];
mysterySuspects: MysterySuspect[];
mysteryLinks: MysteryLink[];
mysteryClueProgressPoints: number;
mysterySuspectProgressPoints: number;
isMysteryActive: boolean;
```

New interfaces:
```typescript
interface MysteryClue {
  id: string;
  position: number;  // 1-100 for d100 rolls
  description: string;
  discoveredInScene: number;
  intensified?: number;  // Multiplier (default 1)
}

interface MysterySuspect {
  id: string;
  position: number;  // 1-10 for d10 rolls
  name: string;
  characterListId?: string;  // Link to Character if applicable
  discoveredInScene: number;
  cluePoints: number;  // Calculated from links
}

interface MysteryLink {
  id: string;
  clueId: string;
  suspectId: string;
  strength: number;  // How many times this link has been strengthened
  createdInScene: number;
}
```

Store methods:
```typescript
- activateMystery(threadId: string)
- addMysteryClue(description: string, position?: number)
- addMysterySuspect(name: string, position?: number)
- linkClueToSuspect(clueId: string, suspectId: string)
- strengthenLink(linkId: string)
- removeMysteryClue(clueId: string)
- removeMysterySuspect(suspectId: string)
- incrementMysteryPP(type: 'clues' | 'suspects')
- intensifyClue(clueId: string)
- markClincherClue(clueId: string, suspectId: string)
- solveMystery(suspectId: string)
```

### Phase 2: Mystery Tables
**Files**: New files in `src/lib/tables/mythicTables/`

1. **mysteryElementsTable.ts**
   - Mystery Elements Table logic
   - Separate for Clues vs Suspects columns
   - Include Progress Points modifier

2. **mysterySpecialTable.ts**
   - Mystery Special Table (1d100)
   - Effects: Unclinch, Remove, Intensify, PP adjustments

3. **mysteryEventFocusTable.ts**
   - Modified Event Focus Table for mysteries
   - Add "Clue Element" and "Suspect Element" results

4. **mysteryDescriptorsTable.ts**
   - Clues descriptors (100 entries)
   - Suspects descriptors (100 entries)

### Phase 3: UI Components
**Files**: New components in `src/lib/components/solorpg/`

1. **MysteryMatrixPanel.svelte**
   - Main Mystery Matrix visualization
   - Grid layout: 20 outer boxes (clues) + 10 inner boxes (suspects)
   - SVG/Canvas for drawing links between clues and suspects
   - Display clue points per suspect
   - Progress points display
   - Add/edit clues and suspects manually (Investigation mode)

2. **MysteryDiscoveryCheck.svelte**
   - Discovery Check workflow modal
   - Step 1: "Did you earn the check?" (Yes/No)
   - Step 2: Fate Question "Is anything discovered?"
   - Step 3: If YES, roll on Mystery Elements Table
   - Show results and update Mystery Matrix

3. **MysteryElementRoller.svelte**
   - Roll on Mystery Elements Table
   - Choose Clues or Suspects column
   - Apply Progress Points modifier
   - Show result and interpretation guidance
   - Auto-update Mystery Matrix

4. **MysteryClueCard.svelte / MysterySuspectCard.svelte**
   - Individual clue/suspect display
   - Edit description
   - Show linked suspects/clues
   - Remove button
   - Intensify button (for clues)

5. **MysteryActivator.svelte**
   - Select a Thread to convert to "The Mystery"
   - Confirmation dialog
   - Move Thread to Mystery status

### Phase 4: Integration Points

**Integration with existing components:**

1. **ListsPanel.svelte**
   - Add "Convert to Mystery" button for Threads
   - Show Mystery status indicator if active

2. **RandomEventGenerator.svelte**
   - Check if Mystery is active
   - If active, use Mystery Event Focus Table instead
   - Handle "Clue Element" and "Suspect Element" results

3. **SceneManager.svelte**
   - Show "Mystery Active" banner if mystery mode
   - Link to Mystery Matrix panel

4. **Main Page** (`solo-rpg/+page.svelte`)
   - Add "Mystery Matrix" tab or accordion section
   - Show when mystery is active

### Phase 5: Visual Design

**Mystery Matrix Layout:**
```
┌─────────────────────────────────────────────────┐
│            MYSTERY: [Thread Name]               │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Clue] [Clue] [Clue] [Clue] [Clue]           │
│                                                 │
│  [Clue]  ╔═══════════════╗  [Clue]            │
│          ║  [Suspect 1]  ║                     │
│  [Clue]  ║  CP: 3        ║  [Clue]            │
│          ╠═══════════════╣                     │
│  [Clue]  ║  [Suspect 2]  ║  [Clue]            │
│          ║  CP: 1        ║                     │
│  [Clue]  ╚═══════════════╝  [Clue]            │
│                                                 │
│  [Clue] [Clue] [Clue] [Clue] [Clue]           │
│                                                 │
├─────────────────────────────────────────────────┤
│  Clue PP: ███ 3    Suspect PP: ██ 2           │
│  [Discovery Check] [Roll for Clue/Suspect]     │
└─────────────────────────────────────────────────┘
```

Use SVG or Canvas to draw connection lines between clues and suspects.

### Phase 6: Features

**Core Features:**
- ✅ Visual Mystery Matrix grid
- ✅ Add/Remove Clues and Suspects
- ✅ Link Clues to Suspects with visual lines
- ✅ Track Clue Points per Suspect
- ✅ Progress Points tracking (separate for each)
- ✅ Discovery Check workflow
- ✅ Roll on Mystery Elements Table
- ✅ Mystery Special Table effects
- ✅ Clincher Clue detection (auto or manual)
- ✅ Solve Mystery workflow
- ✅ Mystery Event Focus integration

**Enhanced Features:**
- Auto-assign position numbers to clues/suspects
- Random position assignment or manual
- Highlight Suspect with most Clue Points
- History log of all discoveries
- Export/Print Mystery Matrix
- Undo last action
- Mystery solved celebration/summary

## User Workflow

1. **Start Mystery**
   - Player creates Thread: "Discover who killed Lord Ashford"
   - Click "Convert to Mystery"
   - Thread removed from list, Mystery becomes active

2. **Investigation**
   - During scenes, player finds clues through normal play
   - Manually add: "Bloody knife found in study"
   - Manually add suspect: "Butler"
   - Draw link between them

3. **Discovery Check**
   - Player: "I search the butler's room for evidence"
   - Click "Discovery Check" button
   - System: "Did you earn this check?" → Player rolls Stealth → Success
   - System: Fate Question "Is anything discovered?" → YES
   - System: Roll Mystery Elements Table (Clues) → "New Linked Clue"
   - System generates or prompts for clue description
   - System rolls for suspect to link → Butler
   - System auto-creates link and updates Clue Points

4. **Progress**
   - Continue investigating, adding clues/suspects
   - Butler accumulates 3 Clue Points
   - Maid has 2 Clue Points
   - Gardener has 1 Clue Point

5. **Solving**
   - Roll Discovery Check → "Clincher Clue"
   - System links to Butler (most Clue Points)
   - Mystery SOLVED!
   - Player interprets final evidence that proves guilt

## Technical Considerations

1. **State Management**
   - Store all mystery data in session
   - Persist to localStorage
   - Clear mystery when solved or abandoned

2. **Visual Rendering**
   - Use SVG for connection lines
   - Calculate line paths dynamically
   - Responsive layout for different screen sizes
   - Consider using D3.js or similar for graph rendering

3. **Dice Rolling**
   - Reuse existing rollD10, rollD100 functions
   - Add rollMysteryElements function
   - Add rollMysterySpecial function

4. **User Experience**
   - Clear visual distinction for mystery mode
   - Tooltips explaining mechanics
   - Guided workflow for Discovery Checks
   - Confirmation dialogs for important actions
   - Undo capability for mistakes

## Progressive Implementation

**Sprint 1: Foundation**
- Data model and store methods
- Basic Mystery Matrix visualization
- Manual add/remove clues and suspects

**Sprint 2: Core Mechanics**
- Discovery Check workflow
- Mystery Elements Table rolling
- Linking clues to suspects
- Progress Points tracking

**Sprint 3: Special Features**
- Mystery Special Table
- Mystery Event Focus integration
- Clincher Clue handling
- Solve Mystery workflow

**Sprint 4: Polish**
- Improved visual design
- History and undo
- Better UX flows
- Mystery descriptors integration
- Help/tutorial content

## Open Questions

1. **Visual representation**: Grid layout vs. circular layout vs. free-form canvas?
2. **Mobile support**: How to handle on small screens?
3. **Multiple mysteries**: Support multiple active mysteries at once?
4. **Integration depth**: Should mystery mode affect other systems (Chaos Factor, etc.)?
5. **AI assistance**: Auto-suggest clue/suspect descriptions based on context?

## Next Steps

1. Review plan with user
2. Decide on visual design approach
3. Start with Sprint 1: Data model
4. Build prototype of Mystery Matrix UI
5. Iterate based on feedback
