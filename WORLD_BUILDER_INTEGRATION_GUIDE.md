# World Builder Integration - Implementation Guide

## ✅ Completed Steps

1. **Created JSON Data File** (`src/lib/data/world-builder/deck-of-worlds-eco-cards.json`)
   - Extracted all 240 Eco Cards from the PDF
   - 24 Region cards (4 cues each)
   - 36 Landmark cards (4 cues each)
   - 36 Namesake cards (4 cues each)
   - 24 Origin cards (4 cues each)
   - 36 Attribute cards (4 cues each)
   - 24 Advent cards (cue + interpretations)

2. **Created TypeScript Types** (`src/lib/types/worldBuilder.ts`)
   - `WorldBuilderCardType` - region, landmark, namesake, origin, attribute, advent
   - `WorldBuilderCard` - card data structure
   - `WorldBuilderDeck` - complete deck structure
   - `WORLD_BUILDER_CARD_TYPES` - metadata with icons, colors, descriptions
   - `Microsetting` - interface for complete microsetting (6 cards)

3. **Created Loader** (`src/lib/data/worldBuilderLoader.ts`)
   - `loadWorldBuilderMainDeck()` - loads and caches all cards
   - `getAllWorldBuilderCards()` - returns flat array of all cards
   - `getCardsByType()` - filter by card type
   - `getRandomCard()` - draw random card
   - `generateMicrosetting()` - generate complete microsetting
   - `getDeckStats()` - deck statistics

## 🔧 Required Changes to StoryBoardGenerator.svelte

### 1. Add Imports (Line ~8)

```typescript
// Add after Story Engine imports
import { getRandomCard as getRandomWorldBuilderCard, generateMicrosetting } from '$lib/data/worldBuilderLoader';
import { WORLD_BUILDER_CARD_TYPES, type WorldBuilderCardType, type WorldBuilderCard } from '$lib/types/worldBuilder';
```

### 2. Add World Builder Category Definition (Line ~33)

```typescript
// Add after storyEngineCategory
const worldBuilderCategory: CategoryInfo = {
	type: 'world-builder' as any,
	name: 'World Builder',
	icon: '🌍',
	metadata: [
		{ name: 'Region', type: 'world-builder' },
		{ name: 'Landmark', type: 'world-builder' },
		{ name: 'Namesake', type: 'world-builder' },
		{ name: 'Origin', type: 'world-builder' },
		{ name: 'Attribute', type: 'world-builder' },
		{ name: 'Advent', type: 'world-builder' },
		{ name: 'Microsetting (6 cards)', type: 'world-builder' }
	]
};
```

### 3. Add World Builder State Variables (Line ~50)

```typescript
// Add after Story Engine state variables
let isWorldBuilderMode = $state(false);
let selectedWorldBuilderType = $state<WorldBuilderCardType | 'microsetting' | null>(null);
let generatedWorldBuilderCard = $state<WorldBuilderCard | null>(null);
let generatedMicrosetting = $state<WorldBuilderCard[] | null>(null);
let showWorldBuilderHelp = $state(false);
```

### 4. Add World Builder Generation Functions (After line ~220)

```typescript
// World Builder generation functions
async function generateWorldBuilderCard() {
	if (!selectedWorldBuilderType || selectedWorldBuilderType === 'microsetting') return;

	isRolling = true;
	try {
		generatedWorldBuilderCard = await getRandomWorldBuilderCard(selectedWorldBuilderType as WorldBuilderCardType);
	} catch (error) {
		console.error('Failed to generate World Builder card:', error);
	} finally {
		isRolling = false;
	}
}

async function generateWorldBuilderMicrosetting() {
	isRolling = true;
	try {
		const microsetting = await generateMicrosetting();
		// Convert to array for easy rendering
		generatedMicrosetting = [
			microsetting.region,
			...microsetting.landmarks,
			microsetting.namesake,
			microsetting.origin,
			microsetting.attribute,
			microsetting.advent
		];
	} catch (error) {
		console.error('Failed to generate Microsetting:', error);
	} finally {
		isRolling = false;
	}
}

function addWorldBuilderCardToBoard(card: WorldBuilderCard, offsetMultiplier: number = 0, groupId?: string) {
	if (!$activeBoard) return;

	const viewportCenterX = (-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
	const viewportCenterY = (-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

	const typeInfo = WORLD_BUILDER_CARD_TYPES[card.type];

	// Same spacing logic as Story Engine
	const cardWidth = 400;
	const gap = 20;
	const cardSpacing = cardWidth + gap;
	const totalWidth = (7 * cardWidth) + (6 * gap); // 7 cards for microsetting

	const minLeftMargin = 50;
	let startX = viewportCenterX - (totalWidth / 2);
	if (startX < minLeftMargin) {
		startX = minLeftMargin;
	}

	const xOffset = offsetMultiplier * cardSpacing;
	const finalX = startX + xOffset;
	const finalY = viewportCenterY - 200;

	const nodeData = {
		x: finalX,
		y: finalY,
		width: 400,
		height: 400,
		label: '',
		notes: `World Builder: ${typeInfo.name}`,
		icon: typeInfo.icon,
		layer: 0,
		groupId: groupId,
		worldBuilderCard: {
			type: card.type,
			cues: card.cues ? Array.from(card.cues) : undefined,
			cue: card.cue,
			interpretations: card.interpretations,
			activeCueIndex: 0,
			expansion: card.expansion
		}
	};

	storyboardStore.addNode(
		$activeBoard.id,
		nodeData,
		`Generate: World Builder ${typeInfo.name}`
	);
}
```

