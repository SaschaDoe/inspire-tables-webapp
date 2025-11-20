<script lang="ts">
	/**
	 * Meaning Discovery Component
	 * Allows rolling on any Mythic meaning table at any time for inspiration
	 * From Mythic GME manual page 84: "You can roll on any Meaning Table at any time"
	 */

	import {
		rollTwoMeaningWords,
		getTableCategories,
		getAllMeaningTableNames,
		type TwoWordMeaningResult
	} from '$lib/utils/mythicTableLookup';
	import { soloRpgStore, type MeaningRoll } from '$lib/stores/soloRpgStore.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// State
	let selectedCategory = $state<string | null>(null);
	let selectedTable = $state<string>('Actions Table 1');
	let meaningResult = $state<TwoWordMeaningResult | null>(null);
	let isRolling = $state(false);
	let playerNotes = $state('');

	// Derived data
	let tableCategories = $derived(getTableCategories());
	let categoryList = $derived(Object.keys(tableCategories));

	// Get tables for selected category
	let availableTables = $derived(() => {
		if (selectedCategory) {
			return tableCategories[selectedCategory] || [];
		}
		return getAllMeaningTableNames();
	});

	// Roll on the selected table
	async function rollForMeaning() {
		isRolling = true;

		// Simulate dice rolling delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		try {
			meaningResult = rollTwoMeaningWords(selectedTable);
		} catch (error) {
			console.error('Error rolling on meaning table:', error);
			meaningResult = null;
		}

		isRolling = false;
	}

	// Select category
	function selectCategory(category: string) {
		selectedCategory = category;
		// Auto-select first table in category
		const tables = tableCategories[category];
		if (tables && tables.length > 0) {
			selectedTable = tables[0];
		}
	}

	// Reset to all tables view
	function showAllTables() {
		selectedCategory = null;
	}

	// Add result to scene notes
	function addToNotes() {
		if (!meaningResult || !soloRpgStore.currentSession) return;

		const roll: MeaningRoll = {
			id: crypto.randomUUID(),
			sceneNumber: soloRpgStore.currentSession.currentSceneNumber,
			context: playerNotes || 'General meaning discovery',
			tableName: meaningResult.tableName,
			roll1: meaningResult.roll1,
			result1: meaningResult.word1,
			roll2: meaningResult.roll2,
			result2: meaningResult.word2,
			playerInterpretation: playerNotes,
			timestamp: new Date()
		};

		soloRpgStore.logMeaningRoll(roll);

		// Show confirmation (optional)
		alert('Meaning roll saved to history!');

		// Clear form
		playerNotes = '';
		meaningResult = null;
	}

	// Close modal
	function handleClose() {
		// Reset state
		meaningResult = null;
		playerNotes = '';
		onClose();
	}

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;

		if (e.key === 'Escape') {
			handleClose();
		}
	}

	// Get category icon
	function getCategoryIcon(category: string): string {
		switch (category) {
			case 'Actions & Descriptions':
				return '⚡';
			case 'Core Elements':
				return '🎯';
			case 'Character Details':
				return '👤';
			case 'Location Details':
				return '🗺️';
			case 'Creatures':
				return '🐉';
			case 'Objects & Items':
				return '⚔️';
			case 'Meta & Narrative':
				return '📖';
			default:
				return '📋';
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={handleClose}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		role="button"
		tabindex="0"
		aria-label="Close dialog"
	>
		<!-- Modal Content -->
		<div
			class="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="meaning-discovery-title"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-lg">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="text-4xl">🎲</span>
						<div>
							<h2 id="meaning-discovery-title" class="text-2xl font-bold text-white">
								Discover Meaning
							</h2>
							<p class="text-purple-100 text-sm mt-1">
								Roll on any table to generate inspiration
							</p>
						</div>
					</div>
					<button
						onclick={handleClose}
						class="text-white/80 hover:text-white text-3xl leading-none"
						aria-label="Close"
					>
						×
					</button>
				</div>
			</div>

			<!-- Body -->
			<div class="p-6 space-y-6">
				<!-- Category Selection -->
				<div>
					<h3 class="text-lg font-semibold text-purple-200 mb-3">
						What do you want to learn about?
					</h3>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
						<button
							onclick={showAllTables}
							class="p-4 rounded-lg border-2 transition-all {selectedCategory === null
								? 'border-purple-500 bg-purple-500/20'
								: 'border-gray-600 bg-gray-800 hover:border-purple-400'}"
						>
							<div class="text-2xl mb-1">📋</div>
							<div class="text-sm font-medium text-white">All Tables</div>
							<div class="text-xs text-gray-400 mt-1">View everything</div>
						</button>

						{#each categoryList as category}
							{@const icon = getCategoryIcon(category)}
							<button
								onclick={() => selectCategory(category)}
								class="p-4 rounded-lg border-2 transition-all {selectedCategory === category
									? 'border-purple-500 bg-purple-500/20'
									: 'border-gray-600 bg-gray-800 hover:border-purple-400'}"
							>
								<div class="text-2xl mb-1">{icon}</div>
								<div class="text-sm font-medium text-white">{category}</div>
								<div class="text-xs text-gray-400 mt-1">
									{tableCategories[category].length} tables
								</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Table Selection -->
				<div>
					<label for="meaning-table-select" class="block text-purple-200 font-medium mb-2">
						Choose Table:
						{#if selectedCategory}
							<span class="text-purple-400">({selectedCategory})</span>
						{/if}
					</label>
					<select
						id="meaning-table-select"
						bind:value={selectedTable}
						class="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg p-3 focus:border-purple-500 focus:outline-none"
					>
						{#if selectedCategory === null}
							<!-- Show all tables organized by category -->
							{#each categoryList as category}
								<optgroup label={category}>
									{#each tableCategories[category] as table}
										<option value={table}>{table}</option>
									{/each}
								</optgroup>
							{/each}
						{:else}
							<!-- Show only selected category tables -->
							{#each availableTables() as table}
								<option value={table}>{table}</option>
							{/each}
						{/if}
					</select>
				</div>

				<!-- Roll Button -->
				<div class="flex justify-center">
					<button
						onclick={rollForMeaning}
						disabled={isRolling}
						class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
					>
						{#if isRolling}
							<span class="inline-block animate-spin mr-2">🎲</span>
							Rolling...
						{:else}
							🎲 Roll for Meaning
						{/if}
					</button>
				</div>

				<!-- Results -->
				{#if meaningResult}
					<div class="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500 rounded-lg p-6">
						<h3 class="text-xl font-bold text-purple-200 mb-4 flex items-center gap-2">
							<span>✨</span>
							<span>Meaning Results</span>
						</h3>

						<div class="grid md:grid-cols-2 gap-4 mb-6">
							<!-- Word 1 -->
							<div class="bg-gray-800/60 rounded-lg p-4">
								<div class="text-sm text-gray-400 mb-1">Roll 1:</div>
								<div class="text-3xl font-bold text-purple-300 mb-1">
									{meaningResult.word1}
								</div>
								<div class="text-sm text-gray-500">d100: {meaningResult.roll1}</div>
							</div>

							<!-- Word 2 -->
							<div class="bg-gray-800/60 rounded-lg p-4">
								<div class="text-sm text-gray-400 mb-1">Roll 2:</div>
								<div class="text-3xl font-bold text-pink-300 mb-1">
									{meaningResult.word2}
								</div>
								<div class="text-sm text-gray-500">d100: {meaningResult.roll2}</div>
							</div>
						</div>

						<!-- Interpretation Help -->
						<div class="bg-gray-800/40 rounded-lg p-4 mb-4">
							<div class="text-sm font-medium text-purple-200 mb-2">
								💡 Interpretation Help:
							</div>
							<p class="text-gray-300 text-sm leading-relaxed">
								Combine these two words to describe what you're asking about. Use them as
								inspiration - they don't have to make perfect literal sense. Think creatively
								about how these words might relate to your current situation or question.
							</p>
						</div>

						<!-- Player Notes -->
						<div class="mb-4">
							<label for="player-interpretation" class="block text-purple-200 mb-2">
								Your Interpretation (optional):
							</label>
							<textarea
								id="player-interpretation"
								bind:value={playerNotes}
								placeholder="How do you interpret these words? What do they mean in your current context?"
								rows="3"
								class="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg p-3 focus:border-purple-500 focus:outline-none"
							></textarea>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-3">
							<button
								onclick={rollForMeaning}
								class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
							>
								🔄 Roll Again
							</button>
							<button
								onclick={addToNotes}
								class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
							>
								📝 Add to Notes
							</button>
						</div>
					</div>
				{:else if !isRolling}
					<!-- Prompt to roll -->
					<div class="text-center text-gray-400 py-8">
						<div class="text-5xl mb-3">🎲</div>
						<p>Select a table and click "Roll for Meaning" to get inspiration!</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for modal */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: rgb(139, 92, 246) rgb(31, 41, 55);
	}

	.overflow-y-auto::-webkit-scrollbar {
		width: 8px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: rgb(31, 41, 55);
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: rgb(139, 92, 246);
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: rgb(167, 139, 250);
	}
</style>
