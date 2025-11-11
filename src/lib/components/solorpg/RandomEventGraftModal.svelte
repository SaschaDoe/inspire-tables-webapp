<script lang="ts">
	/**
	 * Random Event Graft Modal (Phase 1B)
	 * Generates a Random Event that grafts into the Expected Scene
	 * to create an Altered Scene
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import { rollTwoMeaningWords, type TwoWordMeaningResult } from '$lib/utils/mythicTableLookup';
	import { rollD100 } from '$lib/utils/mythicDice';
	import type { EventFocus } from '$lib/utils/eventFocus';

	interface Props {
		isOpen: boolean;
		expectedSceneDescription: string;
		onClose: () => void;
		onComplete: () => void;
	}

	let { isOpen, expectedSceneDescription, onClose, onComplete }: Props = $props();

	// State
	let hasGenerated = $state(false);
	let focusResult = $state<EventFocus | undefined>(undefined);
	let focusRoll = $state<number | undefined>(undefined);
	let meaningResult = $state<TwoWordMeaningResult | null>(null);
	let combinationNotes = $state('');

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let chaosFactor = $derived(currentSession?.chaosFactor || 5);

	// Event Focus options (from Mythic GME)
	const eventFocusOptions: EventFocus[] = [
		'Remote Event',
		'NPC Action',
		'Introduce NPC',
		'Move Toward Thread',
		'Move Away From Thread',
		'Close Thread',
		'PC Negative',
		'PC Positive',
		'Ambiguous Event',
		'NPC Negative',
		'NPC Positive'
	];

	function generateRandomEvent() {
		// Roll for Event Focus (d100 divided by 10)
		const roll = rollD100();
		focusRoll = roll;

		// Determine focus (simplified for now - 11 options)
		const focusIndex = Math.min(Math.floor(roll / 9.1), 10);
		focusResult = eventFocusOptions[focusIndex];

		// Generate meaning pair for the event
		meaningResult = rollTwoMeaningWords('Actions Table 1');

		hasGenerated = true;
	}

	function rerollMeaning() {
		meaningResult = rollTwoMeaningWords('Actions Table 1');
	}

	function rerollFocus() {
		const roll = rollD100();
		focusRoll = roll;
		const focusIndex = Math.min(Math.floor(roll / 9.1), 10);
		focusResult = eventFocusOptions[focusIndex];
	}

	function complete() {
		onComplete();
		resetAndClose();
	}

	function resetAndClose() {
		hasGenerated = false;
		focusResult = undefined;
		focusRoll = undefined;
		meaningResult = null;
		combinationNotes = '';
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
			class="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="graft-title"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-lg">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="text-4xl">⚡</span>
						<div>
							<h2 id="graft-title" class="text-2xl font-bold text-white">
								Random Event Graft
							</h2>
							<p class="text-purple-100 text-sm mt-1">
								Generate a Random Event to combine with your Expected Scene
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
				<!-- Explanation -->
				<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
					<h4 class="text-purple-300 font-medium mb-2">What is Random Event Graft?</h4>
					<p class="text-sm text-slate-300">
						Instead of replacing your Expected Scene, a Random Event will be <em>added</em> to it.
						The Expected Scene still happens, but now there's also a Random Event occurring
						at the same time or influencing the scene.
					</p>
				</div>

				<!-- Expected Scene Display -->
				<div class="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
					<h4 class="text-slate-400 text-xs uppercase mb-2">Your Expected Scene:</h4>
					<p class="text-white">{expectedSceneDescription}</p>
				</div>

				{#if !hasGenerated}
					<!-- Generate Button -->
					<button
						onclick={generateRandomEvent}
						class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
					>
						<span class="flex items-center justify-center gap-2">
							<span>🎲</span>
							<span>Generate Random Event</span>
						</span>
					</button>
				{:else}
					<!-- Generated Event Display -->
					<div class="space-y-4">
						<!-- Event Focus -->
						<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
							<div class="flex items-center justify-between mb-2">
								<h4 class="text-purple-300 font-medium">Event Focus</h4>
								<button
									onclick={rerollFocus}
									class="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
								>
									🎲 Reroll
								</button>
							</div>
							<div class="text-center">
								<div class="text-2xl font-bold text-white mb-1">{focusResult}</div>
								<div class="text-xs text-slate-400">Roll: {focusRoll}</div>
							</div>
						</div>

						<!-- Event Meaning -->
						{#if meaningResult}
							<div class="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
								<div class="flex items-center justify-between mb-2">
									<h4 class="text-blue-300 font-medium">Event Meaning</h4>
									<button
										onclick={rerollMeaning}
										class="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
									>
										🎲 Reroll
									</button>
								</div>
								<div class="text-center mb-2">
									<span class="text-xl font-bold text-white">{meaningResult.word1}</span>
									<span class="text-slate-500 mx-2">/</span>
									<span class="text-xl font-bold text-white">{meaningResult.word2}</span>
								</div>
								<div class="text-xs text-slate-400 text-center">
									{meaningResult.tableName}: Rolls {meaningResult.roll1}, {meaningResult.roll2}
								</div>
							</div>
						{/if}

						<!-- Interpretation Guide -->
						<div class="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
							<h4 class="text-green-300 font-medium mb-2">How to Combine:</h4>
							<p class="text-sm text-slate-300 mb-3">
								Your Expected Scene occurs, <strong>AND</strong> this Random Event happens too.
								Think about:
							</p>
							<ul class="text-sm text-slate-300 space-y-1.5 mb-3">
								<li class="flex items-start gap-2">
									<span class="text-green-400">•</span>
									<span>Does the event happen <em>during</em> the scene?</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-green-400">•</span>
									<span>Does it happen <em>before</em> and affect how the scene plays out?</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-green-400">•</span>
									<span>Or does it happen <em>nearby</em> as background context?</span>
								</li>
							</ul>
						</div>

						<!-- Combination Notes -->
						<div>
							<label for="combination-notes" class="block text-sm text-slate-400 mb-2">
								Your Interpretation (optional):
							</label>
							<textarea
								id="combination-notes"
								bind:value={combinationNotes}
								placeholder="Describe how the Expected Scene and Random Event combine..."
								class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
								rows="3"
							></textarea>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2">
							<button
								onclick={complete}
								class="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
							>
								✓ Create Altered Scene (Grafted)
							</button>
							<button
								onclick={resetAndClose}
								class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