### 5. Add World Builder Category Button (After line ~278)

```html
<!-- World Builder Category -->
<button
	class="category-btn world-builder-btn {isWorldBuilderMode ? 'active' : ''}"
	onclick={() => {
		isWorldBuilderMode = true;
		isStoryEngineMode = false;
		selectedTable = null;
		searchQuery = '';
		generatedText = '';
		generatedWorldBuilderCard = null;
		generatedMicrosetting = null;
		selectedWorldBuilderType = null;
	}}
>
	<span class="category-icon">{worldBuilderCategory.icon}</span>
	<span class="category-name">{worldBuilderCategory.name}</span>
	<span class="category-count">7</span>
</button>
```

### 6. Update Mode Checks (Line ~246, ~264, ~281)

Update the category button onclick handlers to include:
```typescript
isWorldBuilderMode = false;
generatedWorldBuilderCard = null;
generatedMicrosetting = null;
selectedWorldBuilderType = null;
```

### 7. Add World Builder UI Section (After line ~346, inside the {:else} block)

```html
{:else if isWorldBuilderMode}
	<!-- World Builder card type selector -->
	<div class="story-engine-header">
		<h3 class="story-engine-title">Select Card Type</h3>
		<button class="help-btn" onclick={() => (showWorldBuilderHelp = true)} title="How to use World Builder">
			<span class="help-icon">?</span>
			<span class="help-text">Help</span>
		</button>
	</div>
	<div class="story-engine-types">
		{#each Object.values(WORLD_BUILDER_CARD_TYPES) as typeInfo}
			<button
				class="story-engine-type-btn {selectedWorldBuilderType === typeInfo.type ? 'selected' : ''}"
				onclick={() => {
					selectedWorldBuilderType = typeInfo.type;
					generatedWorldBuilderCard = null;
					generatedMicrosetting = null;
				}}
			>
				<span class="type-icon">{typeInfo.icon}</span>
				<div class="type-info">
					<span class="type-name">{typeInfo.name}</span>
					<span class="type-desc">{typeInfo.description}</span>
				</div>
			</button>
		{/each}
		<!-- Microsetting option -->
		<button
			class="story-engine-type-btn story-seed-btn {selectedWorldBuilderType === 'microsetting' ? 'selected' : ''}"
			onclick={() => {
				selectedWorldBuilderType = 'microsetting';
				generatedWorldBuilderCard = null;
				generatedMicrosetting = null;
			}}
		>
			<span class="type-icon">🗺️</span>
			<div class="type-info">
				<span class="type-name">Microsetting</span>
				<span class="type-desc">Complete worldbuilding prompt (6+ cards)</span>
			</div>
		</button>
	</div>
{:else if !isStoryEngineMode && !isWorldBuilderMode}
```

### 8. Add World Builder Generation UI (After line ~377)

