<script lang="ts">
	import { Campaign, NarrativeMediumType } from '$lib/entities/campaign';
	import { CampaignCreator } from '$lib/creators/campaignCreator';
	import { onMount } from 'svelte';
	import { getGenreFullName } from '$lib/entities/genre';
	import { CampaignStatementTable } from '$lib/tables/campaignTables/campaignStatementTable';
	import { Dice } from '$lib/utils/dice';
	import CampaignCard from '$lib/components/entities/CampaignCard.svelte';
	import { entityStore } from '$lib/stores/entityStore';
	import { tabStore } from '$lib/stores/tabStore';
	import type { AdventureEntity } from '$lib/types/entity';
	import { EntityType } from '$lib/types/entity';
	import { goto } from '$app/navigation';

	let campaigns = $state<Campaign[]>([]);
	let isGenerating = $state(false);
	let selectedMedium = $state<NarrativeMediumType>(NarrativeMediumType.RPG);
	let showCreationLog = $state(false);
	let currentLog = $state<string[]>([]);

	onMount(() => {
		loadCampaigns();
	});

	function loadCampaigns() {
		const stored = localStorage.getItem('campaigns');
		if (stored) {
			campaigns = JSON.parse(stored);
		}
	}

	function saveCampaigns() {
		localStorage.setItem('campaigns', JSON.stringify(campaigns));
	}

	function generateCampaign() {
		isGenerating = true;
		showCreationLog = false;

		setTimeout(() => {
			const creator = new CampaignCreator(selectedMedium);
			const campaign = creator.create();
			campaign.name = `Campaign ${campaigns.length + 1}`;
			campaign.createdAt = new Date();

			currentLog = campaign.creationLog;
			campaigns = [campaign, ...campaigns];
			saveCampaigns();

			isGenerating = false;
			showCreationLog = true;
		}, 800);
	}

	function deleteCampaign(id: string) {
		campaigns = campaigns.filter((c) => c.id !== id);
		saveCampaigns();
	}

	function updateCampaignName(id: string, newName: string) {
		const campaign = campaigns.find((c) => c.id === id);
		if (campaign) {
			campaign.name = newName;
			campaign.updatedAt = new Date();
			saveCampaigns();
			// Trigger reactivity by reassigning the array
			campaigns = [...campaigns];
		}
	}

	function addCampaignStatement(id: string) {
		const campaign = campaigns.find((c) => c.id === id);
		if (campaign && campaign.genreMix) {
			const dice = new Dice();
			const statementTable = new CampaignStatementTable();
			const result = statementTable.roleWithCascade(dice);

			if (!campaign.genreMix.themeStatements) {
				campaign.genreMix.themeStatements = [];
			}

			campaign.genreMix.themeStatements.push(result.text);
			campaign.updatedAt = new Date();
			saveCampaigns();
			// Trigger reactivity by reassigning the array
			campaigns = [...campaigns];
		}
	}

	function removeCampaignStatement(campaignId: string, statementIndex: number) {
		const campaign = campaigns.find((c) => c.id === campaignId);
		if (campaign && campaign.genreMix && campaign.genreMix.themeStatements) {
			campaign.genreMix.themeStatements.splice(statementIndex, 1);
			campaign.updatedAt = new Date();
			saveCampaigns();
			// Trigger reactivity by reassigning the array
			campaigns = [...campaigns];
		}
	}

	function addAdventure(campaignId: string) {
		const campaign = campaigns.find(c => c.id === campaignId);
		if (!campaign) return;

		// Get existing adventures for this campaign to number them
		const allEntities = entityStore.searchEntities('');
		const adventureCount = allEntities.filter(e => e.type === EntityType.Adventure && e.campaignId === campaignId).length;

		const newAdventure: AdventureEntity = {
			id: crypto.randomUUID(),
			type: EntityType.Adventure,
			name: `Adventure ${adventureCount + 1}`,
			description: 'A new adventure awaits...',
			tags: [],
			parentId: campaignId,
			campaignId: campaignId,
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [
				{
					targetId: campaignId,
					type: 'parent',
					label: 'belongs to'
				}
			],
			customFields: {},
			status: 'planned',
			plotStructure: {},
			sessions: []
		};

		entityStore.createEntity(newAdventure);

		// Update campaign to trigger re-render of CampaignCard
		campaign.updatedAt = new Date();
		saveCampaigns();
		campaigns = [...campaigns];
	}

	function openAdventure(adventureId: string) {
		// Get the adventure entity from the store
		const allEntities = entityStore.searchEntities('');
		const adventure = allEntities.find(e => e.id === adventureId && e.type === EntityType.Adventure) as AdventureEntity;

		if (adventure) {
			// Open the adventure in a tab
			tabStore.openTab(adventure);
			// Navigate to workspace to see it
			goto('/workspace');
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
		<div class="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
	</div>

	<!-- Header -->
	<div class="bg-slate-900/50 border-b border-purple-500/20 sticky top-0 z-10 backdrop-blur">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 flex items-center gap-3">
					<span class="text-4xl">🎭</span>
					<span>Campaign Generator</span>
				</h1>
				<a
					href="/"
					class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
				>
					Home
				</a>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8 max-w-6xl relative z-10">
		<!-- Generator Section -->
		<div class="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 mb-8 shadow-2xl">
			<h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6">Generate New Campaign</h2>

			<div class="mb-6">
				<div class="block text-purple-200 mb-3 text-lg">Narrative Medium:</div>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
					{#each Object.values(NarrativeMediumType) as medium}
						<button
							onclick={() => (selectedMedium = medium)}
							class="px-4 py-3 rounded-xl font-medium transition-all {selectedMedium === medium
								? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
								: 'bg-slate-800 text-purple-200 hover:bg-slate-700 border border-purple-500/20'}"
						>
							{medium}
						</button>
					{/each}
				</div>
			</div>

			<button
				onclick={generateCampaign}
				disabled={isGenerating}
				class="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-bold text-xl rounded-xl shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-200 hover:scale-105 active:scale-95 {isGenerating
					? 'animate-pulse'
					: ''}"
			>
				{isGenerating ? '🎲 Generating Campaign...' : '✨ Generate Campaign'}
			</button>

			<!-- Creation Log -->
			{#if showCreationLog && currentLog.length > 0}
				<div class="mt-6 p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-400/30">
					<h3 class="text-lg font-semibold text-purple-100 mb-3 flex items-center gap-2">
						<span>📜</span>
						<span>Creation Log</span>
					</h3>
					<div class="space-y-1">
						{#each currentLog as log}
							<p class="text-purple-200 text-sm font-mono">{log}</p>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Campaigns List -->
		<div class="space-y-4">
			<h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6">Your Campaigns ({campaigns.length})</h2>

			{#if campaigns.length === 0}
				<div class="text-center py-16">
					<div class="text-6xl mb-4">🎭</div>
					<p class="text-purple-200 text-lg">No campaigns yet. Generate your first one above!</p>
				</div>
			{:else}
				{#each campaigns as campaign (campaign.id)}
					<CampaignCard
						{campaign}
						showActions={true}
						onDelete={deleteCampaign}
						onNameChange={updateCampaignName}
						onAddStatement={addCampaignStatement}
						onRemoveStatement={removeCampaignStatement}
						onAddAdventure={addAdventure}
						onOpenAdventure={openAdventure}
					/>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	.delay-500 {
		animation-delay: 500ms;
	}

	.delay-1000 {
		animation-delay: 1000ms;
	}
</style>
