<script lang="ts">
	/**
	 * Mystery Matrix Panel (Phase 4: Mythic Magazine Vol 6)
	 * Main visualization and management interface for mystery investigations
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import type { MysteryClue, MysterySuspect } from '$lib/stores/soloRpgStore.svelte';

	// State
	let selectedClueId = $state<string | null>(null);
	let selectedSuspectId = $state<string | null>(null);
	let showAddClue = $state(false);
	let showAddSuspect = $state(false);
	let newClueDescription = $state('');
	let newSuspectName = $state('');
	let editingClueId = $state<string | null>(null);
	let editingSuspectId = $state<string | null>(null);

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let mysteryThread = $derived(currentSession?.mysteryThread || '');
	let clues = $derived(currentSession?.mysteryClues || []);
	let suspects = $derived(currentSession?.mysterySuspects || []);
	let links = $derived(currentSession?.mysteryLinks || []);
	let clueProgressPoints = $derived(currentSession?.mysteryClueProgressPoints || 0);
	let suspectProgressPoints = $derived(currentSession?.mysterySuspectProgressPoints || 0);
	let isSolved = $derived(currentSession?.mysterySolved || false);
	let topSuspect = $derived(soloRpgStore.mysterySuspectWithMostCluePoints);

	// Grid positions for clues (20 boxes arranged around perimeter)
	const cluePositions: { x: number; y: number; pos: number }[] = [
		// Top row (1-5)
		{ x: 50, y: 50, pos: 1 },
		{ x: 200, y: 50, pos: 2 },
		{ x: 350, y: 50, pos: 3 },
		{ x: 500, y: 50, pos: 4 },
		{ x: 650, y: 50, pos: 5 },
		// Right column (6-10)
		{ x: 800, y: 150, pos: 6 },
		{ x: 800, y: 250, pos: 7 },
		{ x: 800, y: 350, pos: 8 },
		{ x: 800, y: 450, pos: 9 },
		{ x: 800, y: 550, pos: 10 },
		// Bottom row (11-15)
		{ x: 650, y: 700, pos: 11 },
		{ x: 500, y: 700, pos: 12 },
		{ x: 350, y: 700, pos: 13 },
		{ x: 200, y: 700, pos: 14 },
		{ x: 50, y: 700, pos: 15 },
		// Left column (16-20)
		{ x: 50, y: 550, pos: 16 },
		{ x: 50, y: 450, pos: 17 },
		{ x: 50, y: 350, pos: 18 },
		{ x: 50, y: 250, pos: 19 },
		{ x: 50, y: 150, pos: 20 }
	];

	// Grid positions for suspects (10 boxes in center)
	const suspectPositions: { x: number; y: number; pos: number }[] = [
		{ x: 250, y: 200, pos: 1 },
		{ x: 550, y: 200, pos: 2 },
		{ x: 250, y: 300, pos: 3 },
		{ x: 550, y: 300, pos: 4 },
		{ x: 250, y: 400, pos: 5 },
		{ x: 550, y: 400, pos: 6 },
		{ x: 250, y: 500, pos: 7 },
		{ x: 550, y: 500, pos: 8 },
		{ x: 250, y: 600, pos: 9 },
		{ x: 550, y: 600, pos: 10 }
	];

	function getCluePosition(clue: MysteryClue) {
		// Map position 1-100 to one of the 20 boxes
		const boxIndex = ((clue.position - 1) % 20);
		return cluePositions[boxIndex];
	}

	function getSuspectPosition(suspect: MysterySuspect) {
		// Map position 1-10 to boxes
		const boxIndex = (suspect.position - 1) % 10;
		return suspectPositions[boxIndex];
	}

	function addClue() {
		if (!newClueDescription.trim()) return;
		soloRpgStore.addMysteryClue(newClueDescription.trim());
		newClueDescription = '';
		showAddClue = false;
	}

	function addSuspect() {
		if (!newSuspectName.trim()) return;
		soloRpgStore.addMysterySuspect(newSuspectName.trim());
		newSuspectName = '';
		showAddSuspect = false;
	}

	function removeClue(clueId: string) {
		if (confirm('Remove this clue and all its links?')) {
			soloRpgStore.removeMysteryClue(clueId);
		}
	}

	function removeSuspect(suspectId: string) {
		if (confirm('Remove this suspect and all their links?')) {
			soloRpgStore.removeMysterySuspect(suspectId);
		}
	}

	function toggleLinkSelection(clueId: string, suspectId: string) {
		// Check if link exists
		const existingLink = links.find(
			(l) => l.clueId === clueId && l.suspectId === suspectId
		);

		if (existingLink) {
			// Link exists - ask to remove or strengthen
			if (confirm('Link exists. Strengthen it (+1 to strength)?')) {
				soloRpgStore.linkClueToSuspect(clueId, suspectId); // This will strengthen
			}
		} else {
			// Create new link
			soloRpgStore.linkClueToSuspect(clueId, suspectId);
		}
	}

	function getLinkStrength(clueId: string, suspectId: string): number {
		const link = links.find((l) => l.clueId === clueId && l.suspectId === suspectId);
		return link?.strength || 0;
	}

	function getLinksForClue(clueId: string) {
		return links.filter((l) => l.clueId === clueId);
	}

	function getClueById(id: string) {
		return clues.find((c) => c.id === id);
	}

	function getSuspectById(id: string) {
		return suspects.find((s) => s.id === id);
	}

	// Calculate center point for suspect box (for line connections)
	function getSuspectCenter(suspect: MysterySuspect) {
		const pos = getSuspectPosition(suspect);
		return { x: pos.x + 75, y: pos.y + 40 }; // Center of 150x80 box
	}

	// Calculate center point for clue box (for line connections)
	function getClueCenter(clue: MysteryClue) {
		const pos = getCluePosition(clue);
		return { x: pos.x + 65, y: pos.y + 30 }; // Center of 130x60 box
	}
</script>

<div class="mystery-matrix-panel h-full bg-slate-900 overflow-auto">
	<!-- Header -->
	<div class="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-indigo-900 p-4 border-b border-purple-500">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-2xl font-bold text-white flex items-center gap-2">
					🔍 Mystery Matrix
				</h2>
				<p class="text-purple-200 text-sm mt-1">
					{mysteryThread}
					{#if isSolved}
						<span class="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded">✓ SOLVED</span>
					{/if}
				</p>
			</div>
			<div class="flex gap-2">
				<button
					onclick={() => (showAddClue = !showAddClue)}
					class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
				>
					+ Clue
				</button>
				<button
					onclick={() => (showAddSuspect = !showAddSuspect)}
					class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
				>
					+ Suspect
				</button>
			</div>
		</div>

		<!-- Progress Points -->
		<div class="mt-3 flex gap-4 text-sm">
			<div class="flex items-center gap-2">
				<span class="text-blue-300">Clue PP:</span>
				<span class="font-mono font-bold text-white">{clueProgressPoints}</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-red-300">Suspect PP:</span>
				<span class="font-mono font-bold text-white">{suspectProgressPoints}</span>
			</div>
			{#if topSuspect}
				<div class="flex items-center gap-2 ml-auto">
					<span class="text-yellow-300">Top Suspect:</span>
					<span class="font-bold text-white">{topSuspect.name}</span>
					<span class="text-yellow-400">({topSuspect.cluePoints} CP)</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Add Clue Form -->
	{#if showAddClue}
		<div class="p-4 bg-blue-900/20 border-b border-blue-500/30">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={newClueDescription}
					placeholder="Describe the clue..."
					class="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
					onkeydown={(e) => e.key === 'Enter' && addClue()}
				/>
				<button
					onclick={addClue}
					disabled={!newClueDescription.trim()}
					class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
				>
					Add
				</button>
				<button
					onclick={() => {
						showAddClue = false;
						newClueDescription = '';
					}}
					class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}

	<!-- Add Suspect Form -->
	{#if showAddSuspect}
		<div class="p-4 bg-red-900/20 border-b border-red-500/30">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={newSuspectName}
					placeholder="Suspect name..."
					class="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
					onkeydown={(e) => e.key === 'Enter' && addSuspect()}
				/>
				<button
					onclick={addSuspect}
					disabled={!newSuspectName.trim()}
					class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm rounded transition-colors"
				>
					Add
				</button>
				<button
					onclick={() => {
						showAddSuspect = false;
						newSuspectName = '';
					}}
					class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}

	<!-- Mystery Matrix Grid -->
	<div class="relative p-8">
		<svg class="absolute inset-0 w-full h-full pointer-events-none" style="min-height: 800px;">
			<!-- Draw lines for links -->
			{#each links as link (link.id)}
				{@const clue = getClueById(link.clueId)}
				{@const suspect = getSuspectById(link.suspectId)}
				{#if clue && suspect}
					{@const clueCenter = getClueCenter(clue)}
					{@const suspectCenter = getSuspectCenter(suspect)}
					<line
						x1={clueCenter.x}
						y1={clueCenter.y}
						x2={suspectCenter.x}
						y2={suspectCenter.y}
						stroke={clue.isClincherClue ? '#fbbf24' : '#8b5cf6'}
						stroke-width={link.strength + 1}
						opacity="0.6"
						stroke-dasharray={clue.isClincherClue ? '5,5' : 'none'}
					/>
					<!-- Link strength indicator -->
					{@const midX = (clueCenter.x + suspectCenter.x) / 2}
					{@const midY = (clueCenter.y + suspectCenter.y) / 2}
					{#if link.strength > 1}
						<circle cx={midX} cy={midY} r="8" fill="#8b5cf6" />
						<text
							x={midX}
							y={midY + 4}
							text-anchor="middle"
							class="text-xs font-bold fill-white"
						>
							{link.strength}
						</text>
					{/if}
				{/if}
			{/each}
		</svg>

		<div class="relative" style="min-height: 800px;">
			<!-- Clue Boxes -->
			{#each clues as clue (clue.id)}
				{@const pos = getCluePosition(clue)}
				<div
					class="absolute w-32 p-2 rounded border-2 cursor-pointer transition-all {clue.isClincherClue
						? 'bg-yellow-900/40 border-yellow-500'
						: 'bg-blue-900/40 border-blue-500'} hover:scale-105 hover:z-10"
					style="left: {pos.x}px; top: {pos.y}px;"
					onclick={() => (selectedClueId = selectedClueId === clue.id ? null : clue.id)}
				>
					<div class="flex items-start justify-between mb-1">
						<span class="text-xs font-bold text-blue-300">#{clue.position}</span>
						{#if clue.intensified > 1}
							<span class="text-xs px-1 bg-purple-600 text-white rounded">x{clue.intensified}</span>
						{/if}
						{#if clue.isClincherClue}
							<span class="text-yellow-400 text-xs">★</span>
						{/if}
					</div>
					<p class="text-xs text-white line-clamp-2">{clue.description}</p>
					{#if selectedClueId === clue.id}
						<div class="mt-2 flex gap-1">
							<button
								onclick={() => removeClue(clue.id)}
								class="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
							>
								×
							</button>
							{#if !clue.isClincherClue}
								<button
									onclick={() => soloRpgStore.intensifyClue(clue.id)}
									class="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
									title="Intensify (+1 multiplier)"
								>
									↑
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{/each}

			<!-- Suspect Boxes -->
			{#each suspects as suspect (suspect.id)}
				{@const pos = getSuspectPosition(suspect)}
				{@const isTop = topSuspect?.id === suspect.id}
				<div
					class="absolute w-36 p-3 rounded border-2 cursor-pointer transition-all {isTop
						? 'bg-yellow-900/40 border-yellow-500'
						: 'bg-red-900/40 border-red-500'} hover:scale-105 hover:z-10"
					style="left: {pos.x}px; top: {pos.y}px;"
					onclick={() => (selectedSuspectId = selectedSuspectId === suspect.id ? null : suspect.id)}
				>
					<div class="flex items-start justify-between mb-1">
						<span class="text-xs font-bold text-red-300">#{suspect.position}</span>
						{#if isTop}
							<span class="text-yellow-400 text-sm">👑</span>
						{/if}
					</div>
					<p class="text-sm font-bold text-white mb-1">{suspect.name}</p>
					<div class="text-xs text-red-200">
						CP: <span class="font-mono font-bold">{suspect.cluePoints}</span>
					</div>
					{#if selectedSuspectId === suspect.id}
						<div class="mt-2">
							<button
								onclick={() => removeSuspect(suspect.id)}
								class="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
							>
								Remove
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Instructions -->
	{#if clues.length === 0 && suspects.length === 0}
		<div class="p-8 text-center text-slate-400">
			<div class="text-6xl mb-4">🔍</div>
			<h3 class="text-xl font-bold mb-2">Start Your Investigation</h3>
			<p class="text-sm mb-4">
				Add clues and suspects as you discover them through Investigation and Discovery Checks.
			</p>
			<div class="text-left max-w-md mx-auto text-sm space-y-2">
				<p><strong class="text-blue-400">Clues:</strong> Evidence, items, facts that help solve the mystery</p>
				<p><strong class="text-red-400">Suspects:</strong> People or entities that might be responsible</p>
				<p><strong class="text-purple-400">Links:</strong> Connect clues to suspects they implicate</p>
				<p><strong class="text-yellow-400">Goal:</strong> Reach 6 Clue Points on a suspect OR roll a Clincher Clue</p>
			</div>
		</div>
	{/if}

	<!-- Linking Instructions -->
	{#if clues.length > 0 && suspects.length > 0}
		<div class="p-4 bg-purple-900/20 border-t border-purple-500/30">
			<p class="text-sm text-purple-200">
				<strong>To link:</strong> Click a clue or suspect to select it, then click what you want to link it to.
				Click existing links to strengthen them. Purple lines = links. Yellow dashed = Clincher Clue.
			</p>
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
