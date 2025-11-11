<script lang="ts">
	// Random Event Generator Component
	// Generates random events for Mythic GME

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import type { RandomEvent } from '$lib/stores/soloRpgStore.svelte';
	import {
		EventFocus,
		ALL_EVENT_FOCUSES,
		getEventFocus,
		needsListRoll,
		suggestMeaningTables,
		getEventFocusDescription
	} from '$lib/utils/eventFocus';
	import { rollD100, rollOnList } from '$lib/utils/mythicDice';
	import { rollOnMeaningTable, getAllMeaningTableNames, getTableCategories } from '$lib/utils/mythicTableLookup';
	import {
		rollMysteryEventFocus,
		getMysteryEventFocusDescription,
		grantsFreeElementRoll,
		type MysteryEventFocus
	} from '$lib/tables/mythicTables/mysteryEventFocusTable';
	import {
		rollMysteryElement,
		getMysteryElementDescription
	} from '$lib/tables/mythicTables/mysteryElementsTable';
	import {
		rollClueDescriptors,
		rollSuspectDescriptors
	} from '$lib/tables/mythicTables/mysteryDescriptorsTable';
	import DiceVisualizer from './DiceVisualizer.svelte';
	import MysteryDiscoveryCheck from './MysteryDiscoveryCheck.svelte';

	interface Props {
		autoContext?: string;
		onComplete?: () => void;
	}

	let { autoContext = '', onComplete }: Props = $props();

	// State
	let step = $state<'context' | 'focus' | 'lists' | 'meaning' | 'interpretation' | 'mystery-element'>('context');
	let context = $state(autoContext);
	let selectedFocus = $state<MysteryEventFocus | null>(null);
	let focusRoll = $state<number | undefined>(undefined);
	let focusChosen = $state(false);

	// Mystery-specific state
	let mysteryElementResult = $state<string | null>(null);
	let mysteryElementCategory = $state<'clues' | 'suspects' | null>(null);
	let mysteryDescriptorWords = $state<{ word1: string; word2: string } | null>(null);

	// List rolling
	let listRollResult = $state<string>('');
	let involvedThread = $state<string>('');
	let involvedCharacter = $state<string>('');

	// Meaning tables
	let meaningTable1 = $state('Actions Table 1');
	let meaningRoll1 = $state<number | undefined>(undefined);
	let meaningResult1 = $state('');
	let meaningTable2 = $state('Descriptions Table 1');
	let meaningRoll2 = $state<number | undefined>(undefined);
	let meaningResult2 = $state('');

	let interpretation = $state('');
	let isRolling = $state(false);

	// Derived
	let threads = $derived(soloRpgStore.activeThreads);
	let characters = $derived(soloRpgStore.activeCharacters);
	let isMysteryMode = $derived(!!soloRpgStore.currentSession?.mysteryThread);
	let needsList = $derived(selectedFocus ? needsListRoll(selectedFocus as EventFocus) : null);
	let suggestedTables = $derived(selectedFocus ? suggestMeaningTables(selectedFocus as EventFocus) : []);
	let allTableNames = $derived(getAllMeaningTableNames());
	let tableCategories = $derived(getTableCategories());

	// Roll for Event Focus
	async function rollEventFocus() {
		isRolling = true;
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Use Mystery Event Focus table if in mystery mode
		if (isMysteryMode) {
			const result = rollMysteryEventFocus();
			focusRoll = result.roll;
			selectedFocus = result.focus;
			focusChosen = false;
			isRolling = false;

			// Check if this grants a free mystery element roll
			const elementCheck = grantsFreeElementRoll(result.focus);
			if (elementCheck.grants && elementCheck.category) {
				// Auto-roll mystery element
				setTimeout(() => {
					rollMysteryElementForEvent(elementCheck.category!);
				}, 1500);
				return;
			}
		} else {
			const roll = rollD100();
			focusRoll = roll;
			selectedFocus = getEventFocus(roll);
			focusChosen = false;
			isRolling = false;
		}

		// Auto-advance to next step
		setTimeout(() => {
			if (needsList) {
				step = 'lists';
			} else {
				step = 'meaning';
			}
		}, 1500);
	}

	// Roll Mystery Element for Event (Clue Element / Suspect Element)
	function rollMysteryElementForEvent(category: 'clues' | 'suspects') {
		const session = soloRpgStore.currentSession;
		if (!session) return;

		mysteryElementCategory = category;
		const progressPoints = category === 'clues'
			? session.mysteryClueProgressPoints || 0
			: session.mysterySuspectProgressPoints || 0;

		const result = rollMysteryElement(progressPoints, category);
		mysteryElementResult = result.result;

		// Roll descriptor words for inspiration
		const descriptors = category === 'clues' ? rollClueDescriptors() : rollSuspectDescriptors();
		mysteryDescriptorWords = descriptors;

		// Increment progress points
		soloRpgStore.incrementMysteryProgressPoints(category);

		step = 'mystery-element';
	}

	// Choose Event Focus manually
	function chooseFocus(focus: MysteryEventFocus) {
		selectedFocus = focus;
		focusChosen = true;
		focusRoll = undefined;

		// Check if this grants a free mystery element roll
		if (isMysteryMode) {
			const elementCheck = grantsFreeElementRoll(focus);
			if (elementCheck.grants && elementCheck.category) {
				rollMysteryElementForEvent(elementCheck.category);
				return;
			}
		}

		if (needsList) {
			step = 'lists';
		} else {
			step = 'meaning';
		}
	}

	// Roll on appropriate list
	function rollOnAppropriateList() {
		if (!needsList) return;

		if (needsList === 'threads') {
			if (threads.length === 0) {
				listRollResult = 'No threads available - choose manually or skip';
				return;
			}
			const result = rollOnList(threads.length);
			if (result.position === 0) {
				listRollResult = `${result.diceUsed}: Choose any thread`;
			} else {
				const thread = threads[result.position - 1];
				involvedThread = thread.text;
				listRollResult = `${result.diceUsed} → ${thread.text}`;
			}
		} else if (needsList === 'characters') {
			if (characters.length === 0) {
				listRollResult = 'No characters available - choose manually or skip';
				return;
			}
			const result = rollOnList(characters.length);
			if (result.position === 0) {
				listRollResult = `${result.diceUsed}: Choose any character`;
			} else {
				const character = characters[result.position - 1];
				involvedCharacter = character.name;
				listRollResult = `${result.diceUsed} → ${character.name}`;
			}
		}
	}

	// Roll on meaning table
	async function rollMeaningTable(tableNumber: 1 | 2) {
		isRolling = true;
		await new Promise(resolve => setTimeout(resolve, 1000));

		try {
			if (tableNumber === 1) {
				const result = rollOnMeaningTable(meaningTable1);
				meaningRoll1 = result.roll;
				meaningResult1 = result.result;
			} else {
				const result = rollOnMeaningTable(meaningTable2);
				meaningRoll2 = result.roll;
				meaningResult2 = result.result;
			}
		} catch (error) {
			console.error('Error rolling on meaning table:', error);
			// Fallback to error message
			if (tableNumber === 1) {
				meaningRoll1 = 0;
				meaningResult1 = 'Error: Table not found';
			} else {
				meaningRoll2 = 0;
				meaningResult2 = 'Error: Table not found';
			}
		}

		isRolling = false;
	}

	// Generate complete event
	async function generateComplete() {
		// Roll focus if not chosen
		if (!selectedFocus) {
			await rollEventFocus();
			await new Promise(resolve => setTimeout(resolve, 1500));
		}

		// Roll on lists if needed
		if (needsList && !listRollResult) {
			rollOnAppropriateList();
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		// Roll on meaning tables
		if (!meaningRoll1) {
			await rollMeaningTable(1);
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
		if (!meaningRoll2) {
			await rollMeaningTable(2);
		}

		step = 'interpretation';
	}

	// Save the event
	function saveEvent() {
		if (!selectedFocus || !soloRpgStore.currentSession) return;

		const event: RandomEvent = {
			id: crypto.randomUUID(),
			sceneNumber: soloRpgStore.currentSession.currentSceneNumber,
			context,
			focus: selectedFocus,
			focusRoll,
			focusChosen,
			involvedThread: involvedThread || undefined,
			involvedCharacter: involvedCharacter || undefined,
			listRoll: listRollResult || undefined,
			meaningTable1,
			meaningRoll1: meaningRoll1!,
			meaningResult1,
			meaningTable2,
			meaningRoll2,
			meaningResult2,
			playerInterpretation: interpretation,
			timestamp: new Date()
		};

		soloRpgStore.logRandomEvent(event);
		onComplete?.();
	}

	// Reset
	function reset() {
		step = 'context';
		selectedFocus = null;
		focusRoll = undefined;
		focusChosen = false;
		listRollResult = '';
		involvedThread = '';
		involvedCharacter = '';
		meaningRoll1 = undefined;
		meaningResult1 = '';
		meaningRoll2 = undefined;
		meaningResult2 = '';
		interpretation = '';
		mysteryElementResult = null;
		mysteryElementCategory = null;
		mysteryDescriptorWords = null;
	}
</script>

<div class="random-event-generator bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl">
	<div class="flex items-center gap-3 mb-6">
		<span class="text-4xl">⚡</span>
		<h2 class="text-2xl font-bold text-white">Random Event</h2>
		{#if isMysteryMode}
			<span class="ml-auto px-3 py-1 bg-purple-600/30 border border-purple-500 text-purple-300 text-xs font-bold rounded-full">
				🔍 MYSTERY MODE
			</span>
		{/if}
	</div>

	<!-- Progress Indicator -->
	<div class="flex items-center gap-2 mb-6 text-xs">
		<div class="flex-1 h-1 rounded-full {step === 'context' || step === 'focus' || step === 'lists' || step === 'mystery-element' || step === 'meaning' || step === 'interpretation' ? 'bg-orange-500' : 'bg-slate-700'}"></div>
		<div class="flex-1 h-1 rounded-full {step === 'focus' || step === 'lists' || step === 'mystery-element' || step === 'meaning' || step === 'interpretation' ? 'bg-orange-500' : 'bg-slate-700'}"></div>
		<div class="flex-1 h-1 rounded-full {step === 'lists' || step === 'mystery-element' || step === 'meaning' || step === 'interpretation' ? 'bg-orange-500' : 'bg-slate-700'}"></div>
		<div class="flex-1 h-1 rounded-full {step === 'mystery-element' || step === 'meaning' || step === 'interpretation' ? 'bg-orange-500' : 'bg-slate-700'}"></div>
		<div class="flex-1 h-1 rounded-full {step === 'meaning' || step === 'interpretation' ? 'bg-orange-500' : 'bg-slate-700'}"></div>
		<div class="flex-1 h-1 rounded-full {step === 'interpretation' ? 'bg-orange-500' : 'bg-slate-700'}"></div>
	</div>

	{#if step === 'context'}
		<!-- Context Input -->
		<div class="space-y-4">
			<div>
				<label for="event-context" class="block text-sm font-medium text-orange-300 mb-2">
					Current Situation
				</label>
				<textarea
					id="event-context"
					bind:value={context}
					placeholder="What's happening right now? Describe the current scene..."
					class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
					rows="3"
				></textarea>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => step = 'focus'}
					class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all"
				>
					Continue →
				</button>
				<button
					onclick={generateComplete}
					class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
				>
					⚡ Quick Generate
				</button>
			</div>
		</div>

	{:else if step === 'focus'}
		<!-- Event Focus Selection -->
		<div class="space-y-4">
			<div class="text-sm text-orange-200 mb-4">
				{#if selectedFocus}
					<strong>Selected: {selectedFocus}</strong>
					<p class="text-xs text-slate-400 mt-1">
						{isMysteryMode
							? getMysteryEventFocusDescription(selectedFocus)
							: getEventFocusDescription(selectedFocus as EventFocus)}
					</p>
				{:else}
					Choose how to determine the event focus
					{#if isMysteryMode}
						<span class="ml-2 text-xs text-purple-400">(Mystery Mode Active)</span>
					{/if}
				{/if}
			</div>

			{#if !selectedFocus}
				<div class="grid sm:grid-cols-2 gap-3">
					<button
						onclick={rollEventFocus}
						disabled={isRolling}
						class="p-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl transition-all text-center"
					>
						<div class="text-3xl mb-2">🎲</div>
						<div class="font-bold">Roll Event Focus</div>
						<div class="text-xs opacity-80">d100 on Event Focus table</div>
					</button>

					<button
						onclick={() => step = 'focus'}
						class="p-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all text-center"
					>
						<div class="text-3xl mb-2">✋</div>
						<div class="font-bold">Choose Manually</div>
						<div class="text-xs opacity-80">Pick from list below</div>
					</button>
				</div>

				{#if isRolling}
					<div class="flex justify-center py-4">
						<DiceVisualizer diceType="d100" isRolling={true} size="large" />
					</div>
				{:else if focusRoll}
					<div class="p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg text-center">
						<div class="text-sm text-orange-300 mb-2">Rolled {focusRoll}</div>
						<div class="text-2xl font-bold text-white">{selectedFocus}</div>
					</div>
				{/if}

				<!-- Manual Selection Grid -->
				<div class="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-2">
					{#each ALL_EVENT_FOCUSES as focus}
						<button
							onclick={() => chooseFocus(focus)}
							class="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-orange-500/50 rounded-lg text-left transition-all"
						>
							<div class="text-sm font-medium text-white">{focus}</div>
						</button>
					{/each}
				</div>
			{:else}
				<button
					onclick={() => {
						if (needsList) {
							step = 'lists';
						} else {
							step = 'meaning';
						}
					}}
					class="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all"
				>
					Continue →
				</button>
			{/if}
		</div>

	{:else if step === 'lists' && needsList}
		<!-- List Rolling -->
		<div class="space-y-4">
			<div class="p-4 bg-slate-800/30 rounded-lg">
				<div class="text-sm text-orange-300 mb-2">Event Focus: {selectedFocus}</div>
				<div class="text-xs text-slate-400">
					This focus requires rolling on {needsList === 'threads' ? 'Threads' : 'Characters'} list
				</div>
			</div>

			<button
				onclick={rollOnAppropriateList}
				disabled={!!listRollResult}
				class="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
			>
				🎲 Roll on {needsList === 'threads' ? 'Threads' : 'Characters'} List
			</button>

			{#if listRollResult}
				<div class="p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
					<div class="text-white font-medium">{listRollResult}</div>
					{#if involvedThread}
						<div class="text-sm text-purple-300 mt-2">Thread: {involvedThread}</div>
					{/if}
					{#if involvedCharacter}
						<div class="text-sm text-purple-300 mt-2">Character: {involvedCharacter}</div>
					{/if}
				</div>

				<button
					onclick={() => step = 'meaning'}
					class="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all"
				>
					Continue to Meaning →
				</button>
			{/if}
		</div>

	{:else if step === 'meaning'}
		<!-- Meaning Tables -->
		<div class="space-y-4">
			<div class="text-sm text-orange-200 mb-2">
				Roll on two Meaning Tables to generate event details
			</div>

			{#if suggestedTables.length > 0}
				<div class="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs">
					<strong class="text-blue-300">Suggested tables:</strong>
					<span class="text-blue-200">{suggestedTables.join(', ')}</span>
				</div>
			{/if}

			<!-- Meaning Table 1 -->
			<div class="p-4 bg-slate-800/30 rounded-lg">
				<label class="block text-sm font-medium text-orange-300 mb-2">Meaning Table 1</label>
				<select
					bind:value={meaningTable1}
					class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm mb-3"
				>
					{#if suggestedTables.length > 0}
						<optgroup label="✨ Suggested">
							{#each suggestedTables as table}
								<option value={table}>{table}</option>
							{/each}
						</optgroup>
					{/if}
					{#each Object.entries(tableCategories) as [category, tables]}
						<optgroup label={category}>
							{#each tables as table}
								<option value={table}>{table}</option>
							{/each}
						</optgroup>
					{/each}
				</select>

				{#if !meaningRoll1}
					<button
						onclick={() => rollMeaningTable(1)}
						disabled={isRolling}
						class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
					>
						🎲 Roll Table 1
					</button>
				{:else}
					<div class="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
						<div class="text-sm text-green-300">Rolled {meaningRoll1}</div>
						<div class="text-white font-medium">{meaningResult1}</div>
					</div>
				{/if}
			</div>

			<!-- Meaning Table 2 -->
			<div class="p-4 bg-slate-800/30 rounded-lg">
				<label class="block text-sm font-medium text-orange-300 mb-2">Meaning Table 2</label>
				<select
					bind:value={meaningTable2}
					class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm mb-3"
				>
					{#if suggestedTables.length > 0}
						<optgroup label="✨ Suggested">
							{#each suggestedTables as table}
								<option value={table}>{table}</option>
							{/each}
						</optgroup>
					{/if}
					{#each Object.entries(tableCategories) as [category, tables]}
						<optgroup label={category}>
							{#each tables as table}
								<option value={table}>{table}</option>
							{/each}
						</optgroup>
					{/each}
				</select>

				{#if !meaningRoll2}
					<button
						onclick={() => rollMeaningTable(2)}
						disabled={isRolling || !meaningRoll1}
						class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
					>
						🎲 Roll Table 2
					</button>
				{:else}
					<div class="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
						<div class="text-sm text-green-300">Rolled {meaningRoll2}</div>
						<div class="text-white font-medium">{meaningResult2}</div>
					</div>
				{/if}
			</div>

			{#if meaningRoll1 && meaningRoll2}
				<button
					onclick={() => step = 'interpretation'}
					class="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all"
				>
					Continue to Interpretation →
				</button>
			{/if}
		</div>

	{:else if step === 'mystery-element'}
		<!-- Mystery Element Result (Clue/Suspect Element from Event Focus) -->
		<div class="space-y-4">
			<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
				<h3 class="text-lg font-bold text-purple-300 mb-2">
					🔍 {mysteryElementCategory === 'clues' ? 'Clue' : 'Suspect'} Element Discovered!
				</h3>
				<p class="text-sm text-slate-300 mb-3">
					The Random Event has revealed a free discovery! This {mysteryElementCategory === 'clues' ? 'clue' : 'suspect'} should be immediately apparent in the scene.
				</p>

				<div class="p-3 bg-slate-700/50 rounded mb-3">
					<div class="text-lg font-bold text-white mb-1">{mysteryElementResult}</div>
					<p class="text-sm text-slate-400">
						{getMysteryElementDescription(mysteryElementResult!, mysteryElementCategory!)}
					</p>
				</div>

				{#if mysteryDescriptorWords}
					<div class="p-3 bg-blue-900/30 border border-blue-500/30 rounded">
						<div class="text-sm text-blue-300 mb-1">Inspiration Words:</div>
						<div class="text-lg font-bold text-white">
							{mysteryDescriptorWords.word1} / {mysteryDescriptorWords.word2}
						</div>
					</div>
				{/if}
			</div>

			<div class="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-sm text-yellow-300">
				<strong>Note:</strong> Add this {mysteryElementCategory === 'clues' ? 'clue' : 'suspect'} to your Mystery Matrix after interpreting the full event.
			</div>

			<button
				onclick={() => step = 'meaning'}
				class="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all"
			>
				Continue to Meaning →
			</button>
		</div>

	{:else if step === 'interpretation'}
		<!-- Interpretation -->
		<div class="space-y-4">
			<div class="p-4 bg-slate-800/30 rounded-lg space-y-2 text-sm">
				<div><strong class="text-orange-300">Event Focus:</strong> <span class="text-white">{selectedFocus}</span></div>
				{#if mysteryElementResult}
					<div><strong class="text-purple-300">Mystery Element:</strong> <span class="text-white">{mysteryElementResult} ({mysteryElementCategory})</span></div>
				{/if}
				{#if involvedThread}
					<div><strong class="text-purple-300">Thread:</strong> <span class="text-white">{involvedThread}</span></div>
				{/if}
				{#if involvedCharacter}
					<div><strong class="text-cyan-300">Character:</strong> <span class="text-white">{involvedCharacter}</span></div>
				{/if}
				<div><strong class="text-green-300">Meaning 1:</strong> <span class="text-white">{meaningResult1}</span></div>
				<div><strong class="text-green-300">Meaning 2:</strong> <span class="text-white">{meaningResult2}</span></div>
			</div>

			<div>
				<label for="event-interpretation" class="block text-sm font-medium text-orange-300 mb-2">
					Your Interpretation
				</label>
				<textarea
					id="event-interpretation"
					bind:value={interpretation}
					placeholder="Combine the elements above into a narrative event..."
					class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
					rows="4"
				></textarea>
			</div>

			<div class="flex gap-3">
				<button
					onclick={saveEvent}
					class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all"
				>
					✓ Log Event
				</button>
				<button
					onclick={reset}
					class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
				>
					Generate Another
				</button>
			</div>
		</div>
	{/if}
</div>
