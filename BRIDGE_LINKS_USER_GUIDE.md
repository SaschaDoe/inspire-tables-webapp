# 🌉 Bridge Links - User Guide

## What Are Bridge Links?

**Bridge Links** are special connections that appear on cards from the Bridge Expansion sets. They allow you to **spawn related cards from other decks** with a single click, creating interconnected worldbuilding elements automatically!

When you see a bridge link on a card, you can click it to instantly generate and connect a related card from another deck.

## How to Identify Bridge Links

Bridge links appear as **highlighted references** in card cues with special icons or patterns:

### Emoji-Based Links
- 🎭 **Faction** - Links to Lore Master faction
- 👤 **Figure** - Links to Lore Master figure
- 📅 **Event** - Links to Lore Master event
- 📍 **Location** - Links to Lore Master location
- 🎲 **Object** - Links to Lore Master object
- 🧱 **Material** - Links to Lore Master material
- 🐲 **Creature** - Links to Lore Master creature
- ⚡ **Deity** - Links to Lore Master deity
- 🌲 **Region** - Links to World Builder region
- 🏛 **Landmark** - Links to World Builder landmark

### Text-Based Links
- "a Faction", "an Event" - References to Lore Master types
- "a Region", "a Landmark" - References to World Builder types

## Where Do Bridge Links Appear?

Bridge links are automatically detected and displayed on:

✅ **Story Engine Cards** (Engine & Conflict types)
✅ **World Builder Cards** (Origin, Attribute, Advent types)
✅ **Lore Master Cards** (All types)

You'll see a purple highlighted section labeled **"🌉 Bridge Links:"** beneath the active cue when bridge links are detected.

## How to Use Bridge Links

### Step 1: Generate a Bridge Card

1. Open the **Storyboard Generator** (click the ✨ button)
2. Select any deck (Story Engine, World Builder, or Lore Master)
3. Generate a card that has cross-deck references

**Example**: Generate a World Builder Origin card that says:
> "ANCIENT SACRED SITE OF A 🎭 FACTION"

### Step 2: View the Bridge Link

On the card, you'll see a bridge links section appear:

```
🌉 Bridge Links:
┌─────────────────────────┐
│ 🔗 a 🎭 faction     →  │ ← Click this!
└─────────────────────────┘
```

### Step 3: Click to Spawn

Click the bridge link button. The system will:

1. ✨ Generate a random card of that type
2. 📍 Place it next to the original card
3. 🔗 Auto-create a connection between them
4. 🏷️ Label the connection with the link text

### Step 4: Repeat!

The newly generated card might have its own bridge links! Keep clicking to build out your world organically.

## Example Workflows

### 🏰 Building a Fantasy Settlement

**Starting Card**: World Builder Origin
> "ANCIENT SACRED SITE OF A FACTION"

1. Generate the Origin card → Shows bridge link: "a 🎭 faction"
2. Click "🎭 faction" → Generates Lore Master Faction: "THE HERALDS OF THE SHATTERED MOUNTAINS"
3. The faction card has nickname_link: "region"
4. Click "region" → Generates World Builder Region: "SHATTERED MOUNTAINS"
5. **Result**: Complete settlement with geography, faction, and history!

### 🗺️ Creating an Adventure Hook

**Starting Card**: Story Engine Engine
> "WANTS TO CAPTURE A CREATURE"

1. Generate Engine card → Shows bridge link: "a creature"
2. Click "creature" → Generates Lore Master Creature: "SHADOW WOLF"
3. The creature has secondary cue: "HABITAT: 📍 LOCATION"
4. Click "📍 location" → Generates Location: "THE WHISPERING FOREST"
5. **Result**: Adventure goal + target + location all connected!

### ⚔️ Quest Location Setup

**Starting Card**: World Builder Landmark
> "HABITAT OF A 🐲 CREATURE"

1. Generate Landmark card → Shows bridge link: "🐲 creature"
2. Click "🐲 creature" → Generates Creature cluster: "MINE COBRA"
3. Creature has link to "material"
4. Click "material" → Generates Material: "PHOSPHORESCENT ORE"
5. **Result**: Dangerous location with inhabitant and valuable resource!

## Visual Guide

