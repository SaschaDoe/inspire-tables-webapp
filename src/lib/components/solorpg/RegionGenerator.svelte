<script lang="ts">
	/**
	 * Region Generator Component (Phase 4A + Mythic Vol 3 Dungeons)
	 * Creates new regions for Location Crafter
	 */

	import { soloRpgStore } from '$lib/stores/soloRpgStore.svelte';
	import { rollRegionDescriptor, type RegionType } from '$lib/utils/locationCrafterTables';
	import { rollDungeonStoryDescriptor } from '$lib/tables/mythicTables/dungeonStoryDescriptorsTable';
	import { rollDungeonRegionDescriptor } from '$lib/tables/mythicTables/dungeonRegionDescriptorsTable';

	interface Props {
		onRegionCreated?: () => void;
	}

	let { onRegionCreated }: Props = $props();

	// State
	let showForm = $state(false);
	let regionName = $state('');
	let regionType = $state<RegionType>('Wilderness');
	let descriptor1 = $state('');
	let descriptor2 = $state('');
	let description = $state('');
	let hasRolled = $state(false);

	// Mythic Vol 3: Dungeon story descriptors
	let storyDescriptor1 = $state('');
	let storyDescriptor2 = $state('');
	let storyDescription = $state('');
	let hasRolledStory = $state(false);

	// Derived
	let currentSession = $derived(soloRpgStore.currentSession);
	let isDungeon = $derived(
		regionType === 'Cavern Dungeon' ||
			regionType === 'Ancient Dungeon' ||
			regionType === 'Palatial Dungeon'
	);
	let canCreate = $derived(
		regionName.trim() !== '' && descriptor1.trim() !== '' && descriptor2.trim() !== ''
	);

	function startNewRegion() {
		showForm = true;
		resetForm();
	}

	function resetForm() {
		regionName = '';
		regionType = 'Wilderness';
		descriptor1 = '';
		descriptor2 = '';
		description = '';
		hasRolled = false;
		storyDescriptor1 = '';
		storyDescriptor2 = '';
		storyDescription = '';
		hasRolledStory = false;
	}

	function rollStoryDescriptors() {
		if (!isDungeon) return;
		storyDescriptor1 = rollDungeonStoryDescriptor(regionType as any);
		storyDescriptor2 = rollDungeonStoryDescriptor(regionType as any);
		hasRolledStory = true;
	}

	function rerollStoryDescriptor1() {
		if (!isDungeon) return;
		storyDescriptor1 = rollDungeonStoryDescriptor(regionType as any);
	}

	function rerollStoryDescriptor2() {
		if (!isDungeon) return;
		storyDescriptor2 = rollDungeonStoryDescriptor(regionType as any);
	}

	function rollDescriptors() {
		if (isDungeon) {
			descriptor1 = rollDungeonRegionDescriptor(regionType as any);
			descriptor2 = rollDungeonRegionDescriptor(regionType as any);
		} else {
			descriptor1 = rollRegionDescriptor(regionType);
			descriptor2 = rollRegionDescriptor(regionType);
		}
		hasRolled = true;
	}

	function rerollDescriptor1() {
		if (isDungeon) {
			descriptor1 = rollDungeonRegionDescriptor(regionType as any);
		} else {
			descriptor1 = rollRegionDescriptor(regionType);
		}
	}

	function rerollDescriptor2() {
		if (isDungeon) {
			descriptor2 = rollDungeonRegionDescriptor(regionType as any);
		} else {
			descriptor2 = rollRegionDescriptor(regionType);
		}
	}

	function createRegion() {
		if (!canCreate) return;

		const region = soloRpgStore.createRegion(
			regionName.trim(),
			regionType,
			descriptor1.trim(),
			descriptor2.trim(),
			description.trim()
		);

		// Add story descriptors for dungeons
		if (isDungeon && region && hasRolledStory) {
			soloRpgStore.updateRegion(region.id, {
				storyDescriptor1: storyDescriptor1.trim(),
				storyDescriptor2: storyDescriptor2.trim(),
				storyDescription: storyDescription.trim()
			});
		}

		resetForm();
		showForm = false;
		onRegionCreated?.();
	}

	function cancel() {
		resetForm();
		showForm = false;
	}

	// Type info for guidance
	const typeGuidance: Record<RegionType, string> = {
		Wilderness:
			'Natural areas like forests, deserts, mountains, jungles, oceans, tundra, etc.',
		City: 'Civilized settlements like towns, cities, villages, space stations, etc.',
		Structure: 'Built structures like buildings, castles, dungeons, ships, temples, etc.',
		'Cavern Dungeon':
			'🏔️ Natural cave systems, underground fissures, deep earth dwellings',
		'Ancient Dungeon':
			'🏚️ Classic catacombs, dark dungeons, cobwebbed ruins from bygone ages',
		'Palatial Dungeon':
			'🏰 Castles, grand structures, less decrepit but still dangerous places'
	};

	// Type icons for visual differentiation
	const typeIcons: Record<RegionType, string> = {
		Wilderness: '🌲',
		City: '🏙️',
		Structure: '🏛️',
		'Cavern Dungeon': '⛰️',
		'Ancient Dungeon': '🏚️',
		'Palatial Dungeon': '🏰'
	};
