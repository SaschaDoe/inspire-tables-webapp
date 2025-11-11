<script lang="ts">
	/**
	 * Area History Timeline Component (Phase 4C)
	 * Displays the history of a region with Progress Points tracking
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import type { Region, AreaHistoryEntry } from '$lib/stores/soloRpgStore.svelte';

	interface Props {
		regionId: string;
	}

	let { regionId }: Props = $props();

	// State
	let showAddForm = $state(false);
	let newEventText = $state('');

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let region = $derived(
		currentSession?.regions.find((r: Region) => r.id === regionId) || null
	);
	let history = $derived(region?.history || []);
	let sortedHistory = $derived(
		[...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
	);

	function addHistoryEntry() {
		if (!newEventText.trim()) return;
		soloRpgStore.addHistoryEntry(regionId, newEventText.trim());
		newEventText = '';
		showAddForm = false;
	}

	function deleteEntry(entryId: string) {
		if (confirm('Delete this history entry?')) {
			soloRpgStore.deleteHistoryEntry(regionId, entryId);
		}
	}

	function formatDate(date: Date): string {
		const d = new Date(date);
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function formatPPChange(current: number, previous?: number): string {
		if (previous === undefined) return `PP: ${current}`;
		const diff = current - previous;
		if (diff === 0) return `PP: ${current}`;
		const sign = diff > 0 ? '+' : '';
		return `PP: ${current} (${sign}${diff})`;
	}
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="text-2xl">📜</span>
			<h3 class="text-lg font-bold text-slate-200">Area History</h3>
		</div>
		<button
			onclick={() => (showAddForm = !showAddForm)}
			class="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
		>
			{showAddForm ? 'Cancel' : '+ Add Entry'}
		</button>
	</div>

	<!-- Add Entry Form -->
	{#if showAddForm}
		<div class="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
			<label for="new-event" class="block text-sm text-slate-400 mb-2">
				New History Event:
			</label>
			<textarea
				id="new-event"
				bind:value={newEventText}
				placeholder="Describe what happened (e.g., 'Discovered hidden passage', 'Defeated guardian')..."
				class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
				rows="2"
			></textarea>
			<div class="flex gap-2 mt-2">
				<button
					onclick={addHistoryEntry}
					disabled={!newEventText.trim()}
					class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
				>
					Add Entry
				</button>
				<button
					onclick={() => {
						showAddForm = false;
						newEventText = '';
					}}
					class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}

	<!-- Timeline -->
	{#if sortedHistory.length === 0}
		<div class="p-6 text-center text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700">
			<div class="text-4xl mb-2">📜</div>
			<p class="text-sm">No history entries yet.</p>
			<p class="text-xs mt-1">Add entries to track important events and Progress Points changes.</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each sortedHistory as entry, index (entry.id)}
				{@const previousEntry = sortedHistory[index + 1]}
				{@const previousPP = previousEntry?.progressPoints}
				<div
					class="group relative p-3 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-colors"
				>
					<!-- Timeline Connector -->
					{#if index < sortedHistory.length - 1}
						<div
							class="absolute left-6 top-full w-0.5 h-2 bg-slate-600 -mt-px"
							style="z-index: -1;"
						></div>
					{/if}

					<div class="flex items-start gap-3">
						<!-- Timeline Dot -->
						<div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-lg mt-0.5">
							{#if entry.progressPoints > (previousPP || 0)}
								📈
							{:else if entry.progressPoints < (previousPP || 0)}
								📉
							{:else}
								📌
							{/if}
						</div>

						<!-- Content -->
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 mb-1">
								<div class="text-sm text-white font-medium">
									{entry.event}
								</div>
								<button
									onclick={() => deleteEntry(entry.id)}
									class="opacity-0 group-hover:opacity-100 flex-shrink-0 text-xs px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded transition-all"
									aria-label="Delete"
								>
									×
								</button>
							</div>
							<div class="flex items-center gap-3 text-xs text-slate-400">
								<span class="font-mono {entry.progressPoints > (previousPP || 0) ? 'text-green-400' : entry.progressPoints < (previousPP || 0) ? 'text-red-400' : 'text-slate-400'}">
									{formatPPChange(entry.progressPoints, previousPP)}
								</span>
								<span>•</span>
								<span>{formatDate(entry.timestamp)}</span>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Current PP Summary -->
	{#if region}
		<div class="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
			<div class="flex items-center justify-between">
				<span class="text-sm text-blue-300">Current Progress Points:</span>
				<span class="text-lg font-bold text-white font-mono">{region.progressPoints}</span>
			</div>
			<p class="text-xs text-slate-400 mt-1">
				Progress Points affect Area Element generation rolls (1d10 + PP).
			</p>
		</div>
	{/if}
</div>
