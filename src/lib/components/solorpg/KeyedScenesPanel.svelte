<script lang="ts">
	/**
	 * Keyed Scenes Panel (Mythic Magazine Vol 2)
	 * Manage keyed scenes with events and triggers
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import {
		rollKeyedSceneEvent,
		rollKeyedSceneTrigger,
		getKeyedSceneGuidance
	} from '$lib/tables/mythicTables/keyedSceneTables';

	// State for adding new keyed scene
	let showAddForm = $state(false);
	let newEvent = $state('');
	let newTrigger = $state('');
	let editingSceneId = $state<string | null>(null);
	let editingEvent = $state<{[key: string]: string}>({});
	let editingTrigger = $state<{[key: string]: string}>({});

	// Derived
	let keyedScenes = $derived(soloRpgStore.currentSession?.keyedScenes || []);
	let activeScenes = $derived(keyedScenes.filter(s => !s.used));
	let usedScenes = $derived(keyedScenes.filter(s => s.used));

	function addKeyedScene() {
		if (!newEvent.trim() || !newTrigger.trim()) return;
		soloRpgStore.addKeyedScene(newEvent.trim(), newTrigger.trim());
		newEvent = '';
		newTrigger = '';
		showAddForm = false;
	}

	function removeKeyedScene(id: string) {
		if (confirm('Remove this keyed scene?')) {
			soloRpgStore.removeKeyedScene(id);
		}
	}

	function toggleSceneEdit(id: string) {
		if (editingSceneId === id) {
			editingSceneId = null;
		} else {
			editingSceneId = id;
			const scene = keyedScenes.find(s => s.id === id);
			if (scene) {
				editingEvent[id] = scene.event;
				editingTrigger[id] = scene.trigger;
			}
		}
	}

	function saveScene(id: string) {
		const event = editingEvent[id];
		const trigger = editingTrigger[id];
		if (event && trigger) {
			soloRpgStore.updateKeyedScene(id, { event, trigger });
		}
		editingSceneId = null;
	}

	function markSceneUsed(id: string) {
		if (confirm('Mark this keyed scene as used?')) {
			soloRpgStore.markKeyedSceneUsed(id);
		}
	}

	function rollEvent() {
		const result = rollKeyedSceneEvent();
		newEvent = result.event;
	}

	function rollTrigger() {
		const result = rollKeyedSceneTrigger();
		newTrigger = result.trigger;
	}
</script>

<div class="keyed-scenes-panel bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/20 shadow-xl">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<span class="text-3xl">🎬</span>
			<div>
				<h3 class="text-xl font-bold text-white">Keyed Scenes</h3>
				<p class="text-xs text-slate-400">Special scenes that trigger when conditions are met</p>
			</div>
		</div>
		<button
			onclick={() => showAddForm = !showAddForm}
			class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
		>
			+ Add
		</button>
	</div>

	<!-- Add Form -->
	{#if showAddForm}
		<div class="mb-4 p-4 bg-slate-800/50 rounded-lg border border-orange-500/30">
			<div class="space-y-3">
				<div>
					<div class="flex items-center justify-between mb-2">
						<label class="block text-sm font-medium text-orange-300">Event (What happens)</label>
						<button
							onclick={rollEvent}
							class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
							title="Roll for random event"
						>
							🎲 Roll
						</button>
					</div>
					<textarea
						bind:value={newEvent}
						placeholder="Character must find emotional support or break down..."
						class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
						rows="2"
					></textarea>
				</div>

				<div>
					<div class="flex items-center justify-between mb-2">
						<label class="block text-sm font-medium text-blue-300">Trigger (When it activates)</label>
						<button
							onclick={rollTrigger}
							class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
							title="Roll for random trigger"
						>
							🎲 Roll
						</button>
					</div>
					<textarea
						bind:value={newTrigger}
						placeholder="When Chaos Factor reaches 5 or more..."
						class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
						rows="2"
					></textarea>
				</div>

				<div class="flex gap-2">
					<button
						onclick={addKeyedScene}
						disabled={!newEvent.trim() || !newTrigger.trim()}
						class="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
					>
						Add Keyed Scene
					</button>
					<button
						onclick={() => {
							showAddForm = false;
							newEvent = '';
							newTrigger = '';
						}}
						class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Active Keyed Scenes -->
	{#if activeScenes.length === 0 && usedScenes.length === 0}
		<div class="text-center py-8 text-slate-400">
			<div class="text-6xl mb-3">🎬</div>
			<p class="text-sm mb-2">No keyed scenes yet</p>
			<p class="text-xs max-w-md mx-auto mb-4">
				{getKeyedSceneGuidance()}
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			<!-- Active Scenes -->
			{#if activeScenes.length > 0}
				<div class="text-sm font-bold text-orange-300 mb-2">Active Scenes ({activeScenes.length})</div>
				{#each activeScenes as scene (scene.id)}
					<div class="group bg-slate-800/30 hover:bg-slate-800/50 rounded-lg border border-orange-500/30 transition-all">
						<div class="p-3">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<!-- Event Column -->
								<div class="space-y-1">
									<div class="flex items-center justify-between">
										<div class="text-xs font-bold text-orange-300 uppercase">Event</div>
										{#if editingSceneId !== scene.id}
											<button
												onclick={() => toggleSceneEdit(scene.id)}
												class="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-white transition-opacity"
											>
												✏️ Edit
											</button>
										{/if}
									</div>
									{#if editingSceneId === scene.id}
										<textarea
											bind:value={editingEvent[scene.id]}
											class="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-orange-500"
											rows="3"
										></textarea>
									{:else}
										<p class="text-sm text-white">{scene.event}</p>
									{/if}
								</div>

								<!-- Trigger Column -->
								<div class="space-y-1">
									<div class="text-xs font-bold text-blue-300 uppercase">Trigger</div>
									{#if editingSceneId === scene.id}
										<textarea
											bind:value={editingTrigger[scene.id]}
											class="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-blue-500"
											rows="3"
										></textarea>
									{:else}
										<p class="text-sm text-slate-300">{scene.trigger}</p>
									{/if}
								</div>
							</div>

							<!-- Actions -->
							<div class="flex gap-2 mt-3">
								{#if editingSceneId === scene.id}
									<button
										onclick={() => saveScene(scene.id)}
										class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
									>
										Save
									</button>
									<button
										onclick={() => editingSceneId = null}
										class="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
									>
										Cancel
									</button>
								{:else}
									<button
										onclick={() => markSceneUsed(scene.id)}
										class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
									>
										✓ Mark Used
									</button>
								{/if}
								<button
									onclick={() => removeKeyedScene(scene.id)}
									class="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
								>
									Remove
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}

			<!-- Used Scenes -->
			{#if usedScenes.length > 0}
				<details class="mt-4">
					<summary class="text-sm font-bold text-slate-400 cursor-pointer hover:text-slate-300 mb-2">
						Used Scenes ({usedScenes.length})
					</summary>
					<div class="space-y-2 mt-2">
						{#each usedScenes as scene (scene.id)}
							<div class="bg-slate-800/20 rounded-lg border border-slate-600/30 p-3 opacity-60">
								<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
									<div>
										<div class="font-bold text-slate-400 mb-1">EVENT</div>
										<p class="text-slate-400">{scene.event}</p>
									</div>
									<div>
										<div class="font-bold text-slate-400 mb-1">TRIGGER</div>
										<p class="text-slate-400">{scene.trigger}</p>
									</div>
								</div>
								{#if scene.usedInScene}
									<div class="text-xs text-slate-500 mt-2">Used in Scene #{scene.usedInScene}</div>
								{/if}
							</div>
						{/each}
					</div>
				</details>
			{/if}
		</div>
	{/if}
</div>
