# Mythic GME Variations Implementation Plan

This document outlines the plan to implement advanced/optional features from the Mythic GME 2nd Edition VARIATIONS section (p123+).

## ✅ Core Features Already Complete

### Implemented in Current Version:
- ✅ **Fate Questions with Fate Chart** (d100) - Full implementation
- ✅ **Random Events with Event Focus Table** - All focus types
- ✅ **Scene Management** - First, Expected, Altered, Interrupt scenes
- ✅ **Scene Adjustment Table** - Implemented in SceneManager
- ✅ **Chaos Factor tracking** - With up/down adjustments
- ✅ **Lists** - Threads (25 max) & Characters (25 max)
- ✅ **Meaning Tables** - All variants (Actions, Descriptions, Elements, etc.)
- ✅ **Session History** - Comprehensive audit trail
- ✅ **Per-Scene Notes** - Scene.notes field exists
- ✅ **Session Settings** - useFateCheck and chaosFlavor already in store

### Current Data Structures:
- Thread: id, text, position, completed, createdInScene, completedInScene
- Character: id, name, description, position, active, isNPC, createdInScene
- Scene: Full structure with notes, type, chaos tracking, thread/character changes

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

**Design Considerations**:
- Smart detection: Check if question text contains NPC indicators ("does he", "will she", NPC names from Characters list)
- Provide contextual help without being intrusive
- Include examples in tooltip

**Estimated Effort**: 2-3 hours

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

---

## 🎯 Phase 5: Supporting Infrastructure

### Feature 11: Adventure Journal View (NEW)
**What It Is**: Enhanced view of all scenes with narrative summaries
**Implementation**:
- **New Component**: `AdventureJournal.svelte`
  - Chronological display of all scenes
  - Each scene shows: number, type, description, chaos before/after, notes
  - Rich text editor for scene narrative
  - Print/export friendly view
- **Features**:
  - Search/filter scenes by keyword
  - Jump to specific scene
  - Inline editing of scene notes
  - "Story Mode" view (hide mechanics, show only narrative)
- **Integration**: Button in header "📖 Adventure Journal"

**Files to Create**:
- `src/lib/components/solorpg/AdventureJournal.svelte`

**Files to Modify**:
- `src/routes/solo-rpg/+page.svelte` (add button)

**Estimated Effort**: 4-5 hours

---

### Feature 12: Settings/Preferences Panel (NEW - CRITICAL)
**What It Is**: Centralized settings for optional features
**Implementation**:
- **New Component**: `SessionSettings.svelte`
- **Settings to Add**:
  ```typescript
  interface SessionSettings {
    // Existing
    useFateCheck: boolean;
    chaosFlavor: 'standard' | 'mid' | 'low' | 'none';

    // New
    useThreadProgressTracks: boolean;
    usePerilPoints: boolean;
    useKeyedScenes: boolean;
    showNPCBehaviorGuidance: boolean;
    autoSuggestThreadDiscovery: boolean;

    // UI preferences
    compactMode: boolean;
    showTutorialHints: boolean;
  }
  ```
- **UI**: Modal accessible via ⚙️ icon in header
  - Grouped sections: Mechanics / UI / Advanced
  - Toggle switches with descriptions
  - Reset to defaults button

**Files to Modify**:
- `src/lib/stores/soloRpgStore.svelte.ts` (add SessionSettings interface)
- `src/routes/solo-rpg/+page.svelte` (add settings button)

**Files to Create**:
- `src/lib/components/solorpg/SessionSettings.svelte`

**Estimated Effort**: 3-4 hours

---

### Feature 13: Data Migration & Compatibility (NEW - CRITICAL)
**What It Is**: Handle backwards compatibility for existing sessions
**Implementation**:
- **Migration Strategy**:
  1. Add version field to SoloRpgSession: `schemaVersion: number`
  2. Current version: 1, increment with breaking changes
  3. Migration functions for each version jump
- **Default Values**:
  ```typescript
  function migrateSession(session: any): SoloRpgSession {
    // Add missing fields with defaults
    return {
      ...session,
      schemaVersion: 2,
      settings: session.settings || getDefaultSettings(),
      // Add new fields with safe defaults
      threads: session.threads.map(t => ({
        ...t,
        progressTrack: t.progressTrack ?? undefined
      })),
      // etc.
    };
  }
  ```
