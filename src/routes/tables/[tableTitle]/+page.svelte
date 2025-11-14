<script lang="ts">
	import { page } from '$app/stores';
	import { tableMetadata, loadTable } from '$lib/data/tableMetadata.generated';
	import type { Table } from '$lib/tables/table';
	import { Dice } from '$lib/utils/dice';
	import { onMount } from 'svelte';
	import FateChartViewer from '$lib/components/FateChartViewer.svelte';

	let table = $state<Table | null>(null);
	let rollResults = $state<string[]>([]);
	let isRolling = $state(false);
	let isLoading = $state(true);
	let isFateChart = $state(false);

	// Check if the current table is a galaxy images table
	const isGalaxyImagesTable = $derived(
		table?.title.includes('Galaxy Images') || false
	);

	// Helper to check if a result is an image filename
	function isImageResult(result: string): boolean {
		return result.endsWith('.png') || result.endsWith('.jpg') || result.endsWith('.jpeg');
	}

	onMount(async () => {
		const tableTitle = decodeURIComponent($page.params.tableTitle);
		// Check if this is the Fate Chart (special 2D table)
		isFateChart = tableTitle === 'Fate Chart';

		// Find the table metadata across all categories
		for (const category of tableMetadata) {
			const foundMeta = category.tables.find((t) => t.title === tableTitle);
			if (foundMeta) {
				// Lazy load the table
				table = await loadTable(foundMeta);
				isLoading = false;
				break;
			}
		}
		if (!table) {
			isLoading = false;
		}
	});

	function rollTable() {
		if (!table) return;

		isRolling = true;
		setTimeout(() => {
			const dice = new Dice();
			const result = table!.roleWithCascade(dice);
			rollResults = [result.text, ...rollResults].slice(0, 10); // Keep last 10 results
			isRolling = false;
		}, 300);
	}

	function clearHistory() {
		rollResults = [];
	}
</script>

