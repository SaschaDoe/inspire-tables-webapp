# Mythic GME Variations Implementation Plan

This document outlines the plan to implement advanced/optional features from the Mythic GME 2nd Edition VARIATIONS section (p123+).

## Features to Implement

### ✅ Core Features Already Complete
- Fate Questions with Fate Chart (d100)
- Random Events with Event Focus Table
- Scene Management (First, Expected, Altered, Interrupt)
- Chaos Factor tracking
- Lists (Threads & Characters)
- Meaning Tables (all variants)
- Session History

---

## 🎯 Phase 1: Enhanced NPC Features

### Feature 2: NPC Behavior Table Guidance
**Location in Manual**: p108-109
**What It Is**: Interpretive guidance for Fate Question results about NPC actions
**Implementation**:
- **Component**: Tooltip/help icon in `FateQuestion.svelte` result display
- **Trigger**: Show when user types keywords like "NPC", "does [name]", "will [name]"
- **Content**: Contextual guidance based on result:
  - **Yes**: "The NPC does what you expect or continues their action"
  - **No**: "The NPC does the next most expected behavior"
  - **Exceptional Yes**: "The NPC does the expected action with greater intensity"
  - **Exceptional No**: "The NPC does the opposite or breaks away dramatically"
- **UI**: Subtle info icon (ℹ️) next to result that shows popover with guidance

**Files to Modify**:
- `src/lib/components/solorpg/FateQuestion.svelte`

**Estimated Effort**: 1-2 hours

---

### Feature 3: NPC Statistics Table
**Location in Manual**: p127
**What It Is**: Random table for generating NPC combat statistics (Strength, Agility, etc.)
**Implementation**:
- **New Table**: Add to `src/lib/tables/mythicTables/`
  - File: `npcStatisticsTable.ts`
  - Rolls 1d100 for each stat (Strength, Agility, Intellect, Willpower)
- **New Component**: `NPCStatisticsGenerator.svelte`
  - Input: NPC name (optional)
  - Output: Generated stats (Low/Below Average/Average/Above Average/High/Exceptional)
  - Button: "Save to Characters List"
- **Integration**: Add button to Solo RPG interface
  - Location: Near Lists Panel or as modal tool
  - Icon: 📊 "Generate NPC Stats"

**Files to Create**:
- `src/lib/tables/mythicTables/npcStatisticsTable.ts`
- `src/lib/components/solorpg/NPCStatisticsGenerator.svelte`

**Files to Modify**:
- `src/routes/solo-rpg/+page.svelte` (add button/modal)
- `src/lib/data/tableMetadata.ts` (register table)

**Estimated Effort**: 3-4 hours

---

## 🎯 Phase 2: Thread Enhancement Features

### Feature 4: Thread Progress Track
**Location in Manual**: p132-135
**What It Is**: Visual 10-box track showing progress toward resolving a thread
**Implementation**:
- **Data Structure**: Add to Thread type in `soloRpgStore.svelte.ts`:
  ```typescript
  interface Thread {
    name: string;
    progressTrack?: number; // 0-10, optional
    // existing fields...
  }
  ```
- **UI Component**: Visual track in `ListsPanel.svelte`
  - Each thread shows progress boxes: ☐☐☐☐☐☐☐☐☐☐
  - Click to toggle filled: ☑
  - Tooltip: "Move Toward: +1 box | Move Away: -1 box | Close: Fill all"
- **Auto-update from Events**: When Random Event result is:
  - "Move Toward Thread": Prompt to +1 a thread
  - "Move Away From Thread": Prompt to -1 a thread
  - "Close Thread": Prompt to fill thread completely
- **Optional Feature**: Can be toggled on/off per thread

**Files to Modify**:
- `src/lib/stores/soloRpgStore.svelte.ts` (add progressTrack field)
- `src/lib/components/solorpg/ListsPanel.svelte` (add visual track UI)
- `src/lib/components/solorpg/RandomEventGenerator.svelte` (add progress prompts)

**Estimated Effort**: 4-5 hours

---