- **Load-time Migration**: Automatically upgrade old sessions when loaded

**Files to Modify**:
- `src/lib/stores/soloRpgStore.svelte.ts` (add migration logic)

**Estimated Effort**: 2-3 hours

---

### Feature 14: Export/Import Sessions (NEW)
**What It Is**: Export session data to JSON, import from file
**Implementation**:
- **Export**: Download session as `.mythic.json` file
  - Include all session data
  - Human-readable formatting
  - Metadata: export date, version
- **Import**: Upload `.mythic.json` file
  - Validate structure
  - Run migrations if needed
  - Conflict resolution if session ID exists
- **UI**: Buttons in Session Manager
  - "📥 Import Session"
  - "📤 Export Session" (per session)

**Files to Modify**:
- `src/lib/components/solorpg/SessionManager.svelte` (add import/export buttons)
- `src/lib/stores/soloRpgStore.svelte.ts` (add import/export methods)

**Estimated Effort**: 3-4 hours

---

### Feature 15: Keyboard Shortcuts (NEW - Optional Enhancement)
**What It Is**: Power user shortcuts for common actions
**Implementation**:
- **Shortcuts**:
  - `Ctrl+F`: Ask Fate Question (focus input)
  - `Ctrl+E`: Generate Random Event
  - `Ctrl+S`: Save session
  - `Ctrl+H`: Open History
  - `Ctrl+J`: Open Journal
  - `Esc`: Close modals
  - `?`: Show keyboard shortcuts help
- **UI**: Keyboard shortcuts modal (show with `?` key)
  - List all shortcuts with descriptions
  - Platform-aware (Cmd on Mac, Ctrl on Windows)

**Files to Create**:
- `src/lib/components/solorpg/KeyboardShortcutsHelp.svelte`

**Files to Modify**:
- `src/routes/solo-rpg/+page.svelte` (add global keyboard listener)

**Estimated Effort**: 2-3 hours

---

## 📋 Implementation Summary

### Total Estimated Effort: 35-45 hours

### Recommended Order (Priority-Based):

#### 🔴 Phase 0: Critical Infrastructure (MUST DO FIRST)
1. **Feature 13** (Data Migration) - Foundation for all changes
2. **Feature 12** (Settings Panel) - Control for optional features

#### 🟢 Phase 1: Quick Wins (High Value, Low Effort)
3. **Feature 2** (NPC Behavior Guidance) - 2-3h
4. **Feature 5** (Discovery Fate Question) - 2h
5. **Feature 10** (Peril Points) - 3h

#### 🟡 Phase 2: Core Enhancements
6. **Feature 4** (Thread Progress Track) - 4-5h
7. **Feature 3** (NPC Statistics Generator) - 3-4h
8. **Feature 11** (Adventure Journal) - 4-5h

#### 🟠 Phase 3: Advanced Features
9. **Feature 6** (Thread Discovery Check) - 3-4h
10. **Feature 8** (Keyed Scenes) - 5-6h

#### 🔵 Phase 4: Nice-to-Have
11. **Feature 14** (Export/Import) - 3-4h
12. **Feature 15** (Keyboard Shortcuts) - 2-3h

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

---

## 📱 Mobile & Responsive Design Considerations

All new features must work well on mobile:
- **Thread Progress Tracks**: Touch-friendly boxes (min 44x44px)
- **Peril Points**: Swipeable or tap-based controls
- **Settings Panel**: Scrollable sections, thumb-friendly toggles
- **Keyed Scenes Manager**: Card-based layout for small screens
- **Adventure Journal**: Readable on phone, hide secondary info on mobile
- **Keyboard Shortcuts**: Show/hide based on device type
- **NPC Stats Generator**: Stack vertically on mobile

**Testing Targets**:
- Mobile: 375px width (iPhone SE)
- Tablet: 768px width (iPad)
- Desktop: 1280px+ width

---

## 🎓 Tutorial & Onboarding Strategy

### For New Users:
1. **First-time Setup Wizard**:
   - Choose complexity level: Basic / Standard / Advanced
   - Basic: Core features only (hide optional features)
   - Standard: Show most features with hints
   - Advanced: Everything enabled

