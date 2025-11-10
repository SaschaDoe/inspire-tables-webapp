<script lang="ts">
	import { Campaign, NarrativeMediumType } from '$lib/entities/campaign';
	import { CampaignCreator } from '$lib/creators/campaignCreator';
	import { onMount } from 'svelte';
	import { getGenreFullName } from '$lib/entities/genre';
	import { CampaignStatementTable } from '$lib/tables/campaignTables/campaignStatementTable';
	import { Dice } from '$lib/utils/dice';

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
			campaigns = campaigns;
			saveCampaigns();
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
			campaigns = campaigns;
			saveCampaigns();
		}
	}

	function removeCampaignStatement(campaignId: string, statementIndex: number) {
		const campaign = campaigns.find((c) => c.id === campaignId);
		if (campaign && campaign.genreMix && campaign.genreMix.themeStatements) {
			campaign.genreMix.themeStatements.splice(statementIndex, 1);
			campaign.updatedAt = new Date();
			campaigns = campaigns;
			saveCampaigns();
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
				<label class="block text-purple-200 mb-3 text-lg">Narrative Medium:</label>
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
					<div
						class="group relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all shadow-xl"
					>
						<!-- Glow effect on hover -->
						<div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-25 transition-opacity"></div>

						<div class="relative">
							<div class="flex items-start justify-between mb-4">
								<input
									type="text"
									value={campaign.name}
									onchange={(e) => updateCampaignName(campaign.id, e.currentTarget.value)}
									class="text-2xl font-bold bg-transparent text-white border-b-2 border-transparent hover:border-purple-500/50 focus:border-purple-500 focus:outline-none transition-colors"
								/>
								<button
									onclick={() => deleteCampaign(campaign.id)}
									class="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
								>
									Delete
								</button>
							</div>

							{#if campaign.genreMix}
								<div class="space-y-4">
									<p class="text-purple-100 text-lg leading-relaxed">{campaign.genreMix.description}</p>

									<!-- Genre Weights -->
									<div>
										<h4 class="text-sm font-semibold text-purple-300 mb-2">Genre Mix:</h4>
										<div class="flex flex-wrap gap-2">
											{#each Object.entries(campaign.genreMix.genreWeights) as [genre, weight]}
												<div
													class="px-3 py-1 bg-purple-900/30 rounded-full text-purple-100 text-sm border border-purple-500/30"
												>
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
												<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-purple-500/50 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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
											<span class="text-purple-100 font-bold"
												>{campaign.genreMix.blendIntensity}/10</span
											>
										</div>
									</div>

									<!-- Campaign Statements -->
									<div>
										<div class="flex items-center justify-between mb-2">
											<h4 class="text-sm font-semibold text-purple-300">Campaign Statements:</h4>
											<button
												onclick={() => addCampaignStatement(campaign.id)}
												class="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs rounded-lg transition-all shadow-sm"
											>
												+ Add Statement
											</button>
										</div>
										{#if campaign.genreMix.themeStatements && campaign.genreMix.themeStatements.length > 0}
											<div class="space-y-2">
												{#each campaign.genreMix.themeStatements as statement, index}
													<div class="flex items-start gap-2 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
														<span class="text-pink-400 text-lg mt-0.5">✨</span>
														<p class="flex-1 text-purple-100 text-sm leading-relaxed">{statement}</p>
														<button
															onclick={() => removeCampaignStatement(campaign.id, index)}
															class="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs rounded transition-colors"
														>
															Remove
														</button>
													</div>
												{/each}
											</div>
										{:else}
											<p class="text-purple-300 text-sm italic">No campaign statements yet. Click "Add Statement" to generate one.</p>
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