### Feature 5: Discovery Fate Question
**Location in Manual**: p136
**What It Is**: Special Fate Question variant for making discoveries (always uses 50/50 odds)
**Implementation**:
- **UI Enhancement**: Add checkbox in `FateQuestion.svelte`
  - Label: "🔍 Discovery Question (uses 50/50 odds)"
  - When checked: Forces odds to "50/50" and shows special guidance
- **Special Behavior**:
  - If result triggers Random Event → Skip the event (discoveries don't generate events)
  - Show tooltip: "Discovery Questions use 50/50 odds regardless of likelihood"
- **Use Case Examples** (show in tooltip):
  - "Do I find a clue?"
  - "Is there a secret door?"
  - "Do I discover the villain's weakness?"

**Files to Modify**:
- `src/lib/components/solorpg/FateQuestion.svelte`

**Estimated Effort**: 2 hours

---

### Feature 6: Thread Discovery Check
**Location in Manual**: p137-139
**What It Is**: Mechanic for discovering new threads during play
**Implementation**:
- **When to Use**: After certain Random Events (especially "New NPC", "Ambiguous Event")
- **Component**: `ThreadDiscoveryCheck.svelte` (modal/inline prompt)
  - Trigger: Manual button or auto-prompt after specific events
  - Process:
    1. Roll 1d100
    2. If roll ≤ (Chaos Factor × 10): Discovery made
    3. On success: Roll 2× on Meaning Tables → New thread
    4. Add thread to Lists automatically
- **Integration**:
  - Add "🔍 Check for Thread Discovery" button in Scene Manager
  - Auto-prompt after "Ambiguous Event" or "New NPC" events

**Files to Create**:
- `src/lib/components/solorpg/ThreadDiscoveryCheck.svelte`

**Files to Modify**:
- `src/lib/components/solorpg/SceneManager.svelte` (add button)
- `src/lib/components/solorpg/RandomEventGenerator.svelte` (auto-prompt)

**Estimated Effort**: 3-4 hours

---

## 🎯 Phase 3: Advanced Scene Features

### Feature 8: Keyed Scenes
**Location in Manual**: p149-155
**What It Is**: Pre-planned scenes with specific content that you want to include
**Implementation**:
- **Data Structure**: Add KeyedScene type:
  ```typescript
  interface KeyedScene {
    id: string;
    name: string;
    description: string;
    requiredThreads?: string[]; // Thread names that trigger this scene
    requiredChaosFactor?: { min?: number; max?: number };
    isPlayed: boolean;
    order?: number; // Optional ordering
  }
  ```
- **New Component**: `KeyedScenesManager.svelte`
  - CRUD for keyed scenes
  - Mark scenes as played
  - Trigger conditions (threads, chaos factor range)
- **Integration with Scene Manager**:
  - Before normal scene setup, check if any keyed scene should trigger
  - Show notification: "Keyed Scene Available: [name]"
  - Option to play keyed scene or continue with expected scene
- **UI**: Separate panel/modal accessible from Solo RPG interface
  - Tab: "Keyed Scenes" alongside current tools
  - List of planned scenes with trigger conditions

**Files to Create**:
- `src/lib/components/solorpg/KeyedScenesManager.svelte`

**Files to Modify**:
- `src/lib/stores/soloRpgStore.svelte.ts` (add KeyedScene type and storage)
- `src/lib/components/solorpg/SceneManager.svelte` (check for keyed scenes)
- `src/routes/solo-rpg/+page.svelte` (add tab/button)

**Estimated Effort**: 5-6 hours

---

## 🎯 Phase 4: Danger Tracking

### Feature 10: Peril Points
**Location in Manual**: p170
**What It Is**: Track accumulated danger/peril that affects scene outcomes
**Implementation**:
- **Data Structure**: Add to Session:
  ```typescript
  interface Session {
    // ... existing fields
    perilPoints?: number; // 0-10+, optional
    perilThreshold?: number; // Default 5, configurable
  }
  ```
- **UI Component**: Visual tracker in main interface
  - Location: Near Chaos Factor display
  - Display: "⚠️ Peril: ▓▓▓▓▓░░░░░ (5/10)"
  - Controls: +/- buttons, threshold setting
- **Effects**:
  - When Peril Points ≥ Threshold: Show warning badge
  - Optional: Increase Random Event chance
  - Optional: Modify Fate Question odds (add -1 to rolls)
- **Reset**: Manual reset or auto-reset at scene end
- **Integration**:
  - GM can add peril points during dangerous scenes
  - Optional auto-increase on "PC Negative" events

**Files to Modify**:
- `src/lib/stores/soloRpgStore.svelte.ts` (add peril tracking)
- `src/lib/components/solorpg/ChaosFactorPanel.svelte` (add peril display)
- `src/lib/components/solorpg/SceneManager.svelte` (optional reset)

**Estimated Effort**: 3 hours

---

## 📋 Implementation Summary

### Total Estimated Effort: 23-28 hours

### Recommended Order:
1. **Feature 2** (NPC Behavior Guidance) - Quick win, enhances existing feature
2. **Feature 5** (Discovery Fate Question) - Small enhancement, useful immediately
3. **Feature 10** (Peril Points) - Simple tracking mechanic
4. **Feature 4** (Thread Progress Track) - Visual enhancement for threads
5. **Feature 6** (Thread Discovery Check) - Builds on thread features
6. **Feature 3** (NPC Statistics Generator) - Standalone tool
7. **Feature 8** (Keyed Scenes) - Most complex, can be done last

### Technical Considerations:
- All features should be **optional** (can be toggled on/off per session)
- Store optional settings in `SessionSettings` interface
- Maintain backwards compatibility with existing sessions
- Add feature explanations/tooltips for new users
- Update Session History to log new mechanics (progress track changes, peril points, etc.)

---

## 🎨 UI Integration Plan

### Main Solo RPG Interface Layout:
```
┌────────────────────────────────────────┐
│ Scene Manager | History | Settings     │ ← Existing header
├────────────────────────────────────────┤
│ 📊 Chaos Factor: 5    ⚠️ Peril: 3/10  │ ← Add Peril here
├────────────────────────────────────────┤
│ Fate Questions                         │
│   [Question input]                     │
│   Result: Yes ℹ️ ← NPC Behavior tip    │
│   □ Discovery Question                 │ ← New checkbox
├────────────────────────────────────────┤
│ Lists (Threads & Characters)           │
│   Thread: Find artifact                │
│   Progress: ☑☑☑☐☐☐☐☐☐☐             │ ← New track
│   🔍 Check for Thread Discovery        │ ← New button
├────────────────────────────────────────┤
│ Tools: Random Event | Meaning | 4W     │
│        NPC Stats | Keyed Scenes        │ ← Add buttons
└────────────────────────────────────────┘
```

---

## 📝 Documentation Needs

Each new feature should include:
1. **Tooltip/Help Icon**: Brief explanation of what it does
2. **Example Use Cases**: When to use this feature
3. **Manual Reference**: Link to page in Mythic GME manual (if applicable)
4. **"Learn More" Modal**: Detailed explanation with examples

---

## ✅ Definition of Done

For each feature:
- [ ] Implementation complete
- [ ] Svelte 5 compliant (no warnings from autofixer)
- [ ] Integrated into main Solo RPG interface
- [ ] Optional/toggleable (doesn't interfere with basic usage)
- [ ] Session History updated to track new actions
- [ ] Backwards compatible with existing sessions
- [ ] User documentation/tooltips added
- [ ] Tested with existing features (no conflicts)

---

## 🚀 Future Enhancements (Beyond This Plan)

These are NOT in scope but could be added later:
- **Fate Check (2d10)**: Alternative to Fate Chart
- **Alternative Chaos Flavors**: Mid/Low/No-Chaos variants
- **Adventure Crafter Integration**: p171-175
- **Prepared Adventure Support**: p156+ (Adventure Features List)
- **NPC Behavior AI Suggestions**: ML-based NPC action predictions
- **Thread Relationship Graph**: Visual web of connected threads
- **Session Replay**: Watch your adventure unfold chronologically
