# Solo RPG Complete Implementation Plan
**Goal:** Implement full Mythic GME 2nd Edition ruleset with all 42 tables

**Status:** In Progress
**Started:** January 11, 2025

---

## Current State Analysis

### ✅ What Works (Sprint 1-2.5 Complete)
- Scene management (First, Expected, Altered, Interrupt)
- Scene bookkeeping (Update Lists, Adjust CF, Scene Notes)
- Fate Questions with Fate Chart
- Random Event triggering (doubles detection)
- Scene Adjustment Table for Altered Scenes
- Threads and Characters Lists management
- Session management and localStorage persistence
- Chaos Factor management

### ❌ What's Broken/Missing
1. **Random Event Meaning Tables** - Placeholders only, not actually rolling
2. **Discovering Meaning Feature** - Not implemented at all (major feature!)
3. **39 of 42 Mythic tables** - Exist as code but not accessible to users
4. **Table selection UI** - No way for users to choose which meaning table to use
5. **NPC Behavior Table** - Not implemented
6. **Complex table lookups** - No helper to actually get results from tables

---

## Phase 1: Fix Random Events (CRITICAL - Currently Broken)

### Priority: P0 (Blocker)
### Estimated Time: 2-3 hours

#### Tasks

**1.1: Create Table Lookup Helper**
- **File:** `src/lib/utils/mythicTableLookup.ts` (NEW)
- **Purpose:** Central system to roll on any Mythic table and get actual results
- **Functions:**
  ```typescript
  // Get result from any meaning table
  function rollOnMeaningTable(tableName: string, roll?: number): { roll: number; result: string }

  // Get two rolls for meaning (standard Mythic pattern)
  function rollTwoMeaningWords(tableName: string): { roll1: number; word1: string; roll2: number; word2: string }

  // Suggest tables based on Event Focus
  function getRecommendedMeaningTables(focus: EventFocus): string[]
  ```
- **Implementation:**
  - Import all 42 table classes
  - Create map of table name → table instance
  - Handle d100 rolls and lookups
  - Error handling for invalid table names

**1.2: Update RandomEventGenerator Component**
- **File:** `src/lib/components/solorpg/RandomEventGenerator.svelte`
- **Changes:**
  - Replace lines 131-134 (placeholder strings) with actual table lookups
  - Add table selection UI in "meaning" step
  - Show suggested tables based on Event Focus (from eventFocus.ts suggestions)
  - Allow manual table selection from dropdown
  - Display actual rolled words instead of placeholders
  - Add "Reroll Meaning" button

**1.3: Update Event Focus Suggestions**
- **File:** `src/lib/utils/eventFocus.ts`
- **Changes:**
  - Update `suggestMeaningTables()` to return exact table names that match our table classes
  - Add descriptions for why each table is suggested

**1.4: Testing**
- Generate Random Event
- Verify Event Focus rolls correctly
- Verify Meaning Tables show suggestions
- Verify actual table results appear (not placeholders)
- Test all Event Focus types
- Verify interpretation notes include actual words

**Acceptance Criteria:**
- [ ] Random Events display actual meaning table results
- [ ] Users can select from suggested tables
- [ ] Users can choose alternate tables from full list
- [ ] Two words are rolled and displayed
- [ ] Words are saved in event history
- [ ] All Event Focus types work correctly

---

## Phase 2: Add "Discover Meaning" Feature (NEW MAJOR FEATURE)

### Priority: P1 (High Value)
### Estimated Time: 4-5 hours

#### Context
From Mythic manual page 84: "Discovering Meaning is about generating adventure details by rolling on a Meaning Table... You can roll on any Meaning Table at any time to get a pair of words to use for inspiration."

This is a PRIMARY feature of Mythic GME, not just for Random Events!

#### Tasks

