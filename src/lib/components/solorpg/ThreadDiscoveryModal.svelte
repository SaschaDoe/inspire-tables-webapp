<script lang="ts">
	/**
	 * Thread Discovery Check Modal
	 * Rolls d100 vs CF×10 to discover new threads
	 * On success, generates a random 2-word thread suggestion
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import { rollD100 } from '$lib/utils/mythicDice';
	import { rollTwoMeaningWords, type TwoWordMeaningResult } from '$lib/utils/mythicTableLookup';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// State
	let isRolling = $state(false);
	let hasRolled = $state(false);
	let roll = $state<number | undefined>(undefined);
	let success = $state(false);
	let threadSuggestion = $state<TwoWordMeaningResult | null>(null);
	let customThreadText = $state('');

	// Derived
	let chaosFactor = $derived(soloRpgStore.currentSession?.chaosFactor || 5);
	let threshold = $derived(chaosFactor * 10);

	// Perform discovery check
	async function performCheck() {
		isRolling = true;
		hasRolled = false;

		// Animate roll
		await new Promise(resolve => setTimeout(resolve, 1500));

		// Roll d100
		const rollResult = rollD100();
		roll = rollResult;
		success = rollResult <= threshold;

		// If successful, generate thread suggestion
		if (success) {
			threadSuggestion = rollTwoMeaningWords('Actions Table 1');
			customThreadText = `${threadSuggestion.word1} ${threadSuggestion.word2}`;
		}

		isRolling = false;
		hasRolled = true;
	}

	// Add the thread
	function addThread() {
		if (!customThreadText.trim()) return;

		soloRpgStore.addThread(customThreadText.trim());
		resetAndClose();
	}

	// Reroll the meaning
	function rerollMeaning() {
		if (!success) return;

		threadSuggestion = rollTwoMeaningWords('Actions Table 1');
		customThreadText = `${threadSuggestion.word1} ${threadSuggestion.word2}`;
	}

	// Reset and close
	function resetAndClose() {
		isRolling = false;
		hasRolled = false;
		roll = undefined;
		success = false;
		threadSuggestion = null;
		customThreadText = '';
		onClose();
	}

	// Keyboard handler
	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			resetAndClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={resetAndClose}
		role="presentation"
	>
		<!-- Modal Content -->
		<div
			class="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-purple-500/30"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="thread-discovery-title"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-lg">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="text-4xl">🔍</span>
						<div>
							<h2 id="thread-discovery-title" class="text-2xl font-bold text-white">
								Thread Discovery Check
							</h2>
							<p class="text-purple-100 text-sm mt-1">
								Roll d100 vs {threshold} (CF {chaosFactor} × 10)
							</p>
						</div>
					</div>
					<button
						onclick={resetAndClose}
						class="text-white/80 hover:text-white text-3xl leading-none"
						aria-label="Close"
					>
						×
					</button>
				</div>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-4">
				{#if !hasRolled}
					<!-- Initial State -->
					<div class="text-center space-y-4">
						<p class="text-gray-300 text-sm">
							Discovery Checks allow you to find new threads based on the current Chaos Factor.
							Roll d100 - if you roll {threshold} or lower, a new thread is discovered!
						</p>

						<button
							onclick={performCheck}
							disabled={isRolling}
							class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
						>
							{#if isRolling}
								<span class="flex items-center justify-center gap-2">
									<span class="animate-spin">🎲</span>
									<span>Rolling...</span>
								</span>
							{:else}
								<span class="flex items-center justify-center gap-2">
									<span>🔍</span>
									<span>Roll Discovery Check</span>
								</span>
							{/if}
						</button>
					</div>
				{:else}
					<!-- Result State -->
					<div class="space-y-4">
						<!-- Roll Result -->
						<div class="p-4 bg-gray-800 rounded-lg text-center">
							<div class="text-sm text-gray-400 mb-2">Your Roll</div>
							<div class="text-6xl font-bold {success ? 'text-green-400' : 'text-red-400'} mb-2">
								{roll}
							</div>
							<div class="text-sm text-gray-400">
								Target: ≤ {threshold}
							</div>
						</div>

						<!-- Success/Failure Message -->
						{#if success}
							<div class="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
								<div class="font-bold text-green-400 mb-2 flex items-center gap-2">
									<span>✓</span>
									<span>Success! Thread Discovered</span>
								</div>
								<p class="text-sm text-gray-300">
									A new thread has emerged from the story. You can edit the suggestion below or use it as-is.
								</p>
							</div>

							<!-- Thread Suggestion -->
							{#if threadSuggestion}
								<div class="space-y-3">
									<div class="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
										<div class="text-xs text-purple-300 mb-1">Suggested Thread:</div>
										<div class="text-lg font-medium text-white">
											{threadSuggestion.word1} / {threadSuggestion.word2}
										</div>
										<div class="text-xs text-gray-400 mt-1">
											{threadSuggestion.tableName}: Rolls {threadSuggestion.roll1}, {threadSuggestion.roll2}
										</div>
									</div>

									<div>
										<label for="custom-thread" class="block text-sm text-gray-400 mb-2">
											Thread Text (edit as needed):
										</label>
										<textarea
											id="custom-thread"
											bind:value={customThreadText}
											class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
											rows="2"
										></textarea>
									</div>

									<div class="flex gap-2">
										<button
											onclick={rerollMeaning}
											class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
										>
											🎲 Reroll Meaning
										</button>
										<button
											onclick={addThread}
											disabled={!customThreadText.trim()}
											class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
										>
											+ Add Thread
										</button>
									</div>
								</div>
							{/if}
						{:else}
							<div class="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
								<div class="font-bold text-red-400 mb-2 flex items-center gap-2">
									<span>✗</span>
									<span>No Thread Discovered</span>
								</div>
								<p class="text-sm text-gray-300">
									The current story hasn't revealed any new threads yet. You can try again or add a thread manually.
								</p>
							</div>

							<button
								onclick={performCheck}
								class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
							>
								Try Again
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="bg-gray-800 p-4 border-t border-gray-700 rounded-b-lg flex justify-end">
				<button
					onclick={resetAndClose}
					class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
				>
					{hasRolled && !success ? 'Close' : 'Cancel'}
				</button>
			</div>
		</div>
	</div>
{/if}
