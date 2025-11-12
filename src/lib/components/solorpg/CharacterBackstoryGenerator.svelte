<script lang="ts">
	/**
	 * Character Backstory Generator Component (Mythic Magazine Vol 2)
	 * Wizard-style interface for creating characters with rich backstories
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import {
		rollBackstoryFocus,
		getBackstoryFocusDescription,
		getBackstoryFocusGuidance,
		getFallbackResult,
		type BackstoryFocusResult
	} from '$lib/tables/mythicTables/backstoryFocusTable';
	import {
		rollActionMeaning,
		rollDescriptionMeaning
	} from '$lib/tables/mythicTables/meaningTablesRoller';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// Backstory mini-lists (separate from main adventure)
	interface BackstoryNPC {
		id: string;
		name: string;
		description: string;
	}

	interface BackstoryThread {
		id: string;
		text: string;
		closed: boolean;
	}

	interface BackstoryConnection {
		id: string;
		from: string; // NPC id or 'subject'
		to: string; // NPC id or 'subject'
		description: string;
	}

	interface BackstoryEvent {
		id: string;
		roll: number;
		result: BackstoryFocusResult;
		meaningType: 'action' | 'description' | null;
		meaning: { word1: string; word2: string } | null;
		interpretation: string;
	}

	// Workflow state
	let step = $state<'choice' | 'name' | 'rolling' | 'review'>('choice');
	let useFullBackstory = $state(false);

	// Character data
	let characterName = $state('');
	let characterDescription = $state('');

	// Backstory generation state
	let backstoryNPCs = $state<BackstoryNPC[]>([]);
	let backstoryThreads = $state<BackstoryThread[]>([]);
	let backstoryConnections = $state<BackstoryConnection[]>([]);
	let backstoryEvents = $state<BackstoryEvent[]>([]);
	let currentEventId = $state<string | null>(null);

	// Current roll state
	let currentRoll = $state<number | null>(null);
	let currentResult = $state<BackstoryFocusResult | null>(null);
	let currentMeaningType = $state<'action' | 'description' | null>(null);
	let currentMeaning = $state<{ word1: string; word2: string } | null>(null);
	let currentInterpretation = $state('');
	let showMeaningChoice = $state(false);
	let showInterpretationInput = $state(false);

	// Derived
	let rollCount = $derived(backstoryEvents.length);
	let canContinueRolling = $derived(rollCount < 7 && !isComplete);
	let isComplete = $derived(
		backstoryEvents.length > 0 &&
			backstoryEvents[backstoryEvents.length - 1]?.result === 'Complete, Or New Thread'
	);

	function reset() {
		step = 'choice';
		useFullBackstory = false;
		characterName = '';
		characterDescription = '';
		backstoryNPCs = [];
		backstoryThreads = [];
		backstoryConnections = [];
		backstoryEvents = [];
		currentEventId = null;
		currentRoll = null;
		currentResult = null;
		currentMeaningType = null;
		currentMeaning = null;
		currentInterpretation = '';
		showMeaningChoice = false;
		showInterpretationInput = false;
	}

	function startQuickAdd() {
		useFullBackstory = false;
		step = 'name';
	}

	function startFullBackstory() {
		useFullBackstory = true;
		step = 'name';
	}

	function confirmName() {
		if (!characterName.trim()) return;
		if (useFullBackstory) {
			step = 'rolling';
		} else {
			// Quick add - just save and close
			saveCharacter();
		}
	}

	function rollBackstory() {
		const result = rollBackstoryFocus();
		currentRoll = result.roll;

		// Check if we need to convert result based on available lists
		const hasNPCs = backstoryNPCs.length > 0;
		const hasThreads = backstoryThreads.filter(t => !t.closed).length > 0;

		// Special handling for first roll Complete
		if (result.result === 'Complete, Or New Thread' && backstoryEvents.length === 0) {
			currentResult = 'New Thread';
		} else {
			currentResult = getFallbackResult(result.result, hasNPCs, hasThreads);
		}

		showMeaningChoice = true;
		showInterpretationInput = false;
		currentMeaning = null;
		currentInterpretation = '';
		currentEventId = crypto.randomUUID();
	}

	function chooseMeaningType(type: 'action' | 'description') {
		currentMeaningType = type;

		if (type === 'action') {
			currentMeaning = rollActionMeaning();
		} else {
			currentMeaning = rollDescriptionMeaning();
		}

		showMeaningChoice = false;
		showInterpretationInput = true;
	}

	function saveEvent() {
		if (!currentResult || !currentEventId || !currentInterpretation.trim()) return;

		const event: BackstoryEvent = {
			id: currentEventId,
			roll: currentRoll!,
			result: currentResult,
			meaningType: currentMeaningType,
			meaning: currentMeaning,
			interpretation: currentInterpretation
		};

		backstoryEvents.push(event);

		// Reset for next roll
		currentRoll = null;
		currentResult = null;
		currentMeaningType = null;
		currentMeaning = null;
		currentInterpretation = '';
		showMeaningChoice = false;
		showInterpretationInput = false;
		currentEventId = null;

		// Check if complete or max rolls
		if (isComplete || rollCount >= 7) {
			step = 'review';
		}
	}

	function skipToReview() {
		if (backstoryEvents.length === 0) return;
		step = 'review';
	}

	function addBackstoryNPC() {
		const npc: BackstoryNPC = {
			id: crypto.randomUUID(),
			name: `NPC ${backstoryNPCs.length + 1}`,
			description: ''
		};
		backstoryNPCs.push(npc);
	}

	function removeBackstoryNPC(id: string) {
		backstoryNPCs = backstoryNPCs.filter(n => n.id !== id);
	}

	function addBackstoryThread() {
		const thread: BackstoryThread = {
			id: crypto.randomUUID(),
			text: `Thread ${backstoryThreads.length + 1}`,
			closed: false
		};
		backstoryThreads.push(thread);
	}

	function closeBackstoryThread(id: string) {
		const thread = backstoryThreads.find(t => t.id === id);
		if (thread) {
			thread.closed = true;
		}
	}

	function removeBackstoryThread(id: string) {
		backstoryThreads = backstoryThreads.filter(t => t.id !== id);
	}

	function saveCharacter() {
		if (!characterName.trim()) return;

		// Generate full backstory text from events
		let backstoryText = '';
		if (useFullBackstory && backstoryEvents.length > 0) {
			backstoryText = backstoryEvents.map((e, i) =>
				`${i + 1}. ${e.interpretation}`
			).join('\n\n');
		}

		// Add character to main list
		soloRpgStore.addCharacter(
			characterName.trim(),
			backstoryText || characterDescription.trim()
		);

		onClose();
		reset();
	}

	function finish() {
		onClose();
		reset();
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
		<div class="bg-slate-800 rounded-lg border-2 border-cyan-500 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
			<!-- Header -->
			<div class="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 border-b border-cyan-500">
				<h2 class="text-2xl font-bold text-white">🎭 Character Creation</h2>
				<p class="text-cyan-200 text-sm mt-1">
					{#if step === 'choice'}
						Choose your creation method
					{:else if step === 'name'}
						{useFullBackstory ? 'Name your character and begin backstory' : 'Quick character creation'}
					{:else if step === 'rolling'}
						Generating backstory... Roll {rollCount + 1}/7
					{:else}
						Review and finalize
					{/if}
				</p>
			</div>

			<div class="p-6 space-y-4">
				<!-- Step 1: Choice -->
				{#if step === 'choice'}
					<div class="space-y-4">
						<h3 class="text-lg font-bold text-white mb-4">How would you like to create your character?</h3>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<!-- Quick Add -->
							<button
								onclick={startQuickAdd}
								class="p-6 bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-500 hover:border-cyan-500 rounded-lg transition-all text-left group"
							>
								<div class="text-4xl mb-3">⚡</div>
								<div class="text-xl font-bold text-white mb-2">Quick Add</div>
								<p class="text-sm text-slate-300 mb-3">
									Simple and fast. Just enter a name and optional description.
								</p>
								<div class="text-xs text-slate-400">
									• Takes 30 seconds<br>
									• Basic character entry<br>
									• Add details later
								</div>
							</button>

							<!-- Full Backstory -->
							<button
								onclick={startFullBackstory}
								class="p-6 bg-purple-900/40 hover:bg-purple-900/60 border-2 border-purple-500 hover:border-purple-400 rounded-lg transition-all text-left group"
							>
								<div class="text-4xl mb-3">✨</div>
								<div class="text-xl font-bold text-white mb-2">Generate Backstory</div>
								<p class="text-sm text-purple-200 mb-3">
									Create a rich history using Mythic's Backstory Focus Table system.
								</p>
								<div class="text-xs text-purple-300">
									• Takes 5-10 minutes<br>
									• Generates compelling history<br>
									• Uses Meaning Tables<br>
									• Creates NPCs & connections
								</div>
							</button>
						</div>
					</div>
				{/if}

				<!-- Step 2: Name & Description -->
				{#if step === 'name'}
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-white mb-2">Character Name *</label>
							<input
								type="text"
								bind:value={characterName}
								placeholder="Enter character name..."
								class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
								onkeydown={(e) => e.key === 'Enter' && confirmName()}
							/>
						</div>

						{#if !useFullBackstory}
							<div>
								<label class="block text-sm font-medium text-white mb-2">Description (optional)</label>
								<textarea
									bind:value={characterDescription}
									placeholder="Brief description..."
									class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
									rows="3"
								></textarea>
							</div>
						{:else}
							<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
								<h4 class="text-sm font-bold text-purple-300 mb-2">About Backstory Generation</h4>
								<p class="text-xs text-slate-300 mb-2">
									You'll roll on the Backstory Focus Table up to 7 times, or until you get "Complete".
									Each roll generates events, NPCs, relationships, and story threads from your character's past.
								</p>
								<p class="text-xs text-slate-400">
									You'll use the Meaning Tables to interpret each result and build a layered narrative.
								</p>
							</div>
						{/if}

						<div class="flex gap-2">
							<button
								onclick={() => step = 'choice'}
								class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
							>
								← Back
							</button>
							<button
								onclick={confirmName}
								disabled={!characterName.trim()}
								class="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold rounded transition-colors"
							>
								{useFullBackstory ? 'Start Generating Backstory →' : 'Create Character'}
							</button>
						</div>
					</div>
				{/if}

				<!-- Step 3: Rolling Backstory -->
				{#if step === 'rolling'}
					<div class="space-y-4">
						<!-- Progress -->
						<div class="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
							<div class="text-sm text-slate-300">
								Roll <span class="font-mono font-bold text-white">{rollCount + (currentResult ? 1 : 0)}</span> of 7
							</div>
							<div class="text-xs text-slate-400">
								Subject: <span class="text-white font-medium">{characterName}</span>
							</div>
						</div>

						<!-- Previous Events Summary -->
						{#if backstoryEvents.length > 0}
							<div class="p-4 bg-slate-700/30 rounded-lg max-h-48 overflow-y-auto">
								<h4 class="text-sm font-bold text-purple-300 mb-2">Story So Far:</h4>
								<div class="space-y-2">
									{#each backstoryEvents as event, i}
										<div class="text-xs text-slate-300">
											<span class="text-purple-400 font-mono">{i + 1}.</span> {event.interpretation}
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Current Roll -->
						{#if !currentResult}
							<button
								onclick={rollBackstory}
								class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
							>
								🎲 Roll on Backstory Focus Table
							</button>
						{:else}
							<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
								<div class="flex items-start justify-between mb-2">
									<div>
										<div class="text-sm text-slate-400">Roll: <span class="font-mono font-bold text-white">{currentRoll}</span></div>
										<div class="text-lg font-bold text-purple-300">{currentResult}</div>
									</div>
								</div>
								<p class="text-sm text-slate-300 mb-3">
									{getBackstoryFocusDescription(currentResult)}
								</p>
								<div class="p-3 bg-slate-700/50 rounded text-xs text-slate-400">
									💡 {getBackstoryFocusGuidance(currentResult)}
								</div>
							</div>

							<!-- Meaning Tables Choice -->
							{#if showMeaningChoice}
								<div class="space-y-3">
									<p class="text-sm text-white font-medium">Choose meaning tables to help interpret this result:</p>
									<div class="grid grid-cols-2 gap-3">
										<button
											onclick={() => chooseMeaningType('action')}
											class="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
										>
											Action Meaning
										</button>
										<button
											onclick={() => chooseMeaningType('description')}
											class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
										>
											Description Meaning
										</button>
									</div>
								</div>
							{/if}

							<!-- Meaning Result & Interpretation -->
							{#if showInterpretationInput && currentMeaning}
								<div class="space-y-3">
									<div class="p-3 bg-slate-700/50 rounded-lg">
										<div class="text-xs text-slate-400 mb-1">
											{currentMeaningType === 'action' ? 'Action' : 'Description'} Meaning:
										</div>
										<div class="text-lg font-bold text-white">
											{currentMeaning.word1} / {currentMeaning.word2}
										</div>
									</div>

									<div>
										<label class="block text-sm font-medium text-white mb-2">
											Your Interpretation *
										</label>
										<textarea
											bind:value={currentInterpretation}
											placeholder="Interpret this result in the context of the backstory... What happened? How does it connect to previous events?"
											class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
											rows="4"
										></textarea>
									</div>

									<button
										onclick={saveEvent}
										disabled={!currentInterpretation.trim()}
										class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold rounded transition-colors"
									>
										Save & Continue
									</button>
								</div>
							{/if}
						{/if}

						<!-- Actions -->
						{#if !currentResult && backstoryEvents.length > 0}
							<div class="flex gap-2">
								<button
									onclick={skipToReview}
									class="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
								>
									Finish Early & Review
								</button>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Step 4: Review -->
				{#if step === 'review'}
					<div class="space-y-4">
						<div class="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
							<h3 class="text-lg font-bold text-green-300 mb-2">✓ Backstory Complete!</h3>
							<p class="text-sm text-slate-300">
								Review your character's history below. You can edit interpretations if needed.
							</p>
						</div>

						<!-- Character Summary -->
						<div class="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
							<div class="text-lg font-bold text-white mb-1">{characterName}</div>
							<div class="text-sm text-cyan-300">Total Events: {backstoryEvents.length}</div>
						</div>

						<!-- Backstory Events -->
						<div class="space-y-3 max-h-96 overflow-y-auto">
							{#each backstoryEvents as event, i}
								<div class="p-3 bg-slate-700/30 rounded-lg">
									<div class="flex items-start justify-between mb-2">
										<div class="text-sm font-bold text-purple-300">Event {i + 1}</div>
										<div class="text-xs text-slate-400">{event.result}</div>
									</div>
									{#if event.meaning}
										<div class="text-xs text-slate-400 mb-2">
											{event.meaningType === 'action' ? 'Action' : 'Description'}:
											<span class="text-purple-300 font-medium">{event.meaning.word1} / {event.meaning.word2}</span>
										</div>
									{/if}
									<p class="text-sm text-white">{event.interpretation}</p>
								</div>
							{/each}
						</div>

						<div class="flex gap-2">
							<button
								onclick={() => step = 'rolling'}
								class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
							>
								← Back to Rolling
							</button>
							<button
								onclick={saveCharacter}
								class="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded transition-colors"
							>
								Save Character
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Close Button -->
			<div class="p-4 border-t border-slate-700">
				<button
					onclick={finish}
					class="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
