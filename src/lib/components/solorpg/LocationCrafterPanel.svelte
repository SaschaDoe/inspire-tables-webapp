<script lang="ts">
	/**
	 * Location Crafter Main Panel (Phase 4E)
	 * Container panel that brings together all Location Crafter components
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import RegionGenerator from './RegionGenerator.svelte';
	import AreaGenerator from './AreaGenerator.svelte';
	import AreaHistoryTimeline from './AreaHistoryTimeline.svelte';
	import KnownElementsSheet from './KnownElementsSheet.svelte';
	import LocationCrafterHelp from './LocationCrafterHelp.svelte';
	import type { Region, Area } from '$lib/stores/soloRpgStore.svelte';

	// State
	let selectedRegionId = $state<string | null>(null);
	let activeTab = $state<'areas' | 'known' | 'history'>('areas');
	let showHelp = $state(false);

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let regions = $derived(currentSession?.regions || []);
	let selectedRegion = $derived(
		regions.find((r: Region) => r.id === selectedRegionId) || null
	);
	let sortedRegions = $derived(
		[...regions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
	);

	// Auto-select first region if none selected
	$effect(() => {
		if (!selectedRegionId && regions.length > 0) {
			selectedRegionId = regions[0].id;
		}
	});

	function selectRegion(regionId: string) {
		selectedRegionId = regionId;
		activeTab = 'areas'; // Reset to areas tab when switching regions
	}

	function onRegionCreated() {
		// Select the newly created region
		const newRegion = regions[regions.length - 1];
		if (newRegion) {
			selectedRegionId = newRegion.id;
			activeTab = 'areas';
		}
	}

	function deleteRegion(regionId: string) {
		if (confirm('Delete this region and all its areas? This cannot be undone.')) {
			soloRpgStore.deleteRegion(regionId);
			if (selectedRegionId === regionId) {
				selectedRegionId = regions.length > 0 ? regions[0].id : null;
			}
		}
	}

	function toggleRegionComplete(regionId: string) {
		const region = regions.find((r: Region) => r.id === regionId);
		if (region) {
			soloRpgStore.updateRegion(regionId, { completed: !region.completed });
		}
	}

	function formatDate(date: Date): string {
		const d = new Date(date);
		return d.toLocaleDateString();
	}

	const typeIcons = {
		Wilderness: '🌲',
		City: '🏙️',
		Structure: '🏛️',
		'Cavern Dungeon': '⛰️',
		'Ancient Dungeon': '🏚️',
		'Palatial Dungeon': '🏰'
	};
</script>

<div class="flex flex-col h-full bg-slate-900">
	<!-- Header -->
	<div class="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<span class="text-3xl">🗺️</span>
				<div>
					<h2 class="text-2xl font-bold text-white">Location Crafter</h2>
					<p class="text-emerald-100 text-sm">Randomized location generation system</p>
				</div>
			</div>
			<button
				onclick={() => (showHelp = true)}
				class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
				title="Learn how to use Location Crafter"
			>
				❓ Help
			</button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="flex-1 overflow-hidden flex">
		<!-- Sidebar: Region List -->
		<div class="w-80 border-r border-slate-700 bg-slate-800/50 overflow-y-auto">
			<!-- Region Generator -->
			<div class="sticky top-0 z-10 bg-slate-800">
				<RegionGenerator {onRegionCreated} />
			</div>

			<!-- Regions List -->
			<div class="p-4 space-y-2">
				{#if sortedRegions.length === 0}
					<div class="p-4 text-center text-slate-500">
						<p class="text-sm">No regions yet.</p>
						<p class="text-xs mt-1">Create your first region above.</p>
					</div>
				{:else}
					{#each sortedRegions as region (region.id)}
						<button
							onclick={() => selectRegion(region.id)}
							class="w-full text-left p-3 rounded-lg border transition-all {selectedRegionId === region.id ? 'bg-emerald-900/40 border-emerald-500' : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'} {region.completed ? 'opacity-60' : ''}"
						>
							<div class="flex items-start gap-2">
								<span class="text-xl flex-shrink-0">{typeIcons[region.type]}</span>
								<div class="flex-1 min-w-0">
									<div class="font-medium text-white text-sm mb-1 flex items-center gap-2">
										{region.name}
										{#if region.completed}
											<span class="text-xs text-green-400">✓</span>
										{/if}
									</div>
									<div class="text-xs text-slate-400">
										{region.type} • {region.areas.length} area{region.areas.length !== 1 ? 's' : ''}
									</div>
									<div class="text-xs text-emerald-400 mt-1">
										PP: {region.progressPoints}
									</div>
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Main Panel: Region Details -->
		<div class="flex-1 overflow-y-auto">
			{#if !selectedRegion}
				<div class="h-full flex items-center justify-center p-8">
					<div class="text-center text-slate-500 max-w-md">
						<div class="text-6xl mb-4">🗺️</div>
						<h3 class="text-xl font-bold mb-2">Welcome to Location Crafter</h3>
						<p class="text-sm mb-4">
							Location Crafter is a procedural location generation system from Mythic Magazine Volume
							2. Use it to dynamically create regions, areas, and encounters for your solo RPG
							adventures.
						</p>
						<p class="text-sm text-emerald-400">
							Create your first region to get started →
						</p>
					</div>
				</div>
			{:else}
				<div class="p-6 space-y-6">
					<!-- Region Header -->
					<div class="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-4">
						<div class="flex items-start justify-between mb-3">
							<div class="flex items-start gap-3">
								<span class="text-4xl">{typeIcons[selectedRegion.type]}</span>
								<div>
									<h3 class="text-2xl font-bold text-white">{selectedRegion.name}</h3>
									<div class="text-sm text-slate-400 mt-1">
										{selectedRegion.type} Region • Created {formatDate(selectedRegion.timestamp)}
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<button
									onclick={() => toggleRegionComplete(selectedRegion.id)}
									class="text-xs px-3 py-1.5 {selectedRegion.completed ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'} text-white rounded transition-colors"
									title={selectedRegion.completed ? 'Mark as incomplete' : 'Mark as complete'}
								>
									{selectedRegion.completed ? '✓ Complete' : 'Mark Complete'}
								</button>
								<button
									onclick={() => deleteRegion(selectedRegion.id)}
									class="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
								>
									Delete
								</button>
							</div>
						</div>

						<!-- Region Descriptors -->
						<div class="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded">
							<div class="text-xs text-emerald-400 mb-1">Region Descriptors:</div>
							<div class="text-sm text-white font-medium">
								{selectedRegion.descriptor1} / {selectedRegion.descriptor2}
							</div>
							{#if selectedRegion.description}
								<p class="text-sm text-slate-300 mt-2">{selectedRegion.description}</p>
							{/if}
						</div>

						<!-- Dungeon Story Descriptors (if present) -->
						{#if selectedRegion.storyDescriptor1 || selectedRegion.storyDescriptor2 || selectedRegion.storyDescription}
							<div class="p-3 bg-purple-900/20 border border-purple-500/30 rounded mt-3">
								<div class="text-xs text-purple-400 mb-1">Dungeon Story:</div>
								{#if selectedRegion.storyDescriptor1 && selectedRegion.storyDescriptor2}
									<div class="text-sm text-white font-medium mb-1">
										{selectedRegion.storyDescriptor1} / {selectedRegion.storyDescriptor2}
									</div>
								{/if}
								{#if selectedRegion.storyDescription}
									<p class="text-sm text-slate-300 mt-2">{selectedRegion.storyDescription}</p>
								{/if}
							</div>
						{/if}

						<!-- Region Stats -->
						<div class="grid grid-cols-3 gap-3 mt-3">
							<div class="p-2 bg-blue-900/20 border border-blue-500/30 rounded text-center">
								<div class="text-xs text-blue-400">Progress Points</div>
								<div class="text-xl font-bold text-white font-mono">{selectedRegion.progressPoints}</div>
							</div>
							<div class="p-2 bg-purple-900/20 border border-purple-500/30 rounded text-center">
								<div class="text-xs text-purple-400">Areas</div>
								<div class="text-xl font-bold text-white">{selectedRegion.areas.length}</div>
							</div>
							<div class="p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-center">
								<div class="text-xs text-yellow-400">Known Elements</div>
								<div class="text-xl font-bold text-white">{selectedRegion.knownElements.length}</div>
							</div>
						</div>
					</div>

					<!-- Tabs -->
					<div class="flex gap-2 border-b border-slate-700">
						<button
							onclick={() => (activeTab = 'areas')}
							class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'areas' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}"
						>
							Areas ({selectedRegion.areas.length})
						</button>
						<button
							onclick={() => (activeTab = 'known')}
							class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'known' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}"
						>
							Known Elements ({selectedRegion.knownElements.length})
						</button>
						<button
							onclick={() => (activeTab = 'history')}
							class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}"
						>
							History ({selectedRegion.history.length})
						</button>
					</div>

					<!-- Tab Content -->
					{#if activeTab === 'areas'}
						<div class="space-y-4">
							<!-- Area Generator -->
							<AreaGenerator regionId={selectedRegion.id} />

							<!-- Areas List -->
							{#if selectedRegion.areas.length === 0}
								<div class="p-6 text-center text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700">
									<div class="text-4xl mb-2">🏗️</div>
									<p class="text-sm">No areas generated yet.</p>
									<p class="text-xs mt-1">Generate your first area above.</p>
								</div>
							{:else}
								<div class="space-y-3">
									{#each [...selectedRegion.areas].sort((a, b) => b.number - a.number) as area (area.id)}
										<div class="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
											<div class="flex items-center justify-between mb-3">
												<h4 class="text-lg font-bold text-white">
													Area #{area.number}
													{#if area.isSecretArea}
														<span class="text-xs ml-2 px-2 py-0.5 bg-orange-600/30 text-orange-300 rounded" title="Found via secret door">
															🔍 Secret
														</span>
													{/if}
												</h4>
												<div class="text-xs text-slate-400">
													{formatDate(area.timestamp)}
												</div>
											</div>

											<!-- Dungeon Connector (if present) -->
											{#if area.connectorFromPrevious}
												<div class="mb-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded">
													<div class="text-xs text-purple-400 mb-1">🚪 Connector:</div>
													<div class="text-sm text-white font-medium">{area.connectorFromPrevious}</div>
													{#if area.connectorDescription}
														<p class="text-sm text-slate-300 mt-1">{area.connectorDescription}</p>
													{/if}
												</div>
											{/if}

											<div class="grid gap-3">
												<!-- Large Location -->
												<div class="p-3 bg-purple-900/20 border border-purple-500/30 rounded">
													<div class="text-xs text-purple-400 mb-1">
														Large Location: <span class="font-medium">{area.largeLoc}</span>
													</div>
													{#if area.largeLocDescription}
														<div class="text-sm text-white">{area.largeLocDescription}</div>
													{/if}
												</div>

												<!-- Small Location -->
												<div class="p-3 bg-teal-900/20 border border-teal-500/30 rounded">
													<div class="text-xs text-teal-400 mb-1">
														Small Location: <span class="font-medium">{area.smallLoc}</span>
													</div>
													{#if area.smallLocDescription}
														<div class="text-sm text-white">{area.smallLocDescription}</div>
													{/if}
												</div>

												<!-- Encounter/Object -->
												<div class="p-3 bg-amber-900/20 border border-amber-500/30 rounded">
													<div class="text-xs text-amber-400 mb-1">
														Encounter/Object: <span class="font-medium">{area.encounterObj}</span>
													</div>
													{#if area.encounterObjDescription}
														<div class="text-sm text-white">{area.encounterObjDescription}</div>
													{/if}
												</div>
											</div>

											{#if area.notes}
												<div class="mt-3 p-2 bg-slate-700/50 rounded text-sm text-slate-300">
													{area.notes}
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else if activeTab === 'known'}
						<KnownElementsSheet regionId={selectedRegion.id} />
					{:else if activeTab === 'history'}
						<AreaHistoryTimeline regionId={selectedRegion.id} />
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Help Modal -->
<LocationCrafterHelp isOpen={showHelp} onClose={() => (showHelp = false)} />
