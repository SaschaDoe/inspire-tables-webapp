<script lang="ts">
	/**
	 * 4W First Scene Generator
	 * Structured First Scene generation using Who, What, Where, Why method
	 * From Mythic GME page 65-66
	 */

	import { rollTwoMeaningWords, type TwoWordMeaningResult } from '$lib/utils/mythicTableLookup';
	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// State for each W
	let whoResult = $state<TwoWordMeaningResult | null>(null);
	let whatResult = $state<TwoWordMeaningResult | null>(null);
	let whereResult = $state<TwoWordMeaningResult | null>(null);
	let whyResult = $state<TwoWordMeaningResult | null>(null);

	// Loading states
	let isRollingWho = $state(false);
	let isRollingWhat = $state(false);
	let isRollingWhere = $state(false);
	let isRollingWhy = $state(false);
	let isRollingAll = $state(false);

	// Player interpretation
	let interpretation = $state('');
	let threadsToAdd = $state('');
	let charactersToAdd = $state('');

	// Roll individual W
	async function rollWho() {
		isRollingWho = true;
		await new Promise((resolve) => setTimeout(resolve, 600));
		try {
			whoResult = rollTwoMeaningWords('Characters Elements');
		} catch (error) {
			console.error('Error rolling Who:', error);
		}
		isRollingWho = false;
	}

	async function rollWhat() {
		isRollingWhat = true;
		await new Promise((resolve) => setTimeout(resolve, 600));
		try {
			whatResult = rollTwoMeaningWords('Actions Table 1');
		} catch (error) {
			console.error('Error rolling What:', error);
		}
		isRollingWhat = false;
	}

	async function rollWhere() {
		isRollingWhere = true;
		await new Promise((resolve) => setTimeout(resolve, 600));
		try {
			whereResult = rollTwoMeaningWords('Locations Elements');
		} catch (error) {
			console.error('Error rolling Where:', error);
		}
		isRollingWhere = false;
	}

	async function rollWhy() {
		isRollingWhy = true;
		await new Promise((resolve) => setTimeout(resolve, 600));
		try {
			whyResult = rollTwoMeaningWords('Actions Table 1');
		} catch (error) {
			console.error('Error rolling Why:', error);
		}
		isRollingWhy = false;
	}

	// Roll all 4Ws at once
	async function rollAll4Ws() {
		isRollingAll = true;

		// Roll all in sequence with small delays for effect
		await rollWho();
		await new Promise((resolve) => setTimeout(resolve, 300));
		await rollWhat();
		await new Promise((resolve) => setTimeout(resolve, 300));
		await rollWhere();
		await new Promise((resolve) => setTimeout(resolve, 300));
		await rollWhy();

		isRollingAll = false;
	}

	// Add interpretation and threads/characters to lists
	function saveToLists() {
		if (!soloRpgStore.currentSession) {
			alert('No active session! Please create or load a session first.');
			return;
		}

		let addedSomething = false;

		// Add threads (one per line)
		if (threadsToAdd.trim()) {
			const threads = threadsToAdd.split('\n').filter(t => t.trim());
			threads.forEach(thread => {
				soloRpgStore.addThread(thread.trim());
				addedSomething = true;
			});
		}

		// Add characters (one per line, format: "Name - Description")
		if (charactersToAdd.trim()) {
			const characters = charactersToAdd.split('\n').filter(c => c.trim());
			characters.forEach(char => {
				const parts = char.split('-').map(p => p.trim());
				const name = parts[0] || 'Unnamed Character';
				const description = parts.slice(1).join('-').trim() || 'No description';
				soloRpgStore.addCharacter(name, description);
				addedSomething = true;
			});
		}

		if (addedSomething) {
			alert('Elements added to your Lists! Ready to start your adventure!');
		}

		// Close modal
		handleClose();
	}

	// Reset all
	function reset() {
		whoResult = null;
		whatResult = null;
		whereResult = null;
		whyResult = null;
		interpretation = '';
		threadsToAdd = '';
		charactersToAdd = '';
	}

	function handleClose() {
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			handleClose();
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
			class="bg-gray-900 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="fourw-generator-title"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-lg">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="text-4xl">🗺️</span>
						<div>
							<h2 id="fourw-generator-title" class="text-2xl font-bold text-white">
								4W First Scene Generator
							</h2>
							<p class="text-cyan-100 text-sm mt-1">
								Structured scene creation: Who, What, Where, Why
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
				<!-- Introduction -->
				<div class="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
					<p class="text-gray-200 text-sm leading-relaxed">
						The 4W Method generates a First Scene by rolling on four Meaning Tables.
						Combine the results into an interesting interpretation for your opening scene!
					</p>
				</div>

				<!-- Roll All Button -->
				<div class="flex justify-center">
					<button
						onclick={rollAll4Ws}
						disabled={isRollingAll}
						class="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
					>
						{#if isRollingAll}
							<span class="inline-block animate-spin mr-2">🎲</span>
							Rolling 4Ws...
						{:else}
							🎲 Roll All 4Ws
						{/if}
					</button>
				</div>

				<!-- The 4 Ws -->
				<div class="grid md:grid-cols-2 gap-4">
					<!-- WHO -->
					<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-cyan-500">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<span class="text-2xl">👤</span>
								<h3 class="text-lg font-bold text-cyan-300">WHO</h3>
							</div>
							<button
								onclick={rollWho}
								disabled={isRollingWho}
								class="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors disabled:opacity-50"
							>
								{isRollingWho ? '🎲' : 'Roll'}
							</button>
						</div>
						<div class="text-xs text-gray-400 mb-2">Characters Elements Table</div>
						{#if whoResult}
							<div class="space-y-2">
								<div class="flex gap-2">
									<div class="bg-gray-900 rounded px-3 py-2 flex-1">
										<div class="text-lg font-bold text-cyan-300">{whoResult.word1}</div>
										<div class="text-xs text-gray-500">Roll: {whoResult.roll1}</div>
									</div>
									<div class="bg-gray-900 rounded px-3 py-2 flex-1">
										<div class="text-lg font-bold text-cyan-300">{whoResult.word2}</div>
										<div class="text-xs text-gray-500">Roll: {whoResult.roll2}</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="text-gray-500 text-sm text-center py-4">
								Click "Roll" to determine Who
							</div>
						{/if}
					</div>

					<!-- WHAT -->
					<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<span class="text-2xl">⚡</span>
								<h3 class="text-lg font-bold text-green-300">WHAT</h3>
							</div>
							<button
								onclick={rollWhat}
								disabled={isRollingWhat}
								class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors disabled:opacity-50"
							>
								{isRollingWhat ? '🎲' : 'Roll'}
							</button>
						</div>
						<div class="text-xs text-gray-400 mb-2">Actions Table</div>
						{#if whatResult}
							<div class="space-y-2">
								<div class="flex gap-2">
									<div class="bg-gray-900 rounded px-3 py-2 flex-1">
										<div class="text-lg font-bold text-green-300">{whatResult.word1}</div>
										<div class="text-xs text-gray-500">Roll: {whatResult.roll1}</div>
									</div>
									<div class="bg-gray-900 rounded px-3 py-2 flex-1">
										<div class="text-lg font-bold text-green-300">{whatResult.word2}</div>
										<div class="text-xs text-gray-500">Roll: {whatResult.roll2}</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="text-gray-500 text-sm text-center py-4">
								Click "Roll" to determine What
							</div>
						{/if}
					</div>

					<!-- WHERE -->
					<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<span class="text-2xl">📍</span>
								<h3 class="text-lg font-bold text-purple-300">WHERE</h3>
							</div>
							<button
								onclick={rollWhere}
								disabled={isRollingWhere}
								class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors disabled:opacity-50"
							>
								{isRollingWhere ? '🎲' : 'Roll'}
							</button>
						</div>
						<div class="text-xs text-gray-400 mb-2">Locations Elements Table</div>
						{#if whereResult}
							<div class="space-y-2">
								<div class="flex gap-2">
									<div class="bg-gray-900 rounded px-3 py-2 flex-1">
										<div class="text-lg font-bold text-purple-300">{whereResult.word1}</div>
										<div class="text-xs text-gray-500">Roll: {whereResult.roll1}</div>
									</div>
									<div class="bg-gray-900 rounded px-3 py-2 flex-1">
										<div class="text-lg font-bold text-purple-300">{whereResult.word2}</div>
										<div class="text-xs text-gray-500">Roll: {whereResult.roll2}</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="text-gray-500 text-sm text-center py-4">
								Click "Roll" to determine Where
							</div>
						{/if}
					</div>

					<!-- WHY -->
					<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-orange-500">
						<div class="flex items-center justify-between mb-3">
							<div class="flex items-center gap-2">
								<span class="text-2xl">❓</span>
								<h3 class="text-lg font-bold text-orange-300">WHY</h3>
							</div>
							<button
								onclick={rollWhy}
								disabled={isRollingWhy}
								class="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors disabled:opacity-50"
							>
								{isRollingWhy ? '🎲' : 'Roll'}
							</button>
						</div>
						<div class="text-xs text-gray-400 mb-2">Actions Table</div>
						{#if whyResult}
							<div class="space-y-2">
								<div class="flex gap-2">
									<div class="bg-gray-900 rounded px-3 py-2 flex-1">
										<div class="text-lg font-bold text-orange-300">{whyResult.word1}</div>
										<div class="text-xs text-gray-500">Roll: {whyResult.roll1}</div>
									</div>
									<div class="bg-gray-900 rounded px-3 py-2 flex-1">
										<div class="text-lg font-bold text-orange-300">{whyResult.word2}</div>
										<div class="text-xs text-gray-500">Roll: {whyResult.roll2}</div>
									</div>
								</div>
							</div>
						{:else}
							<div class="text-gray-500 text-sm text-center py-4">
								Click "Roll" to determine Why
							</div>
						{/if}
					</div>
				</div>

				<!-- Interpretation Section -->
				{#if whoResult && whatResult && whereResult && whyResult}
					<div class="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500 rounded-lg p-6">
						<h3 class="text-xl font-bold text-cyan-200 mb-4 flex items-center gap-2">
							<span>✨</span>
							<span>Your First Scene</span>
						</h3>

						<!-- Interpretation -->
						<div class="mb-4">
							<label for="interpretation" class="block text-cyan-200 mb-2 font-medium">
								Scene Interpretation:
							</label>
							<textarea
								id="interpretation"
								bind:value={interpretation}
								placeholder="Combine the 4Ws into your First Scene. What's happening? Who's involved? Where does it take place? Why are they doing this?"
								rows="4"
								class="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg p-3 focus:border-cyan-500 focus:outline-none"
							></textarea>
						</div>

						<!-- Optional: Seed Lists -->
						<div class="bg-gray-800/50 rounded-lg p-4 space-y-4">
							<h4 class="text-sm font-bold text-cyan-300">Optional: Seed Your Lists</h4>
							<p class="text-xs text-gray-400">Add starting Threads or Characters based on your scene (optional)</p>

							<div>
								<label for="threads" class="block text-gray-300 text-sm mb-1">
									Threads (one per line):
								</label>
								<textarea
									id="threads"
									bind:value={threadsToAdd}
									placeholder="e.g.\nInvestigate the mysterious portal\nHelp the undead return home"
									rows="2"
									class="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 text-sm focus:border-cyan-500 focus:outline-none"
								></textarea>
							</div>

							<div>
								<label for="characters" class="block text-gray-300 text-sm mb-1">
									Characters (format: Name - Description, one per line):
								</label>
								<textarea
									id="characters"
									bind:value={charactersToAdd}
									placeholder="e.g.\nElder Mage - Festival organizer\nSpirit Guide - Helpful ghost"
									rows="2"
									class="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 text-sm focus:border-cyan-500 focus:outline-none"
								></textarea>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-3 mt-4">
							<button
								onclick={reset}
								class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
							>
								🔄 Roll Again
							</button>
							<button
								onclick={saveToLists}
								class="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium"
							>
								✅ Save & Start Adventure
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="bg-gray-800 p-4 border-t border-gray-700 flex justify-between items-center rounded-b-lg">
				<div class="text-sm text-gray-400">
					Combine all 4 elements into an interesting interpretation
				</div>
				<button
					onclick={handleClose}
					class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: rgb(8, 145, 178) rgb(31, 41, 55);
	}

	.overflow-y-auto::-webkit-scrollbar {
		width: 8px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: rgb(31, 41, 55);
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: rgb(8, 145, 178);
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: rgb(34, 211, 238);
	}
</style>
