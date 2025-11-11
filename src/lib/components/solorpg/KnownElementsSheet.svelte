<script lang="ts">
	/**
	 * Known Elements Sheet Component (Phase 4D)
	 * Manages the Known Elements list for a region
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import type { Region, KnownElement } from '$lib/stores/soloRpgStore.svelte';

	interface Props {
		regionId: string;
	}

	let { regionId }: Props = $props();

	// State
	let showAddForm = $state(false);
	let newElementName = $state('');
	let newElementCategory = $state<'Locations' | 'Encounters' | 'Objects'>('Locations');
	let editingId = $state<string | null>(null);
	let editingName = $state('');

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let region = $derived(
		currentSession?.regions.find((r: Region) => r.id === regionId) || null
	);
	let knownElements = $derived(region?.knownElements || []);
	let sortedElements = $derived(
		[...knownElements].sort((a, b) => a.position - b.position)
	);

	// Group by category
	let locationElements = $derived(sortedElements.filter((e) => e.category === 'Locations'));
	let encounterElements = $derived(sortedElements.filter((e) => e.category === 'Encounters'));
	let objectElements = $derived(sortedElements.filter((e) => e.category === 'Objects'));

	function addElement() {
		if (!newElementName.trim()) return;
		soloRpgStore.addKnownElement(regionId, newElementName.trim(), newElementCategory);
		newElementName = '';
		showAddForm = false;
	}

	function startEditing(element: KnownElement) {
		editingId = element.id;
		editingName = element.name;
	}

	function saveEdit(elementId: string) {
		if (!editingName.trim()) {
			cancelEdit();
			return;
		}
		soloRpgStore.updateKnownElement(regionId, elementId, editingName.trim());
		cancelEdit();
	}

	function cancelEdit() {
		editingId = null;
		editingName = '';
	}

	function toggleCrossed(elementId: string) {
		soloRpgStore.toggleKnownElementCrossed(regionId, elementId);
	}

	function deleteElement(elementId: string) {
		if (confirm('Delete this Known Element?')) {
			soloRpgStore.deleteKnownElement(regionId, elementId);
		}
	}

	const categoryIcons = {
		Locations: '📍',
		Encounters: '⚔️',
		Objects: '🎁'
	};

	const categoryColors = {
		Locations: 'emerald',
		Encounters: 'red',
		Objects: 'yellow'
	};
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="text-2xl">📋</span>
			<h3 class="text-lg font-bold text-slate-200">Known Elements</h3>
		</div>
		<button
			onclick={() => (showAddForm = !showAddForm)}
			class="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
		>
			{showAddForm ? 'Cancel' : '+ Add Element'}
		</button>
	</div>

	<!-- Explanation -->
	<div class="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
		<p class="text-xs text-slate-300 mb-2">
			Known Elements are pre-defined locations, encounters, or objects that you KNOW are in this region before exploring. When "Known" is rolled during area generation, the system will:
		</p>
		<ul class="text-xs text-slate-300 list-disc list-inside space-y-1">
			<li>Roll 1d10 to select an element by position</li>
			<li>Only select from elements that haven't been used yet</li>
			<li>Automatically cross out the element when the area is created</li>
		</ul>
		<p class="text-xs text-slate-400 mt-2 italic">
			Add elements you know are present (e.g., "Vampire Lord" in a vampire's castle), not generic possibilities.
		</p>
	</div>

	<!-- Add Element Form -->
	{#if showAddForm}
		<div class="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
			<div class="space-y-3">
				<div>
					<label for="element-name" class="block text-sm text-slate-400 mb-2">
						Element Name:
					</label>
					<input
						id="element-name"
						type="text"
						bind:value={newElementName}
						placeholder="e.g., Ancient Ruins, Dragon Lair, Magic Sword..."
						class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
					/>
				</div>
				<div>
					<label for="element-category" class="block text-sm text-slate-400 mb-2">
						Category:
					</label>
					<select
						id="element-category"
						bind:value={newElementCategory}
						class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
					>
						<option value="Locations">📍 Locations</option>
						<option value="Encounters">⚔️ Encounters</option>
						<option value="Objects">🎁 Objects</option>
					</select>
				</div>
				<div class="flex gap-2">
					<button
						onclick={addElement}
						disabled={!newElementName.trim()}
						class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
					>
						Add Element
					</button>
					<button
						onclick={() => {
							showAddForm = false;
							newElementName = '';
						}}
						class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Elements List -->
	{#if sortedElements.length === 0}
		<div class="p-6 text-center text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700">
			<div class="text-4xl mb-2">📋</div>
			<p class="text-sm">No Known Elements defined yet.</p>
			<p class="text-xs mt-1">Add elements that you expect might appear in this region.</p>
		</div>
	{:else}
		<div class="space-y-4">
			<!-- Locations -->
			{#if locationElements.length > 0}
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-emerald-400 flex items-center gap-2">
						<span>📍</span>
						<span>Locations</span>
					</h4>
					{#each locationElements as element (element.id)}
						<div
							class="group p-3 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-emerald-500/50 transition-colors {element.crossed ? 'opacity-60' : ''}"
						>
							<div class="flex items-center gap-3">
								<!-- Position -->
								<div
									class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold"
								>
									{element.position}
								</div>

								<!-- Content -->
								{#if editingId === element.id}
									<input
										type="text"
										bind:value={editingName}
										onkeydown={(e) => {
											if (e.key === 'Enter') saveEdit(element.id);
											if (e.key === 'Escape') cancelEdit();
										}}
										class="flex-1 px-2 py-1 bg-slate-700 border border-emerald-500 rounded text-white text-sm focus:outline-none"
										autofocus
									/>
								{:else}
									<div class="flex-1 min-w-0">
										<div class="text-sm text-white {element.crossed ? 'line-through' : ''}">
											{element.name}
										</div>
									</div>
								{/if}

								<!-- Actions -->
								<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									{#if editingId === element.id}
										<button
											onclick={() => saveEdit(element.id)}
											class="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
										>
											✓
										</button>
										<button
											onclick={cancelEdit}
											class="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
										>
											×
										</button>
									{:else}
										<button
											onclick={() => toggleCrossed(element.id)}
											class="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
											title={element.crossed ? 'Mark as available' : 'Mark as exhausted'}
										>
											{element.crossed ? '↩️' : '✓'}
										</button>
										<button
											onclick={() => startEditing(element)}
											class="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
										>
											✏️
										</button>
										<button
											onclick={() => deleteElement(element.id)}
											class="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
										>
											×
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Encounters -->
			{#if encounterElements.length > 0}
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-red-400 flex items-center gap-2">
						<span>⚔️</span>
						<span>Encounters</span>
					</h4>
					{#each encounterElements as element (element.id)}
						<div
							class="group p-3 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-red-500/50 transition-colors {element.crossed ? 'opacity-60' : ''}"
						>
							<div class="flex items-center gap-3">
								<div
									class="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold"
								>
									{element.position}
								</div>

								{#if editingId === element.id}
									<input
										type="text"
										bind:value={editingName}
										onkeydown={(e) => {
											if (e.key === 'Enter') saveEdit(element.id);
											if (e.key === 'Escape') cancelEdit();
										}}
										class="flex-1 px-2 py-1 bg-slate-700 border border-red-500 rounded text-white text-sm focus:outline-none"
										autofocus
									/>
								{:else}
									<div class="flex-1 min-w-0">
										<div class="text-sm text-white {element.crossed ? 'line-through' : ''}">
											{element.name}
										</div>
									</div>
								{/if}

								<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									{#if editingId === element.id}
										<button
											onclick={() => saveEdit(element.id)}
											class="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
										>
											✓
										</button>
										<button
											onclick={cancelEdit}
											class="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
										>
											×
										</button>
									{:else}
										<button
											onclick={() => toggleCrossed(element.id)}
											class="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
											title={element.crossed ? 'Mark as available' : 'Mark as exhausted'}
										>
											{element.crossed ? '↩️' : '✓'}
										</button>
										<button
											onclick={() => startEditing(element)}
											class="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
										>
											✏️
										</button>
										<button
											onclick={() => deleteElement(element.id)}
											class="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
										>
											×
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Objects -->
			{#if objectElements.length > 0}
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-yellow-400 flex items-center gap-2">
						<span>🎁</span>
						<span>Objects</span>
					</h4>
					{#each objectElements as element (element.id)}
						<div
							class="group p-3 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-yellow-500/50 transition-colors {element.crossed ? 'opacity-60' : ''}"
						>
							<div class="flex items-center gap-3">
								<div
									class="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white text-xs font-bold"
								>
									{element.position}
								</div>

								{#if editingId === element.id}
									<input
										type="text"
										bind:value={editingName}
										onkeydown={(e) => {
											if (e.key === 'Enter') saveEdit(element.id);
											if (e.key === 'Escape') cancelEdit();
										}}
										class="flex-1 px-2 py-1 bg-slate-700 border border-yellow-500 rounded text-white text-sm focus:outline-none"
										autofocus
									/>
								{:else}
									<div class="flex-1 min-w-0">
										<div class="text-sm text-white {element.crossed ? 'line-through' : ''}">
											{element.name}
										</div>
									</div>
								{/if}

								<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									{#if editingId === element.id}
										<button
											onclick={() => saveEdit(element.id)}
											class="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
										>
											✓
										</button>
										<button
											onclick={cancelEdit}
											class="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
										>
											×
										</button>
									{:else}
										<button
											onclick={() => toggleCrossed(element.id)}
											class="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
											title={element.crossed ? 'Mark as available' : 'Mark as exhausted'}
										>
											{element.crossed ? '↩️' : '✓'}
										</button>
										<button
											onclick={() => startEditing(element)}
											class="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
										>
											✏️
										</button>
										<button
											onclick={() => deleteElement(element.id)}
											class="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
										>
											×
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
