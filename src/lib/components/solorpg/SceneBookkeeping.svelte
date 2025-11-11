<script lang="ts">
	// Scene Bookkeeping Component
	// Handles end-of-scene workflow: Update Lists, Adjust CF, Record Notes

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';

	interface Props {
		onClose?: () => void;
		onComplete?: () => void;
	}

	let { onClose, onComplete }: Props = $props();

	// State
	let currentStep = $state<1 | 2 | 3>(1);
	let chaosAdjustment = $state<'increase' | 'decrease' | 'same'>('same');
	let sceneNotes = $state('');
	let newThreadText = $state('');
	let newCharacterName = $state('');
	let newCharacterDesc = $state('');

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let threads = $derived(soloRpgStore.activeThreads);
	let characters = $derived(soloRpgStore.activeCharacters);
	let currentSceneNumber = $derived(currentSession?.currentSceneNumber || 0);
	let currentCF = $derived(currentSession?.chaosFactor || 5);
	let newCF = $derived(
		chaosAdjustment === 'increase'
			? Math.min(9, currentCF + 1)
			: chaosAdjustment === 'decrease'
				? Math.max(1, currentCF - 1)
				: currentCF
	);
	let sceneStats = $derived(soloRpgStore.getSceneStats(currentSceneNumber));

	// Get duplicate count for a thread
	function getThreadDuplicateCount(threadText: string): number {
		if (!currentSession) return 0;
		return currentSession.threads.filter((t) => t.text === threadText && !t.completed).length;
	}

	// Get duplicate count for a character
	function getCharacterDuplicateCount(characterName: string): number {
		if (!currentSession) return 0;
		return currentSession.characters.filter((c) => c.name === characterName && c.active).length;
	}

	// Thread actions
	function addThread() {
		if (newThreadText.trim()) {
			soloRpgStore.addThread(newThreadText.trim());
			newThreadText = '';
		}
	}

	function markThreadImportant(id: string) {
		soloRpgStore.duplicateThread(id);
	}

	function completeThreadItem(id: string) {
		soloRpgStore.completeThread(id);
	}

	// Character actions
	function addCharacter() {
		if (newCharacterName.trim()) {
			soloRpgStore.addCharacter(newCharacterName.trim(), newCharacterDesc.trim());
			newCharacterName = '';
			newCharacterDesc = '';
		}
	}

	function markCharacterImportant(id: string) {
		soloRpgStore.duplicateCharacter(id);
	}

	function deactivateCharacter(id: string) {
		soloRpgStore.toggleCharacterActive(id);
	}

	// Navigation
	function nextStep() {
		if (currentStep < 3) {
			currentStep = (currentStep + 1) as 1 | 2 | 3;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep = (currentStep - 1) as 1 | 2 | 3;
		}
	}

	// Complete bookkeeping
	function completeBookkeeping() {
		// Apply chaos factor adjustment
		if (chaosAdjustment === 'increase') {
			soloRpgStore.incrementChaosFactor();
		} else if (chaosAdjustment === 'decrease') {
			soloRpgStore.decrementChaosFactor();
		}

		// Increment scene number
		if (currentSession) {
			soloRpgStore.advanceScene();
		}

		// Call callbacks
		onComplete?.();
		onClose?.();
	}
</script>

