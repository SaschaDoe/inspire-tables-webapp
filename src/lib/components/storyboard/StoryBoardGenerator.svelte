<script lang="ts">
	import { storyboardStore, activeBoard } from '$lib/stores/storyboardStore';
	import { Dice } from '$lib/utils/dice';
	import { getAllCategories, loadTablesForCategory, type CategoryInfo } from '$lib/data/tableHelpers';
	import type { Table } from '$lib/tables/table';
	import { onMount } from 'svelte';
	import { getRandomCard, generateStorySeed } from '$lib/data/storyEngineLoader';
	import { STORY_ENGINE_CARD_TYPES, type StoryEngineCardType, type StoryEngineCard } from '$lib/types/storyEngine';

	interface Props {
		show: boolean;
		onClose: () => void;
	}

	let { show, onClose }: Props = $props();

	// Categories with their metadata (no tables loaded yet)
	const categories = getAllCategories();

	// Add Story Engine as a special category
	const storyEngineCategory: CategoryInfo = {
		type: 'story-engine' as any,
		name: 'Story Engine',
		icon: '📖',
		metadata: [
			{ name: 'Agent', type: 'story-engine' },
			{ name: 'Engine', type: 'story-engine' },
			{ name: 'Anchor', type: 'story-engine' },
			{ name: 'Conflict', type: 'story-engine' },
			{ name: 'Aspect', type: 'story-engine' },
			{ name: 'Story Seed (5 cards)', type: 'story-engine' }
		]
	};

	// State
	let selectedCategory = $state<CategoryInfo>(categories[0]);
	let categoryTables = $state<Table[]>([]);
	let isLoadingTables = $state(false);
	let selectedTable = $state<Table | null>(null);
	let searchQuery = $state('');
	let generatedText = $state('');
	let isRolling = $state(false);

	// Story Engine specific state
	let isStoryEngineMode = $state(false);
	let selectedStoryEngineType = $state<StoryEngineCardType | 'story-seed' | null>(null);
	let generatedStoryEngineCard = $state<StoryEngineCard | null>(null);
	let generatedStorySeed = $state<StoryEngineCard[] | null>(null);
	let showStoryEngineHelp = $state(false);

	// Load tables when category changes
	$effect(() => {
		if (selectedCategory) {
			loadCategoryTables(selectedCategory);
		}
	});

	async function loadCategoryTables(category: CategoryInfo) {
		isLoadingTables = true;
		try {
			categoryTables = await loadTablesForCategory(category.type);
		} catch (error) {
			console.error('Failed to load tables for category:', category.name, error);
			categoryTables = [];
		} finally {
			isLoadingTables = false;
		}
	}

	// Load initial category on mount
	onMount(() => {
		loadCategoryTables(selectedCategory);
	});

	// Filter tables by search
	let filteredTables = $derived(
		categoryTables.filter((table) =>
			table.title.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Roll on selected table
	async function rollTable() {
		if (!selectedTable || !$activeBoard) return;

		isRolling = true;
		await new Promise((resolve) => setTimeout(resolve, 500)); // Dramatic pause

		const dice = new Dice();
		const result = selectedTable.roleWithCascade(dice);
		generatedText = result.text;

		isRolling = false;
	}

	// Add result as card to storyboard
	function addToStoryboard() {
		if (!$activeBoard || !generatedText || !selectedTable) return;

		// Calculate center of viewport
		const viewportCenterX =
			(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY =
			(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		storyboardStore.addNode(
			$activeBoard.id,
			{
				x: viewportCenterX - 100,
				y: viewportCenterY - 60,
				width: 200,
				height: 120,
				label: generatedText,
				notes: `Generated from: ${selectedTable.title}`,
				color: '#fbbf24', // Yellow color for generated cards
				icon: '🎲',
				entityType: 'generated' as any, // Special type for generated cards
				layer: 0
			},
			`Generate: ${selectedTable.title}`
		);

		// Reset and close
		generatedText = '';
		selectedTable = null;
		onClose();
	}

	// Quick generate and add
	async function quickGenerate() {
		await rollTable();
		if (generatedText) {
			addToStoryboard();
		}
	}

	// Story Engine generation functions
	async function generateStoryEngineCard() {
		if (!selectedStoryEngineType || selectedStoryEngineType === 'story-seed') return;

		isRolling = true;
		try {
			generatedStoryEngineCard = await getRandomCard(selectedStoryEngineType as StoryEngineCardType);
		} catch (error) {
			console.error('Failed to generate Story Engine card:', error);
		} finally {
			isRolling = false;
		}
	}

	async function generateStoryEngineStorySeed() {
		isRolling = true;
		try {
			generatedStorySeed = await generateStorySeed();
		} catch (error) {
			console.error('Failed to generate Story Seed:', error);
		} finally {
			isRolling = false;
		}
	}

	function addStoryEngineCardToBoard(card: StoryEngineCard, offsetMultiplier: number = 0, groupId?: string) {
		if (!$activeBoard) {
			console.error('No active board!');
			return;
		}

		const viewportCenterX =
			(-$activeBoard.viewport.x + window.innerWidth / 2) / $activeBoard.viewport.zoom;
		const viewportCenterY =
			(-$activeBoard.viewport.y + window.innerHeight / 2) / $activeBoard.viewport.zoom;

		const typeInfo = STORY_ENGINE_CARD_TYPES[card.type];

		// Arrange cards in a nice horizontal spread
		const cardWidth = 400;
		const gap = 20;
		const cardSpacing = cardWidth + gap; // 420px between card starts

		// Calculate total width of all cards: 5 cards + 4 gaps
		const totalWidth = (5 * cardWidth) + (4 * gap); // 2080px

		// Place cards starting from a safe left position
		// Ensure leftmost card is always visible (min 50px from left edge)
		const minLeftMargin = 50;
		let startX = viewportCenterX - (totalWidth / 2);

		// If startX would be negative or too close to edge, adjust it
		if (startX < minLeftMargin) {
			startX = minLeftMargin;
		}

		const xOffset = offsetMultiplier * cardSpacing;
		const finalX = startX + xOffset;
		const finalY = viewportCenterY - 200;

		console.log(`Card ${offsetMultiplier} (${card.type}): viewport center=(${viewportCenterX.toFixed(0)}, ${viewportCenterY.toFixed(0)}), position=(${finalX.toFixed(0)}, ${finalY.toFixed(0)}), startX=${startX.toFixed(0)}`);

		const nodeData = {
			x: finalX,
			y: finalY,
			width: 400,
			height: 400,
			label: '', // Story Engine cards don't use label
			notes: `Story Engine: ${typeInfo.name}`,
			icon: typeInfo.icon,
			layer: 0,
			groupId: groupId, // Add group ID for moving cards together
			storyEngineCard: {
				type: card.type,
				cues: Array.from(card.cues), // Convert Proxy to plain array
				activeCueIndex: 0, // Start with first cue
				expansion: card.expansion
			}
		};

		console.log('Adding Story Engine card:', nodeData);

		storyboardStore.addNode(
			$activeBoard.id,
			nodeData,
			`Generate: Story Engine ${typeInfo.name}`
		);

		console.log('Card added. Total nodes:', $activeBoard.nodes.length);
	}

	// Handle escape to close
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && show) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if show}
	<div class="modal-overlay" onclick={onClose} role="presentation">
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="dialog">
			<div class="modal-header">
				<div class="header-icon">🎲</div>
				<h2 class="modal-title">Generate Story Elements</h2>
				<button class="close-btn" onclick={onClose} aria-label="Close">×</button>
			</div>

			<div class="modal-body">
				<!-- Category selector -->
				<div class="category-grid">
					{#each categories as category (category.type)}
						<button
							class="category-btn {category.type === selectedCategory.type && !isStoryEngineMode ? 'active' : ''}"
							onclick={() => {
								selectedCategory = category;
								selectedTable = null;
								searchQuery = '';
								isStoryEngineMode = false;
								generatedStoryEngineCard = null;
								generatedStorySeed = null;
								selectedStoryEngineType = null;
							}}
						>
							<span class="category-icon">{category.icon}</span>
							<span class="category-name">{category.name}</span>
							<span class="category-count">{category.metadata.length}</span>
						</button>
					{/each}
					<!-- Story Engine Category -->
					<button
						class="category-btn story-engine-btn {isStoryEngineMode ? 'active' : ''}"
						onclick={() => {
							isStoryEngineMode = true;
							selectedTable = null;
							searchQuery = '';
							generatedText = '';
							generatedStoryEngineCard = null;
							generatedStorySeed = null;
							selectedStoryEngineType = null;
						}}
					>
						<span class="category-icon">{storyEngineCategory.icon}</span>
						<span class="category-name">{storyEngineCategory.name}</span>
						<span class="category-count">6</span>
					</button>
				</div>

				{#if !isStoryEngineMode}
					<!-- Search bar -->
					<div class="search-bar">
						<span class="search-icon">🔍</span>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search {selectedCategory.name.toLowerCase()} tables..."
							class="search-input"
						/>
					</div>

					<!-- Table list -->
					<div class="table-list">
						{#each filteredTables as table (table.title)}
							<button
								class="table-item {table === selectedTable ? 'selected' : ''}"
								onclick={() => (selectedTable = table)}
							>
								<span class="table-name">{table.title}</span>
							</button>
						{/each}
					</div>
				{:else}
					<!-- Story Engine card type selector -->
					<div class="story-engine-header">
						<h3 class="story-engine-title">Select Card Type</h3>
						<button class="help-btn" onclick={() => (showStoryEngineHelp = true)} title="How to use Story Engine">
							<span class="help-icon">?</span>
							<span class="help-text">Help</span>
						</button>
					</div>
					<div class="story-engine-types">
						{#each Object.values(STORY_ENGINE_CARD_TYPES) as typeInfo}
							<button
								class="story-engine-type-btn {selectedStoryEngineType === typeInfo.type ? 'selected' : ''}"
								onclick={() => {
									selectedStoryEngineType = typeInfo.type;
									generatedStoryEngineCard = null;
									generatedStorySeed = null;
								}}
							>
								<span class="type-icon">{typeInfo.icon}</span>
								<div class="type-info">
									<span class="type-name">{typeInfo.name}</span>
									<span class="type-desc">{typeInfo.description}</span>
								</div>
							</button>
						{/each}
						<!-- Story Seed option -->
						<button
							class="story-engine-type-btn story-seed-btn {selectedStoryEngineType === 'story-seed' ? 'selected' : ''}"
							onclick={() => {
								selectedStoryEngineType = 'story-seed';
								generatedStoryEngineCard = null;
								generatedStorySeed = null;
							}}
						>
							<span class="type-icon">✨</span>
							<div class="type-info">
								<span class="type-name">Story Seed</span>
								<span class="type-desc">Complete 5-card prompt</span>
							</div>
						</button>
					</div>
				{/if}

				<!-- Roll section -->
				{#if !isStoryEngineMode && selectedTable}
					<!-- Regular table generation -->
					<div class="roll-section">
						<div class="selected-table">
							<span class="label">Selected:</span>
							<span class="value">{selectedTable.title}</span>
						</div>

						{#if !generatedText}
							<button class="roll-btn" onclick={rollTable} disabled={isRolling}>
								{#if isRolling}
									<span class="rolling">🎲 Rolling...</span>
								{:else}
									<span>🎲 Roll Table</span>
								{/if}
							</button>
						{:else}
							<div class="result-display">
								<div class="result-label">Result:</div>
								<div class="result-text">{generatedText}</div>
							</div>

							<div class="action-buttons">
								<button class="add-btn" onclick={addToStoryboard}> ✓ Add to Storyboard </button>
								<button class="reroll-btn" onclick={rollTable}> 🔄 Reroll </button>
							</div>
						{/if}
					</div>
				{:else if isStoryEngineMode && selectedStoryEngineType}
					<!-- Story Engine generation -->
					<div class="roll-section story-engine-roll">
						{#if selectedStoryEngineType !== 'story-seed'}
							<!-- Single card generation -->
							{#if !generatedStoryEngineCard}
								<button class="roll-btn" onclick={generateStoryEngineCard} disabled={isRolling}>
									{#if isRolling}
										<span class="rolling">🎲 Drawing...</span>
									{:else}
										<span>🎲 Draw Card</span>
									{/if}
								</button>
							{:else}
								<div class="story-engine-result">
									<div class="result-label">
										{STORY_ENGINE_CARD_TYPES[generatedStoryEngineCard.type].icon}
										{STORY_ENGINE_CARD_TYPES[generatedStoryEngineCard.type].name}
									</div>
									<div class="cues-preview">
										{#each generatedStoryEngineCard.cues as cue, index}
											<div class="cue-preview-item">
												<span class="cue-number">{index + 1}.</span>
												<span class="cue-preview-text">{cue}</span>
											</div>
										{/each}
									</div>
								</div>

								<div class="action-buttons">
									<button
										class="add-btn"
										onclick={() => {
											addStoryEngineCardToBoard(generatedStoryEngineCard!);
											generatedStoryEngineCard = null;
										}}
									>
										✓ Add to Storyboard
									</button>
									<button class="reroll-btn" onclick={generateStoryEngineCard}> 🔄 Draw Again </button>
								</div>
							{/if}
						{:else}
							<!-- Story Seed generation (5 cards) -->
							{#if !generatedStorySeed}
								<button class="roll-btn" onclick={generateStoryEngineStorySeed} disabled={isRolling}>
									{#if isRolling}
										<span class="rolling">🎲 Generating...</span>
									{:else}
										<span>✨ Generate Story Seed</span>
									{/if}
								</button>
							{:else}
								<div class="story-seed-result">
									<div class="result-label">Story Seed - Add cards one by one:</div>
									{#each generatedStorySeed as card, index}
										{@const typeInfo = STORY_ENGINE_CARD_TYPES[card.type]}
										<div class="story-seed-card">
											<div class="seed-card-header">
												<span class="seed-card-icon">{typeInfo.icon}</span>
												<span class="seed-card-type">{typeInfo.name}</span>
												<span class="seed-card-cue">{card.cues[0]}</span>
											</div>
											<button
												class="add-seed-btn"
												onclick={() => {
													addStoryEngineCardToBoard(card, index);
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
											// Generate a single groupId for all cards in this Story Seed
											const storySeedGroupId = crypto.randomUUID();
											generatedStorySeed!.forEach((card, index) => {
												addStoryEngineCardToBoard(card, index, storySeedGroupId);
											});
											generatedStorySeed = null;
										}}
									>
										✓ Add All to Storyboard
									</button>
									<button class="reroll-btn" onclick={generateStoryEngineStorySeed}>
										🔄 Generate New Seed
									</button>
								</div>
							{/if}
						{/if}
					</div>
				{:else}
					<div class="placeholder">
						<p class="placeholder-icon">{isStoryEngineMode ? '📖' : selectedCategory.icon}</p>
						<p class="placeholder-text">
							{isStoryEngineMode ? 'Select a card type to generate' : 'Select a table to generate content'}
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Story Engine Help Modal -->
{#if showStoryEngineHelp}
	<div class="modal-overlay" onclick={() => (showStoryEngineHelp = false)} role="presentation">
		<div class="help-modal" onclick={(e) => e.stopPropagation()} role="dialog">
			<div class="help-header">
				<h2 class="help-title">📖 Story Engine Guide</h2>
				<button class="close-btn" onclick={() => (showStoryEngineHelp = false)}>×</button>
			</div>

			<div class="help-content">
				<section class="help-section">
					<h3>What is Story Engine?</h3>
					<p>Story Engine is a storytelling card system that helps you create characters, conflicts, and complete story prompts through visual card arrangements. Combine five card types to generate everything from simple character concepts to complex multi-character narratives.</p>
				</section>

				<section class="help-section">
					<h3>Card Types</h3>
					<div class="card-types-grid">
						<div class="card-type-help">
							<span class="type-help-icon">🟠</span>
							<div class="type-help-info">
								<strong>Agent</strong>
								<p>Characters who make choices. People, creatures, or entities.</p>
								<em>Examples: Caretaker, Detective, Scholar</em>
							</div>
						</div>
						<div class="card-type-help">
							<span class="type-help-icon">🟣</span>
							<div class="type-help-info">
								<strong>Engine</strong>
								<p>What characters want or how they relate to others.</p>
								<em>Examples: "wants to protect", "is hunting"</em>
							</div>
						</div>
						<div class="card-type-help">
							<span class="type-help-icon">🔵</span>
							<div class="type-help-info">
								<strong>Anchor</strong>
								<p>Objects, places, or events that ground the story.</p>
								<em>Examples: Ship, Tower, Artifact, Storm</em>
							</div>
						</div>
						<div class="card-type-help">
							<span class="type-help-icon">🔴</span>
							<div class="type-help-info">
								<strong>Conflict</strong>
								<p>Problems, consequences, or dilemmas.</p>
								<em>Examples: "time is running out", "it's forbidden"</em>
							</div>
						</div>
						<div class="card-type-help">
							<span class="type-help-icon">🟢</span>
							<div class="type-help-info">
								<strong>Aspect</strong>
								<p>Adjectives that modify other cards.</p>
								<em>Examples: Ancient, Haunted, Forgotten</em>
							</div>
						</div>
					</div>
				</section>

				<section class="help-section">
					<h3>How to Use</h3>
					<div class="usage-steps">
						<div class="usage-step">
							<span class="step-number">1</span>
							<div class="step-content">
								<strong>Generate Cards</strong>
								<p>Choose a card type and click "Draw Card", or generate a complete "Story Seed" (5 cards).</p>
							</div>
						</div>
						<div class="usage-step">
							<span class="step-number">2</span>
							<div class="step-content">
								<strong>Add to Storyboard</strong>
								<p>Click "Add to Storyboard" to place cards on your canvas.</p>
							</div>
						</div>
						<div class="usage-step">
							<span class="step-number">3</span>
							<div class="step-content">
								<strong>Rotate Cues</strong>
								<p>Each card has multiple cues. Use the ◄ ► buttons to rotate through different options.</p>
							</div>
						</div>
						<div class="usage-step">
							<span class="step-number">4</span>
							<div class="step-content">
								<strong>Arrange & Connect</strong>
								<p>Drag cards to arrange them. Place related cards near each other to form relationships and story patterns.</p>
							</div>
						</div>
					</div>
				</section>

				<section class="help-section">
					<h3>Story Seed Pattern</h3>
					<p>The simplest complete story prompt uses 5 cards:</p>
					<div class="pattern-example">
						<div class="pattern-formula">
							<span class="pattern-part">🟠 Agent</span>
							<span class="pattern-plus">+</span>
							<span class="pattern-part">🟣 Engine</span>
							<span class="pattern-plus">+</span>
							<span class="pattern-part">🔵 Anchor</span>
							<span class="pattern-plus">+</span>
							<span class="pattern-part">🔴 Conflict</span>
							<span class="pattern-plus">+</span>
							<span class="pattern-part">🟢 Aspect</span>
						</div>
						<div class="pattern-result">
							<strong>Example:</strong> "A detective wants to find a haunted ship but time is running out."
						</div>
					</div>
				</section>

				<section class="help-section">
					<h3>Creating Adventures</h3>
					<p>Build complex adventures by combining multiple cards in patterns:</p>

					<div class="adventure-patterns">
						<div class="adventure-pattern">
							<h4>🔄 Circle of Fate</h4>
							<p class="pattern-desc">Two characters with reciprocal motivations:</p>
							<ul class="pattern-cards">
								<li>2 Agents</li>
								<li>2 Engines (one pointing each direction)</li>
								<li>2 Conflicts (paired with Engines)</li>
							</ul>
							<div class="pattern-mini-example">
								<strong>Example:</strong> "A caretaker wants to protect an automaton but the wrong people are asking questions. The automaton wants to find its creator but it was awakened under false pretenses."
							</div>
						</div>

						<div class="adventure-pattern">
							<h4>⚔️ Clash of Wills</h4>
							<p class="pattern-desc">Two characters competing for the same thing:</p>
							<ul class="pattern-cards">
								<li>2 Agents</li>
								<li>1 Anchor (center - what they both want)</li>
								<li>2 Engines + 2 Conflicts</li>
							</ul>
							<div class="pattern-mini-example">
								<strong>Example:</strong> "A scholar wants to protect an ancient artifact but it's forbidden. A merchant wants to steal the same artifact but they're being hunted."
							</div>
						</div>

						<div class="adventure-pattern">
							<h4>💔 Soul Divided</h4>
							<p class="pattern-desc">One character torn between two desires:</p>
							<ul class="pattern-cards">
								<li>1 Agent (center)</li>
								<li>2 Anchors (different goals)</li>
								<li>2 Engines + 2 Conflicts</li>
							</ul>
							<div class="pattern-mini-example">
								<strong>Example:</strong> A detective torn between saving their partner (one Anchor) and solving the case (another Anchor).
							</div>
						</div>
					</div>

					<div class="worldbuilding-tips">
						<h4>For Worldbuilding & Adventure Design:</h4>
						<ul>
							<li><strong>Generate NPCs:</strong> Create multiple Agents with Engines for quick character concepts</li>
							<li><strong>Adventure Hooks:</strong> Use Conflicts to design story hooks and obstacles</li>
							<li><strong>Locations:</strong> Combine Anchors with Aspects to create interesting places</li>
							<li><strong>Factions:</strong> Create multiple Agents with shared Engines</li>
							<li><strong>Create Webs:</strong> Connect 3+ characters with interlocking motivations</li>
						</ul>
					</div>
				</section>

				<section class="help-section">
					<h3>Tips</h3>
					<ul class="tips-list">
						<li>💡 Don't overthink - the first interpretation that comes to mind is usually good</li>
						<li>🔄 Rotate cards freely to find cues that spark ideas</li>
						<li>✂️ Not every cue needs to fit perfectly - ignore what doesn't work</li>
						<li>🎭 Place related cards near each other to show relationships</li>
						<li>🔗 Put Engine and Conflict cards near each other to read as "wants to [ENGINE] but [CONFLICT]"</li>
					</ul>
				</section>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: rgb(15 23 42);
		border: 2px solid rgb(168 85 247);
		border-radius: 1rem;
		width: 90%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 0 0 1px rgb(168 85 247 / 0.2),
			0 20px 60px rgb(0 0 0 / 0.5);
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.3);
	}

	.header-icon {
		font-size: 2rem;
	}

	.modal-title {
		flex: 1;
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
	}

	.close-btn {
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: rgb(168 85 247 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.4);
		color: rgb(216 180 254);
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.close-btn:hover {
		background: rgb(168 85 247 / 0.4);
		border-color: rgb(168 85 247 / 0.6);
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.category-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		color: rgb(216 180 254);
	}

	.category-btn:hover {
		background: rgb(30 27 75 / 0.8);
		border-color: rgb(168 85 247 / 0.4);
	}

	.category-btn.active {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		box-shadow: 0 0 12px rgb(168 85 247 / 0.4);
	}

	.category-icon {
		font-size: 1.5rem;
	}

	.category-name {
		font-size: 0.75rem;
		font-weight: 600;
	}

	.category-count {
		font-size: 0.625rem;
		opacity: 0.7;
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.search-icon {
		font-size: 1.25rem;
		opacity: 0.7;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		color: white;
		font-size: 0.875rem;
		outline: none;
	}

	.search-input::placeholder {
		color: rgb(148 163 184);
	}

	.table-list {
		max-height: 200px;
		overflow-y: auto;
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		background: rgb(30 27 75 / 0.3);
		margin-bottom: 1rem;
	}

	.table-item {
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 1px solid rgb(168 85 247 / 0.1);
		color: rgb(216 180 254);
		font-size: 0.875rem;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
	}

	.table-item:last-child {
		border-bottom: none;
	}

	.table-item:hover {
		background: rgb(168 85 247 / 0.1);
	}

	.table-item.selected {
		background: rgb(168 85 247 / 0.3);
		font-weight: 600;
		color: white;
	}

	.table-name {
		display: block;
	}

	.roll-section {
		background: rgb(30 27 75 / 0.5);
		border: 2px solid rgb(168 85 247 / 0.3);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.selected-table {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.label {
		color: rgb(168 85 247);
		font-weight: 600;
	}

	.value {
		color: white;
		font-weight: 600;
	}

	.roll-btn {
		width: 100%;
		padding: 1rem;
		background: linear-gradient(135deg, rgb(168 85 247), rgb(139 92 246));
		border: none;
		border-radius: 0.75rem;
		color: white;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.roll-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgb(168 85 247 / 0.4);
	}

	.roll-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.rolling {
		display: inline-block;
		animation: bounce 1s infinite;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	.result-display {
		background: rgb(15 23 42);
		border: 2px solid rgb(250 204 21 / 0.5);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.result-label {
		color: rgb(250 204 21);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		margin-bottom: 0.5rem;
	}

	.result-text {
		color: white;
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.5;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.add-btn {
		flex: 2;
		padding: 1rem;
		background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
		border: none;
		border-radius: 0.75rem;
		color: white;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgb(34 197 94 / 0.4);
	}

	.reroll-btn {
		flex: 1;
		padding: 1rem;
		background: rgb(30 27 75);
		border: 2px solid rgb(168 85 247 / 0.5);
		border-radius: 0.75rem;
		color: rgb(216 180 254);
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reroll-btn:hover {
		background: rgb(30 27 75 / 0.8);
		border-color: rgb(168 85 247);
	}

	.placeholder {
		text-align: center;
		padding: 3rem 1rem;
		color: rgb(148 163 184);
	}

	.placeholder-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.placeholder-text {
		font-size: 1rem;
	}

	/* Story Engine Styles */
	.story-engine-btn {
		background: linear-gradient(135deg, rgb(139 92 246), rgb(124 58 237));
	}

	.story-engine-btn.active {
		background: linear-gradient(135deg, rgb(168 85 247), rgb(147 51 234));
		box-shadow: 0 0 20px rgb(168 85 247 / 0.6);
	}

	.story-engine-types {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
		max-height: 300px;
		overflow-y: auto;
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		background: rgb(30 27 75 / 0.3);
		padding: 0.5rem;
	}

	.story-engine-type-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.story-engine-type-btn:hover {
		background: rgb(168 85 247 / 0.1);
		border-color: rgb(168 85 247 / 0.4);
	}

	.story-engine-type-btn.selected {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		box-shadow: 0 0 12px rgb(168 85 247 / 0.4);
	}

	.story-seed-btn {
		border-color: rgb(250 204 21 / 0.4);
	}

	.story-seed-btn:hover {
		background: rgb(250 204 21 / 0.1);
		border-color: rgb(250 204 21 / 0.6);
	}

	.story-seed-btn.selected {
		background: rgb(250 204 21 / 0.3);
		border-color: rgb(250 204 21);
		box-shadow: 0 0 12px rgb(250 204 21 / 0.4);
	}

	.type-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.type-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex: 1;
	}

	.type-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
	}

	.type-desc {
		font-size: 0.75rem;
		color: rgb(216 180 254);
		opacity: 0.8;
	}

	.story-engine-result {
		background: rgb(15 23 42);
		border: 2px solid rgb(168 85 247 / 0.5);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.cues-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.cue-preview-item {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.25rem;
		border-left: 3px solid rgb(168 85 247);
	}

	.cue-number {
		color: rgb(168 85 247);
		font-weight: 600;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.cue-preview-text {
		color: white;
		font-size: 0.875rem;
		flex: 1;
	}

	.story-seed-result {
		background: rgb(15 23 42);
		border: 2px solid rgb(250 204 21 / 0.5);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.story-seed-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.5rem;
		margin-top: 0.75rem;
		border: 1px solid rgb(168 85 247 / 0.2);
	}

	.seed-card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.seed-card-icon {
		font-size: 1.25rem;
	}

	.seed-card-type {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgb(168 85 247);
		min-width: 4rem;
	}

	.seed-card-cue {
		font-size: 0.875rem;
		color: white;
		flex: 1;
	}

	.add-seed-btn {
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, rgb(34 197 94), rgb(22 163 74));
		border: none;
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-seed-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgb(34 197 94 / 0.4);
	}

	/* Story Engine Help Styles */
	.story-engine-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		margin-bottom: 0.5rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
	}

	.story-engine-title {
		font-size: 1rem;
		font-weight: 700;
		color: white;
		margin: 0;
	}

	.help-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(59, 130, 246, 0.2);
		border: 1.5px solid rgba(59, 130, 246, 0.4);
		border-radius: 0.5rem;
		color: rgb(147, 197, 253);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.help-btn:hover {
		background: rgba(59, 130, 246, 0.3);
		border-color: rgba(59, 130, 246, 0.6);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.help-icon {
		font-size: 1.125rem;
		font-weight: 900;
		line-height: 1;
	}

	.help-text {
		font-weight: 600;
	}

	.help-modal {
		background: rgb(15 23 42);
		border: 2px solid rgb(59 130 246);
		border-radius: 1rem;
		max-width: 700px;
		max-height: 85vh;
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.help-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		background: linear-gradient(135deg, rgb(30 58 138), rgb(29 78 216));
		border-bottom: 2px solid rgb(59 130 246);
	}

	.help-title {
		font-size: 1.5rem;
		font-weight: 800;
		color: white;
		margin: 0;
	}

	.help-content {
		padding: 2rem;
		overflow-y: auto;
		flex: 1;
	}

	.help-section {
		margin-bottom: 2rem;
	}

	.help-section:last-child {
		margin-bottom: 0;
	}

	.help-section h3 {
		font-size: 1.25rem;
		font-weight: 700;
		color: rgb(147, 197, 253);
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(59, 130, 246, 0.3);
	}

	.help-section p {
		color: rgb(203, 213, 225);
		line-height: 1.6;
		margin: 0 0 1rem 0;
	}

	.card-types-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card-type-help {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: rgba(30, 58, 138, 0.2);
		border: 1.5px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.card-type-help:hover {
		background: rgba(30, 58, 138, 0.3);
		border-color: rgba(59, 130, 246, 0.5);
	}

	.type-help-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.type-help-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.type-help-info strong {
		color: white;
		font-size: 1rem;
		font-weight: 700;
	}

	.type-help-info p {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		margin: 0;
	}

	.type-help-info em {
		color: rgb(148, 163, 184);
		font-size: 0.8125rem;
		font-style: normal;
	}

	.usage-steps {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.usage-step {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235));
		border-radius: 50%;
		color: white;
		font-weight: 800;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.step-content {
		flex: 1;
	}

	.step-content strong {
		display: block;
		color: white;
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.step-content p {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		margin: 0;
	}

	.pattern-example {
		background: rgba(30, 58, 138, 0.2);
		border: 1.5px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-top: 1rem;
	}

	.pattern-formula {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.pattern-part {
		padding: 0.5rem 1rem;
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.pattern-plus {
		color: rgb(148, 163, 184);
		font-weight: 700;
	}

	.pattern-result {
		padding: 1rem;
		background: rgba(34, 197, 94, 0.1);
		border-left: 3px solid rgb(34, 197, 94);
		border-radius: 0.375rem;
	}

	.pattern-result strong {
		display: block;
		color: rgb(134, 239, 172);
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.tips-list {
		margin: 0;
		padding-left: 1.5rem;
		color: rgb(203, 213, 225);
	}

	.tips-list li {
		margin-bottom: 0.75rem;
		line-height: 1.5;
	}

	.tips-list li:last-child {
		margin-bottom: 0;
	}

	/* Adventure Patterns Styles */
	.adventure-patterns {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.adventure-pattern {
		background: rgba(30, 58, 138, 0.2);
		border: 1.5px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.adventure-pattern h4 {
		font-size: 1.125rem;
		font-weight: 700;
		color: rgb(147, 197, 253);
		margin: 0 0 0.75rem 0;
	}

	.pattern-desc {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		margin: 0 0 0.75rem 0;
		font-weight: 600;
	}

	.pattern-cards {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.pattern-cards li {
		color: rgb(203, 213, 225);
		font-size: 0.8125rem;
		padding: 0.375rem 0.75rem;
		background: rgba(59, 130, 246, 0.1);
		border-left: 3px solid rgba(59, 130, 246, 0.5);
		border-radius: 0.25rem;
	}

	.pattern-mini-example {
		background: rgba(34, 197, 94, 0.1);
		border-left: 3px solid rgb(34, 197, 94);
		border-radius: 0.375rem;
		padding: 0.875rem;
		font-size: 0.8125rem;
		color: rgb(203, 213, 225);
		font-style: italic;
		line-height: 1.5;
	}

	.pattern-mini-example strong {
		color: rgb(134, 239, 172);
		font-style: normal;
		display: block;
		margin-bottom: 0.375rem;
	}

	.worldbuilding-tips {
		margin-top: 1.5rem;
		padding: 1.25rem;
		background: rgba(168, 85, 247, 0.1);
		border: 1.5px solid rgba(168, 85, 247, 0.3);
		border-radius: 0.75rem;
	}

	.worldbuilding-tips h4 {
		font-size: 1rem;
		font-weight: 700;
		color: rgb(216, 180, 254);
		margin: 0 0 0.875rem 0;
	}

	.worldbuilding-tips ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.worldbuilding-tips li {
		color: rgb(203, 213, 225);
		font-size: 0.875rem;
		padding: 0.5rem 0.75rem;
		background: rgba(168, 85, 247, 0.1);
		border-left: 3px solid rgba(168, 85, 247, 0.4);
		border-radius: 0.25rem;
		line-height: 1.5;
	}

	.worldbuilding-tips strong {
		color: rgb(216, 180, 254);
		font-weight: 700;
	}
</style>
