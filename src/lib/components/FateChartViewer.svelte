<script lang="ts">
	/**
	 * Fate Chart 2D Table Viewer
	 * Displays the Mythic GME Fate Chart as an interactive matrix
	 */

	import { FATE_CHART_DATA, ODDS_LEVELS, OddsLevel } from '$lib/utils/fateChart';

	// State
	let selectedChaosFactor = $state<number>(5);
	let selectedOdds = $state<OddsLevel>(OddsLevel.FiftyFifty);
	let highlightedCell = $state<{cf: number, odds: string} | null>(null);

	// Get current threshold
	let currentThreshold = $derived.by(() => {
		return FATE_CHART_DATA[selectedChaosFactor][selectedOdds];
	});

	// Check if cell should be highlighted
	function isCellHighlighted(cf: number, odds: OddsLevel): boolean {
		return selectedChaosFactor === cf && selectedOdds === odds;
	}

	// Format threshold display
	function formatThreshold(exceptionalYes: number, yes: number, exceptionalNo: number): string {
		return `≤${exceptionalYes} / ≤${yes} / ≥${exceptionalNo}`;
	}

	// Get color for cell based on yes threshold
	function getCellColor(yes: number): string {
		if (yes >= 95) return 'bg-green-900/30 border-green-500/30';
		if (yes >= 75) return 'bg-green-800/20 border-green-500/20';
		if (yes >= 50) return 'bg-yellow-800/20 border-yellow-500/20';
		if (yes >= 25) return 'bg-orange-800/20 border-orange-500/20';
		return 'bg-red-800/20 border-red-500/20';
	}
</script>

