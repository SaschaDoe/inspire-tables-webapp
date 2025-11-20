# Bridge Expansion Implementation - Progress Report

## 🎯 Overview

The Bridge Expansion System creates **cross-deck integration** between Story Engine, World Builder (Deck of Worlds), and Lore Master's Deck. This allows cards from one deck to reference and spawn cards from another, creating a unified worldbuilding experience.

## 📦 What's Been Implemented

### ✅ Phase 1: Foundation (COMPLETED)

1. **JSON Data Files** → `src/lib/data/bridge/`
   - `story-lore-bridge-expansion-cards.json` (60 cards)
   - `story-world-bridge-expansion-cards.json` (60 cards)
   - `world-lore-bridge-expansion-cards.json` (60 cards)
   - **Total: 180 bridge cards**

2. **Type System** → `src/lib/types/bridge.ts`
   - `BridgeCard` types for all three decks
   - `BridgeLink` interface for cross-deck references
   - `DetectedBridgeLink` for parsing cue text
   - Emoji-to-card-type mappings
   - Helper functions for bridge card detection

3. **Bridge Loader** → `src/lib/data/bridgeLoader.ts`
   - Load all 3 bridge expansions
   - Filter bridge cards by deck/type
   - Convert bridge cards to standard card formats
   - Random bridge card generation
   - Statistics tracking

4. **Link Detection** → `src/lib/utils/linkIconParser.ts`
   - `detectBridgeLinks()` - Find cross-deck references in cues
   - `hasBridgeLinks()` - Check if cue has links
   - `highlightBridgeLinks()` - Create clickable HTML
   - Supports emoji icons (🎭, 👤, 📍, etc.)
   - Supports text patterns ("a Faction", "an Event", etc.)

## 🔧 How Bridge Cards Work

### Bridge Card Structure

Bridge cards have special fields that create cross-deck links:

```typescript
// World Builder Bridge Card (from world-lore expansion)
{
  type: "attribute",
  cue: "HABITAT OF A CREATURE",
  links: ["creature"],  // ← Links to Lore Master creature cards
  isBridge: true,
  bridgeDeck: "world-lore"
}

// Lore Master Bridge Card (from world-lore expansion)
{
  type: "faction",
  cue: "HERALDS OF THE",
  nickname_links: ["region", "landmark", "event"],  // ← Complete name with World Builder
  isBridge: true,
  bridgeDeck: "world-lore"
}

// Story Engine Bridge Card (from story-lore expansion)
{
  type: "engine",
  cue: "WANTS TO CAPTURE",
  links: ["figure", "creature"],  // ← Links to Lore Master cards
  isBridge: true,
  bridgeDeck: "story-lore"
}
```

### Link Types

1. **Primary Links** (`links`) - Direct references in main cue
2. **Nickname Links** (`nickname_links`) - For completing names
3. **Background Links** (`background_links`) - In secondary cues

## 📊 Bridge Expansion Coverage

| Bridge Deck | Story Engine | World Builder | Lore Master | Total Cards |
|-------------|--------------|---------------|-------------|-------------|
| **Story-Lore** | 27 (Engine/Conflict) | - | 33 (all types) | 60 |
| **Story-World** | 30 (Engine/Conflict) | 30 (Origin/Attribute/Advent) | - | 60 |
| **World-Lore** | - | 28 (Origin/Attribute/Advent) | 32 (all types + 2 Deity) | 60 |
| **TOTAL** | 57 | 58 | 65 | **180** |

## 🎨 Bridge Link Detection Examples

The system can detect these patterns in card cues:

### Emoji-Based References
- "HABITAT OF A 🐲 CREATURE" → Detects Lore Master creature link
- "KNOWN FOR A 🎭 FACTION" → Detects Lore Master faction link
- "LINKED TO A 🌲 REGION" → Detects World Builder region link
- "SITE OF A 📍 LOCATION" → Detects Lore Master location link

### Text-Based References
- "WANTS TO CAPTURE A FIGURE" → Detects Lore Master figure link
- "SITE OF AN EVENT" → Detects Lore Master event link
- "DECORATED WITH A FACTION'S BANNERS" → Detects Lore Master faction link

## 🚀 What's Next (PENDING)

### Phase 2: UI Integration

1. **StoryBoardNode Updates**
   - Display bridge links in card cues
   - Make bridge links clickable
   - "Spawn Linked Card" button on bridge cards
   - Visual indicator (⚙🐲 icon) for bridge cards