```html
{:else if isWorldBuilderMode && selectedWorldBuilderType}
	<!-- World Builder generation -->
	<div class="roll-section story-engine-roll">
		{#if selectedWorldBuilderType !== 'microsetting'}
			<!-- Single card generation -->
			{#if !generatedWorldBuilderCard}
				<button class="roll-btn" onclick={generateWorldBuilderCard} disabled={isRolling}>
					{#if isRolling}
						<span class="rolling">🎲 Drawing...</span>
					{:else}
						<span>🎲 Draw Card</span>
					{/if}
				</button>
			{:else}
				<div class="story-engine-result">
					<div class="result-label">
						{WORLD_BUILDER_CARD_TYPES[generatedWorldBuilderCard.type].icon}
						{WORLD_BUILDER_CARD_TYPES[generatedWorldBuilderCard.type].name}
					</div>
					<div class="cues-preview">
						{#if generatedWorldBuilderCard.cues}
							{#each generatedWorldBuilderCard.cues as cue, index}
								<div class="cue-preview-item">
									<span class="cue-number">{index + 1}.</span>
									<span class="cue-preview-text">{cue}</span>
								</div>
							{/each}
						{:else if generatedWorldBuilderCard.cue}
							<div class="cue-preview-item">
								<span class="cue-preview-text">{generatedWorldBuilderCard.cue}</span>
							</div>
							{#if generatedWorldBuilderCard.interpretations}
								<div class="interpretations">
									<div class="interpretations-label">Interpretations:</div>
									{#each generatedWorldBuilderCard.interpretations as interpretation}
										<div class="interpretation-item">• {interpretation}</div>
									{/each}
								</div>
							{/if}
						{/if}
					</div>
				</div>

				<div class="action-buttons">
					<button
						class="add-btn"
						onclick={() => {
							addWorldBuilderCardToBoard(generatedWorldBuilderCard!);
							generatedWorldBuilderCard = null;
						}}
					>
						✓ Add to Storyboard
					</button>
					<button class="reroll-btn" onclick={generateWorldBuilderCard}> 🔄 Draw Again </button>
				</div>
			{/if}
		{:else}
			<!-- Microsetting generation (6+ cards) -->
			{#if !generatedMicrosetting}
				<button class="roll-btn" onclick={generateWorldBuilderMicrosetting} disabled={isRolling}>
					{#if isRolling}
						<span class="rolling">🎲 Generating...</span>
					{:else}
						<span>🗺️ Generate Microsetting</span>
					{/if}
				</button>
			{:else}
				<div class="story-seed-result">
					<div class="result-label">Microsetting - Add cards one by one:</div>
					{#each generatedMicrosetting as card, index}
						{@const typeInfo = WORLD_BUILDER_CARD_TYPES[card.type]}
						<div class="story-seed-card">
							<div class="seed-card-header">
								<span class="seed-card-icon">{typeInfo.icon}</span>
								<span class="seed-card-type">{typeInfo.name}</span>
								<span class="seed-card-cue">{card.cues ? card.cues[0] : card.cue}</span>
							</div>
							<button
								class="add-seed-btn"
								onclick={() => {
									addWorldBuilderCardToBoard(card, index);
								}}
							>
								+ Add
							</button>
						</div>
					{/each}
				</div>

				<div class="action-buttons">
					<button
						class="add-btn"
						onclick={() => {
							const microsettingGroupId = crypto.randomUUID();
							generatedMicrosetting!.forEach((card, index) => {
								addWorldBuilderCardToBoard(card, index, microsettingGroupId);
							});
							generatedMicrosetting = null;
						}}
					>
						✓ Add All to Storyboard
					</button>
					<button class="reroll-btn" onclick={generateWorldBuilderMicrosetting}>
						🔄 Generate New Microsetting
					</button>
				</div>
			{/if}
		{/if}
	</div>
```

### 9. Update Placeholder Condition (Line ~474)

```html
{:else}
	<div class="placeholder">
		<p class="placeholder-icon">{isWorldBuilderMode ? '🌍' : isStoryEngineMode ? '📖' : selectedCategory.icon}</p>
		<p class="placeholder-text">
			{isWorldBuilderMode ? 'Select a card type to generate' : isStoryEngineMode ? 'Select a card type to generate' : 'Select a table to generate content'}
		</p>
	</div>
{/if}
```

### 10. Add CSS Styles (After line ~1029)

```css
/* World Builder Styles */
.world-builder-btn {
	background: linear-gradient(135deg, rgb(14 165 233), rgb(3 105 161));
}

.world-builder-btn.active {
	background: linear-gradient(135deg, rgb(6 182 212), rgb(8 145 178));
	box-shadow: 0 0 20px rgb(6 182 212 / 0.6);
}

.interpretations {
	margin-top: 1rem;
	padding: 1rem;
	background: rgb(30 27 75 / 0.3);
	border-radius: 0.5rem;
	border-left: 3px solid rgb(6 182 212);
}

.interpretations-label {
	color: rgb(6 182 212);
	font-weight: 600;
	font-size: 0.875rem;
	margin-bottom: 0.5rem;
}

.interpretation-item {
	color: rgb(203 213 225);
	font-size: 0.8125rem;
	margin-bottom: 0.375rem;
	padding-left: 0.5rem;
}
```

## 🎯 Integration Result

Once implemented, users will be able to:

1. ✅ Click "World Builder" category button (🌍)
2. ✅ Select from 7 card types:
   - 🟢 Region (main terrain)
   - 🔵 Landmark (points of interest)
   - 🟠 Namesake (atmospheric names)
   - 📘 Origin (historical events - past)
   - ⭐ Attribute (current characteristics - present)
   - 🔮 Advent (future-changing events)
   - 🗺️ Microsetting (complete 6+ card prompt)
3. ✅ Draw individual cards or generate complete microsetting
4. ✅ Add cards to storyboard with rotation support
5. ✅ Group microsetting cards together for easy movement

## 📝 Notes

- World Builder cards work exactly like Story Engine cards
- Same rotation mechanics (◄ ► buttons on cards)
- Same grouping support for moving cards together
- Advent cards have special handling for long-form text + interpretations
- All 240 Eco Cards are loaded and ready to use

## 🔄 Future Expansions

To add more Deck of Worlds expansions later:
1. Add JSON files to `src/lib/data/world-builder/`
2. Update `worldBuilderLoader.ts` to import and parse them
3. No UI changes needed - system automatically handles new cards

---

**Status**: Ready for implementation in StoryBoardGenerator.svelte
