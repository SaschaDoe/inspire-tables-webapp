# Deities Expansion Implementation Plan

## Overview
This document outlines the implementation strategy for integrating the Lore Master's Deck Deities Expansion into the storyboard system.

## Expansion Mechanics Summary

The Deities Expansion adds:
- **25 Deity cards** (new card type)
- **35 Expansion variant cards** (5 each of the 7 main lore types)
- **Forced deity-pairing mechanic**: When drawing an expansion card, you must also draw a Deity card
- **Name substitution**: The Deity card's name replaces ⚪ placeholders in expansion card cues
- **Examples**:
  - Expansion card: "GATES OF ⚪" + Deity card: "THE TORCHBEARER" = "GATES OF THE TORCHBEARER"
  - Expansion card: "⚪'S REAPERS" + Deity card: "THE LION" = "THE LION'S REAPERS"

## Implementation Phases

### Phase 1: Type System Updates

**File**: `src/lib/types/loreMaster.ts`

**Changes**:
1. Add `'deity'` to the `LoreMasterCardType` union type:
```typescript
export type LoreMasterCardType =
  | 'faction'
  | 'figure'
  | 'event'
  | 'location'
  | 'object'
  | 'material'
  | 'creature'
  | 'modifier'
  | 'deity'; // NEW
```

2. Update `LORE_MASTER_CARD_TYPES` constant to include deity:
```typescript
export const LORE_MASTER_CARD_TYPES: LoreMasterCardType[] = [
  'faction', 'figure', 'event', 'location', 'object', 'material', 'creature', 'deity'
];
```

3. Add expansion variant flag to card interface (optional - for future filtering):
```typescript
export interface LoreMasterCard {
  primaryCues: string[];
  secondaryCues: string[];
  isExpansionVariant?: boolean; // NEW - marks cards that require deity pairing
}
```

### Phase 2: Data Loader Updates

**File**: `src/lib/data/loreMasterLoader.ts`

**Changes**:
1. Import the deities expansion JSON file:
```typescript
import deitiesExpansionData from './lore-master/loremaster-deck-deity-expansion.json';
```

2. Update the `loadAllCards()` function to include deity expansion cards:
```typescript
async function loadAllCards() {
  const allCardData = [
    ...existingImports,
    deitiesExpansionData
  ];

  // Process deity cards separately
  // Mark expansion variant cards with isExpansionVariant flag
}
```

3. Add new function to detect if a card is an expansion variant:
```typescript
function isExpansionVariant(card: LoreMasterCard): boolean {
  // Check if primary or secondary cues contain ⚪ placeholder
  return card.primaryCues.some(cue => cue.includes('⚪')) ||
         card.secondaryCues.some(cue => cue.includes('⚪'));
}
```

4. Add function to get a random deity card:
```typescript
export function getRandomDeityCard(): LoreMasterCard {
  const deityCards = cardsByType.get('deity') || [];
  return deityCards[Math.floor(Math.random() * deityCards.length)];
}
```

### Phase 3: Link Icon System

**File**: `src/lib/utils/linkIconParser.ts` (new file)

**Purpose**: Parse and replace link icon placeholders (⚪, ⚫, etc.) in card cues

**Implementation**:
```typescript
export const LINK_ICONS = {
  WHITE_CIRCLE: '⚪',  // Draw any card type
  BLACK_CIRCLE: '⚫',  // Draw specific card type
  // Add other link icons as needed
} as const;

export interface LinkIconReplacement {
  icon: string;
  cardType?: LoreMasterCardType;
  replacementText: string;
}

/**
 * Replace link icons in a cue with actual card names
 */
export function replaceLinkIcons(
  cue: string,
  replacements: LinkIconReplacement[]
): string {
  let result = cue;
  for (const replacement of replacements) {
    result = result.replace(replacement.icon, replacement.replacementText);
  }
  return result;
}

/**
 * Detect which link icons are present in cues
 */
export function detectLinkIcons(cues: string[]): string[] {
  const icons: string[] = [];
  const allIcons = Object.values(LINK_ICONS);

  for (const cue of cues) {
    for (const icon of allIcons) {
      if (cue.includes(icon) && !icons.includes(icon)) {
        icons.push(icon);
      }
    }
  }

  return icons;
}
```

### Phase 4: Storyboard Type Updates

**File**: `src/lib/types/storyboard.ts`

**Changes**:
Update the `loreCluster` interface to include paired deity card:

```typescript
loreCluster?: {
  primaryCard: {
    card: LoreMasterCard;
    activeCueIndex: number;
    // NEW: If this is an expansion variant, store the paired deity
    pairedDeity?: {
      card: LoreMasterCard; // The deity card
      replacementName: string; // The deity name (e.g., "THE LION")
    };
  };
  topCard: { /* ... same structure with pairedDeity */ } | null;
  rightCard: { /* ... same structure with pairedDeity */ } | null;
  bottomCard: { /* ... same structure with pairedDeity */ } | null;
  leftCard: { /* ... same structure with pairedDeity */ } | null;
  modifierCard?: { /* ... */ };
  expandedFromNodeId?: string;
};
```

### Phase 5: Generator UI Updates

