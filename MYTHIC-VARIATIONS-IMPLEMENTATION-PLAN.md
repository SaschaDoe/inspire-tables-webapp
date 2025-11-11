# Mythic GME Variations Implementation Plan

## 🎯 Core Focus: Progressive Disclosure + Mythic GME Features

No backwards compatibility, no settings panel, no migrations. Just implement the features with smart UX that doesn't overwhelm users.

---

## 🎨 Progressive Disclosure Strategy

### Problem: Current UI is cluttered and overwhelming

### Solution: Smart, Contextual Interface

**Principle**: Show features when relevant, hide when not needed

#### Main Solo RPG Interface Redesign:

```
┌─────────────────────────────────────────────────┐
│ [Adventure Name]               Scene: 1   CF: 5 │ ← Compact header
├─────────────────────────────────────────────────┤
│                                                  │
│ 🎬 SCENE SETUP                                   │ ← Collapsible sections
│   [Expected Scene Description]                  │
│   [Test Scene Button]                           │
│   ↓ Result: Expected Scene                      │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ 🎲 ASK A QUESTION                               │
│   [Type your question...]                       │
│   Odds: [50/50 ▼]  [Roll Button]              │
│   ℹ️ Asking about NPC? [Show NPC guidance]     │ ← Contextual help
│   □ This is a Discovery Question                │
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ 📋 LISTS                                        │
│   Threads (3)          Characters (2)           │
│   • Find artifact      • Marcus (NPC)           │
│     ▓▓▓░░░░░░░ 3/10   • Elena (PC)            │ ← Progress shown when relevant
│   [+ Add]  [🔍 Discover New Thread]            │ ← Discovery button
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ 🛠️ TOOLS (Click to use)                        │
│   [⚡ Random Event] [🎲 Meaning] [🎯 4W]       │
│   [📊 NPC Stats]                                │ ← NEW
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ 📖 JOURNAL & HISTORY                            │
│   [View Full History] [View Narrative Journal] │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Key Design Principles**:
1. **Collapsible Sections**: Expand/collapse each major area
2. **Contextual Hints**: Show help only when relevant
3. **Progressive Features**: Advanced features appear after basic use
4. **Clean Layout**: One primary action per section
5. **Persistent State**: Remember what's collapsed/expanded

---

## 📦 Features to Implement (Simplified)

### Feature 1: NPC Behavior Guidance (Contextual)
**When**: User asks question about NPC (detected by keywords or NPC names)
**How**: Small info badge appears with guidance
**Effort**: 1.5 hours

### Feature 2: Discovery Fate Questions
**When**: User checks "Discovery Question" box
**How**: Forces 50/50 odds, skips Random Events
**Effort**: 1 hour

### Feature 3: Thread Progress Tracks
**When**: User enables per-thread (checkbox on thread)
**How**: Visual 10-box track, updates on Random Events
**Effort**: 3 hours

### Feature 4: Thread Discovery Check
**When**: User clicks "🔍 Discover New Thread" button
**How**: Roll vs CF×10, generate thread on success
**Effort**: 2 hours

### Feature 5: NPC Statistics Generator
**When**: User clicks "📊 NPC Stats" tool
**How**: Modal with stat roller, save to Characters list
**Effort**: 3 hours

### Feature 6: Peril Points Tracker
**When**: User enables via toggle in Scene Manager
**How**: Simple counter near Chaos Factor, affects nothing automatically
**Effort**: 1.5 hours

### Feature 7: Adventure Journal View
**When**: User clicks "View Narrative Journal"
**How**: Clean narrative view of all scenes (hide mechanics)
**Effort**: 3 hours

### Feature 8: Keyed Scenes
**When**: User wants to pre-plan scenes (advanced feature)
**How**: Separate "Keyed Scenes" tab, check before scene setup
**Effort**: 4 hours

**Total**: ~19 hours

---

## 🎨 Detailed UX Design

### 1. Collapsible Sections Pattern

```svelte
<CollapsibleSection
  title="🎲 Ask A Question"
  startExpanded={true}
  rememberState={true}
  stateKey="fate-question-section"
>
  <!-- Content -->
</CollapsibleSection>
```

Every major section can collapse to save space. State persists in localStorage.

---

### 2. Contextual NPC Guidance

When user types question containing NPC indicators:
- Check for: "does he", "will she", "can they", or Character names from list
- Show small badge: `ℹ️ NPC Question?` with popover on hover/click
- Popover content based on result:

```
┌─────────────────────────────────────┐
│ 💡 NPC Behavior Guidance            │
│                                     │
│ Yes: NPC does what you expect       │
│ No: NPC does something else         │
│ Exc Yes: Does it with intensity     │
│ Exc No: Does the opposite           │
└─────────────────────────────────────┘
```

---

### 3. Thread Progress Tracks (Optional per Thread)

```
Thread: Find the ancient artifact
□ Enable Progress Track

[Enabled state:]
Thread: Find the ancient artifact ☑
Progress: ▓▓▓▓░░░░░░ (4/10)
[−] [+]
```

Auto-prompt on Random Events:
- "Move Toward Thread" → Show +1 prompt
- "Move Away From Thread" → Show -1 prompt
- "Close Thread" → Fill track

---

### 4. Thread Discovery Check

```
┌──────────────────────────────────────┐
│ 🔍 Thread Discovery Check            │
│                                      │
│ Current CF: 5                        │
│ Success if ≤ 50 (CF × 10)          │
│                                      │
│ [Roll d100]                          │
│                                      │
│ Result: 42 → Success!               │
│                                      │
│ New Thread Discovered:               │
│ "Mysterious / Ancient"               │
│                                      │
│ [Add to Threads] [Reroll] [Cancel]  │
└──────────────────────────────────────┘
```

---

### 5. NPC Statistics Generator

```
┌─────────────────────────────────────────┐
│ 📊 Generate NPC Statistics              │
│                                         │
│ NPC Name: [Optional]                    │
│                                         │
│ [Roll All Stats]                        │
│                                         │
│ Strength:    High (82)                  │
│ Agility:     Average (55)               │
│ Intellect:   Above Average (68)         │
│ Willpower:   Below Average (42)         │
│                                         │
│ [Reroll All] [Reroll Individual]        │
│ [Save to Characters List] [Cancel]      │
└─────────────────────────────────────────┘
```

---

### 6. Peril Points Tracker (Opt-in)

In Scene Manager header:
```
Chaos Factor: 5 [↓][↑]     ⚠️ Peril: 3 [↓][↑]
                              └── Optional, hidden by default