{#if isLoading}
	<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
		<div class="text-center">
			<div class="text-6xl mb-4 animate-spin">🎲</div>
			<p class="text-purple-200 text-lg">Loading table...</p>
		</div>
	</div>
{:else if table}
	<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
		<!-- Header -->
		<div class="bg-slate-900/50 border-b border-purple-500/20 sticky top-0 z-10 backdrop-blur">
			<div class="container mx-auto px-4 py-4">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-3xl font-bold text-white">{table.title}</h1>
						<p class="text-purple-200 text-sm mt-1">
							{table.entries.length} entries • Dice: {table.diceRole.toString()}
						</p>
					</div>
					<div class="flex gap-2">
						<a
							href="/tables"
							class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
						>
							All Tables
						</a>
						<a
							href="/"
							class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
						>
							Home
						</a>
					</div>
				</div>
			</div>
		</div>

		<div class="container mx-auto px-4 py-8 max-w-7xl">
			{#if isFateChart}
				<!-- Fate Chart: Full-width specialized viewer -->
				<div class="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-purple-500/20">
					<FateChartViewer />
				</div>
			{:else}
				<!-- Standard Table: Two-column layout -->
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<!-- Left: Table Entries -->
					<div class="lg:col-span-2">
						<div class="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-purple-500/20">
							<h2 class="text-xl font-bold text-white mb-4">Table Entries</h2>
							<div class="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800">
								{#each table.entries as entry, index}
									<div
										class="flex gap-4 p-3 rounded-lg bg-slate-900/30 border border-purple-500/10 hover:border-purple-500/30 transition-colors"
									>
										<div
											class="flex-shrink-0 w-20 text-center py-1 px-2 bg-purple-900/30 rounded text-purple-300 font-mono text-sm"
										>
											{entry.toString()}
										</div>
										<div class="flex-1">
											<p class="text-white mb-2">{entry.textWithCascades || entry.text}</p>
											{#if isGalaxyImagesTable && isImageResult(entry.text)}
												<div class="mt-2">
													<img
														src="/galaxies/{entry.text}"
														alt={entry.text}
														class="max-w-full h-auto rounded border border-purple-400/20 shadow-md"
														style="max-height: 120px;"
													/>
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- Right: Roll Section -->
					<div class="space-y-6">
						<!-- Info (moved to top) -->
						<div class="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-purple-500/20">
							<h3 class="text-lg font-semibold text-white mb-3">About This Table</h3>
							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span class="text-purple-300">Type:</span>
									<span class="text-white font-medium">{table.tableType}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-purple-300">Entries:</span>
									<span class="text-white font-medium">{table.entries.length}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-purple-300">Dice:</span>
									<span class="text-white font-medium">{table.diceRole.toString()}</span>
								</div>
							</div>
							{#if table.entries.some((e) => e.cascadingRoles.length > 0)}
								<div class="mt-4 p-3 bg-purple-900/20 rounded border border-purple-500/20">
									<p class="text-purple-200 text-xs">
										<span class="font-semibold">Note:</span> This table contains cascading entries
										that may trigger rolls on other tables.
									</p>
								</div>
							{/if}
						</div>

						<!-- Roll Button -->
						<div class="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-purple-500/20">
							<h2 class="text-xl font-bold text-white mb-4">Roll the Dice</h2>
							<button
								onclick={rollTable}
								disabled={isRolling}
								class="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 {isRolling
									? 'animate-pulse'
									: ''}"
							>
								{isRolling ? 'Rolling...' : `Roll ${table.diceRole.toString()}`}
							</button>

							{#if rollResults.length > 0}
								<div class="mt-6">
									<div class="flex items-center justify-between mb-3">
										<h3 class="text-lg font-semibold text-white">Latest Result</h3>
										<button
											onclick={clearHistory}
											class="text-xs text-purple-300 hover:text-purple-100 transition-colors"
										>
											Clear History
										</button>
									</div>
									<div
										class="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-400/30 shadow-lg"
									>
										<p class="text-white text-lg font-medium mb-3">{rollResults[0]}</p>
										{#if isGalaxyImagesTable && isImageResult(rollResults[0])}
											<div class="mt-3 flex justify-center">
												<img
													src="/galaxies/{rollResults[0]}"
													alt={rollResults[0]}
													class="max-w-full h-auto rounded-lg border border-purple-400/50 shadow-xl"
													style="max-height: 300px;"
												/>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</div>

						<!-- Roll History (always visible with fixed height) -->
						<div class="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-purple-500/20">
							<h3 class="text-lg font-semibold text-white mb-4">Previous Rolls</h3>
							<div class="h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800">
								{#if rollResults.length > 1}
									<div class="space-y-2">
										{#each rollResults.slice(1) as result, index}
											<div class="p-3 bg-slate-900/30 rounded border border-purple-500/10">
												<p class="text-purple-100 text-sm mb-2">{result}</p>
												{#if isGalaxyImagesTable && isImageResult(result)}
													<div class="flex justify-center mt-2">
														<img
															src="/galaxies/{result}"
															alt={result}
															class="max-w-full h-auto rounded border border-purple-400/30 shadow-lg"
															style="max-height: 150px;"
														/>
													</div>
												{/if}
											</div>
										{/each}
									</div>
								{:else}
									<div class="h-full flex items-center justify-center">
										<p class="text-purple-300/50 text-sm italic">No previous rolls yet</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-4xl font-bold text-white mb-4">Table Not Found</h1>
			<p class="text-purple-200 mb-8">The requested table could not be found.</p>
			<a
				href="/tables"
				class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-block"
			>
				Browse All Tables
			</a>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar styles */
	.scrollbar-thin::-webkit-scrollbar {
		width: 8px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: rgb(30 41 59 / 0.5);
		border-radius: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: rgb(147 51 234);
		border-radius: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background: rgb(126 34 206);
	}
</style>
