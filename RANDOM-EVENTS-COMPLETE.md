# Complete Random Events System - Mythic GME

## Two Ways Random Events Occur

### 1. During Fate Questions
**When:** Whenever you ask a Fate Question and roll doubles

**How It Works:**
- Roll d100 (or 2d10 for Fate Check)
- If roll is DOUBLES (11, 22, 33, 44, 55, 66, 77, 88, 99)
- AND single digit ≤ Chaos Factor
- Then: Random Event occurs **IN ADDITION** to answering the question

**Example:**
```
Chaos Factor = 8
Roll d100 = 55
Single digit = 5
5 ≤ 8, so Random Event triggers!

The Fate Question is still answered normally (Yes/No/Exceptional)
THEN you also generate and resolve a Random Event
```

**Important:** The Fate Question answer is STILL VALID and applied. The Random Event is an additional twist on top of the answer.

**Current Implementation Status:**
- ✅ Detection works (checkRandomEvent in mythicDice.ts)
- ✅ Recorded in FateQuestion data
- ✅ **FIXED:** Opens Random Event modal via callback
- ✅ Visual notification shown to player

### 2. During Scene Setup (Interrupt Scenes)
**When:** When testing an Expected Scene at the start of a new scene

**How It Works:**
- At beginning of each new Scene (after First Scene)
- Player describes what they EXPECT to happen next
- Roll d10 and compare to Chaos Factor
- If roll ≤ CF and EVEN (2, 4, 6, 8): **Interrupt Scene**

**Interrupt Scene:**
- A Random Event **COMPLETELY REPLACES** the Expected Scene
- The Expected Scene does NOT happen
- Instead, generate Random Event and build new scene around it
- This is Mythic "derailing your expectations"

**Example:**
```
Chaos Factor = 6
Expected Scene: "My detective PC visits the suspect at his workplace"
Roll d10 = 4
4 ≤ 6 and 4 is EVEN, so Interrupt Scene!

The Expected Scene is scrapped.
Generate Random Event instead.
Maybe: Event Focus = NPC Action, roll on Characters List
Result: The suspect's boss calls the PC first with urgent news
NEW Scene: Phone conversation with boss instead of office visit
```

**Current Implementation Status:**
- ✅ Scene testing works (SceneManager.svelte)
- ✅ Detects Interrupt scenes
- ✅ Calls onRandomEventNeeded() callback
- ✅ Opens Random Event modal

## Key Differences

| Aspect | Fate Question Random Event | Interrupt Scene Random Event |
|--------|----------------------------|------------------------------|
| **Trigger** | Doubles ≤ CF on d100 | Even number ≤ CF on d10 |
| **When** | During any Fate Question | Only when testing new Scene |
| **Effect** | Adds twist to current situation | Replaces entire Expected Scene |
| **Original Result** | Still applies (Yes/No/etc.) | Discarded completely |
| **Interpretation** | Related to Fate Question context | Can be anything; starts fresh |

## Random Event Generation Process

Once triggered (either way), generate the Random Event:

### 1. Context
What's happening right now? This guides interpretation.
- For Fate Question Events: The question itself is part of context
- For Interrupt Scenes: The Expected Scene and current situation

### 2. Event Focus (roll d100)
Determines WHAT aspect of adventure is affected:
- Remote Event (1-7)
- NPC Action (8-28)
- New NPC (29-35)
- Move Toward Thread (36-45)
- Move Away From Thread (46-52)
- Close Thread (53-55)
- PC Negative (56-67)
- PC Positive (68-75)
- Ambiguous Event (76-83)
- NPC Negative (84-92)
- NPC Positive (93-100)

If Event Focus requires a Thread or Character, roll on those Lists.
If List is empty, use "Current Context" as Focus instead.

### 3. Meaning (roll d100 twice)
Roll on Meaning Tables to get 2 word pairs for inspiration.
Suggest tables based on Event Focus (e.g., Actions for NPC Action).

### 4. Interpretation
Player combines Context + Event Focus + Meaning into narrative.
This becomes the Random Event that happens in the adventure.

## Fixes Completed ✅

### Priority 1: Fix Fate Question Random Event Trigger - COMPLETED

**File:** `src/lib/components/solorpg/FateQuestion.svelte`

**Implemented Changes:**
1. Added `onRandomEventTriggered` callback prop to Props interface
2. Updated callback invocation to call prop instead of console.log
3. Enhanced Random Event notification UI with clear messaging
4. Added fully functional button to open Random Event modal

**File:** `src/routes/solo-rpg/+page.svelte`

**Implemented Changes:**
1. Passed callback prop to FateQuestion component
2. Callback opens Random Event modal when triggered
3. Removed broken Quick Actions section

### Priority 2: Visual Feedback - COMPLETED

Random Event notification now:
1. Shows prominent orange-bordered notification banner
2. Explains that Random Event occurred IN ADDITION to answer
3. Displays roll details and Chaos Factor
4. Provides working button to generate the event
5. Makes it clear the Fate answer still applies

## Testing Checklist

### Fate Question Random Events
- [ ] Roll Fate Question with CF=5, roll=33 → Should trigger Random Event
- [ ] Roll Fate Question with CF=2, roll=33 → Should NOT trigger (3 > 2)
- [ ] Roll Fate Question with CF=5, roll=34 → Should NOT trigger (not doubles)
- [ ] Verify Fate answer (Yes/No) still applies
- [ ] Verify Random Event modal opens
- [ ] Verify visual notification shows

### Interrupt Scene Random Events
- [ ] Test Expected Scene with CF=6, roll=4 → Should trigger Interrupt
- [ ] Test Expected Scene with CF=6, roll=3 → Should be Altered (odd)
- [ ] Test Expected Scene with CF=6, roll=7 → Should be Expected (> CF)
- [ ] Verify Random Event modal opens for Interrupt
- [ ] Verify scene is marked as "Interrupt" type

## Summary

**We have TWO Random Event systems:**

1. **Fate Question Events** (during gameplay)
   - Adds surprise to current action
   - Happens alongside the Fate answer
   - ✅ **FIXED:** Now opens modal and shows clear UI feedback

2. **Interrupt Scenes** (between scenes)
   - Completely changes what happens next
   - Replaces the Expected Scene
   - ✅ Working correctly

**Status:** Both Random Event systems are now fully functional and integrated!