<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
	<div class="bg-slate-900 rounded-2xl border border-orange-500/30 shadow-2xl max-w-4xl w-full my-8">
		<!-- Header -->
		<div class="flex items-center justify-between p-6 border-b border-orange-500/20">
			<div class="flex items-center gap-3">
				<span class="text-3xl">📋</span>
				<div>
					<h2 class="text-2xl font-bold text-white">Scene {currentSceneNumber} Bookkeeping</h2>
					<p class="text-sm text-slate-400">Step {currentStep} of 3</p>
				</div>
			</div>
			<button
				onclick={onClose}
				class="text-slate-400 hover:text-white transition-colors text-2xl"
				aria-label="Close"
			>
				✕
			</button>
		</div>

		<!-- Progress Bar -->
		<div class="px-6 pt-4">
			<div class="flex gap-2">
				{#each [1, 2, 3] as step}
					<div class="flex-1 h-1.5 rounded-full {currentStep >= step ? 'bg-orange-500' : 'bg-slate-700'}"></div>
				{/each}
			</div>
			<div class="flex justify-between mt-2 text-xs text-slate-500">
				<span class={currentStep === 1 ? 'text-orange-400 font-medium' : ''}>Update Lists</span>
				<span class={currentStep === 2 ? 'text-orange-400 font-medium' : ''}>Adjust CF</span>
				<span class={currentStep === 3 ? 'text-orange-400 font-medium' : ''}>Scene Notes</span>
			</div>
		</div>

		<!-- Content -->
		<div class="p-6 max-h-[60vh] overflow-y-auto">
			<!-- Step 1: Update Lists -->
			{#if currentStep === 1}
				<div class="space-y-6">
					<div>
						<h3 class="text-xl font-bold text-white mb-2">📋 Update Your Lists</h3>
						<p class="text-sm text-slate-400 mb-4">
							Mark threads as complete, highlight important elements (duplicates for higher probability), and add new threads or characters that emerged during this scene.
						</p>
					</div>

					<!-- Threads Section -->
					<div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
						<h4 class="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
							<span>🎯</span>
							<span>Threads</span>
						</h4>

						{#if threads.length === 0}
							<p class="text-slate-500 text-sm italic mb-3">No active threads</p>
						{:else}
							<div class="space-y-2 mb-3">
								{#each threads as thread (thread.id)}
									{@const duplicateCount = getThreadDuplicateCount(thread.text)}
									<div class="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
										<div class="flex items-start justify-between gap-3">
											<div class="flex-1 min-w-0">
												<p class="text-white">{thread.text}</p>
												{#if duplicateCount > 1}
													<p class="text-xs text-purple-400 mt-1">
														⭐ Important (appears {duplicateCount}x)
													</p>
												{/if}
											</div>
											<div class="flex gap-2 flex-shrink-0">
												<button
													onclick={() => markThreadImportant(thread.id)}
													disabled={duplicateCount >= 3}
													class="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-xs rounded transition-colors"
													title="Mark as important (duplicate entry)"
												>
													⭐
												</button>
												<button
													onclick={() => completeThreadItem(thread.id)}
													class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
													title="Mark as complete"
												>
													✓
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Add New Thread -->
						<div class="mt-3">
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={newThreadText}
									placeholder="Add new thread..."
									class="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
									onkeydown={(e) => e.key === 'Enter' && addThread()}
								/>
								<button
									onclick={addThread}
									disabled={!newThreadText.trim()}
									class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
								>
									Add
								</button>
							</div>
						</div>
					</div>

					<!-- Characters Section -->
					<div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
						<h4 class="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
							<span>👤</span>
							<span>Characters</span>
						</h4>

						{#if characters.length === 0}
							<p class="text-slate-500 text-sm italic mb-3">No characters</p>
						{:else}
							<div class="space-y-2 mb-3">
								{#each characters as character (character.id)}
									{@const duplicateCount = getCharacterDuplicateCount(character.name)}
									<div class="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
										<div class="flex items-start justify-between gap-3">
											<div class="flex-1 min-w-0">
												<p class="text-white font-medium">{character.name}</p>
												{#if character.description}
													<p class="text-sm text-slate-400 mt-0.5">{character.description}</p>
												{/if}
												{#if duplicateCount > 1}
													<p class="text-xs text-cyan-400 mt-1">
														⭐ Important (appears {duplicateCount}x)
													</p>
												{/if}
											</div>
											<div class="flex gap-2 flex-shrink-0">
												<button
													onclick={() => markCharacterImportant(character.id)}
													disabled={duplicateCount >= 3}
													class="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-xs rounded transition-colors"
													title="Mark as important (duplicate entry)"
												>
													⭐
												</button>
												<button
													onclick={() => deactivateCharacter(character.id)}
													class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
													title="Remove from active list"
												>
													✕
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Add New Character -->
						<div class="mt-3 space-y-2">
							<input
								type="text"
								bind:value={newCharacterName}
								placeholder="Character name..."
								class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
							/>
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={newCharacterDesc}
									placeholder="Description (optional)..."
									class="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
								/>
								<button
									onclick={addCharacter}
									disabled={!newCharacterName.trim()}
									class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
								>
									Add
								</button>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 2: Adjust Chaos Factor -->
			{#if currentStep === 2}
				<div class="space-y-6">
					<div>
						<h3 class="text-xl font-bold text-white mb-2">🎲 Adjust Chaos Factor</h3>
						<p class="text-sm text-slate-400 mb-4">
							Did things go according to plan, or did chaos reign? Adjust the Chaos Factor based on how much control the PC had over this scene.
						</p>
					</div>

					<div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
						<h4 class="text-lg font-bold text-orange-400 mb-4">Was this scene in PC control?</h4>

						<div class="space-y-3">
							<!-- Decrease CF -->
							<label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border-2 cursor-pointer transition-colors {chaosAdjustment === 'decrease' ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-slate-600'}">
								<input
									type="radio"
									name="chaos"
									value="decrease"
									bind:group={chaosAdjustment}
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-bold text-white mb-1">
										✓ Yes - PC made progress toward goals
									</div>
									<div class="text-sm text-slate-400">
										Things went according to plan. The PC achieved their objectives and maintained control.
									</div>
									<div class="text-sm text-green-400 font-medium mt-2">
										CF: {currentCF} → {Math.max(1, currentCF - 1)} (decrease by 1)
									</div>
								</div>
							</label>

							<!-- Increase CF -->
							<label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border-2 cursor-pointer transition-colors {chaosAdjustment === 'increase' ? 'border-red-500 bg-red-500/10' : 'border-slate-700 hover:border-slate-600'}">
								<input
									type="radio"
									name="chaos"
									value="increase"
									bind:group={chaosAdjustment}
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-bold text-white mb-1">
										✕ No - PC suffered setbacks/sidetracks
									</div>
									<div class="text-sm text-slate-400">
										Chaos erupted. Unexpected events derailed the PC's plans or created new complications.
									</div>
									<div class="text-sm text-red-400 font-medium mt-2">
										CF: {currentCF} → {Math.min(9, currentCF + 1)} (increase by 1)
									</div>
								</div>
							</label>

							<!-- Keep CF Same -->
							<label class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border-2 cursor-pointer transition-colors {chaosAdjustment === 'same' ? 'border-slate-500 bg-slate-500/10' : 'border-slate-700 hover:border-slate-600'}">
								<input
									type="radio"
									name="chaos"
									value="same"
									bind:group={chaosAdjustment}
									class="mt-1"
								/>
								<div class="flex-1">
									<div class="font-bold text-white mb-1">
										? Unclear - Mixed results
									</div>
									<div class="text-sm text-slate-400">
										Some progress, some setbacks. The situation is ambiguous or balanced.
									</div>
									<div class="text-sm text-slate-400 font-medium mt-2">
										CF: {currentCF} → {currentCF} (no change)
									</div>
								</div>
							</label>
						</div>

						<!-- Current CF Display -->
						<div class="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
							<div class="flex items-center justify-between">
								<div>
									<div class="text-sm text-slate-400">Current Chaos Factor</div>
									<div class="text-3xl font-bold text-orange-400">{currentCF}</div>
								</div>
								<div class="text-4xl">→</div>
								<div>
									<div class="text-sm text-slate-400">New Chaos Factor</div>
									<div class="text-3xl font-bold text-orange-400">{newCF}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 3: Scene Notes -->
			{#if currentStep === 3}
				<div class="space-y-6">
					<div>
						<h3 class="text-xl font-bold text-white mb-2">📝 Scene Summary</h3>
						<p class="text-sm text-slate-400 mb-4">
							Record what happened in this scene. This helps you remember key events and maintain narrative continuity.
						</p>
					</div>

					<!-- Scene Stats -->
					<div class="grid grid-cols-2 gap-4">
						<div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
							<div class="text-sm text-green-300 mb-1">Fate Questions Asked</div>
							<div class="text-3xl font-bold text-green-400">{sceneStats.fateQuestions}</div>
						</div>
						<div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
							<div class="text-sm text-orange-300 mb-1">Random Events</div>
							<div class="text-3xl font-bold text-orange-400">{sceneStats.randomEvents}</div>
						</div>
					</div>

					<!-- Notes Textarea -->
					<div>
						<label for="scene-notes" class="block text-sm font-medium text-white mb-2">
							Scene Notes
						</label>
						<textarea
							id="scene-notes"
							bind:value={sceneNotes}
							placeholder="What happened in this scene? What were the key moments, discoveries, or turning points?"
							class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-y"
							rows="8"
						></textarea>
						<p class="mt-2 text-xs text-slate-500">
							Tip: Include important NPCs, locations, revelations, or unresolved questions
						</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer Navigation -->
		<div class="flex items-center justify-between p-6 border-t border-orange-500/20">
			<button
				onclick={prevStep}
				disabled={currentStep === 1}
				class="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
			>
				← Previous
			</button>

			<div class="text-sm text-slate-400">
				Step {currentStep} of 3
			</div>

			{#if currentStep < 3}
				<button
					onclick={nextStep}
					class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
				>
					Next →
				</button>
			{:else}
				<button
					onclick={completeBookkeeping}
					class="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg transition-all shadow-lg hover:scale-105"
				>
					Complete Scene →
				</button>
			{/if}
		</div>
	</div>
</div>
