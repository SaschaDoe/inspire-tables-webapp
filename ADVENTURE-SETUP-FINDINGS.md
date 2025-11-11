# Mythic GME Adventure Setup - Research Findings

**Research Date:** January 11, 2025
**Purpose:** Understand how to properly start a Mythic GME adventure in the Solo RPG UI
**Manual Sections Reviewed:**
- "Seeding Lists" (page 62, lines 5388-5447)
- "The First Scene" (page 63-66, lines 5459-5639)
- "Getting Prepared For A Solo Adventure" (page 123-126, lines 13552-13900)

---

## KEY FINDING: No Mandatory Setup Steps

**The most important discovery:**
> **There are NO mandatory steps when starting a new Mythic adventure.**

From the manual (lines 5398-5400):
> "The start of a new adventure leaves you faced with a pair of stark, blank Lists. These Lists will gradually fill with Threads and Characters as the adventure unfolds..."

**What this means for the UI:**
- Current implementation is CORRECT - allowing blank/empty start
- No need to force players to roll for threads or characters
- Lists can start completely empty
- Lists will naturally fill during play

---

## Optional Setup: Seeding Lists

**What is Seeding?**
Pre-populating Threads and Characters Lists before starting play (OPTIONAL).

**From Manual (lines 5404-5410):**
> "Maybe you have certain goals you want to achieve or NPCs you want to encounter, or maybe you're importing Threads and Characters from previous adventures as part of an ongoing series. Regardless of your reasons, you can start your adventure with any elements you want already on your Lists."

**Example from Manual:**
If starting with the idea "psychic character journeying into the astral realm to find their missing friend":
- Add Thread: "Find my friend"
- Add Character: "Lost friend"

**Benefits:**
- Makes early Random Events more meaningful
- Gives direction from the start
- Helps when continuing a series

**UI Opportunity:**
- Could add optional "Seed Lists?" prompt when creating new session
- Simple text inputs for initial threads/characters
- Completely skippable

---

## The Four First Scene Strategies

The manual provides 4 different approaches for generating the First Scene (lines 5449-5639):

### 1. INSPIRED IDEA (Manual page 63)

**Description:**
> "You can always start with a fully formed idea of your own."

**How it works:**
- Player creates their own "what if" scenario
- Example: "What if my cybernetic superhero gets a lead on the organization that created him?"
- Example: "My knight travels to a village to slay the monster terrorizing the locals"

**When to use:**
- Player has a clear vision
- Want to start with excitement and direction
- Traditional story beginning

**UI Implementation:**
Already supported - players can just start playing and setup their own scene

---

### 2. RANDOM EVENT (Manual page 64)

**Description:**
> "If you want to start surprised or don't have anything in mind you can generate a Random Event to use as inspiration for your First Scene."

**How it works:**
1. Generate a Random Event
2. If Lists are empty, ignore NPC/Thread results → use "Current Context" as Focus
3. Roll on Meaning Tables
4. Interpret based on: PC, setting, genre expectations

**Special Rules for First Scene Random Events:**
- Empty Lists are OK - use Current Context instead
- Minimal Context is fine: "you have a PC, a setting, and an idea of what you'd like to see"
- Wide open possibilities at start

**Example from Manual:**
- Rolled "Praise" and "Hope" with Current Context
- Interpreted as: Weyland camping in forest when haggard man stumbles out, begging for food

**When to use:**
- Want complete surprise
- No specific idea in mind
- Enjoy emergent storytelling

**UI Implementation:**
Could add "Generate First Scene" button that:
1. Triggers Random Event Generator
2. Shows note: "This is your First Scene - interpret broadly!"
3. Pre-fills scene description area

---

### 3. MEANING TABLES (Manual page 64-65)

**Description:**
> "You can skip the Event Focus altogether and go straight to the Meaning Tables for inspiration, rolling up as many word pairs as you need to string together an opening narrative."

**How it works:**
1. Skip Event Focus completely
2. Roll multiple word pairs on Meaning Tables
3. Use whichever tables seem appropriate:
   - Actions
   - Descriptions
   - Locations Elements
   - Character Elements
   - etc.
4. String together an opening narrative

**Example from Manual:**
- Actions: "Observe" + "Benefits"
- Locations: "Enclosed" + "Extravagant"
- Interpreted as: Knight posing as soldier to spy on enemy nation's lavish garrison

