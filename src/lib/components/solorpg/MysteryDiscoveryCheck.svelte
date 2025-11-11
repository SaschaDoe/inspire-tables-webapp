<script lang="ts">
	/**
	 * Mystery Discovery Check Component (Phase 4: Mythic Magazine Vol 6)
	 * Guides user through the Discovery Check workflow
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import { rollD100, rollD10 } from '$lib/utils/mythicDice';
	import {
		rollMysteryElement,
		getMysteryElementDescription,
		type MysteryElementResult
	} from '$lib/tables/mythicTables/mysteryElementsTable';
	import {
		rollMysterySpecial,
		getMysterySpecialDescription,
		getMysterySpecialGuidance,
		type MysterySpecialResult
	} from '$lib/tables/mythicTables/mysterySpecialTable';
	import {
		rollClueDescriptors,
		rollSuspectDescriptors
	} from '$lib/tables/mythicTables/mysteryDescriptorsTable';
	import type { FateAnswer } from '$lib/utils/mythicDice';
	import { determineFateAnswer, OddsLevel } from '$lib/utils/fateChart';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// Workflow state
	let step = $state<'category' | 'earned' | 'fate' | 'roll' | 'result' | 'special'>('category');
	let category = $state<'clues' | 'suspects' | null>(null);
	let earnedCheck = $state(false);

	// Fate Question state
	let odds = $state<OddsLevel>(OddsLevel.Likely);
	let fateRoll = $state(0);
	let fateAnswer = $state<FateAnswer | null>(null);

	// Mystery Elements roll state
	let elementResult = $state<MysteryElementResult | null>(null);
	let specialResult = $state<MysterySpecialResult | null>(null);
	let descriptorWords = $state<{ word1: string; word2: string } | null>(null);

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let chaosFactor = $derived(currentSession?.chaosFactor || 5);
	let clueProgressPoints = $derived(currentSession?.mysteryClueProgressPoints || 0);
	let suspectProgressPoints = $derived(currentSession?.mysterySuspectProgressPoints || 0);
	let progressPoints = $derived(
		category === 'clues' ? clueProgressPoints : category === 'suspects' ? suspectProgressPoints : 0
	);

	function reset() {
		step = 'category';
		category = null;
		earnedCheck = false;
		odds = OddsLevel.Likely;
		fateRoll = 0;
		fateAnswer = null;
		elementResult = null;
		specialResult = null;
		descriptorWords = null;
	}

	function startCheck(cat: 'clues' | 'suspects') {
		category = cat;
		step = 'earned';
	}

	function confirmEarned() {
		earnedCheck = true;
		step = 'fate';
	}

	function rollFateQuestion() {
		fateRoll = rollD100();
		fateAnswer = determineFateAnswer(fateRoll, odds, chaosFactor);
		// Don't change step here - let user see the result and click the button
	}

	function rollElements() {
		if (!category) return; // Safety check

		const result = rollMysteryElement(progressPoints, category);
		elementResult = result;

		// Increment Progress Points
		soloRpgStore.incrementMysteryProgressPoints(category);

		// Roll descriptors for inspiration
		if (category === 'clues') {
			descriptorWords = rollClueDescriptors();
		} else {
			descriptorWords = rollSuspectDescriptors();
		}

		// Auto-add new clues/suspects based on result
		if (descriptorWords) {
			const descriptorText = `${descriptorWords.word1} / ${descriptorWords.word2}`;

			if (result.result === 'New Clue' && category === 'clues') {
				// Automatically add a new clue with descriptor words
				soloRpgStore.addMysteryClue(descriptorText);
			} else if (result.result === 'New Suspect' && category === 'suspects') {
				// Automatically add a new suspect with descriptor words
				soloRpgStore.addMysterySuspect(descriptorText);
			} else if (result.result === 'Clincher Clue' && category === 'clues') {
				// Automatically add the clincher clue with descriptor words
				// Note: User will manually link it to the suspect with most points and mark as clincher
				soloRpgStore.addMysteryClue(descriptorText);
			}
		}

		// Check if Special
		if (result.result === 'Special') {
			const special = rollMysterySpecial();
			specialResult = special;
			step = 'special';
		} else {
			step = 'result';
		}
	}

	function applySpecialEffect() {
		if (!specialResult || !category) return;

		switch (specialResult.result) {
			case 'Progress Points -3':
				soloRpgStore.adjustMysteryProgressPoints(category, -3);
				break;
			case 'Progress Points +3':
				soloRpgStore.adjustMysteryProgressPoints(category, 3);
				break;
			// Other effects require user action
		}

		step = 'result';
	}

	function finish() {
		onClose();
		reset();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
		<div class="bg-slate-800 rounded-lg border-2 border-purple-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 border-b border-purple-500">
				<h2 class="text-2xl font-bold text-white">🔍 Discovery Check</h2>
				<p class="text-purple-200 text-sm mt-1">
					Investigation workflow for discovering clues and suspects
				</p>
			</div>

			<div class="p-6 space-y-4">
				<!-- Step 0: Choose Category -->
				{#if step === 'category'}
					<div class="space-y-4">
						<h3 class="text-lg font-bold text-white">What are you investigating?</h3>
						<p class="text-sm text-slate-300">
							Choose whether you're looking for a Clue (evidence, facts) or a Suspect (person of
							interest).
						</p>

						<div class="grid grid-cols-2 gap-4">
							<button
								onclick={() => startCheck('clues')}
								class="p-6 bg-blue-900/40 hover:bg-blue-900/60 border-2 border-blue-500 rounded-lg transition-all"
							>
								<div class="text-4xl mb-2">🔎</div>
								<div class="text-lg font-bold text-white">Clues</div>
								<div class="text-xs text-blue-300 mt-1">Evidence & Facts</div>
								<div class="text-xs text-slate-400 mt-2">PP: {clueProgressPoints}</div>
							</button>

							<button
								onclick={() => startCheck('suspects')}
								class="p-6 bg-red-900/40 hover:bg-red-900/60 border-2 border-red-500 rounded-lg transition-all"
							>
								<div class="text-4xl mb-2">👤</div>
								<div class="text-lg font-bold text-white">Suspects</div>
								<div class="text-xs text-red-300 mt-1">People of Interest</div>
								<div class="text-xs text-slate-400 mt-2">PP: {suspectProgressPoints}</div>
							</button>
						</div>
					</div>
				{/if}

				<!-- Step 1: Did you earn the check? -->
				{#if step === 'earned'}
					<div class="space-y-4">
						<div class="flex items-center gap-2 text-sm text-purple-300">
							<button
								onclick={() => step = 'category'}
								class="hover:text-purple-100 transition-colors"
							>
								← Back to category
							</button>
							<span class="text-slate-600">|</span>
							<span>Investigating: <strong class="capitalize">{category}</strong></span>
						</div>

						<div class="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
							<h3 class="text-lg font-bold text-orange-300 mb-2">Earning the Discovery Check</h3>
							<p class="text-sm text-slate-300 mb-3">
								To make a Discovery Check, your Character must do something with risk or uncertainty.
								Examples:
							</p>
							<ul class="text-sm text-slate-300 list-disc list-inside space-y-1 mb-3">
								<li>Make a skill roll (Research, Investigation, Perception, etc.)</li>
								<li>Ask a Fate Question about finding something</li>
								<li>Fight your way through guards to search a room</li>
								<li>Crack a safe to access documents</li>
								<li>Interview a suspect who might not talk</li>
							</ul>
							<p class="text-sm text-yellow-300 font-medium">
								Did your Character succeed at the risky action?
							</p>
							<div class="flex gap-2 mt-3">
								<button
									onclick={confirmEarned}
									class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors"
								>
									✓ Yes, Check Earned
								</button>
								<button
									onclick={finish}
									class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
								>
									No, Failed
								</button>
							</div>
						</div>
					</div>
				{/if}

				<!-- Step 2: Fate Question -->
				{#if step === 'fate'}
					<div class="space-y-4">
						<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
							<h3 class="text-lg font-bold text-purple-300 mb-2">Fate Question</h3>
							<p class="text-sm text-slate-300 mb-3">
								Ask the Fate Question: <strong>"Is anything discovered?"</strong>
							</p>
							<p class="text-sm text-slate-400 mb-3">
								Set the Odds based on the circumstances. How likely is it that your investigation
								turns up something useful?
							</p>

							<div class="space-y-3">
								<div>
									<label class="block text-sm text-slate-400 mb-2">Odds:</label>
									<select
										bind:value={odds}
										class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
									>
										<option value={OddsLevel.Impossible}>Impossible</option>
										<option value={OddsLevel.NearlyImpossible}>Nearly Impossible</option>
										<option value={OddsLevel.VeryUnlikely}>Very Unlikely</option>
										<option value={OddsLevel.Unlikely}>Unlikely</option>
										<option value={OddsLevel.FiftyFifty}>50/50</option>
										<option value={OddsLevel.Likely}>Likely</option>
										<option value={OddsLevel.VeryLikely}>Very Likely</option>
										<option value={OddsLevel.NearlyCertain}>Nearly Certain</option>
										<option value={OddsLevel.Certain}>Certain</option>
									</select>
								</div>

								<div class="text-sm text-slate-400">
									Chaos Factor: <span class="font-mono font-bold text-white">{chaosFactor}</span>
								</div>

								<button
									onclick={rollFateQuestion}
									class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition-colors"
								>
									🎲 Roll Fate Question (d100)
								</button>
							</div>
						</div>

						{#if fateAnswer}
							<div
								class="p-4 rounded-lg border-2 {fateAnswer.includes('Yes')
									? 'bg-green-900/20 border-green-500'
									: 'bg-red-900/20 border-red-500'}"
							>
								<div class="text-lg font-bold mb-1">
									Roll: <span class="font-mono">{fateRoll}</span>
								</div>
								<div class="text-2xl font-bold {fateAnswer.includes('Yes') ? 'text-green-400' : 'text-red-400'}">
									{fateAnswer}
								</div>
								{#if fateAnswer === 'Exceptional Yes'}
									<p class="text-sm text-green-300 mt-2">
										Amazing! You'll roll TWICE on the Mystery Elements Table!
									</p>
								{:else if fateAnswer === 'Yes'}
									<p class="text-sm text-green-300 mt-2">
										Something discovered! Roll on the Mystery Elements Table.
									</p>
								{:else if fateAnswer === 'Exceptional No'}
									<p class="text-sm text-red-300 mt-2">
										Dead end! No more Discovery Checks this scene.
									</p>
								{:else}
									<p class="text-sm text-red-300 mt-2">
										Nothing useful found this time.
									</p>
								{/if}

								<div class="mt-4">
									{#if fateAnswer.includes('Yes')}
										<button
											onclick={rollElements}
											class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition-colors"
										>
											Continue to Mystery Elements →
										</button>
									{:else}
										<button
											onclick={() => step = 'result'}
											class="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
										>
											Continue →
										</button>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Step 3: Mystery Elements Result -->
				{#if step === 'roll' && elementResult && category}
					<div class="space-y-4">
						<div class="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
							<h3 class="text-lg font-bold text-blue-300 mb-2">Mystery Elements Roll</h3>
							<div class="text-sm text-slate-400 mb-2">
								Category: <span class="font-bold text-white capitalize">{category}</span>
							</div>
							<div class="text-sm text-slate-400 mb-3">
								Roll: <span class="font-mono font-bold text-white">{elementResult.diceRoll}</span> (d10)
								+ <span class="font-mono font-bold text-white">{elementResult.progressPoints}</span> (PP)
								= <span class="font-mono font-bold text-white">{elementResult.roll}</span>
							</div>

							<div class="p-3 bg-purple-900/40 border border-purple-500 rounded">
								<div class="text-xl font-bold text-purple-300 mb-2">{elementResult.result}</div>
								<p class="text-sm text-slate-300">
									{getMysteryElementDescription(elementResult.result, category)}
								</p>
							</div>

							{#if descriptorWords}
								<div class="mt-3 p-3 bg-slate-700/50 rounded">
									<div class="text-sm text-slate-400 mb-1">Inspiration Words:</div>
									<div class="text-lg font-bold text-white">
										{descriptorWords.word1} / {descriptorWords.word2}
									</div>
								</div>
							{/if}
						</div>

						<button
							onclick={finish}
							class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition-colors"
						>
							Done - Add to Matrix
						</button>
					</div>
				{/if}

				<!-- Step 4: Special Result -->
				{#if step === 'special' && specialResult && category}
					<div class="space-y-4">
						<div class="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
							<h3 class="text-lg font-bold text-yellow-300 mb-2">Special Result!</h3>
							<div class="text-sm text-slate-400 mb-3">
								Roll: <span class="font-mono font-bold text-white">{specialResult.roll}</span>
							</div>

							<div class="p-3 bg-red-900/40 border border-red-500 rounded mb-3">
								<div class="text-xl font-bold text-red-300 mb-2">{specialResult.result}</div>
								<p class="text-sm text-slate-300">
									{getMysterySpecialDescription(specialResult.result, category)}
								</p>
							</div>

							<div class="p-3 bg-slate-700/50 rounded">
								<div class="text-sm text-slate-400 mb-1">Interpretation Guidance:</div>
								<p class="text-sm text-slate-300">
									{getMysterySpecialGuidance(specialResult.result)}
								</p>
							</div>
						</div>

						<button
							onclick={applySpecialEffect}
							class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded transition-colors"
						>
							Apply Effect & Continue
						</button>
					</div>
				{/if}

				<!-- Final Result Summary -->
				{#if step === 'result'}
					<div class="space-y-4">
						<div class="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
							<h3 class="text-lg font-bold text-green-300 mb-2">Discovery Check Complete</h3>

							{#if fateAnswer === 'No' || fateAnswer === 'Exceptional No'}
								<p class="text-sm text-slate-300">
									Nothing discovered this time. Continue your investigation!
								</p>
							{:else if elementResult}
								<p class="text-sm text-slate-300 mb-2">
									<strong>{elementResult.result}</strong> - Now interpret this result and update your
									Mystery Matrix accordingly.
								</p>
								{#if descriptorWords}
									<p class="text-sm text-purple-300">
										Use inspiration: <strong>{descriptorWords.word1} / {descriptorWords.word2}</strong>
									</p>
								{/if}
							{/if}

							{#if category}
								<div class="mt-3 text-sm text-slate-400">
									Progress Points updated: {category === 'clues' ? 'Clue' : 'Suspect'} PP is now {progressPoints
										+ 1}
								</div>
							{/if}
						</div>

						<button
							onclick={finish}
							class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition-colors"
						>
							Close
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
