<script lang="ts">
	// Fate Question Component
	// Core Mythic GME feature for asking yes/no questions

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import { OddsLevel, ODDS_LEVELS, getFateThreshold, determineFateAnswer } from '$lib/utils/fateChart';
	import { rollD100, checkRandomEvent } from '$lib/utils/mythicDice';
	import DiceVisualizer from './DiceVisualizer.svelte';
	import type { FateQuestion as FateQuestionType } from '$lib/stores/soloRpgStore.svelte';

	interface Props {
		onRandomEventTriggered?: () => void;
	}

	let { onRandomEventTriggered }: Props = $props();

	// State
	let question = $state('');
	let selectedOdds = $state<OddsLevel>(OddsLevel.FiftyFifty);
	let isDiscoveryQuestion = $state(false);
	let isRolling = $state(false);
	let currentRoll = $state<number | undefined>(undefined);
	let result = $state<FateQuestionType | undefined>(undefined);
	let interpretation = $state('');
	let showResult = $state(false);

	// Derived values
	let chaosFactor = $derived(soloRpgStore.currentSession?.chaosFactor || 5);
	// Discovery Questions always use 50/50 odds
	let effectiveOdds = $derived(isDiscoveryQuestion ? OddsLevel.FiftyFifty : selectedOdds);
	let thresholds = $derived(getFateThreshold(effectiveOdds, chaosFactor));
	let estimatedProbability = $derived(thresholds.yes);

	// NPC Detection for contextual guidance
	let isNpcQuestion = $derived.by(() => {
		const q = question.toLowerCase();
		const npcKeywords = [
			'does he', 'does she', 'does it', 'does the npc', 'does the character',
			'will he', 'will she', 'will it', 'will the npc', 'will the character',
			'can he', 'can she', 'can it', 'can the npc', 'can the character',
			'is he', 'is she', 'is the npc', 'is the character',
			'would he', 'would she', 'would the npc', 'would the character'
		];

		// Check for NPC keywords
		const hasKeyword = npcKeywords.some(keyword => q.includes(keyword));

		// Check if any character names from the list are mentioned
		const characters = soloRpgStore.currentSession?.characters || [];
		const hasCharacterName = characters.some(char =>
			q.includes(char.name.toLowerCase())
		);

		return hasKeyword || hasCharacterName;
	});

	// Get NPC guidance based on answer
	function getNpcGuidance(answer: string): string {
		if (answer === 'Exceptional Yes') {
			return 'The NPC does what you expected, but with exceptional intensity, enthusiasm, or effectiveness.';
		} else if (answer === 'Yes') {
			return 'The NPC behaves as you expected or hoped they would.';
		} else if (answer === 'No') {
			return 'The NPC does something else instead - different behavior, different motivation, or different action.';
		} else if (answer === 'Exceptional No') {
			return 'The NPC does the opposite of what you expected - contrary behavior, hostile action, or unexpected betrayal.';
		}
		return '';
	}

	// Roll the fate question
	async function rollFate() {
		if (!question.trim() || !soloRpgStore.currentSession) {
			return;
		}

		isRolling = true;
		showResult = false;
		currentRoll = undefined;

		// Simulate rolling animation
		await new Promise(resolve => setTimeout(resolve, 1500));

		// Actual roll
		const roll = rollD100();
		currentRoll = roll;

		// Determine answer (use effectiveOdds for Discovery Questions)
		const answer = determineFateAnswer(roll, effectiveOdds, chaosFactor);

		// Check for random event (Discovery Questions skip this)
		const triggeredRandomEvent = isDiscoveryQuestion ? false : checkRandomEvent(roll, chaosFactor);

		// Create fate question record
		const fateQuestion: FateQuestionType = {
			id: crypto.randomUUID(),
			sceneNumber: soloRpgStore.currentSession.currentSceneNumber,
			question,
			odds: effectiveOdds, // Use effective odds (50/50 for Discovery Questions)
			chaosFactor,
			roll,
			method: 'chart',
			answer,
			threshold: thresholds.yes,
			randomEvent: triggeredRandomEvent,
			playerInterpretation: interpretation || undefined,
			timestamp: new Date()
		};

		result = fateQuestion;
		soloRpgStore.logFateQuestion(fateQuestion);

		isRolling = false;
		showResult = true;

		// If random event triggered, notify parent to open modal
		if (triggeredRandomEvent) {
			onRandomEventTriggered?.();
		}
	}

	// Reset form
	function reset() {
		question = '';
		selectedOdds = OddsLevel.FiftyFifty;
		isDiscoveryQuestion = false;
		currentRoll = undefined;
		result = undefined;
		interpretation = '';
		showResult = false;
	}

	// Get color based on answer
	function getAnswerColor(answer: string): string {
		if (answer.includes('Yes')) return 'text-green-400';
		if (answer.includes('No')) return 'text-red-400';
		return 'text-slate-400';
	}

	// Get background color based on answer
	function getAnswerBg(answer: string): string {
		if (answer.includes('Yes')) return 'bg-green-500/20 border-green-500/50';
		if (answer.includes('No')) return 'bg-red-500/20 border-red-500/50';
		return 'bg-slate-500/20 border-slate-500/50';
	}
</script>