**When to use:**
- Want inspiration but more control than Random Event
- Enjoy creative interpretation
- Want to cherry-pick relevant tables

**UI Implementation:**
Could add "Roll for Inspiration" tool:
- Let player choose which Meaning Tables to roll on
- Show multiple word pairs
- Note: "Use these to create your First Scene"

---

### 4. THE 4W METHOD (Manual page 65-66)

**Description:**
> "A more structured way to use Meaning Tables for the first Scene is to apply a 4W approach: Who, What, Where, and Why."

**How it works:**
1. **WHO** - Roll on Characters Elements Meaning Table
   - Could be PC, existing NPC, or new NPC
2. **WHAT** - Roll on Actions Meaning Tables
   - Main activity of the scene
3. **WHERE** - Roll on Locations Elements Meaning Table
   - The location where it happens
4. **WHY** - Roll on Actions Meaning Tables
   - Motivations behind the actions
5. Optional: Add **HOW** or **WHEN** if desired
6. Combine all elements into interesting interpretation

**Example from Manual:**
- WHO: "Excited" + "Unusual"
- WHAT: "Fail" + "Portal"
- WHERE: "Lively" + "Festive"
- WHY: "Travel" + "Project"
- Interpreted as: Mage invited to festival of undead trying to open portal back to Underworld

**When to use:**
- Want structured generation
- Enjoy puzzle-like interpretation
- Want comprehensive scene setup

**UI Implementation:**
Could create "4W First Scene Generator":
- Four clear sections: Who, What, Where, Why
- Roll buttons for each
- Display all four word pairs
- Text area for interpretation
- Option to add results to Lists

---

## Adventure Approaches: Linear vs Sandbox

**From "Getting Prepared" section (lines 13628-13677)**

### Linear Approach
- Traditional start → middle → end structure
- More planned narrative
- Clear goals and direction from start

### Sandbox Approach
**From manual:**
> "A sandbox adventure can start off much lighter than a linear adventure. All you need to know are some basic facts: who your Character is, what kind of world they live in, and what they're doing as you begin the adventure."

**Sandbox Benefits:**
- Can start with minimal planning
- "Start off slow but quickly build momentum"
- Mythic will "throw things your way that crank up the action"

**Sandbox Example from Manual:**
- PC: Starship captain who ferries goods between planets
- Setting: Known galaxy with trade routes and factions
- Starting Thread: "Complete the current shipment"
- Characters List: Crew members and common ports
- First Scene: "Making sure ship is secure, no threats nearby"
- Then just start playing!

**When to use:**
- Little to no story ideas
- Want emergent gameplay
- Trust Mythic to build story

---

## Sourcing Ideas

**From manual (lines 13614-13626):**
> "You can take inspiration from books, movies, TV shows, comics, anime … anything you enjoy."

**Two Approaches:**
1. **Light Touch:** Use general concepts as basis for First Scene
2. **Heavy Prep:** Populate Threads and Characters Lists from source material before starting

**Benefits:**
- Quick start with material that interests you
- Built-in engagement from the start

---

## Current UI Assessment

### What's Already Working ✅

1. **Session Creation** - Allows starting with minimal info (name, description)
2. **Blank Lists** - Threads and Characters Lists start empty (correct!)
3. **Chaos Factor** - Defaults to 5 (correct per manual)
4. **Scene Number** - Starts at 0, ready for First Scene
5. **Random Event Generator** - Available for First Scene generation
6. **Meaning Discovery** - Available for inspiration

### What Could Be Enhanced 💡

Based on the manual, here are OPTIONAL enhancements:

#### 1. First Scene Setup Wizard (Optional)
When a new session is created, could offer:

```
🎬 FIRST SCENE SETUP (Optional - can skip!)

How would you like to begin?

○ Start Playing - I have my own idea (Inspired Idea)
○ Generate Random Event - Surprise me! (Random Event)
○ Roll for Inspiration - Give me some words (Meaning Tables)
○ Use 4W Method - Structured generation (4W)
○ Skip - I'll figure it out as I go (Sandbox)

[Continue] [Skip This - Start Adventure]
```

#### 2. Seeding Lists Helper (Optional)
After choosing First Scene strategy:

```
📋 SEED YOUR LISTS? (Optional)

Would you like to add any starting Threads or Characters?

Threads (goals, plot lines):
[+ Add Thread]

Characters (NPCs, important people):
[+ Add Character]

[Done] [Skip - Keep Lists Empty]
```