**2.1: Create MeaningDiscovery Component**
- **File:** `src/lib/components/solorpg/MeaningDiscovery.svelte` (NEW)
- **Purpose:** Standalone tool to roll on any meaning table anytime
- **UI Design:**
  ```
  ┌─────────────────────────────────────────┐
  │  🎲 Discover Meaning                    │
  ├─────────────────────────────────────────┤
  │  What do you want to learn about?       │
  │                                          │
  │  [Category Buttons]                      │
  │  - Characters (11 tables)                │
  │  - Locations (12 tables)                 │
  │  - Creatures (5 tables)                  │
  │  - Objects & Items (3 tables)            │
  │  - Actions & Descriptions (4 tables)     │
  │  - Meta/Tone (2 tables)                  │
  │                                          │
  │  [Table Selection Dropdown]              │
  │  Choose specific table or "Recommended"  │
  │                                          │
  │  [🎲 Roll for Meaning]                   │
  │                                          │
  │  Result:                                 │
  │  ┌───────────────────────────────────┐  │
  │  │ Roll 1: 47 → "Mysterious"         │  │
  │  │ Roll 2: 83 → "Ancient"            │  │
  │  │                                   │  │
  │  │ 💡 Interpretation Help:           │  │
  │  │ Combine these words to describe   │  │
  │  │ what you asked about...           │  │
  │  └───────────────────────────────────┘  │
  │                                          │
  │  [Add to Notes] [Roll Again]            │
  └─────────────────────────────────────────┘
  ```

**2.2: Table Organization System**
- **File:** `src/lib/data/meaningTableCategories.ts` (NEW)
- **Purpose:** Organize 42 tables into logical categories
- **Structure:**
  ```typescript
  export interface TableCategory {
    name: string;
    icon: string;
    description: string;
    tables: {
      name: string;
      tableName: string; // Matches import
      description: string;
      useCase: string;
    }[];
  }

  export const MEANING_TABLE_CATEGORIES: TableCategory[] = [
    {
      name: "Characters",
      icon: "👤",
      description: "Describe NPCs, their actions, and personalities",
      tables: [
        { name: "Character Appearance", tableName: "CharacterAppearanceTable", ... },
        { name: "Character Background", tableName: "CharacterBackgroundTable", ... },
        // ... all 11 character tables
      ]
    },
    // ... all categories
  ];
  ```

**2.3: Integration with Main UI**
- **File:** `src/routes/solo-rpg/+page.svelte`
- **Changes:**
  - Add "Discover Meaning" button to main toolbar
  - Add modal/panel for MeaningDiscovery component
  - Optional: Add to "Quick Tables" tab

**2.4: Context-Aware Suggestions**
- When in a scene, suggest relevant tables based on:
  - Current scene type
  - Recent Fate Questions
  - Active threads/characters
- Example: If you just added an NPC to Characters List, suggest "Character Appearance" table

**2.5: Result History**
- **File:** Update `src/lib/stores/soloRpgStore.svelte.ts`
- Add new type: `MeaningRoll`
  ```typescript
  export interface MeaningRoll {
    id: string;
    sceneNumber: number;
    context: string; // What player was trying to learn
    tableName: string;
    roll1: number;
    result1: string;
    roll2: number;
    result2: string;
    playerInterpretation?: string;
    timestamp: Date;
  }
  ```
- Add to session: `meaningRollHistory: MeaningRoll[]`
- Add method: `logMeaningRoll(roll: MeaningRoll)`

**2.6: Testing**
- Access Discover Meaning from main page
- Browse all categories
- Roll on each category type
- Verify all 42 tables are accessible
- Verify results are different each time
- Check interpretation help is useful
- Test history logging

**Acceptance Criteria:**
- [ ] Discover Meaning panel accessible from main UI
- [ ] All 42 tables organized in clear categories
- [ ] Can browse and select any table
- [ ] Rolling produces two words from actual tables
- [ ] Results are logged to session history
- [ ] Context-aware suggestions work
- [ ] UI is intuitive and helpful

---

## Phase 3: Enhanced Meaning Table Selection

### Priority: P2 (Polish)
### Estimated Time: 2-3 hours

#### Tasks