<div class="space-y-6">
	<!-- Controls -->
	<div class="grid md:grid-cols-2 gap-4 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
		<!-- Chaos Factor Selector -->
		<div>
			<label for="cf-select" class="block text-sm font-medium text-purple-200 mb-2">
				Chaos Factor:
			</label>
			<select
				id="cf-select"
				bind:value={selectedChaosFactor}
				class="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg p-2 focus:border-purple-500 focus:outline-none"
			>
				{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as cf (cf)}
					<option value={cf}>CF {cf}</option>
				{/each}
			</select>
		</div>

		<!-- Odds Selector -->
		<div>
			<label for="odds-select" class="block text-sm font-medium text-purple-200 mb-2">
				Odds Level:
			</label>
			<select
				id="odds-select"
				bind:value={selectedOdds}
				class="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg p-2 focus:border-purple-500 focus:outline-none"
			>
				{#each ODDS_LEVELS as odds (odds)}
					<option value={odds}>{odds}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Current Result Display -->
	<div class="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500 rounded-lg p-6">
		<h3 class="text-xl font-bold text-purple-200 mb-4">
			Selected: CF {selectedChaosFactor} × {selectedOdds}
		</h3>

		<div class="grid grid-cols-3 gap-4">
			<div class="bg-gray-800 rounded-lg p-4 text-center">
				<div class="text-xs text-gray-400 mb-1">Exceptional Yes</div>
				<div class="text-2xl font-bold text-green-400">≤ {currentThreshold.exceptionalYes}</div>
				<div class="text-xs text-gray-500 mt-1">Roll this or lower</div>
			</div>

			<div class="bg-gray-800 rounded-lg p-4 text-center">
				<div class="text-xs text-gray-400 mb-1">Yes</div>
				<div class="text-2xl font-bold text-green-300">≤ {currentThreshold.yes}</div>
				<div class="text-xs text-gray-500 mt-1">Roll this or lower</div>
			</div>

			<div class="bg-gray-800 rounded-lg p-4 text-center">
				<div class="text-xs text-gray-400 mb-1">Exceptional No</div>
				<div class="text-2xl font-bold text-red-400">≥ {currentThreshold.exceptionalNo}</div>
				<div class="text-xs text-gray-500 mt-1">Roll this or higher</div>
			</div>
		</div>

		<div class="mt-4 text-center text-sm text-gray-300">
			Anything between {currentThreshold.yes + 1} and {currentThreshold.exceptionalNo - 1} is a regular <span class="text-red-400 font-medium">No</span>
		</div>
	</div>

	<!-- Full Matrix -->
	<div class="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20">
		<h3 class="text-lg font-bold text-purple-200 mb-4">Complete Fate Chart Matrix</h3>
		<p class="text-xs text-gray-400 mb-4">
			Click any cell to see its thresholds. Values shown as: Exceptional Yes / Yes / Exceptional No
		</p>

		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-b border-purple-500/30">
						<th class="sticky left-0 bg-gray-900 p-2 text-left text-purple-300 font-medium">Odds / CF</th>
						{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as cf (cf)}
							<th class="p-2 text-center text-purple-300 font-medium">CF {cf}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each ODDS_LEVELS as odds (odds)}
						<tr class="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
							<td class="sticky left-0 bg-gray-900 p-2 font-medium text-purple-200 text-left border-r border-purple-500/20">
								{odds}
							</td>
							{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as cf (cf)}
								{@const threshold = FATE_CHART_DATA[cf][odds]}
								{@const isHighlighted = isCellHighlighted(cf, odds)}
								<td
									class="p-2 text-center cursor-pointer border border-gray-700/30 {getCellColor(threshold.yes)} {isHighlighted ? 'ring-2 ring-purple-400' : ''}"
									onclick={() => {
										selectedChaosFactor = cf;
										selectedOdds = odds;
									}}
									role="button"
									tabindex="0"
									title="{odds} at CF {cf}"
								>
									<div class="font-mono">
										<div class="text-green-400">{threshold.exceptionalYes}</div>
										<div class="text-green-300 font-bold">{threshold.yes}</div>
										<div class="text-red-400">{threshold.exceptionalNo}</div>
									</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Legend -->
		<div class="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
			<div class="flex items-center gap-2">
				<div class="w-4 h-4 bg-green-400 rounded"></div>
				<span>Top: Exceptional Yes ≤</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-4 h-4 bg-green-300 rounded"></div>
				<span>Middle: Yes ≤</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="w-4 h-4 bg-red-400 rounded"></div>
				<span>Bottom: Exceptional No ≥</span>
			</div>
		</div>
	</div>

	<!-- How to Use -->
	<div class="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
		<h4 class="text-sm font-bold text-blue-200 mb-2">How to Use the Fate Chart:</h4>
		<ol class="text-xs text-gray-300 space-y-1 list-decimal list-inside">
			<li>Choose your <strong>Chaos Factor</strong> (1-9, usually starts at 5)</li>
			<li>Determine the <strong>Odds Level</strong> for your question</li>
			<li>Roll 1d100</li>
			<li>Compare your roll to the thresholds:
				<ul class="ml-6 mt-1 space-y-1 list-disc">
					<li>Roll ≤ Exceptional Yes → <strong class="text-green-400">Exceptional Yes</strong></li>
					<li>Roll ≤ Yes → <strong class="text-green-300">Yes</strong></li>
					<li>Roll ≥ Exceptional No → <strong class="text-red-400">Exceptional No</strong></li>
					<li>Otherwise → <strong class="text-red-300">No</strong></li>
				</ul>
			</li>
		</ol>
		<p class="text-xs text-gray-400 mt-3">
			<strong>Tip:</strong> Green cells = more likely to get Yes. Red cells = more likely to get No.
		</p>
	</div>
</div>

<style>
	/* Make table scrollable on small screens */
	.overflow-x-auto {
		-webkit-overflow-scrolling: touch;
	}

	/* Sticky header for table */
	thead th {
		position: sticky;
		top: 0;
		z-index: 10;
	}

	/* Sticky first column */
	td.sticky, th.sticky {
		position: sticky;
		left: 0;
		z-index: 5;
	}
</style>