</script>

{#if !showForm}
	<div class="p-4">
		<button
			onclick={startNewRegion}
			class="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg transition-all shadow-lg hover:scale-105 active:scale-95"
		>
			<span class="flex items-center justify-center gap-2">
				<span>🗺️</span>
				<span>Create New Region</span>
			</span>
		</button>
	</div>
{:else}
	<div class="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-emerald-500/30">
		<!-- Header -->
		<div class="flex items-center gap-3 pb-3 border-b border-emerald-500/30">
			<span class="text-3xl">🗺️</span>
			<div>
				<h3 class="text-xl font-bold text-emerald-300">New Region</h3>
				<p class="text-sm text-slate-400 mt-1">Location Crafter region generator</p>
			</div>
		</div>

		<!-- Region Name -->
		<div>
			<label for="region-name" class="block text-sm font-medium text-white mb-2">
				Region Name
			</label>
			<input
				id="region-name"
				type="text"
				bind:value={regionName}
				placeholder="e.g., Dark Forest, Crystal Caverns, Port Town..."
				class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
			/>
		</div>

		<!-- Region Type -->
		<div>
			<label for="region-type" class="block text-sm font-medium text-white mb-2">
				Region Type
			</label>
			<select
				id="region-type"
				bind:value={regionType}
				onchange={() => {
					descriptor1 = '';
					descriptor2 = '';
					storyDescriptor1 = '';
					storyDescriptor2 = '';
					hasRolled = false;
					hasRolledStory = false;
				}}
				class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
			>
				<optgroup label="Standard Regions">
					<option value="Wilderness">{typeIcons['Wilderness']} Wilderness</option>
					<option value="City">{typeIcons['City']} City</option>
					<option value="Structure">{typeIcons['Structure']} Structure</option>
				</optgroup>
				<optgroup label="Dungeons (Mythic Vol 3)">
					<option value="Cavern Dungeon">{typeIcons['Cavern Dungeon']} Cavern Dungeon</option>
					<option value="Ancient Dungeon">{typeIcons['Ancient Dungeon']} Ancient Dungeon</option>
					<option value="Palatial Dungeon">{typeIcons['Palatial Dungeon']} Palatial Dungeon</option>
				</optgroup>
			</select>
			<p class="text-xs text-slate-400 mt-1">{typeGuidance[regionType]}</p>
		</div>

		<!-- Dungeon Story Descriptors (Mythic Vol 3) -->
		{#if isDungeon}
			<div class="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
				<h4 class="text-purple-300 font-medium mb-3">Dungeon Story (Optional)</h4>
				<p class="text-sm text-slate-300 mb-3">
					Roll for the "why" behind this dungeon - its background and reason for existing.
				</p>

				{#if !hasRolledStory}
					<button
						onclick={rollStoryDescriptors}
						class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
					>
						🎲 Roll Story Descriptors
					</button>
					<button
						onclick={() => {
							hasRolledStory = true;
							storyDescriptor1 = '';
							storyDescriptor2 = '';
						}}
						class="w-full mt-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
					>
						Skip (I know the story)
					</button>
				{:else}
					<div class="space-y-3">
						{#if storyDescriptor1 || storyDescriptor2}
							<!-- Story Descriptor 1 -->
							<div class="p-3 bg-slate-800/50 rounded border border-purple-500/20">
								<div class="flex items-center justify-between mb-2">
									<label for="story-descriptor-1" class="text-sm text-slate-400"
										>Story Element 1:</label
									>
									<button
										onclick={rerollStoryDescriptor1}
										class="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
									>
										🎲 Reroll
									</button>
								</div>
								<input
									id="story-descriptor-1"
									type="text"
									bind:value={storyDescriptor1}
									class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
								/>
							</div>

							<!-- Story Descriptor 2 -->
							<div class="p-3 bg-slate-800/50 rounded border border-purple-500/20">
								<div class="flex items-center justify-between mb-2">
									<label for="story-descriptor-2" class="text-sm text-slate-400"
										>Story Element 2:</label
									>
									<button
										onclick={rerollStoryDescriptor2}
										class="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
									>
										🎲 Reroll
									</button>
								</div>
								<input
									id="story-descriptor-2"
									type="text"
									bind:value={storyDescriptor2}
									class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
								/>
							</div>

							<!-- Story Interpretation -->
							<div>
								<label for="story-description" class="block text-sm text-slate-400 mb-2">
									Story Interpretation (optional)
								</label>
								<textarea
									id="story-description"
									bind:value={storyDescription}
									placeholder="Combine these story elements to create the dungeon's background..."
									class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
									rows="2"
								></textarea>
							</div>
						{:else}
							<p class="text-sm text-slate-400 italic">Story skipped - you already know the tale</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Roll Descriptors -->
		<div class="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
			<h4 class="text-emerald-300 font-medium mb-3">Region Descriptors</h4>
			<p class="text-sm text-slate-300 mb-3">
				Roll twice on the Region Descriptors Table to get two characteristics of this region.
			</p>

			{#if !hasRolled}
				<button
					onclick={rollDescriptors}
					class="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
				>
					🎲 Roll Region Descriptors
				</button>
			{:else}
				<div class="space-y-3">
					<!-- Descriptor 1 -->
					<div class="p-3 bg-slate-800/50 rounded border border-emerald-500/20">
						<div class="flex items-center justify-between mb-2">
							<label for="descriptor-1" class="text-sm text-slate-400">Descriptor 1:</label>
							<button
								onclick={rerollDescriptor1}
								class="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
							>
								🎲 Reroll
							</button>
						</div>
						<input
							id="descriptor-1"
							type="text"
							bind:value={descriptor1}
							class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
						/>
					</div>

					<!-- Descriptor 2 -->
					<div class="p-3 bg-slate-800/50 rounded border border-emerald-500/20">
						<div class="flex items-center justify-between mb-2">
							<label for="descriptor-2" class="text-sm text-slate-400">Descriptor 2:</label>
							<button
								onclick={rerollDescriptor2}
								class="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
							>
								🎲 Reroll
							</button>
						</div>
						<input
							id="descriptor-2"
							type="text"
							bind:value={descriptor2}
							class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
						/>
					</div>
				</div>
			{/if}
		</div>

		<!-- Interpretation Guidance -->
		{#if hasRolled}
			<div class="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
				<h4 class="text-blue-300 font-medium mb-2">Interpreting Descriptors</h4>
				<p class="text-sm text-slate-300 mb-2">
					Combine the two descriptors to get an idea of what this region is like. The descriptors
					are intentionally generic to fit many situations.
				</p>
				<ul class="text-sm text-slate-300 space-y-1.5">
					<li class="flex items-start gap-2">
						<span class="text-blue-400">•</span>
						<span>What do these descriptors suggest about the environment?</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-blue-400">•</span>
						<span>How might they interact or contradict each other?</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-blue-400">•</span>
						<span>What challenges or opportunities do they create?</span>
					</li>
				</ul>
			</div>

			<!-- Description -->
			<div>
				<label for="region-description" class="block text-sm font-medium text-white mb-2">
					Your Interpretation (optional)
				</label>
				<textarea
					id="region-description"
					bind:value={description}
					placeholder="Describe how you interpret these descriptors for this region..."
					class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
					rows="3"
				></textarea>
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex gap-2 pt-2 border-t border-emerald-500/30">
			<button
				onclick={createRegion}
				disabled={!canCreate}
				class="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
			>
				✓ Create Region
			</button>
			<button
				onclick={cancel}
				class="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
			>
				Cancel
			</button>
		</div>
	</div>
{/if}