**3.1: Smart Table Recommendations**
- Analyze current context and suggest best tables
- Consider:
  - Event Focus type
  - Scene location type (dungeon, city, wilderness)
  - Recent NPCs added
  - Adventure tone

**3.2: Table Preview**
- Show 3-5 sample results when hovering over table name
- Help users understand what each table provides

**3.3: Multi-Table Rolling**
- Allow rolling on multiple tables at once
- Example: "Character Appearance" + "Character Personality" together
- Combine results for rich NPC generation

**3.4: Custom Table Combinations**
- Save favorite table combinations
- "Quick NPC Generator" = Appearance + Identity + Personality
- "Location Details" = Location Descriptors + Objects + Actions

**Acceptance Criteria:**
- [ ] Recommendations are helpful and accurate
- [ ] Can preview table contents
- [ ] Multi-table rolling works smoothly
- [ ] Can save and reuse combinations

---

## Phase 4: NPC Behavior & Advanced Features

### Priority: P2 (Nice to Have)
### Estimated Time: 3-4 hours

#### Tasks

**4.1: NPC Behavior Generator**
- **File:** `src/lib/components/solorpg/NPCBehaviorGenerator.svelte` (NEW)
- From manual page 106: "Generating NPC Behavior"
- Roll on Character Actions or specialized behavior
- Integrated into Character management

**4.2: Meaning Tables in Altered Scenes**
- Add option to use Meaning Tables for scene alteration inspiration
- Alternative to Scene Adjustment Table
- Button: "Get Inspiration from Meaning Tables"

**4.3: Adventure Tone & Plot Twists**
- **Component:** `AdventureToneSelector.svelte` (NEW)
- Roll on Adventure Tone table during session creation
- Roll on Plot Twists table for major narrative shifts
- Suggest when to use based on session progress

**4.4: Integration with Fate Questions**
- When Fate Question is ambiguous, offer "Roll for Details" button
- Opens Discover Meaning with suggested table

**Acceptance Criteria:**
- [ ] NPC Behavior system works
- [ ] Meaning Tables available in Altered Scenes
- [ ] Adventure Tone can be set
- [ ] Plot Twists can be generated
- [ ] Integration with Fate Questions smooth

---

## Phase 5: Documentation & Polish

### Priority: P3 (Launch Ready)
### Estimated Time: 2-3 hours

#### Tasks

**5.1: Update Documentation**
- Update IMPLEMENTATION-COMPLETE-SUMMARY.md
- Create MEANING-TABLES-GUIDE.md with examples
- Update README with new features

**5.2: In-App Help**
- Add "?" help buttons explaining each table category
- Tutorial mode for first-time users
- Examples of good interpretations

**5.3: UI Polish**
- Consistent styling across all meaning features
- Loading states for rolls
- Animations for dice rolls
- Better visual feedback

**5.4: Performance**
- Lazy-load table data
- Cache table instances
- Optimize large history lists

**Acceptance Criteria:**
- [ ] Documentation complete and accurate
- [ ] Help system is useful
- [ ] UI feels polished and professional
- [ ] Performance is good even with large sessions

---

## Phase 6: Testing & Bug Fixes

### Priority: P0 (Before Release)
### Estimated Time: 2-3 hours

#### Testing Checklist

**Random Events:**
- [ ] All Event Focus types work
- [ ] Meaning tables roll correctly
- [ ] Suggestions are appropriate
- [ ] Can manually select tables
- [ ] Results save to history

**Discover Meaning:**
- [ ] All 42 tables accessible
- [ ] Categories make sense
- [ ] Rolling produces valid results
- [ ] Can roll multiple times
- [ ] History tracks all rolls

**Integration:**
- [ ] Works with existing scene workflow
- [ ] Doesn't break existing features
- [ ] Session save/load works
- [ ] Export/import includes new data

**Edge Cases:**
- [ ] Empty sessions handle gracefully
- [ ] Invalid table names caught
- [ ] Roll errors handled
- [ ] UI doesn't break with extreme data

