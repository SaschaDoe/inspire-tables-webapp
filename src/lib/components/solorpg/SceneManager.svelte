<script lang="ts">
	// Scene Manager Component
	// Handles scene setup, testing, and transitions for Mythic GME

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import type { Scene, SceneType } from '$lib/stores/soloRpgStore.svelte';
	import { rollD10 } from '$lib/utils/mythicDice';
	import { SceneAdjustmentTable } from '$lib/tables/mythicTables/sceneAdjustmentTable';
	import DiceVisualizer from './DiceVisualizer.svelte';
	import SceneBookkeeping from './SceneBookkeeping.svelte';

	interface Props {
		onRandomEventNeeded?: () => void;
	}

	let { onRandomEventNeeded }: Props = $props();

	// State for scene bookkeeping
	let showBookkeepingModal = $state(false);

	// State
	let expectedSceneDescription = $state('');
	let isTestingScene = $state(false);
	let sceneTestRoll = $state<number | undefined>(undefined);
	let sceneTestResult = $state<SceneType | undefined>(undefined);
	let showSceneSetup = $state(false);
	let showAdjustmentRoll = $state(false);
	let adjustmentRoll = $state<number | undefined>(undefined);
	let adjustmentResult = $state<string | undefined>(undefined);

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let chaosFactor = $derived(currentSession?.chaosFactor || 5);
	let currentSceneNumber = $derived(currentSession?.currentSceneNumber || 0);
	let scenes = $derived(currentSession?.scenes || []);
	let currentScene = $derived(scenes.find(s => s.number === currentSceneNumber));

	// Scene testing logic
	async function testScene() {
		if (!expectedSceneDescription.trim() || !currentSession) return;

		isTestingScene = true;
		await new Promise(resolve => setTimeout(resolve, 1500));

		const roll = rollD10();
		sceneTestRoll = roll;

		// Determine scene type based on roll vs CF
		let sceneType: SceneType;
		if (roll <= chaosFactor / 2) {
			sceneType = 'Interrupt';
		} else if (roll <= chaosFactor) {
			sceneType = 'Altered';
		} else {
			sceneType = 'Expected';
		}

		sceneTestResult = sceneType;
		isTestingScene = false;

		// Handle scene type
		if (sceneType === 'Altered') {
			setTimeout(() => {
				showAdjustmentRoll = true;
			}, 500);
		} else if (sceneType === 'Interrupt') {
			setTimeout(() => {
				onRandomEventNeeded?.();
			}, 500);
		} else {
			// Expected scene - just create it
			setTimeout(() => {
				createScene(sceneType);
			}, 1000);
		}
	}

	// Roll on Scene Adjustment table
	async function rollSceneAdjustment() {
		const adjustTable = new SceneAdjustmentTable();
		const roll = rollD10();
		adjustmentRoll = roll;

		const entry = adjustTable.getEntry(roll);
		adjustmentResult = entry?.text || '';

		// Check if we need to roll twice
		if (adjustmentResult === 'Make 2 Adjustments') {
			setTimeout(async () => {
				const roll2 = rollD10();
				const entry2 = adjustTable.getEntry(roll2);
				if (entry2 && entry2.text !== 'Make 2 Adjustments') {
					adjustmentResult = `${adjustmentResult}\n1st: ${entry2.text}`;

					const roll3 = rollD10();
					const entry3 = adjustTable.getEntry(roll3);
					if (entry3 && entry3.text !== 'Make 2 Adjustments') {
						adjustmentResult = `${adjustmentResult}\n2nd: ${entry3.text}`;
					}
				}
			}, 1000);
		}
	}

	// Create a new scene
	function createScene(sceneType: SceneType) {
		if (!currentSession) return;

		const newScene: Scene = {
			number: currentSceneNumber + 1,
			type: sceneType,
			expectedDescription: sceneType !== 'First' ? expectedSceneDescription : undefined,
			actualDescription: sceneType === 'Expected' ? expectedSceneDescription : '',
			chaosFactorBefore: chaosFactor,
			chaosFactorAfter: chaosFactor,
			fateQuestionsAsked: 0,
			randomEventsOccurred: 0,
			threadsAdded: [],
			threadsRemoved: [],
			charactersAdded: [],
			charactersRemoved: [],
			notes: sceneType === 'Altered' && adjustmentResult ? `Scene Adjustment: ${adjustmentResult}` : '',
			timestamp: new Date()
		};

		soloRpgStore.addScene(newScene);

		// Reset state
		expectedSceneDescription = '';
		sceneTestRoll = undefined;
		sceneTestResult = undefined;
		showSceneSetup = false;
		showAdjustmentRoll = false;
		adjustmentRoll = undefined;
		adjustmentResult = undefined;
	}

	// Start first scene
	function startFirstScene() {
		createScene('First');
	}

	// Cancel scene setup
	function cancelSetup() {
		showSceneSetup = false;
		expectedSceneDescription = '';
		sceneTestRoll = undefined;
		sceneTestResult = undefined;
		showAdjustmentRoll = false;
		adjustmentRoll = undefined;
		adjustmentResult = undefined;
	}
