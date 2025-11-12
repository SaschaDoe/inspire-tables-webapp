<script lang="ts">
	import { storyboardStore, activeBoard } from '$lib/stores/storyboardStore';
	import { Dice } from '$lib/utils/dice';
	import { getAllCategories, loadTablesForCategory, type CategoryInfo } from '$lib/data/tableHelpers';
	import type { Table } from '$lib/tables/table';
	import { onMount } from 'svelte';

	interface Props {
		show: boolean;
		onClose: () => void;
	}

	let { show, onClose }: Props = $props();

	// Categories with their metadata (no tables loaded yet)
	const categories = getAllCategories();

	// State
	let selectedCategory = $state<CategoryInfo>(categories[0]);
	let categoryTables = $state<Table[]>([]);
	let isLoadingTables = $state(false);
	let selectedTable = $state<Table | null>(null);
	let searchQuery = $state('');
	let generatedText = $state('');
	let isRolling = $state(false);

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
					{#each categories as category}
						<button
							class="category-btn {category === selectedCategory ? 'active' : ''}"
							onclick={() => {
								selectedCategory = category;
								selectedTable = null;
								searchQuery = '';
							}}
						>
							<span class="category-icon">{category.icon}</span>
							<span class="category-name">{category.name}</span>
							<span class="category-count">{category.tables.length}</span>
						</button>
					{/each}
				</div>

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
					{#each filteredTables as table}
						<button
							class="table-item {table === selectedTable ? 'selected' : ''}"
							onclick={() => (selectedTable = table)}
						>
							<span class="table-name">{table.title}</span>
						</button>
					{/each}
				</div>

				<!-- Roll section -->
				{#if selectedTable}
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
				{:else}
					<div class="placeholder">
						<p class="placeholder-icon">{selectedCategory.icon}</p>
						<p class="placeholder-text">Select a table to generate content</p>
					</div>
				{/if}
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
</style>
