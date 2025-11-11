# Solo RPG Scene Workflow - Missing Features

## Current Issues
1. ~~Quick Actions section is broken/not working~~ - ✅ **REMOVED**
2. Missing Scene Bookkeeping component - **HIGH PRIORITY**
3. No guidance on what to do during a scene
4. Incomplete scene cycle workflow
5. ~~Random Events during Fate Questions only log to console~~ - ✅ **FIXED**

## Complete Mythic GME Scene Workflow

### DURING A SCENE
- Player asks Fate Questions as needed
- Random Events can trigger (when rolling doubles ≤ CF on Fate Questions)
- Player resolves the main action/goal of the scene
- Scene continues until primary objective is resolved

### END OF SCENE (Bookkeeping Required)
**3 Required Steps:**

1. **Update Lists**
   - Add important Threads from the scene
   - Add important Characters from the scene
   - Remove completed/irrelevant Threads
   - Remove irrelevant Characters
   - Duplicate entries for very important elements (max 3 entries per item)

2. **Adjust Chaos Factor**
   - Scene IN PC control → CF -1 (things going well)
   - Scene OUT OF PC control → CF +1 (things chaotic)
   - CF stays between 1-9

3. **Record Scene Stats**
   - Fate Questions asked in this scene
   - Random Events that occurred
   - Notes about what happened

### STARTING NEXT SCENE

1. **Decide Expected Scene**
   - What does PC plan to do next?
   - Where will they go?
   - What do they hope to accomplish?

2. **Test Scene (Roll d10 vs CF)**
   - Roll > CF: **Expected Scene** (happens as planned)
   - Roll ≤ CF and ODD: **Altered Scene** (modified somehow)
   - Roll ≤ CF and EVEN: **Interrupt Scene** (Random Event interrupts)

3. **Handle Result**
   - Expected: Begin scene as planned
   - Altered: Roll Scene Adjustment table, interpret change
   - Interrupt: Generate Random Event, incorporate into scene

## Components Completed ✅

### 1. SceneBookkeeping.svelte - COMPLETED ✅
Modal that opens when scene ends, with 3 sections:

**Section 1: Update Lists**
```
- Show current Threads with checkboxes to:
  - Mark as completed (remove)
  - Mark as important (duplicate entry)
- Show current Characters with same options
- "Add New Thread" button
- "Add New Character" button
```

**Section 2: Adjust Chaos Factor**
```
- Question: "Was this scene in PC control?"
- Radio buttons:
  - Yes (CF -1) - PC made progress toward goals
  - No (CF +1) - PC suffered setbacks/sidetracks
  - Unclear (CF stays same)
- Show current CF and new CF
```

**Section 3: Scene Notes**
```
- Textarea for scene summary
- Auto-filled stats:
  - Fate Questions asked: X
  - Random Events occurred: X
- "Complete Scene" button
```

### 2. Update SceneManager.svelte - COMPLETED ✅

**"End Current Scene" Button** ✅
- Shows when a scene is active
- Opens SceneBookkeeping modal
- Prominent placement in header

**Scene Workflow Guide** ✅
- Added blue info panel with 4-step workflow
- Shows during active scenes
- Clear guidance on what to do

**Scene Display** ✅
- Shows current scene prominently
- Displays scene type (Expected/Altered/Interrupt/First)
- Shows expected vs actual descriptions

### 3. Update soloRpgStore.svelte.ts - COMPLETED ✅

**Added Methods:**
```typescript
// List weighting (duplicate important entries)
duplicateThread(id: string): void  ✅
duplicateCharacter(id: string): void  ✅

// Get scene stats
getSceneStats(sceneNumber: number): {
  fateQuestions: number;
  randomEvents: number;
}  ✅
```

All methods implemented with:
- Max 3 duplicate entries per item
- Scene number tracking for new entries
- Auto-save functionality

### 4. Remove Quick Actions Section - COMPLETED ✅
Removed the entire Quick Actions div from solo-rpg/+page.svelte

## Updated Plan Document

### Sprint 2.5: Complete Scene Workflow - COMPLETED ✅
**Week 1: Scene Bookkeeping**
- ✅ SceneManager.svelte (scene testing)
- ✅ SceneBookkeeping.svelte (end-of-scene workflow)
- ✅ Update SceneManager with workflow guidance
- ✅ Add scene stats tracking
- **Deliverable:** Complete scene cycle ✅

**Week 2: Polish & Testing**
- ✅ Remove broken Quick Actions
- ✅ Fix Random Event triggers
- ✅ Add workflow hints/guidance
- ✅ Update all documentation
- **Deliverable:** Polished, playable Solo RPG MVP ✅

## Gameplay Flow Summary

```
1. START ADVENTURE
   ↓
2. CREATE/LOAD SESSION
   ↓
3. START FIRST SCENE (no testing needed)
   ↓
4. PLAY SCENE
   - Ask Fate Questions
   - Handle Random Events
   - Resolve main action
   ↓
5. END SCENE (Bookkeeping)
   - Update Lists
   - Adjust Chaos Factor
   - Add Notes
   ↓
6. PLAN NEXT SCENE
   - Decide what PC does next
   ↓
7. TEST SCENE (d10 vs CF)
   - Expected / Altered / Interrupt
   ↓
8. START NEW SCENE
   ↓
9. GO TO STEP 4 (repeat)
```

## Priority Actions

1. ~~Fix FateQuestion Random Event trigger~~ - ✅ **COMPLETED**
2. ~~Remove Quick Actions section~~ - ✅ **COMPLETED**
3. **HIGH:** Build SceneBookkeeping component - **NEXT PRIORITY**
4. **HIGH:** Add "End Scene" button to SceneManager
5. **MEDIUM:** Add scene workflow guidance/hints
6. **MEDIUM:** Update plan document with complete workflow
7. **LOW:** Add tooltips and help text throughout

## Bug Fixes Completed ✅

### Fix Random Event Trigger in FateQuestion - COMPLETED

**Implemented Changes:**

**FateQuestion.svelte:**
1. Added `onRandomEventTriggered` callback prop to Props interface
2. Updated callback invocation to call prop instead of console.log
3. Enhanced Random Event notification UI with clear messaging
4. Added fully functional button to open Random Event modal

**solo-rpg/+page.svelte:**
1. Passed callback prop to FateQuestion component
2. Callback opens Random Event modal when triggered

**Status:** Random Events during Fate Questions now fully functional!

### How Random Events Work

**During Fate Questions:**
- Roll d100 (or 2d10 for Fate Check)
- If roll is DOUBLES (11, 22, 33, 44, 55, 66, 77, 88, 99)
- AND single digit ≤ Chaos Factor
- Then: Random Event occurs IN ADDITION to answering the question
- The Fate Question answer is still valid/used

**Example:**
- CF = 6
- Roll d100 = 33
- Single digit = 3
- 3 ≤ 6, so Random Event triggers!
- Answer the Fate Question normally
- THEN generate and resolve the Random Event

**During Scene Setup:**
- Roll d10 vs CF when testing Expected Scene
- If roll ≤ CF and EVEN (2, 4, 6, 8): Interrupt Scene
- Interrupt Scene = Random Event completely replaces Expected Scene
- Generate Random Event and build scene around it

## Notes

- The Random Event button in Quick Actions DOES work (has onclick handler)
- But the other buttons (New Scene, Journal) don't do anything
- Better to remove entire section and let scene workflow guide the player
- SceneManager already has scene testing - just need bookkeeping
- Store already has most methods - just need a few additions for weighting/stats