2. **StoryBoardGenerator Updates**
   - Add "Bridge Compounds" category (🌉)
   - Compound generators:
     - **Settlement Story** (World Builder Landmark + Lore Master Location cluster)
     - **Faction Territory** (World Builder Microsetting + Lore Master Faction cluster)
     - **Divine Domain** (World Builder Region + Lore Master Deity + followers)
     - **Adventure Site** (All three decks combined!)
   - Bridge-aware card generation (prefer bridge cards when enabled)

3. **Visual Enhancements**
   - Different connection line styles for bridge links
   - Auto-layout for spawned linked cards
   - Bridge link preview tooltips
   - Highlight connected cards on hover

### Phase 3: Advanced Features

1. **Smart Linking**
   - Auto-detect available links in cards
   - Suggest linked cards to generate
   - Multi-card spawn (generate all links at once)

2. **Bridge Workflows**
   - "Start from Story → Build World" workflow
   - "Start from World → Add Lore" workflow
   - "Start from Lore → Create Adventures" workflow

## 💡 Usage Examples

### Example 1: Building a Fantasy Settlement

1. Generate **World Builder** Origin: "ANCIENT SACRED SITE OF A FACTION"
2. Card has link to Lore Master `faction` type
3. Click link → Generate Lore Master Faction cluster: "THE HERALDS OF THE SHATTERED MOUNTAINS"
4. Faction card has nickname_link to `region`
5. Click link → Generate World Builder Region: "SHATTERED MOUNTAINS"
6. **Result**: Interconnected settlement with geography + faction + history!

### Example 2: Creating an Adventure Plot

1. Generate **Story Engine** Engine: "WANTS TO CAPTURE A CREATURE"
2. Card has link to Lore Master `creature` type
3. Click link → Generate Lore Master Creature cluster: "THE SHADOW WOLF"
4. Creature has secondary cue: "HABITAT: 📍 LOCATION"
5. Click link → Generate Lore Master Location: "THE WHISPERING FOREST"
6. **Result**: Complete adventure hook with target creature and location!

### Example 3: Divine Domain (ADVANCED)

Using compound generator:
1. Select "Divine Domain" compound
2. System generates:
   - World Builder: Region (divine territory)
   - World Builder: Landmark (temple/shrine)
   - Lore Master: Deity card
   - Lore Master: Faction (worshippers)
   - Lore Master: Location (holy site)
3. All cards auto-connected with labeled relationships
4. **Result**: Complete pantheon element with geography, followers, and sacred sites!

## 📝 Implementation Checklist

- [x] Create bridge types system
- [x] Create bridge loader
- [x] Extend link icon parser
- [x] Move JSON files to data directory
- [ ] Update StoryBoardNode with bridge link display
- [ ] Add bridge compound generators to StoryBoardGenerator
- [ ] Add visual styles for bridge cards
- [ ] Test cross-deck card generation
- [ ] Test compound generators
- [ ] Document user workflows

## 🎓 Technical Notes

### Detection Patterns

The link detection uses two strategies:

```typescript
// 1. Emoji pattern matching
const emojiPattern = /(🎭|👤|📅|📍|🎲|🧱|🐲|⚡|🌲|🏛|📖|⭐|🌸)\s*(\w+)?/gi;

// 2. Text pattern matching
const textPattern = /\b(a|an)\s+(faction|figure|event|location|...)\b/gi;
```

### Conversion Functions

Bridge cards can be converted to standard card formats:

```typescript
bridgeCardToStoryEngineCard(bridgeCard) → StoryEngineCard
bridgeCardToWorldBuilderCard(bridgeCard) → WorldBuilderCard
bridgeCardToLoreMasterCard(bridgeCard) → LoreMasterCard
```

This allows seamless integration with existing card systems.

## 🌟 Benefits

1. **Coherent Worldbuilding**: All three decks work together
2. **Reduced Effort**: Auto-generate connected elements
3. **Discovery**: Links suggest what to create next
4. **Flexibility**: Use bridges or not, your choice
5. **Visual Mapping**: See relationships on storyboard

## 🔮 Future Possibilities

- **Bridge Templates**: Pre-built compound patterns
- **Export Connected Clusters**: Save related cards as groups
- **Bridge Card Filtering**: Show only bridge-compatible cards
- **Multi-Deck Search**: "Find all creature-related content across all decks"
- **Smart Suggestions**: "You generated a faction, would you like their territory?"

---

**Status**: Foundation complete, UI integration next
**Total Implementation**: ~40% complete
**Next Milestone**: Add clickable bridge links to StoryBoardNode