**File**: `src/lib/components/storyboard/StoryBoardGenerator.svelte`

**Changes**:

1. Add expansion mode toggle:
```typescript
let useExpansionVariants = $state(false); // Toggle for expansion cards
```

2. Update `generateLoreCluster()` function to handle deity pairing:
```typescript
async function generateLoreCluster() {
  if (!selectedLoreMasterType) return;

  isRolling = true;
  try {
    // Draw primary card
    const primaryCard = await getRandomLoreMasterCard(
      selectedLoreMasterType,
      useExpansionVariants
    );

    // If expansion variant, also draw deity card
    let primaryDeity = null;
    if (isExpansionVariant(primaryCard)) {
      const deityCard = await getRandomDeityCard();
      primaryDeity = {
        card: deityCard,
        replacementName: extractDeityName(deityCard)
      };
    }

    // Draw 4 secondary cards (with deity pairing if needed)
    // ... similar logic for each secondary card

    generatedLoreCluster = {
      primaryCard,
      primaryDeity,
      topCard,
      topDeity,
      // ... etc
    };
  } finally {
    isRolling = false;
  }
}

function extractDeityName(deityCard: LoreMasterCard): string {
  // Deity cards have their name in secondary cues
  // e.g., ["THE LION"], ["THE SERPENT"], etc.
  return deityCard.secondaryCues[0] || '';
}
```

3. Add expansion mode UI:
```svelte
{#if isLoreMasterMode}
  <div class="expansion-toggle">
    <label>
      <input type="checkbox" bind:checked={useExpansionVariants} />
      Use Deities Expansion
    </label>
    {#if useExpansionVariants}
      <span class="expansion-note">
        Expansion cards will be paired with Deity cards
      </span>
    {/if}
  </div>
{/if}
```

### Phase 6: Node Rendering Updates

**File**: `src/lib/components/storyboard/StoryBoardNode.svelte`

**Changes**:

1. Update cue display to handle deity-paired cards:
```typescript
function getDisplayCue(
  card: LoreMasterCard,
  cueIndex: number,
  pairedDeity?: { replacementName: string }
): string {
  const isPrimary = cueIndex < 4;
  const cues = isPrimary ? card.primaryCues : card.secondaryCues;
  const actualIndex = isPrimary ? cueIndex : cueIndex - 4;

  let cue = cues[actualIndex] || '';

  // Replace ⚪ with deity name if paired
  if (pairedDeity && cue.includes('⚪')) {
    cue = cue.replace(/⚪/g, pairedDeity.replacementName);
  }

  return cue;
}
```

2. Add visual indicator for deity-paired cards:
```svelte
{#if card.pairedDeity}
  <div class="deity-indicator" title="Paired with {card.pairedDeity.replacementName}">
    🌟
  </div>
{/if}
```

3. Update card tooltip to show paired deity:
```svelte
<div class="card-tooltip">
  <div>Card: {card.card.primaryCues[0]}</div>
  {#if card.pairedDeity}
    <div class="deity-pair">
      Deity: {card.pairedDeity.replacementName}
    </div>
  {/if}
</div>
```

### Phase 7: Future Enhancements

1. **Deity Cluster Type**: Allow creating clusters with deity as primary card
2. **Link Icon Detection**: Automatically detect which type of card should be drawn based on link icons
3. **Expansion Card Filtering**: Add option to use only base deck or only expansion
4. **Deity Tucking**: Implement visual tucking of deity cards under paired cards
5. **Multiple Deity Support**: Handle cards with multiple ⚪ icons requiring multiple deities

## Testing Checklist

- [ ] Verify deity cards load correctly
- [ ] Verify expansion variant cards load correctly
- [ ] Test deity pairing mechanic
- [ ] Test ⚪ replacement in card cues
- [ ] Test UI toggle for expansion mode
- [ ] Test visual rendering of paired cards
- [ ] Test that non-expansion cards work as before
- [ ] Verify no regression in base deck functionality

## Files to Create/Modify

**New Files**:
- `docs/deities-expansion-implementation-plan.md` (this file)
- `docs/deities-expansion-user-guide.md`
- `src/lib/utils/linkIconParser.ts`

**Modified Files**:
- `src/lib/types/loreMaster.ts`
- `src/lib/types/storyboard.ts`
- `src/lib/data/loreMasterLoader.ts`
- `src/lib/components/storyboard/StoryBoardGenerator.svelte`
- `src/lib/components/storyboard/StoryBoardNode.svelte`

## Estimated Complexity

- **Phase 1-2**: Low complexity (type and data changes)
- **Phase 3**: Medium complexity (new utility system)
- **Phase 4**: Low complexity (type updates)
- **Phase 5**: Medium-High complexity (generator logic)
- **Phase 6**: Medium complexity (rendering updates)

## Notes

- The ⚪ (white circle) is the primary deity placeholder symbol
- Deity cards have unique structure: 4 primary cues + only 1-4 secondary cues (the deity name)
- Some deity cards have multiple names (e.g., "THE SPIDER", "THE STAG", "THE FLY" on one card)
- Expansion cards should be marked/filtered separately from base deck cards
- Consider future support for other link icons (⚫, etc.) which may have different mechanics
