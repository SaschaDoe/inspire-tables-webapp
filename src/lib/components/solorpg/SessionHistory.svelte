<script lang="ts">
	/**
	 * Session History Component
	 * Comprehensive audit trail of all actions in the Solo RPG session
	 * Shows: Fate Questions, Random Events, Meaning Rolls, and Scene information
	 */

	import { soloRpgStore, type FateQuestion, type RandomEvent, type MeaningRoll } from '$lib/stores/soloRpgStore.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	// State
	let filterType = $state<'all' | 'fate' | 'events' | 'meaning'>('all');
	let filterScene = $state<number | 'all'>('all');

	// Derived data
	let session = $derived(soloRpgStore.currentSession);

	// Combined timeline of all activities
	type TimelineEntry = {
		type: 'fate' | 'event' | 'meaning';
		timestamp: Date;
		sceneNumber: number;
		data: FateQuestion | RandomEvent | MeaningRoll;
	};

	let allEntries = $derived((): TimelineEntry[] => {
		if (!session) return [];

		const entries: TimelineEntry[] = [];

		// Add fate questions (with safety check for old sessions)
		if (session.fateQuestionHistory) {
			session.fateQuestionHistory.forEach(q => {
				entries.push({ type: 'fate', timestamp: q.timestamp, sceneNumber: q.sceneNumber, data: q });
			});
		}

		// Add random events (with safety check for old sessions)
		if (session.randomEventHistory) {
			session.randomEventHistory.forEach(e => {
				entries.push({ type: 'event', timestamp: e.timestamp, sceneNumber: e.sceneNumber, data: e });
			});
		}

		// Add meaning rolls (with safety check for old sessions)
		if (session.meaningRollHistory) {
			session.meaningRollHistory.forEach(m => {
				entries.push({ type: 'meaning', timestamp: m.timestamp, sceneNumber: m.sceneNumber, data: m });
			});
		}

		// Sort by timestamp (newest first)
		return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	});

	// Filtered entries
	let filteredEntries = $derived(() => {
		let filtered = allEntries();

		// Filter by type
		if (filterType !== 'all') {
			filtered = filtered.filter(e => e.type === filterType);
		}

		// Filter by scene
		if (filterScene !== 'all') {
			filtered = filtered.filter(e => e.sceneNumber === filterScene);
		}

		return filtered;
	});

	// Get unique scene numbers for filter
	let sceneNumbers = $derived(() => {
		if (!session) return [];
		return Array.from(new Set(allEntries().map(e => e.sceneNumber))).sort((a, b) => b - a);
	});

	// Format timestamp
	function formatTimestamp(date: Date): string {
		return new Date(date).toLocaleString();
	}

	// Close modal
	function handleClose() {
		onClose();
	}

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={handleClose}
		onkeydown={(e) => e.key === 'Escape' && handleClose()}
		role="button"
		tabindex="0"
		aria-label="Close dialog"
	>
		<!-- Modal Content -->
		<div
			class="bg-gray-900 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-orange-500/30 flex flex-col"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="session-history-title"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-orange-600 to-red-600 p-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="text-4xl">📜</span>
						<div>
							<h2 id="session-history-title" class="text-2xl font-bold text-white">
								Session History
							</h2>
							<p class="text-orange-100 text-sm mt-1">
								{#if session}
									{session.adventureName} - {allEntries().length} total entries
								{/if}
							</p>
						</div>
					</div>
					<button
						onclick={handleClose}
						class="text-white/80 hover:text-white text-3xl leading-none"
						aria-label="Close"
					>
						×
					</button>
				</div>
			</div>

			<!-- Filters -->
			<div class="bg-gray-800 p-4 border-b border-gray-700 flex gap-4 flex-wrap">
				<!-- Type Filter -->
				<div>
					<label for="type-filter" class="block text-sm text-gray-400 mb-1">Show:</label>
					<select
						id="type-filter"
						bind:value={filterType}
						class="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
					>
						<option value="all">All Activities</option>
						<option value="fate">Fate Questions</option>
						<option value="event">Random Events</option>
						<option value="meaning">Meaning Rolls</option>
					</select>
				</div>

				<!-- Scene Filter -->
				<div>
					<label for="scene-filter" class="block text-sm text-gray-400 mb-1">Scene:</label>
					<select
						id="scene-filter"
						bind:value={filterScene}
						class="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
					>
						<option value="all">All Scenes</option>
						{#each sceneNumbers() as sceneNum}
							<option value={sceneNum}>Scene {sceneNum}</option>
						{/each}
					</select>
				</div>

				<!-- Summary Stats -->
				<div class="ml-auto flex gap-4 items-center">
					<div class="text-center">
						<div class="text-2xl font-bold text-green-400">{session?.fateQuestionHistory?.length || 0}</div>
						<div class="text-xs text-gray-400">Fate Questions</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-purple-400">{session?.randomEventHistory?.length || 0}</div>
						<div class="text-xs text-gray-400">Random Events</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-400">{session?.meaningRollHistory?.length || 0}</div>
						<div class="text-xs text-gray-400">Meaning Rolls</div>
					</div>
				</div>
			</div>

			<!-- Timeline -->
			<div class="flex-1 overflow-y-auto p-6 space-y-4">
				{#if filteredEntries().length === 0}
					<div class="text-center text-gray-400 py-12">
						<div class="text-5xl mb-3">📭</div>
						<p>No history entries found</p>
						<p class="text-sm mt-2">Start playing to build your adventure history!</p>
					</div>
				{:else}
					{#each filteredEntries() as entry}
						{@const isFate = entry.type === 'fate'}
						{@const isEvent = entry.type === 'event'}
						{@const isMeaning = entry.type === 'meaning'}

						<div class="bg-gray-800 rounded-lg p-4 border-l-4 {
							isFate ? 'border-green-500' :
							isEvent ? 'border-purple-500' :
							'border-blue-500'
						}">
							<!-- Header -->
							<div class="flex items-start justify-between mb-3">
								<div class="flex items-center gap-2">
									<span class="text-2xl">
										{#if isFate}🎯
										{:else if isEvent}⚡
										{:else}🎲
										{/if}
									</span>
									<div>
										<div class="font-bold text-white">
											{#if isFate}Fate Question
											{:else if isEvent}Random Event
											{:else}Meaning Discovery
											{/if}
										</div>
										<div class="text-xs text-gray-400">
											Scene {entry.sceneNumber} • {formatTimestamp(entry.timestamp)}
										</div>
									</div>
								</div>
							</div>

							<!-- Content -->
							{#if isFate}
								{@const fate = entry.data as FateQuestion}
								<div class="space-y-2">
									<div class="text-gray-300">
										<span class="font-medium">Question:</span> {fate.question}
									</div>
									<div class="flex gap-4 text-sm">
										<span class="text-gray-400">Odds: <span class="text-white">{fate.odds}</span></span>
										<span class="text-gray-400">CF: <span class="text-white">{fate.chaosFactor}</span></span>
										<span class="text-gray-400">Roll: <span class="text-white">{fate.roll}</span></span>
										<span class="font-bold {
											fate.answer === 'Exceptional Yes' || fate.answer === 'Yes' ? 'text-green-400' :
											fate.answer === 'Exceptional No' || fate.answer === 'No' ? 'text-red-400' :
											'text-yellow-400'
										}">
											→ {fate.answer}
										</span>
									</div>
									{#if fate.randomEvent}
										<div class="text-orange-400 text-sm font-medium">
											⚡ Triggered Random Event!
										</div>
									{/if}
									{#if fate.playerInterpretation}
										<div class="bg-gray-900 p-3 rounded mt-2">
											<div class="text-xs text-gray-400 mb-1">Your Notes:</div>
											<div class="text-gray-300 text-sm">{fate.playerInterpretation}</div>
										</div>
									{/if}
								</div>

							{:else if isEvent}
								{@const event = entry.data as RandomEvent}
								<div class="space-y-2">
									<div class="text-gray-300">
										<span class="font-medium">Focus:</span> {event.focus}
										{#if event.involvedCharacter}
											<span class="text-cyan-400 ml-2">→ {event.involvedCharacter}</span>
										{/if}
										{#if event.involvedThread}
											<span class="text-purple-400 ml-2">→ {event.involvedThread}</span>
										{/if}
									</div>
									<div class="bg-purple-900/30 p-3 rounded">
										<div class="text-sm font-medium text-purple-300 mb-1">Meaning:</div>
										<div class="text-white">
											{event.meaningResult1} / {event.meaningResult2}
										</div>
										<div class="text-xs text-gray-400 mt-1">
											{event.meaningTable1}: {event.meaningRoll1}
											{#if event.meaningTable2}
												• {event.meaningTable2}: {event.meaningRoll2}
											{/if}
										</div>
									</div>
									{#if event.playerInterpretation}
										<div class="bg-gray-900 p-3 rounded mt-2">
											<div class="text-xs text-gray-400 mb-1">Your Interpretation:</div>
											<div class="text-gray-300 text-sm">{event.playerInterpretation}</div>
										</div>
									{/if}
								</div>

							{:else}
								{@const meaning = entry.data as MeaningRoll}
								<div class="space-y-2">
									<div class="text-gray-300">
										<span class="font-medium">Table:</span> {meaning.tableName}
									</div>
									<div class="bg-blue-900/30 p-3 rounded">
										<div class="text-white font-medium">
											{meaning.result1} / {meaning.result2}
										</div>
										<div class="text-xs text-gray-400 mt-1">
											Roll: {meaning.roll1}, {meaning.roll2}
										</div>
									</div>
									{#if meaning.playerInterpretation}
										<div class="bg-gray-900 p-3 rounded mt-2">
											<div class="text-xs text-gray-400 mb-1">Your Interpretation:</div>
											<div class="text-gray-300 text-sm">{meaning.playerInterpretation}</div>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>

			<!-- Footer -->
			<div class="bg-gray-800 p-4 border-t border-gray-700 flex justify-between items-center">
				<div class="text-sm text-gray-400">
					Showing {filteredEntries().length} of {allEntries().length} entries
				</div>
				<button
					onclick={handleClose}
					class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: rgb(249, 115, 22) rgb(31, 41, 55);
	}

	.overflow-y-auto::-webkit-scrollbar {
		width: 8px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: rgb(31, 41, 55);
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: rgb(249, 115, 22);
		border-radius: 4px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: rgb(251, 146, 60);
	}
</style>