2. **Contextual Tooltips**:
   - Show ? icons next to new features
   - "What's this?" tooltips on first use
   - Dismissible hints (store in localStorage)

3. **Tutorial Mode** (Optional):
   - Guided walkthrough of first session
   - Step-by-step instructions
   - Can skip at any time

### For Existing Users:
- **"What's New" Modal**: Show once per version with new features
- **Feature Announcements**: Small badge on new buttons
- **Opt-in for Advanced Features**: Don't overwhelm with everything at once

---

## 🧪 Testing Checklist

### Per Feature:
- [ ] Works with existing sessions (backwards compatible)
- [ ] Works with new sessions
- [ ] Toggleable on/off (if optional)
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] No Svelte warnings/errors
- [ ] Session History tracks changes
- [ ] Data persists to localStorage
- [ ] Export/import includes new data

### Integration Testing:
- [ ] All features work together without conflicts
- [ ] Settings panel controls all optional features
- [ ] Data migration handles all version upgrades
- [ ] Performance acceptable with all features enabled

---

## 🚀 Future Enhancements (Beyond This Plan)

These are NOT in scope but could be added later:
- **Fate Check (2d10)**: Alternative to Fate Chart (we have useFateCheck flag ready)
- **Alternative Chaos Flavors**: Mid/Low/No-Chaos variants (chaosFlavor exists)
- **Adventure Crafter Integration**: p171-175
- **Prepared Adventure Support**: p156+ (Adventure Features List)
- **NPC Behavior AI Suggestions**: ML-based NPC action predictions
- **Thread Relationship Graph**: Visual web of connected threads
- **Session Replay**: Watch your adventure unfold chronologically
- **Collaborative Play**: Multiple players in same session (real-time sync)
- **Voice Input**: Speak questions, get spoken answers
- **Procedural Map Generation**: Visual representation of adventure locations

---

## 📝 Documentation Requirements

Each feature needs:
1. **In-App Help**:
   - Tooltip explaining what it does
   - Example use cases
   - Link to Mythic GME manual page (if applicable)

2. **User Guide**:
   - Update main documentation
   - Add feature to feature matrix
   - Include screenshots

3. **Developer Docs**:
   - Technical architecture
   - Data structures
   - Integration points

---

## 🎯 Success Metrics

How to measure if features are useful:
- **Adoption Rate**: % of sessions using optional features
- **User Feedback**: Surveys, GitHub issues
- **Performance**: Page load time, localStorage size
- **Error Rate**: Console errors, failed operations
- **Retention**: Users returning to app after 7/30 days

---

## ⚠️ Risks & Mitigation

### Risk 1: Feature Overload
**Mitigation**:
- Complexity levels (Basic/Standard/Advanced)
- Progressive disclosure (show features when relevant)
- Settings panel to hide unused features

### Risk 2: Performance Degradation
**Mitigation**:
- Lazy load components
- Virtualize long lists (thread/character lists)
- Debounce localStorage saves

### Risk 3: Data Loss
**Mitigation**:
- Versioned data format
- Migration testing
- Export before updates
- localStorage size monitoring

### Risk 4: Browser Compatibility
**Mitigation**:
- Test on Chrome, Firefox, Safari, Edge
- Polyfills for older browsers
- Graceful degradation for missing features

---

## 💡 Key Insights from Review

### What We Already Have:
- ✅ Scene.notes exists (per-scene narrative)
- ✅ useFateCheck and chaosFlavor settings exist
- ✅ Scene Adjustment Table fully implemented
- ✅ Comprehensive Session History system

### What Was Missing from Original Plan:
- ❌ Adventure Journal view/editor
- ❌ Centralized Settings panel
- ❌ Data migration strategy
- ❌ Export/Import functionality
- ❌ Mobile optimization plan
- ❌ Tutorial/onboarding system

### Critical Realizations:
1. **Settings Panel is CRITICAL** - Must be done before other features
2. **Data Migration is FOUNDATIONAL** - Must be first to avoid breaking changes
3. **Mobile Must Be First-Class** - Many users play on phones
4. **Progressive Disclosure is KEY** - Don't overwhelm new users