<div class="fate-question bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl">
	<div class="flex items-center gap-3 mb-6">
		<span class="text-4xl">🎯</span>
		<h2 class="text-2xl font-bold text-white">Fate Question</h2>
	</div>

	{#if !showResult}
		<!-- Input Form -->
		<div class="space-y-4">
			<!-- Question Input -->
			<div>
				<label for="fate-question-input" class="block text-sm font-medium text-orange-300 mb-2">
					Your Question
				</label>
				<textarea
					id="fate-question-input"
					bind:value={question}
					placeholder="Is the guard hostile?"
					class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
					rows="2"
				></textarea>
				<p class="mt-1 text-xs text-slate-500">Ask a yes/no question about the current situation</p>
			</div>

			<!-- Odds Selector -->
			<div>
				<label for="odds-select" class="block text-sm font-medium text-orange-300 mb-2">
					Odds
				</label>
				<select
					id="odds-select"
					bind:value={selectedOdds}
					disabled={isDiscoveryQuestion}
					class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#each ODDS_LEVELS as odds}
						<option value={odds}>{odds}</option>
					{/each}
				</select>
			</div>

			<!-- Discovery Question Checkbox -->
			<div class="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
				<label class="flex items-start gap-3 cursor-pointer">
					<input
						type="checkbox"
						bind:checked={isDiscoveryQuestion}
						class="mt-1 w-4 h-4 rounded border-blue-500 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
					/>
					<div class="flex-1">
						<div class="text-sm font-medium text-blue-300">Discovery Question</div>
						<div class="text-xs text-blue-200 mt-1">
							Discovery Questions always use 50/50 odds and never trigger Random Events.
							Use these when exploring new story elements or discoveries.
						</div>
						{#if isDiscoveryQuestion}
							<div class="text-xs text-blue-400 font-medium mt-2">
								🔍 Odds locked to 50/50 • Random Events disabled
							</div>
						{/if}
					</div>
				</label>
			</div>

			<!-- Stats Display -->
			<div class="grid grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-lg">
				<div>
					<div class="text-xs text-slate-500 mb-1">Chaos Factor</div>
					<div class="text-2xl font-bold text-orange-400">{chaosFactor}</div>
				</div>
				<div>
					<div class="text-xs text-slate-500 mb-1">Est. Probability</div>
					<div class="text-2xl font-bold text-orange-400">~{estimatedProbability}%</div>
				</div>
			</div>

			<!-- Roll Button -->
			<button
				onclick={rollFate}
				disabled={!question.trim() || isRolling}
				class="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:scale-102 active:scale-98 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
			>
				{#if isRolling}
					<span class="animate-spin">🎲</span>
					<span>Rolling...</span>
				{:else}
					<span>🎯</span>
					<span>Ask Fate</span>
				{/if}
			</button>
		</div>

		<!-- Rolling Dice Display -->
		{#if isRolling}
			<div class="mt-6 flex justify-center">
				<DiceVisualizer diceType="d100" isRolling={true} size="large" />
			</div>
		{/if}
	{:else if result}
		<!-- Result Display -->
		<div class="space-y-6">
			<!-- Question Display -->
			<div class="p-4 bg-slate-800/30 rounded-lg">
				<div class="text-sm text-slate-500 mb-1">Question</div>
				<div class="text-lg text-white">{result.question}</div>
				<div class="text-xs text-slate-500 mt-2">Odds: {result.odds} | CF: {result.chaosFactor}</div>
			</div>

			<!-- Dice Result -->
			<div class="flex justify-center">
				<DiceVisualizer diceType="d100" result={result.roll} size="large" />
			</div>

			<!-- Answer -->
			<div class="p-6 rounded-xl border-2 {getAnswerBg(result.answer)}">
				<div class="text-center">
					<div class="text-sm text-slate-400 mb-2">Answer</div>
					<div class="text-5xl font-black {getAnswerColor(result.answer)} mb-2">
						{result.answer.toUpperCase()}
					</div>
					<div class="text-sm text-slate-400">
						Rolled {result.roll} (threshold: ≤{result.threshold})
					</div>
				</div>

				<!-- Visual Threshold Bar -->
				<div class="mt-4">
					<div class="h-2 bg-slate-700 rounded-full overflow-hidden relative">
						<div
							class="h-full bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all"
							style="width: {result.threshold}%"
						></div>
						<div
							class="absolute top-0 h-full w-1 bg-white shadow-lg transition-all"
							style="left: {result.roll}%"
						></div>
					</div>
					<div class="flex justify-between mt-1 text-xs text-slate-500">
						<span>1</span>
						<span>{result.threshold}</span>
						<span>100</span>
					</div>
				</div>
			</div>

			<!-- NPC Behavior Guidance -->
			{#if isNpcQuestion}
				<div class="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-xl">💡</span>
						<span class="text-sm font-bold text-blue-300">NPC Behavior Guidance</span>
					</div>
					<p class="text-sm text-blue-200">
						{getNpcGuidance(result.answer)}
					</p>
				</div>
			{/if}

			<!-- Random Event Notification -->
			{#if result.randomEvent}
				<div class="p-4 bg-orange-600/20 border-2 border-orange-500 rounded-lg">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-2xl">⚡</span>
						<span class="font-bold text-orange-400">Random Event Triggered!</span>
					</div>
					<p class="text-sm text-orange-200 mb-3">
						You rolled <strong>{result.roll}</strong> (doubles ≤ CF {chaosFactor}).
						In addition to the <strong>{result.answer}</strong> answer above,
						a Random Event also occurs!
					</p>
					<button
						onclick={onRandomEventTriggered}
						class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
					>
						⚡ Generate Random Event
					</button>
				</div>
			{/if}

			<!-- Interpretation -->
			<div>
				<label for="interpretation-input" class="block text-sm font-medium text-orange-300 mb-2">
					Your Interpretation (Optional)
				</label>
				<textarea
					id="interpretation-input"
					bind:value={interpretation}
					placeholder="What does this mean for your story?"
					class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
					rows="3"
				></textarea>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3">
				<button
					onclick={reset}
					class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-102 active:scale-98"
				>
					Ask Another Question
				</button>
				<button
					onclick={reset}
					class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
				>
					Done
				</button>
			</div>
		</div>
	{/if}
</div>