### Before Clicking
```
┌────────────────────────────────┐
│ 🔵 LANDMARK                    │
│ ◄ ►                            │
│                                │
│ "HABITAT OF A CREATURE"        │
│                                │
│ 🌉 Bridge Links:               │
│ ┌──────────────────────────┐   │
│ │ 🔗 a creature        →  │   │ ← Clickable!
│ └──────────────────────────┘   │
└────────────────────────────────┘
```

### After Clicking
```
┌──────────────┐         ┌──────────────────┐
│ 🔵 LANDMARK  │ ------→ │ 7️⃣ CREATURE     │
│              │ dashed  │                  │
│ "HABITAT OF  │ purple  │ "SHADOW WOLF"    │
│  A CREATURE" │  line   │                  │
└──────────────┘         └──────────────────┘
        ↑                         ↑
   Original card          Spawned via bridge!
```

## Connection Visual Indicators

Bridge-spawned cards are automatically connected with special styling:

- **Line Type**: Dashed (not solid)
- **Color**: Purple (Lore Master) or Cyan (World Builder)
- **Label**: Shows the link text (e.g., "a creature")
- **Arrow**: Points from source to spawned card

## Tips & Tricks

### 🎯 Strategic Worldbuilding

1. **Start Broad**: Begin with World Builder to establish geography
2. **Add Lore**: Use bridge links to add factions, figures, creatures
3. **Create Conflict**: Add Story Engine cards that reference the lore
4. **Interconnect**: Follow multiple bridge links to create dense worlds

### 🔄 Exploring Variations

- **Don't like the spawned card?** Delete it and click the bridge link again for a different result!
- **Want more connections?** Rotate cues to find other bridge links
- **Building specific themes?** Look for bridge cards with links matching your needs

### 🎨 Visual Organization

- **Group cards**: Bridge-spawned cards can be grouped (Alt+G)
- **Layer cards**: Use layers to organize (Z key to send back)
- **Add notes**: Right-click cards to add context notes

## Finding Bridge Cards

Bridge cards are part of three expansion sets:

1. **Story-Lore Bridge** (60 cards)
   - Story Engine cards linking to Lore Master
   - Lore Master cards linking to Story Engine

2. **Story-World Bridge** (60 cards)
   - Story Engine cards linking to World Builder
   - World Builder cards linking to Story Engine

3. **World-Lore Bridge** (60 cards)
   - World Builder cards linking to Lore Master
   - Lore Master cards linking to World Builder

**Total: 180 bridge cards!**

## Keyboard Shortcuts

When working with bridge cards:

- **Alt+Click**: Create manual connections between any cards
- **Shift+Click**: Multi-select cards
- **Alt+G**: Group selected cards
- **Alt+U**: Ungroup selected cards
- **Z**: Send selected cards to back
- **X**: Bring selected cards to front

## Troubleshooting

### "No bridge links appear on my card"

**Reason**: Not all cards have bridge links - only cards from the Bridge Expansion sets.

**Solution**: Keep generating cards until you get a bridge card, or look for these patterns in cues:
- References to other card types
- Emoji icons (🎭, 👤, 🌲, etc.)
- Text like "a Faction", "an Event"

### "The spawned card isn't what I expected"

**Reason**: Bridge links spawn random cards of the specified type.

**Solution**: Delete the spawned card and click the bridge link again for a different result!

### "Bridge link button doesn't work"

**Reason**: May need to wait for card generation to complete.

**Solution**: Make sure you're on a storyboard, and try clicking again after a moment.

## Advanced: Compound Generation (Coming Soon!)

Future updates will include **Compound Generators** that create multiple connected cards automatically:

- 🏰 **Settlement Story**: Landmark + Location cluster + Faction
- 🗺️ **Faction Territory**: Microsetting + Faction cluster
- ⚡ **Divine Domain**: Region + Deity + Worshippers + Temple
- 🎭 **Adventure Site**: Full adventure with all three decks!

These will generate 5-10 interconnected cards with one click!

## Need Help?

- Check `BRIDGE_EXPANSION_IMPLEMENTATION.md` for technical details
- See `world-lore-bridge-expansion-guidebook.md` for the original rules
- Explore the bridge JSON files in `src/lib/data/bridge/`

---

**🌉 Happy bridge building! Connect your decks and create amazing worlds!**