</script>

<div class="scene-manager bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20 shadow-xl">
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center gap-3">
			<span class="text-3xl">🎬</span>
			<div>
				<h3 class="text-xl font-bold text-white">Scene Manager</h3>
				<p class="text-sm text-slate-400">Scene #{currentSceneNumber}</p>
			</div>
		</div>

		<div class="flex gap-2">
			{#if currentSceneNumber === 0}
				<button
					onclick={startFirstScene}
					class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
				>
					Start First Scene
				</button>
			{:else}
				<button
					onclick={() => showBookkeepingModal = true}
					class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
				>
					📋 End Scene
				</button>
				<button
					onclick={() => showSceneSetup = !showSceneSetup}
					class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
				>
					+ New Scene
				</button>
			{/if}
		</div>
	</div>

	<!-- Current Scene Display -->
	{#if currentScene}
		<div class="mb-6 p-4 bg-slate-800/50 rounded-lg border border-amber-500/30">
			<div class="flex items-center gap-2 mb-2">
				<span class="text-lg font-bold text-amber-400">Scene {currentScene.number}</span>
				<span class="px-2 py-0.5 bg-amber-600/20 text-amber-400 text-xs rounded">
					{currentScene.type}
				</span>
			</div>

			{#if currentScene.expectedDescription && currentScene.type !== 'Expected'}
				<div class="mb-2">
					<span class="text-xs text-slate-500 uppercase tracking-wide">Expected:</span>
					<p class="text-sm text-slate-300">{currentScene.expectedDescription}</p>
				</div>
			{/if}

			<div>
				<span class="text-xs text-slate-500 uppercase tracking-wide">
					{currentScene.type === 'Expected' ? 'Scene:' : 'Actual:'}
				</span>
				<p class="text-sm text-white">{currentScene.actualDescription || 'In progress...'}</p>
			</div>

			{#if currentScene.notes}
				<div class="mt-2 pt-2 border-t border-slate-700">
					<span class="text-xs text-slate-500 uppercase tracking-wide">Notes:</span>
					<p class="text-sm text-slate-400">{currentScene.notes}</p>
				</div>
			{/if}
		</div>

		<!-- Scene Workflow Guide -->
		<div class="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
			<h4 class="font-bold text-blue-300 mb-2 flex items-center gap-2">
				<span>📖</span>
				<span>During This Scene:</span>
			</h4>
			<ul class="text-sm text-blue-200 space-y-1.5">
				<li class="flex items-start gap-2">
					<span class="text-blue-400">•</span>
					<span>Ask Fate Questions to resolve uncertainties</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-blue-400">•</span>
					<span>Watch for Random Events (doubles ≤ CF on Fate Questions)</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-blue-400">•</span>
					<span>Play out the scene until main action resolves</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-blue-400">•</span>
					<span>Click "End Scene" when primary objective is complete</span>
				</li>
			</ul>
		</div>
	{/if}

	<!-- Scene Setup Form -->
	{#if showSceneSetup}
		<div class="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-amber-500/30">
			<div>
				<label class="block text-sm font-medium text-white mb-2">
					Expected Scene Description
				</label>
				<textarea
					bind:value={expectedSceneDescription}
					placeholder="Describe what you expect to happen in this scene..."
					class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 min-h-24 resize-y"
				></textarea>
				<p class="text-xs text-slate-500 mt-1">
					Tip: Be specific about location, characters, and situation
				</p>
			</div>

			<!-- Test Scene Button -->
			{#if !sceneTestRoll}
				<div class="flex gap-2">
					<button
						onclick={testScene}
						disabled={!expectedSceneDescription.trim() || isTestingScene}
						class="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
					>
						{#if isTestingScene}
							<span>🎲</span>
							<span>Testing Scene...</span>
						{:else}
							<span>🎲</span>
							<span>Test Scene (d10 vs CF {chaosFactor})</span>
						{/if}
					</button>
					<button
						onclick={cancelSetup}
						class="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			{/if}

			<!-- Scene Test Result -->
			{#if sceneTestRoll !== undefined && sceneTestResult}
				<div class="p-4 bg-slate-900/50 rounded-lg border border-amber-500/30 space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-400">Scene Test Roll:</span>
						<div class="flex items-center gap-2">
							<DiceVisualizer diceType="d10" result={sceneTestRoll} size="small" showLabel={false} />
							<span class="text-lg font-bold text-white">{sceneTestRoll}</span>
						</div>
					</div>

					<div class="p-3 bg-slate-800/50 rounded text-center">
						<div class="text-xs text-slate-500 mb-1">Scene Type</div>
						<div class="text-2xl font-bold {
							sceneTestResult === 'Expected' ? 'text-green-400' :
							sceneTestResult === 'Altered' ? 'text-yellow-400' :
							'text-red-400'
						}">
							{sceneTestResult}
						</div>
						<div class="text-xs text-slate-400 mt-1">
							{sceneTestResult === 'Expected' ? 'Scene goes as expected' :
							 sceneTestResult === 'Altered' ? 'Scene is modified in some way' :
							 'Scene is interrupted by a random event'}
						</div>
					</div>

					<!-- Altered Scene - Show Adjustment -->
					{#if sceneTestResult === 'Altered' && showAdjustmentRoll}
						<div class="space-y-2">
							{#if !adjustmentRoll}
								<button
									onclick={rollSceneAdjustment}
									class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
								>
									🎲 Roll Scene Adjustment
								</button>
							{:else}
								<div class="p-3 bg-yellow-900/20 rounded border border-yellow-500/30">
									<div class="text-sm text-yellow-400 font-medium mb-1">Scene Adjustment:</div>
									<div class="text-white whitespace-pre-line">{adjustmentResult}</div>
								</div>
								<button
									onclick={() => createScene('Altered')}
									class="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
								>
									✓ Create Altered Scene
								</button>
							{/if}
						</div>
					{/if}

					<!-- Expected Scene - Confirm -->
					{#if sceneTestResult === 'Expected'}
						<button
							onclick={() => createScene('Expected')}
							class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
						>
							✓ Begin Expected Scene
						</button>
					{/if}

					<!-- Interrupt Scene - Note -->
					{#if sceneTestResult === 'Interrupt'}
						<div class="p-3 bg-red-900/20 rounded border border-red-500/30">
							<div class="text-sm text-red-400 font-medium mb-1">⚠️ Scene Interrupted!</div>
							<div class="text-xs text-slate-400">
								A Random Event occurs. Generate the event first, then create the scene incorporating the interrupt.
							</div>
						</div>
						<button
							onclick={() => createScene('Interrupt')}
							class="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
						>
							✓ Create Interrupt Scene
						</button>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Scene History Timeline -->
	{#if scenes.length > 0}
		<div class="mt-6">
			<h4 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
				<span>📜</span>
				<span>Scene History</span>
			</h4>
			<div class="space-y-2 max-h-60 overflow-y-auto">
				{#each scenes.slice().reverse() as scene (scene.number)}
					<div class="p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-transparent hover:border-amber-500/30 transition-all {scene.number === currentSceneNumber ? 'ring-2 ring-amber-500/50' : ''}">
						<div class="flex items-center gap-2 mb-1">
							<span class="text-sm font-bold text-amber-400">Scene {scene.number}</span>
							<span class="px-2 py-0.5 bg-amber-600/20 text-amber-400 text-xs rounded">
								{scene.type}
							</span>
							{#if scene.number === currentSceneNumber}
								<span class="ml-auto px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded">
									Current
								</span>
							{/if}
						</div>
						<div class="text-xs text-slate-400 line-clamp-2">
							{scene.actualDescription || scene.expectedDescription || 'No description'}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Scene Bookkeeping Modal -->
{#if showBookkeepingModal}
	<SceneBookkeeping
		onClose={() => showBookkeepingModal = false}
		onComplete={() => showBookkeepingModal = false}
	/>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