```

Toggle to show/hide in Scene Manager. Just a counter, no automatic effects.

---

### 7. Adventure Journal View

```
┌───────────────────────────────────────────┐
│ 📖 Adventure Journal: [Adventure Name]    │
│                                           │
│ ═══ Scene 1: The Beginning ═══           │
│                                           │
│ Marcus arrived at the abandoned temple,  │
│ searching for clues about the artifact.  │
│ He encountered Elena, who claimed to     │
│ have information...                       │
│                                           │
│ [Edit] [Scene Details ▼]                 │
│                                           │
│ ═══ Scene 2: Betrayal ═══                │
│                                           │
│ Elena revealed her true intentions...    │
│                                           │
└───────────────────────────────────────────┘
```

**Story Mode**: Hide all mechanics, show only narrative
**Full Mode**: Show scene type, chaos changes, events

---

### 8. Keyed Scenes Manager

Separate tab/section (not visible by default):

```
┌────────────────────────────────────┐
│ 🔑 Keyed Scenes                    │
│                                    │
│ Planned scenes you want to include │
│                                    │
│ □ The Betrayal                     │
│   Trigger: Thread "Trust" active   │
│   CF: 6+                           │
│   [Edit] [Delete]                  │
│                                    │
│ ☑ The Final Confrontation          │
│   Trigger: Manual                  │
│   [Edit] [Delete] [PLAY NOW]       │
│                                    │
│ [+ Add Keyed Scene]                │
└────────────────────────────────────┘
```

Before scene setup, check if keyed scene should trigger and prompt user.

---

## 🎯 Implementation Order

### Week 1: Foundation + Quick Wins (7.5h)
1. **Collapsible Sections Component** (2h) - Reusable pattern
2. **NPC Behavior Guidance** (1.5h) - Contextual help
3. **Discovery Fate Questions** (1h) - Simple checkbox
4. **Peril Points Tracker** (1.5h) - Optional counter
5. **Thread Discovery Check** (1.5h) - Simple roll modal

### Week 2: Core Features (6h)
6. **Thread Progress Tracks** (3h) - Visual tracking
7. **Adventure Journal View** (3h) - Narrative view

### Week 3: Advanced Features (5.5h)
8. **NPC Statistics Generator** (3h) - Stat roller
9. **Keyed Scenes** (4h) - Pre-planned scenes
10. **Polish & Testing** (2h)

**Total**: ~21 hours (with buffer)

---

## 📱 Mobile Considerations

- All modals are mobile-friendly
- Thread progress: Large touch targets (48×48px minimum)
- Collapsible sections save screen space
- Peril/Chaos: Stack vertically on mobile
- Journal: Full-width, simplified controls

---

## 🎓 Progressive Disclosure Implementation

### First Session:
- Show only: Scene Setup, Fate Questions, Lists (basic), Random Event button
- Hide: Thread Progress, Peril Points, Keyed Scenes, Discovery Check
- Hint badges: "💡 Tip: Try rolling on a Meaning Table" (dismissible)

### After 3 Scenes:
- Reveal: Thread Discovery Check button
- Show: "You can enable Progress Tracks on threads"

### After 5 Scenes:
- Reveal: Peril Points option
- Reveal: Keyed Scenes tab
- Show: "You can pre-plan scenes with Keyed Scenes"

### After 10 Scenes:
- All features visible
- Tutorial hints dismissed
- Full power-user mode

**Implementation**: Use localStorage to track:
```typescript
interface ProgressionState {
  scenesPlayed: number;
  featuresRevealed: string[];
  hintsShown: string[];
  hintsDismissed: string[];
}
```

---

## ✅ Definition of Done

Per Feature:
- [ ] Works on mobile and desktop
- [ ] Doesn't break existing functionality
- [ ] Follows progressive disclosure (hidden by default if advanced)
- [ ] Has contextual help/tooltip
- [ ] Svelte 5 compliant
- [ ] Clean, minimal UI

Overall:
- [ ] Solo RPG section feels cleaner, less overwhelming
- [ ] New users see only essential features
- [ ] Advanced users can access all features easily
- [ ] No regressions in existing features

---

## 🎨 Visual Design Updates

### Color Coding (Keep Consistent):
- 🟢 Fate Questions: Green accents
- 🟣 Random Events: Purple accents
- 🔵 Meaning/Discovery: Blue accents
- 🟠 Scene/Narrative: Orange accents
- ⚫ Tools/Utilities: Gray accents

### Spacing:
- Large breathing room between sections
- Clear visual hierarchy
- Grouped related controls

### Typography:
- Clear section headers (larger, bold)
- Consistent icon usage
- Readable body text (16px minimum)

---

## 🚀 Let's Implement!

Starting with Week 1 features:
1. Collapsible Sections Component
2. NPC Behavior Guidance
3. Discovery Fate Questions
4. Peril Points Tracker
5. Thread Discovery Check

Ready to begin implementation.