---

## File Structure

### New Files
```
src/lib/
  utils/
    mythicTableLookup.ts          (Phase 1)
  data/
    meaningTableCategories.ts     (Phase 2)
  components/solorpg/
    MeaningDiscovery.svelte       (Phase 2)
    NPCBehaviorGenerator.svelte   (Phase 4)
    AdventureToneSelector.svelte  (Phase 4)

MEANING-TABLES-GUIDE.md          (Phase 5)
```

### Modified Files
```
src/lib/components/solorpg/
  RandomEventGenerator.svelte     (Phase 1)
  SceneManager.svelte             (Phase 4)

src/lib/utils/
  eventFocus.ts                   (Phase 1)

src/lib/stores/
  soloRpgStore.svelte.ts          (Phase 2, 4)

src/routes/
  solo-rpg/+page.svelte           (Phase 2)
```

---

## Implementation Order

1. **Phase 1** - Fix Random Events (BLOCKING)
2. **Phase 2** - Add Discover Meaning (HIGH VALUE)
3. **Phase 6** - Test Phase 1 & 2 thoroughly
4. **Phase 3** - Enhanced selection (POLISH)
5. **Phase 4** - Advanced features (COMPLETE)
6. **Phase 5** - Documentation (SHIP IT)
7. **Phase 6** - Final testing (QUALITY)

---

## Success Metrics

### Completeness
- ✅ All 42 Mythic tables are user-accessible
- ✅ Random Events use real table results
- ✅ Discover Meaning feature fully functional
- ✅ All Mythic GME core mechanics implemented

### Usability
- ✅ Clear UI for table selection
- ✅ Helpful suggestions for which table to use
- ✅ Examples and guidance for interpretation
- ✅ Smooth integration with existing workflow

### Quality
- ✅ No broken features
- ✅ Fast performance
- ✅ Comprehensive documentation
- ✅ Thoroughly tested

---

## Technical Decisions

### Table Loading Strategy
- **Decision:** Import all tables directly (not lazy-loaded initially)
- **Rationale:** Only 42 tables, small footprint, simpler code
- **Future:** Can optimize later if needed

### State Management
- **Decision:** Extend existing soloRpgStore
- **Rationale:** Keep all session data centralized
- **Pattern:** Add new arrays for meaning roll history

### UI Components
- **Decision:** Separate components for each feature
- **Rationale:** Modularity, reusability, testability
- **Pattern:** Props-based communication

### Table Naming
- **Decision:** Use exact class names from table files
- **Rationale:** Direct mapping, no translation layer needed
- **Example:** "CharacterAppearanceTable" → import { CharacterAppearanceTable }

---

## Risk Assessment

### High Risk
- **Complexity:** 42 tables is a lot to organize
  - *Mitigation:* Clear categorization system

- **User Confusion:** What table to use when?
  - *Mitigation:* Context-aware suggestions, examples, help text

### Medium Risk
- **Performance:** Rolling multiple tables rapidly
  - *Mitigation:* Efficient table lookups, caching

- **Testing:** Many combinations to test
  - *Mitigation:* Systematic testing checklist

### Low Risk
- **Breaking Changes:** Modifying existing code
  - *Mitigation:* Careful integration, preserve existing APIs

---

## Future Enhancements (Post-MVP)

- **Favorites System:** Save frequently-used tables
- **Custom Tables:** Let users create their own meaning tables
- **AI Interpretation:** Suggest interpretations for rolled words
- **Share Results:** Export interesting results to share
- **Statistics:** Track most-used tables, common combinations
- **Guided Mode:** Step-by-step tutorial for new users
- **Mobile Optimization:** Touch-friendly UI for tablets
- **Offline Mode:** PWA support for offline play

---

## Notes

- Keep existing features working throughout implementation
- Test after each phase before moving to next
- Prioritize user experience over technical perfection
- Document as you go, not at the end
- Get user feedback early and often (if possible)

---

**Last Updated:** January 11, 2025