#### 3. 4W First Scene Generator (New Component)
Dedicated tool that:
- Rolls on each table (Who, What, Where, Why)
- Shows word pairs
- Provides interpretation area
- Can add results to Lists automatically

#### 4. First Scene Indicator
Show helpful message at scene 0:

```
📖 This is your First Scene!

The First Scene is special - it gets your story rolling. You can:
- Start with your own idea
- Generate a Random Event for inspiration
- Roll on Meaning Tables for inspiration
- Use the 4W method for structured setup

Your Lists can start empty - they'll fill naturally as you play!
```

#### 5. Session Creation Template Options
When creating session, offer templates:

```
📦 ADVENTURE TEMPLATES (Optional)

○ Blank Slate - Start from scratch
○ Quest Beginning - Pre-seeded with quest thread
○ Sandbox Explorer - Minimal setup for emergent play
○ Continuing Adventure - Import from previous session
○ Inspired by... - Use existing fiction as template

[Select] [Skip - Custom Setup]
```

---

## Recommendations Summary

### What NOT to Do ❌

1. **Don't force players to roll for threads** - Not required by manual
2. **Don't force players to roll for characters** - Not required by manual
3. **Don't require scene description** - Can emerge during play
4. **Don't mandate First Scene generation** - Player choice is key
5. **Don't over-complicate the start** - Blank slate is valid!

### What TO Do ✅

1. **Keep current blank start** - It's correct per manual
2. **Add OPTIONAL helpers** - For players who want guidance
3. **Make all enhancements skippable** - Never mandatory
4. **Provide information** - Explain what each strategy is
5. **Support all 4 strategies** - Let players choose their style
6. **Add sandbox guidance** - Show it's OK to start minimal

---

## Implementation Priority

If implementing enhancements, suggested priority:

### Priority 1: Information
- Add "First Scene Help" tooltip/modal explaining strategies
- Show that blank start is valid
- Explain Lists will fill during play

### Priority 2: 4W Generator
- Most structured, easiest to implement
- Clear value proposition
- Self-contained component

### Priority 3: Seeding Lists Helper
- Simple UI addition
- Directly useful
- Minimal complexity

### Priority 4: First Scene Wizard
- Most comprehensive
- Most complex
- Highest value for new players
- Should be completely optional

### Priority 5: Templates
- Nice-to-have
- Good for returning users
- Lower priority than core tools

---

## Quotes from Manual for Reference

**On blank Lists:**
> "The start of a new adventure leaves you faced with a pair of stark, blank Lists. These Lists will gradually fill with Threads and Characters as the adventure unfolds, but the First Scene presents you with a unique opportunity to jumpstart the process and make your Lists a little less lonely." (lines 5398-5403)

**On First Scene flexibility:**
> "There are a few different ways you can come up with a First Scene depending on how much Context you're starting with and how surprised you want to be." (lines 5462-5464)

**On minimal Context:**
> "You have a PC, a setting, and an idea of what you'd like to see in this adventure, especially if you're using a chosen RPG that's built around a specific world or genre. This is more than enough to form an interpretation for the First Scene." (lines 5492-5496)

**On sandbox starting:**
> "All you need to know are some basic facts: who your Character is, what kind of world they live in, and what they're doing as you begin the adventure. Then your first Scene can simply be plopping your Character into the setting and seeing what happens." (lines 13638-13656)

---

## Conclusion

The current Solo RPG UI is **fundamentally correct** in its implementation:
- ✅ Allows blank Lists at start
- ✅ No mandatory thread/character generation
- ✅ Provides tools (Random Events, Meaning Discovery)
- ✅ Lets players start playing immediately

**Optional enhancements** could help guide new players through the Four First Scene Strategies, but these should NEVER be mandatory. The Mythic GME philosophy is flexibility and player choice.

The answer to the user's question:
> "Are there special things todo in the first after a new session started? like roll fore a thread and characters?"

**Answer:** NO - there are no mandatory special things to do. Players have complete freedom to:
1. Start with blank Lists (most common)
2. Optionally seed Lists with initial elements
3. Choose from 4 First Scene generation strategies (or create their own)
4. Start playing immediately with minimal setup

The UI should celebrate this flexibility, not constrain it.

---

**End of Research Document**

**Next Steps:**
1. Review findings with user
2. Determine if any optional enhancements are desired
3. If yes, prioritize which features to implement
4. Keep all enhancements optional and skippable
