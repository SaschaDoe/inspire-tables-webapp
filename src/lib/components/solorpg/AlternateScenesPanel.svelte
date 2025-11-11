<script lang="ts">
	/**
	 * Alternate Scenes Panel (Phase 2B)
	 * Manage pre-planned scenes from Mythic Magazine Vol 2
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import type {
		AlternateScene,
		AlternateSceneTriggerType,
		AlternateSceneTriggerCondition
	} from '$lib/stores/soloRpgStore.svelte';

	// State
	let showAddForm = $state(false);
	let editingScene = $state<AlternateScene | null>(null);

	// Form fields
	let formTitle = $state('');
	let formDescription = $state('');
	let formTriggerType = $state<AlternateSceneTriggerType>('manual');
	let formRecurring = $state(false);

	// Trigger condition fields
	let formThreadId = $state('');
	let formChaosMin = $state<number | undefined>(undefined);
	let formChaosMax = $state<number | undefined>(undefined);
	let formSceneMin = $state<number | undefined>(undefined);

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let alternateScenes = $derived(currentSession?.alternateScenes || []);
	let threads = $derived(currentSession?.threads || []);
	let activeThreads = $derived(threads.filter((t) => !t.completed));

	// Getters
	function getThreadName(threadId?: string): string {
		if (!threadId) return 'Unknown';
		const thread = threads.find((t) => t.id === threadId);
		return thread?.text || 'Unknown Thread';
	}

	function getTriggerDescription(scene: AlternateScene): string {
		switch (scene.triggerType) {
			case 'manual':
				return 'Manual only';
			case 'auto':
				return 'Always check when setting up scenes';
			case 'thread':
				return scene.triggerCondition?.threadId
					? `When "${getThreadName(scene.triggerCondition.threadId)}" is active`
					: 'Thread trigger (not configured)';
			case 'chaos': {
				const { chaosMin, chaosMax } = scene.triggerCondition || {};
				if (chaosMin !== undefined && chaosMax !== undefined) {
					return `Chaos Factor ${chaosMin}-${chaosMax}`;
				} else if (chaosMin !== undefined) {
					return `Chaos Factor >= ${chaosMin}`;
				} else if (chaosMax !== undefined) {
					return `Chaos Factor <= ${chaosMax}`;
				}
				return 'Chaos trigger (not configured)';
			}
			case 'scene-count':
				return scene.triggerCondition?.sceneMin
					? `Scene ${scene.triggerCondition.sceneMin}+`
					: 'Scene count trigger (not configured)';
			default:
				return 'Unknown trigger';
		}
	}

	// Form actions
	function openAddForm() {
		resetForm();
		editingScene = null;
		showAddForm = true;
	}

	function openEditForm(scene: AlternateScene) {
		editingScene = scene;
		formTitle = scene.title;
		formDescription = scene.description;
		formTriggerType = scene.triggerType;
		formRecurring = scene.recurring;

		// Load trigger conditions
		if (scene.triggerCondition) {
			formThreadId = scene.triggerCondition.threadId || '';
			formChaosMin = scene.triggerCondition.chaosMin;
			formChaosMax = scene.triggerCondition.chaosMax;
			formSceneMin = scene.triggerCondition.sceneMin;
		} else {
			formThreadId = '';
			formChaosMin = undefined;
			formChaosMax = undefined;
			formSceneMin = undefined;
		}

		showAddForm = true;
	}

	function resetForm() {
		formTitle = '';
		formDescription = '';
		formTriggerType = 'manual';
		formRecurring = false;
		formThreadId = '';
		formChaosMin = undefined;
		formChaosMax = undefined;
		formSceneMin = undefined;
	}

	function closeForm() {
		showAddForm = false;
		editingScene = null;
		resetForm();
	}

	function saveScene() {
		if (!formTitle.trim()) return;

		// Build trigger condition
		let triggerCondition: AlternateSceneTriggerCondition | undefined = undefined;

		if (formTriggerType === 'thread' && formThreadId) {
			triggerCondition = { threadId: formThreadId };
		} else if (formTriggerType === 'chaos') {
			if (formChaosMin !== undefined || formChaosMax !== undefined) {
				triggerCondition = {
					chaosMin: formChaosMin,
					chaosMax: formChaosMax
				};
			}
		} else if (formTriggerType === 'scene-count' && formSceneMin !== undefined) {
			triggerCondition = { sceneMin: formSceneMin };
		}

		if (editingScene) {
			// Update existing
			soloRpgStore.updateAlternateScene(editingScene.id, {
				title: formTitle.trim(),
				description: formDescription.trim(),
				triggerType: formTriggerType,
				triggerCondition,
				recurring: formRecurring
			});
		} else {
			// Create new
			soloRpgStore.addAlternateScene(
				formTitle.trim(),
				formDescription.trim(),
				formTriggerType,
				triggerCondition,
				formRecurring
			);
		}

		closeForm();
	}

	function deleteScene(scene: AlternateScene) {
		if (confirm(`Delete alternate scene "${scene.title}"?`)) {
			soloRpgStore.removeAlternateScene(scene.id);
		}
	}

	function playScene(scene: AlternateScene) {
		// This will be handled by Phase 2C integration
		alert(`Playing scene "${scene.title}" will be implemented in Phase 2C`);
	}
</script>

<div class="alternate-scenes-panel bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/20 shadow-xl">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center gap-3">
			<span class="text-3xl">🔑</span>
			<div>
				<h3 class="text-xl font-bold text-white">Alternate Scenes</h3>
				<p class="text-sm text-slate-400">Pre-planned scenes that may occur</p>
			</div>
		</div>
		<button
			onclick={openAddForm}
			class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
		>
			+ Add Scene
		</button>
	</div>

	<!-- Info Box -->
	{#if alternateScenes.length === 0 && !showAddForm}
		<div class="p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-lg text-center">
			<div class="text-4xl mb-3">🎭</div>
			<h4 class="text-lg font-bold text-indigo-300 mb-2">No Alternate Scenes Yet</h4>
			<p class="text-sm text-slate-300 mb-4">
				Alternate Scenes are pre-planned scenes you want to potentially occur during your adventure.
				They can trigger automatically based on conditions, or be used when an Altered Scene is rolled.
			</p>
			<button
				onclick={openAddForm}
				class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
			>
				Create Your First Alternate Scene
			</button>
		</div>
	{/if}

	<!-- Scenes List -->
	{#if alternateScenes.length > 0}
		<div class="space-y-3 mb-6">
			{#each alternateScenes as scene (scene.id)}
				<div
					class="group p-4 bg-slate-800/50 hover:bg-slate-800/70 rounded-lg border transition-all {scene.used && !scene.recurring
						? 'border-slate-600 opacity-60'
						: 'border-indigo-500/30 hover:border-indigo-500'}"
				>
					<!-- Scene Header -->
					<div class="flex items-start justify-between mb-2">
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-1">
								<h4 class="text-lg font-bold text-white">{scene.title}</h4>
								{#if scene.recurring}
									<span
										class="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded border border-purple-500/30"
										title="This scene can trigger multiple times"
									>
										♻️ Recurring
									</span>
								{/if}
								{#if scene.used}
									<span
										class="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded border border-green-500/30"
									>
										✓ Used in Scene {scene.usedInScene}
									</span>
								{/if}
							</div>
						</div>

						<!-- Actions -->
						<div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								onclick={() => openEditForm(scene)}
								class="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
								title="Edit scene"
							>
								✏️ Edit
							</button>
							<button
								onclick={() => playScene(scene)}
								class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
								title="Use this scene now"
							>
								▶ Play
							</button>
							<button
								onclick={() => deleteScene(scene)}
								class="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded transition-colors"
								title="Delete scene"
							>
								🗑️
							</button>
						</div>
					</div>

					<!-- Description -->
					<p class="text-sm text-slate-300 mb-3">{scene.description}</p>

					<!-- Trigger Info -->
					<div class="flex items-center gap-4 text-xs">
						<div class="flex items-center gap-1.5">
							<span class="text-slate-500">Trigger:</span>
							<span class="text-indigo-400 font-medium">{getTriggerDescription(scene)}</span>
						</div>
						<div class="flex items-center gap-1.5 text-slate-500">
							<span>Created in Scene {scene.createdInScene}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Add/Edit Form Modal -->
	{#if showAddForm}
		<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div
				class="bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full border border-indigo-500/30 max-h-[90vh] overflow-y-auto"
			>
				<!-- Form Header -->
				<div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-lg">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<span class="text-4xl">🔑</span>
							<div>
								<h2 class="text-2xl font-bold text-white">
									{editingScene ? 'Edit' : 'Create'} Alternate Scene
								</h2>
								<p class="text-purple-100 text-sm mt-1">
									Pre-plan a scene that may occur during your adventure
								</p>
							</div>
						</div>
						<button
							onclick={closeForm}
							class="text-white/80 hover:text-white text-3xl leading-none"
							aria-label="Close"
						>
							×
						</button>
					</div>
				</div>

				<!-- Form Content -->
				<div class="p-6 space-y-4">
					<!-- Title -->
					<div>
						<label for="scene-title" class="block text-sm font-medium text-white mb-2">
							Scene Title *
						</label>
						<input
							id="scene-title"
							type="text"
							bind:value={formTitle}
							placeholder="e.g., 'The Betrayal', 'Ambush at the Bridge'"
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
						/>
					</div>

					<!-- Description -->
					<div>
						<label for="scene-desc" class="block text-sm font-medium text-white mb-2">
							Scene Description *
						</label>
						<textarea
							id="scene-desc"
							bind:value={formDescription}
							placeholder="Describe what happens in this scene..."
							rows="4"
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none resize-none"
						></textarea>
					</div>

					<!-- Trigger Type -->
					<div>
						<label for="trigger-type" class="block text-sm font-medium text-white mb-2">
							Trigger Type
						</label>
						<select
							id="trigger-type"
							bind:value={formTriggerType}
							class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
						>
							<option value="manual">Manual Only</option>
							<option value="auto">Always Check (Auto-suggest)</option>
							<option value="thread">Thread-Based</option>
							<option value="chaos">Chaos Factor Range</option>
							<option value="scene-count">Scene Number Minimum</option>
						</select>
						<p class="text-xs text-slate-400 mt-1">
							{#if formTriggerType === 'manual'}
								You must manually choose to play this scene
							{:else if formTriggerType === 'auto'}
								This scene will always be suggested when setting up new scenes
							{:else if formTriggerType === 'thread'}
								This scene triggers when a specific thread is active
							{:else if formTriggerType === 'chaos'}
								This scene triggers when Chaos Factor is within a range
							{:else if formTriggerType === 'scene-count'}
								This scene triggers after reaching a minimum scene number
							{/if}
						</p>
					</div>

					<!-- Trigger Conditions -->
					{#if formTriggerType === 'thread'}
						<div class="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
							<label for="thread-select" class="block text-sm font-medium text-indigo-300 mb-2">
								Required Thread
							</label>
							<select
								id="thread-select"
								bind:value={formThreadId}
								class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
							>
								<option value="">-- Select Thread --</option>
								{#each activeThreads as thread}
									<option value={thread.id}>{thread.text}</option>
								{/each}
							</select>
							<p class="text-xs text-slate-400 mt-2">
								Scene will trigger when this thread is active (not completed)
							</p>
						</div>
					{/if}

					{#if formTriggerType === 'chaos'}
						<div class="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg space-y-3">
							<p class="text-sm font-medium text-indigo-300 mb-2">Chaos Factor Range</p>
							<div class="grid grid-cols-2 gap-3">
								<div>
									<label for="chaos-min" class="block text-xs text-slate-400 mb-1">
										Minimum (optional)
									</label>
									<input
										id="chaos-min"
										type="number"
										min="1"
										max="9"
										bind:value={formChaosMin}
										placeholder="1-9"
										class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
									/>
								</div>
								<div>
									<label for="chaos-max" class="block text-xs text-slate-400 mb-1">
										Maximum (optional)
									</label>
									<input
										id="chaos-max"
										type="number"
										min="1"
										max="9"
										bind:value={formChaosMax}
										placeholder="1-9"
										class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
									/>
								</div>
							</div>
							<p class="text-xs text-slate-400">
								Scene triggers when CF is within this range. Leave blank for no limit on that side.
							</p>
						</div>
					{/if}

					{#if formTriggerType === 'scene-count'}
						<div class="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
							<label for="scene-min" class="block text-sm font-medium text-indigo-300 mb-2">
								Minimum Scene Number
							</label>
							<input
								id="scene-min"
								type="number"
								min="1"
								bind:value={formSceneMin}
								placeholder="e.g., 5"
								class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
							/>
							<p class="text-xs text-slate-400 mt-2">
								Scene will trigger starting from this scene number
							</p>
						</div>
					{/if}

					<!-- Recurring Checkbox -->
					<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
						<label class="flex items-start gap-3 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={formRecurring}
								class="mt-1 w-4 h-4 rounded border-purple-500 bg-slate-800 text-purple-600"
							/>
							<div>
								<div class="text-sm font-medium text-purple-300">Recurring Scene</div>
								<div class="text-xs text-slate-400 mt-1">
									This scene can trigger/be used multiple times throughout the adventure
								</div>
							</div>
						</label>
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-2 pt-2">
						<button
							onclick={saveScene}
							disabled={!formTitle.trim() || !formDescription.trim()}
							class="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
						>
							{editingScene ? 'Update' : 'Create'} Scene
						</button>
						<button
							onclick={closeForm}
							class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
