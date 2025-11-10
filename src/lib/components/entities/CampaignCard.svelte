<script lang="ts">
	import { onMount } from 'svelte';
	import type { Campaign } from '$lib/entities/campaign';
	import { getGenreFullName } from '$lib/entities/genre';
	import { entityStore } from '$lib/stores/entityStore';
	import type { AdventureEntity } from '$lib/types/entity';

	interface Props {
		campaign: Campaign;
		showActions?: boolean;
		onDelete?: (id: string) => void;
		onNameChange?: (id: string, name: string) => void;
		onAddAdventure?: (id: string) => void;
		onOpenAdventure?: (adventureId: string) => void;
		onAddStatement?: (id: string) => void;
		onRemoveStatement?: (id: string, index: number) => void;
	}

	let {
		campaign,
		showActions = true,
		onDelete,
		onNameChange,
		onAddAdventure,
		onOpenAdventure,
		onAddStatement,
		onRemoveStatement
	}: Props = $props();

	let adventures = $state<AdventureEntity[]>([]);

	onMount(() => {
		loadAdventures();
	});

	// Reload adventures when campaign changes (e.g., after adding new adventure)
	$effect(() => {
		// Watch for changes to campaign.updatedAt to reload adventures
		campaign.updatedAt;
		loadAdventures();
	});

	function loadAdventures() {
		const allEntities = entityStore.searchEntities('');
		adventures = allEntities
			.filter(e => e.type === 'adventure' && e.campaignId === campaign.id)
			.map(e => e as AdventureEntity);
	}

	function handleNameChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		onNameChange?.(campaign.id, target.value);
	}
</script>

<div class="campaign-card group relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all shadow-xl">
	<!-- Glow effect on hover -->
	<div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-25 transition-opacity"></div>

	<div class="relative">
		<!-- Header -->
		<div class="flex items-start justify-between mb-4">
			{#if showActions && onNameChange}
				<input
					type="text"
					value={campaign.name}
					onchange={handleNameChange}
					class="text-2xl font-bold bg-transparent text-white border-b-2 border-transparent hover:border-purple-500/50 focus:border-purple-500 focus:outline-none transition-colors flex-1 mr-4"
				/>
			{:else}
				<h2 class="text-2xl font-bold text-white">{campaign.name}</h2>
			{/if}

			{#if showActions && onDelete}
				<button
					onclick={() => onDelete?.(campaign.id)}
					class="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
				>
					Delete
				</button>
			{/if}
		</div>

		{#if campaign.genreMix}
			<div class="space-y-4">
				<!-- Description -->
				<p class="text-purple-100 text-lg leading-relaxed">{campaign.genreMix.description}</p>

				<!-- Genre Weights -->
				<div>
					<h4 class="text-sm font-semibold text-purple-300 mb-2">Genre Mix:</h4>
					<div class="flex flex-wrap gap-2">
						{#each Object.entries(campaign.genreMix.genreWeights) as [genre, weight]}
							<div class="px-3 py-1 bg-purple-900/30 rounded-full text-purple-100 text-sm border border-purple-500/30">
								{genre}: <span class="font-bold">{weight}%</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Blend Intensity -->
				<div>
					<div class="flex items-center gap-2 mb-2">
						<h4 class="text-sm font-semibold text-purple-300">Blend Intensity:</h4>
						<div class="relative group inline-block">
							<span class="text-purple-400 cursor-help text-xs">ℹ️</span>
							<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-purple-500/50 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
								<p class="text-xs text-purple-100 leading-relaxed">
									<strong class="text-purple-300">Low (1-3):</strong> Genres mostly separate, subtle touches<br/>
									<strong class="text-purple-300">Medium (4-6):</strong> Genres blended but distinct<br/>
									<strong class="text-purple-300">High (7-10):</strong> Genres deeply intertwined
								</p>
								<div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
							</div>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<div class="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
								style="width: {campaign.genreMix.blendIntensity * 10}%"
							></div>
						</div>
						<span class="text-purple-100 font-bold">{campaign.genreMix.blendIntensity}/10</span>
					</div>
				</div>

				<!-- Campaign Statements -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<h4 class="text-sm font-semibold text-purple-300">Campaign Statements:</h4>
						{#if showActions && onAddStatement}
							<button
								onclick={() => onAddStatement?.(campaign.id)}
								class="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs rounded-lg transition-all shadow-sm"
							>
								+ Add Statement
							</button>
						{/if}
					</div>
					{#if campaign.genreMix.themeStatements && campaign.genreMix.themeStatements.length > 0}
						<div class="space-y-2">
							{#each campaign.genreMix.themeStatements as statement, index}
								<div class="flex items-start gap-2 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
									<span class="text-pink-400 text-lg mt-0.5">✨</span>
									<p class="flex-1 text-purple-100 text-sm leading-relaxed">{statement}</p>
									{#if showActions && onRemoveStatement}
										<button
											onclick={() => onRemoveStatement?.(campaign.id, index)}
											class="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs rounded transition-colors"
										>
											Remove
										</button>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-purple-300 text-sm italic">No campaign statements yet. Click "Add Statement" to generate one.</p>
					{/if}
				</div>

				<!-- Adventures Section -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<h4 class="text-sm font-semibold text-purple-300">Adventures:</h4>
						{#if showActions && onAddAdventure}
							<button
								onclick={() => onAddAdventure?.(campaign.id)}
								class="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs rounded-lg transition-all shadow-sm"
							>
								+ Add Adventure
							</button>
						{/if}
					</div>

					{#if adventures.length > 0}
						<div class="space-y-2">
							{#each adventures as adventure}
								<button
									onclick={() => onOpenAdventure?.(adventure.id)}
									class="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all"
								>
									<div class="flex items-center gap-2">
										<span class="text-xl">🗺️</span>
										<span class="text-white font-semibold">{adventure.name}</span>
										{#if adventure.status}
											<span class="px-2 py-0.5 bg-blue-900/30 rounded-full text-blue-200 text-xs">
												{adventure.status}
											</span>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					{:else}
						<p class="text-purple-300 text-sm italic">No adventures yet. Click "Add Adventure" to create one.</p>
					{/if}
				</div>

				<!-- Metadata -->
				<div class="flex gap-4 text-sm text-purple-300">
					<span>📺 {campaign.narrativeMediumType}</span>
					<span>📅 {new Date(campaign.createdAt).toLocaleDateString()}</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.campaign-card {
		container-type: inline-size;
	}
</style>
