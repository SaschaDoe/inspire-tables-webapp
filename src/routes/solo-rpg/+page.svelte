<script lang="ts">
	// This is the main Solo RPG interface page
	// Based on Mythic GME (Game Master Emulator) 2nd Edition

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import ChaosFactorPanel from '$lib/components/solorpg/ChaosFactorPanel.svelte';
	import FateQuestion from '$lib/components/solorpg/FateQuestion.svelte';
	import ListsPanel from '$lib/components/solorpg/ListsPanel.svelte';
	import RandomEventGenerator from '$lib/components/solorpg/RandomEventGenerator.svelte';
	import SceneManager from '$lib/components/solorpg/SceneManager.svelte';
	import SessionManager from '$lib/components/solorpg/SessionManager.svelte';
	import MeaningDiscovery from '$lib/components/solorpg/MeaningDiscovery.svelte';
	import SessionHistory from '$lib/components/solorpg/SessionHistory.svelte';
	import FirstSceneHelp from '$lib/components/solorpg/FirstSceneHelp.svelte';
	import FourWGenerator from '$lib/components/solorpg/FourWGenerator.svelte';
	import LocationCrafterPanel from '$lib/components/solorpg/LocationCrafterPanel.svelte';
	import MysteryMatrixPanel from '$lib/components/solorpg/MysteryMatrixPanel.svelte';
	import KeyedScenesPanel from '$lib/components/solorpg/KeyedScenesPanel.svelte';

	let activeTab = $state<'play' | 'tables' | 'location' | 'mystery' | 'reference'>('play');
	let showSessionManager = $state(false);
	let showRandomEventModal = $state(false);
	let showMeaningDiscovery = $state(false);
	let showSessionHistory = $state(false);
	let showFirstSceneHelp = $state(false);
	let showFourWGenerator = $state(false);

	// Derived state
	let hasSession = $derived(soloRpgStore.currentSession !== null);
	let sessionName = $derived(soloRpgStore.currentSession?.adventureName || '');
	let isMysteryMode = $derived(!!soloRpgStore.currentSession?.mysteryThread);

	function quickStart() {
		soloRpgStore.createSession('Quick Adventure', 'A quick solo adventure session');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950">
	<!-- Header -->
	<div class="bg-slate-900/50 backdrop-blur-xl border-b border-orange-500/20">
		<div class="container mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<a href="/" class="text-orange-400 hover:text-orange-300 transition-colors">
						← Back
					</a>
					<div class="flex items-center gap-3">
						<span class="text-5xl">🎮</span>
						<div>
							<h1 class="text-3xl font-bold text-white">Solo RPG</h1>
							<p class="text-sm text-orange-300">
								{#if hasSession}
									{sessionName}
								{:else}
									Mythic Game Master Emulator
								{/if}
							</p>
						</div>
					</div>
				</div>

				<!-- Quick Actions -->
				<div class="flex gap-2 flex-wrap">
					<button
						onclick={() => showSessionManager = true}
						class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
					>
						💾 Manage Sessions
					</button>
					<button
						onclick={() => showFirstSceneHelp = true}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
						title="Learn how to start your adventure"
					>
						📖 First Scene Help
					</button>
					{#if hasSession}
						<button
							onclick={() => showSessionHistory = true}
							class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
						>
							📜 History
						</button>
						<button
							onclick={() => showFourWGenerator = true}
							class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
							title="Generate First Scene using 4W method"
						>
							🗺️ 4W Generator
						</button>
						<button
							onclick={() => showMeaningDiscovery = true}
							class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
						>
							🎲 Discover Meaning
						</button>
						<a
							href="/tables"
							class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
						>
							📊 Browse Tables
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="border-b border-orange-500/20 bg-slate-900/30">
		<div class="container mx-auto px-4">
			<div class="flex gap-1">
				<button
					class="px-6 py-3 font-medium transition-colors relative {activeTab === 'play' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-300'}"
					onclick={() => activeTab = 'play'}
				>
					🎮 Play
					{#if activeTab === 'play'}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"></div>
					{/if}
				</button>
				<button
					class="px-6 py-3 font-medium transition-colors relative {activeTab === 'tables' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-300'}"
					onclick={() => activeTab = 'tables'}
				>
					📊 Quick Tables
					{#if activeTab === 'tables'}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"></div>
					{/if}
				</button>
				<button
					class="px-6 py-3 font-medium transition-colors relative {activeTab === 'location' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-300'}"
					onclick={() => activeTab = 'location'}
				>
					🗺️ Location Crafter
					{#if activeTab === 'location'}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"></div>
					{/if}
				</button>
				<button
					class="px-6 py-3 font-medium transition-colors relative {activeTab === 'mystery' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-300'}"
					onclick={() => activeTab = 'mystery'}
				>
					🔍 Mystery Matrix
					{#if isMysteryMode}
						<span class="ml-1 px-1.5 py-0.5 bg-purple-600 text-purple-200 text-[10px] font-bold rounded">ACTIVE</span>
					{/if}
					{#if activeTab === 'mystery'}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"></div>
					{/if}
				</button>
				<button
					class="px-6 py-3 font-medium transition-colors relative {activeTab === 'reference' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-300'}"
					onclick={() => activeTab = 'reference'}
				>
					📖 Rules Reference
					{#if activeTab === 'reference'}
						<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"></div>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="container mx-auto px-4 py-8">
		{#if activeTab === 'play'}
			<!-- Play Tab Content -->
			{#if !hasSession}
				<!-- Welcome / No Session -->
				<div class="text-center py-20">
					<div class="text-8xl mb-6">🎲</div>
					<h2 class="text-4xl font-bold text-white mb-4">Welcome to Solo RPG Mode</h2>
					<p class="text-xl text-orange-200 mb-8 max-w-2xl mx-auto">
						Use the Mythic Game Master Emulator to play tabletop RPGs solo or GM-less. Ask fate questions, generate random events, and create epic adventures!
					</p>
					<div class="flex gap-4 justify-center">
						<button
							onclick={quickStart}
							class="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xl font-bold rounded-xl shadow-2xl transition-all hover:scale-105"
						>
							🎲 Quick Start
						</button>
						<button
							onclick={() => showSessionManager = true}
							class="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-xl font-bold rounded-xl shadow-2xl transition-all"
						>
							⚙️ Custom Session
						</button>
					</div>
				</div>
			{:else}
				<!-- Active Game Session -->
				<div class="grid lg:grid-cols-[300px_1fr] gap-6">
					<!-- Left Sidebar - Chaos Factor -->
					<div class="space-y-6">
						<ChaosFactorPanel />

						<!-- Session Stats Card -->
						<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 border border-orange-500/20">
							<h3 class="text-sm font-bold text-white mb-3">Session Stats</h3>
							<div class="space-y-2 text-xs">
								<div class="flex justify-between text-slate-400">
									<span>Scene:</span>
									<span class="text-orange-400 font-medium">{soloRpgStore.currentSession?.currentSceneNumber || 0}</span>
								</div>
								<div class="flex justify-between text-slate-400">
									<span>Threads:</span>
									<span class="text-purple-400 font-medium">{soloRpgStore.activeThreads.length}</span>
								</div>
								<div class="flex justify-between text-slate-400">
									<span>Characters:</span>
									<span class="text-cyan-400 font-medium">{soloRpgStore.activeCharacters.length}</span>
								</div>
								<div class="flex justify-between text-slate-400">
									<span>Questions Asked:</span>
									<span class="text-green-400 font-medium">{soloRpgStore.currentSession?.fateQuestionHistory.length || 0}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Main Play Area -->
					<div class="space-y-6">
						<!-- Scene Manager -->
						<SceneManager onRandomEventNeeded={() => showRandomEventModal = true} />

						<!-- Keyed Scenes Panel -->
						<KeyedScenesPanel />

						<!-- Fate Question -->
						<FateQuestion onRandomEventTriggered={() => showRandomEventModal = true} />

						<!-- Lists Panel -->
						<ListsPanel />
					</div>
				</div>
			{/if}
		{:else if activeTab === 'tables'}
			<!-- Quick Tables Tab Content -->
			<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/20">
				<h2 class="text-2xl font-bold text-white mb-4">Quick Tables</h2>
				<p class="text-orange-200 mb-6">Fast access to the most commonly used Mythic tables</p>

				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div class="bg-slate-800/50 p-4 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-colors cursor-pointer">
						<div class="text-3xl mb-2">🎯</div>
						<h3 class="font-bold text-white mb-1">Fate Chart</h3>
						<p class="text-sm text-slate-400">Ask yes/no questions</p>
					</div>
					<div class="bg-slate-800/50 p-4 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-colors cursor-pointer">
						<div class="text-3xl mb-2">⚡</div>
						<h3 class="font-bold text-white mb-1">Event Focus</h3>
						<p class="text-sm text-slate-400">Determine event type</p>
					</div>
					<div class="bg-slate-800/50 p-4 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-colors cursor-pointer">
						<div class="text-3xl mb-2">🎬</div>
						<h3 class="font-bold text-white mb-1">Scene Adjustment</h3>
						<p class="text-sm text-slate-400">Modify expected scenes</p>
					</div>
					<div class="bg-slate-800/50 p-4 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-colors cursor-pointer">
						<div class="text-3xl mb-2">🎭</div>
						<h3 class="font-bold text-white mb-1">Actions</h3>
						<p class="text-sm text-slate-400">Action meaning tables</p>
					</div>
					<div class="bg-slate-800/50 p-4 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-colors cursor-pointer">
						<div class="text-3xl mb-2">✨</div>
						<h3 class="font-bold text-white mb-1">Descriptions</h3>
						<p class="text-sm text-slate-400">Descriptive meaning tables</p>
					</div>
					<div class="bg-slate-800/50 p-4 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-colors cursor-pointer">
						<div class="text-3xl mb-2">👤</div>
						<h3 class="font-bold text-white mb-1">Characters</h3>
						<p class="text-sm text-slate-400">Character elements</p>
					</div>
				</div>

				<div class="mt-6 text-center">
					<a href="/tables" class="text-orange-400 hover:text-orange-300 font-medium">
						Browse All 42 Mythic Tables →
					</a>
				</div>
			</div>
		{:else if activeTab === 'location'}
			<!-- Location Crafter Tab Content -->
			{#if !hasSession}
				<!-- No Session - Prompt to create one -->
				<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/20">
					<div class="text-center py-12">
						<div class="text-6xl mb-4">🗺️</div>
						<h2 class="text-2xl font-bold text-white mb-4">Location Crafter</h2>
						<p class="text-orange-200 mb-6 max-w-2xl mx-auto">
							Randomized location generation system from Mythic Magazine Volume 2. Create and explore procedurally generated regions, areas, and encounters.
						</p>
						<p class="text-slate-400 mb-6">Create or load a session to use Location Crafter.</p>
						<div class="flex gap-4 justify-center">
							<button
								onclick={quickStart}
								class="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transition-all"
							>
								🎲 Quick Start
							</button>
							<button
								onclick={() => showSessionManager = true}
								class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all"
							>
								⚙️ Manage Sessions
							</button>
						</div>
					</div>
				</div>
			{:else}
				<!-- Location Crafter Panel -->
				<div class="h-[calc(100vh-16rem)]">
					<LocationCrafterPanel />
				</div>
			{/if}
		{:else if activeTab === 'mystery'}
			<!-- Mystery Matrix Tab Content -->
			{#if !hasSession}
				<!-- No Session - Prompt to create one -->
				<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/20">
					<div class="text-center py-12 max-w-3xl mx-auto">
						<div class="text-6xl mb-4">🔍</div>
						<h2 class="text-3xl font-bold text-white mb-3">Mystery Matrix</h2>
						<p class="text-lg text-orange-200 mb-6">
							Investigation system from Mythic Magazine Volume 6
						</p>
						<div class="bg-slate-800/50 rounded-xl p-6 mb-6 text-left">
							<p class="text-slate-300 mb-4">
								The Mystery Matrix helps you track and solve mysteries in your solo RPG adventures by visualizing:
							</p>
							<ul class="space-y-2 text-slate-300">
								<li class="flex items-start gap-2">
									<span class="text-blue-400">📎</span> <span><strong>Clues</strong> you discover</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-red-400">👤</span> <span><strong>Suspects</strong> you investigate</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-purple-400">🔗</span> <span><strong>Links</strong> connecting clues to suspects</span>
								</li>
							</ul>
						</div>
						<p class="text-slate-400 mb-6">Create or load a session to start using the Mystery Matrix.</p>
						<div class="flex gap-4 justify-center">
							<button
								onclick={quickStart}
								class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transition-all"
							>
								🎲 Quick Start
							</button>
							<button
								onclick={() => showSessionManager = true}
								class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all"
							>
								⚙️ Manage Sessions
							</button>
						</div>
					</div>
				</div>
			{:else if !isMysteryMode}
				<!-- Session Active but Mystery Not Activated -->
				<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/20">
					<div class="py-8 max-w-4xl mx-auto">
						<div class="text-center mb-8">
							<div class="text-6xl mb-4">🔍</div>
							<h2 class="text-3xl font-bold text-white mb-3">Mystery Matrix</h2>
							<p class="text-lg text-orange-200">
								Investigation system from Mythic Magazine Volume 6
							</p>
						</div>

						<div class="bg-slate-800/50 rounded-xl p-6 mb-6">
							<h3 class="text-xl font-bold text-purple-300 mb-4">What is the Mystery Matrix?</h3>
							<p class="text-slate-300 mb-4">
								The Mystery Matrix is a visual investigation tool that helps you solve mysteries in your solo RPG adventures. It tracks:
							</p>
							<ul class="space-y-2 text-slate-300 mb-4">
								<li class="flex items-start gap-2">
									<span class="text-blue-400 font-bold">📎</span>
									<span><strong class="text-blue-300">Clues</strong> - Evidence, facts, and information you discover (20 slots)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-red-400 font-bold">👤</span>
									<span><strong class="text-red-300">Suspects</strong> - People of interest in your investigation (10 slots)</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-purple-400 font-bold">🔗</span>
									<span><strong class="text-purple-300">Links</strong> - Connections between clues and suspects that build your case</span>
								</li>
							</ul>
							<p class="text-slate-300">
								As you link clues to suspects, they accumulate "Clue Points". When a suspect reaches 6 clue points, you've solved the mystery!
							</p>
						</div>

						<div class="bg-slate-800/50 rounded-xl p-6 mb-6">
							<h3 class="text-xl font-bold text-purple-300 mb-4">How to Activate Mystery Mode</h3>
							<div class="space-y-4">
								<div class="flex items-start gap-4">
									<div class="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
									<div>
										<p class="text-white font-medium mb-1">Go to the Play tab</p>
										<p class="text-slate-400 text-sm">Navigate to the main Play tab where you manage your adventure</p>
									</div>
								</div>
								<div class="flex items-start gap-4">
									<div class="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
									<div>
										<p class="text-white font-medium mb-1">Create or select a Thread</p>
										<p class="text-slate-400 text-sm">In the Threads section, either create a new thread like "Investigate the murder" or use an existing one</p>
									</div>
								</div>
								<div class="flex items-start gap-4">
									<div class="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
									<div>
										<p class="text-white font-medium mb-1">Click the 🔍 button</p>
										<p class="text-slate-400 text-sm">Hover over your thread and click the 🔍 magnifying glass button that appears on the right</p>
									</div>
								</div>
								<div class="flex items-start gap-4">
									<div class="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
									<div>
										<p class="text-white font-medium mb-1">Confirm activation</p>
										<p class="text-slate-400 text-sm">Confirm the conversion - this will activate the Mystery Matrix and enable special investigation features</p>
									</div>
								</div>
							</div>
						</div>

						<div class="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 mb-6">
							<h4 class="text-lg font-bold text-blue-300 mb-2">💡 Pro Tip</h4>
							<p class="text-slate-300 text-sm">
								When Mystery Mode is active, Random Events will use a special Mystery Event Focus table that can give you free clue and suspect discoveries!
							</p>
						</div>

						<div class="text-center">
							<button
								onclick={() => activeTab = 'play'}
								class="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg transition-all hover:scale-105"
							>
								🎮 Go to Play Tab
							</button>
						</div>
					</div>
				</div>
			{:else}
				<!-- Mystery Matrix Panel -->
				<div class="h-[calc(100vh-16rem)]">
					<MysteryMatrixPanel />
				</div>
			{/if}
		{:else if activeTab === 'reference'}
			<!-- Rules Reference Tab Content -->
			<div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/20">
				<h2 class="text-2xl font-bold text-white mb-4">Mythic GME Quick Reference</h2>
				<div class="space-y-6 text-orange-100">
					<div>
						<h3 class="text-xl font-bold text-orange-300 mb-2">🎯 Fate Questions</h3>
						<p class="mb-2">Ask yes/no questions to the Game Master Emulator:</p>
						<ol class="list-decimal list-inside space-y-1 ml-4">
							<li>Phrase your question</li>
							<li>Determine the odds (Impossible to Certain)</li>
							<li>Check current Chaos Factor (1-9)</li>
							<li>Roll d100 and compare to Fate Chart</li>
							<li>Interpret the answer (Yes, No, Exceptional)</li>
						</ol>
					</div>

					<div>
						<h3 class="text-xl font-bold text-orange-300 mb-2">🎲 Chaos Factor</h3>
						<p>Tracks how chaotic/unpredictable the adventure is (1 = ordered, 9 = chaotic). Affects fate question probabilities and random event frequency.</p>
					</div>

					<div>
						<h3 class="text-xl font-bold text-orange-300 mb-2">⚡ Random Events</h3>
						<p class="mb-2">Triggered when rolling doubles on d100 AND the single digit ≤ Chaos Factor:</p>
						<ol class="list-decimal list-inside space-y-1 ml-4">
							<li>Roll on Event Focus table</li>
							<li>Roll on appropriate Lists if needed</li>
							<li>Roll 2x on Meaning Tables</li>
							<li>Interpret and apply to story</li>
						</ol>
					</div>

					<div>
						<h3 class="text-xl font-bold text-orange-300 mb-2">📋 Lists</h3>
						<p>Maintain two lists (max 25 entries each):</p>
						<ul class="list-disc list-inside space-y-1 ml-4">
							<li><strong>Threads:</strong> Story goals and plot lines</li>
							<li><strong>Characters:</strong> NPCs and important people</li>
						</ul>
					</div>

					<div>
						<h3 class="text-xl font-bold text-orange-300 mb-2">🎬 Scenes</h3>
						<p class="mb-2">Structure your adventure into scenes:</p>
						<ol class="list-decimal list-inside space-y-1 ml-4">
							<li>Describe expected scene</li>
							<li>Roll d10 vs Chaos Factor</li>
							<li>If ≤ CF: Altered Scene (roll adjustment)</li>
							<li>If ≤ CF/2: Interrupt Scene (random event)</li>
							<li>Otherwise: Expected Scene</li>
						</ol>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Random Event Modal -->
{#if showRandomEventModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
		<div class="bg-slate-900 rounded-2xl p-8 border border-orange-500/30 shadow-2xl max-w-3xl w-full my-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold text-white">Random Event Generator</h2>
				<button
					onclick={() => showRandomEventModal = false}
					class="text-slate-400 hover:text-white transition-colors"
					aria-label="Close"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>

			<RandomEventGenerator
				onComplete={() => showRandomEventModal = false}
			/>
		</div>
	</div>
{/if}

<!-- Session Manager Modal -->
{#if showSessionManager}
	<SessionManager onClose={() => showSessionManager = false} />
{/if}

<!-- Meaning Discovery Modal -->
<MeaningDiscovery
	isOpen={showMeaningDiscovery}
	onClose={() => showMeaningDiscovery = false}
/>

<!-- Session History Modal -->
<SessionHistory
	isOpen={showSessionHistory}
	onClose={() => showSessionHistory = false}
/>

<!-- First Scene Help Modal -->
<FirstSceneHelp
	isOpen={showFirstSceneHelp}
	onClose={() => showFirstSceneHelp = false}
/>

<!-- 4W Generator Modal -->
<FourWGenerator
	isOpen={showFourWGenerator}
	onClose={() => showFourWGenerator = false}
/>
