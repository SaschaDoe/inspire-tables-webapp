<script lang="ts">
	import { onMount } from 'svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import { tabStore, activeTab } from '$lib/stores/tabStore';
	import { entityStore } from '$lib/stores/entityStore';
	import CampaignCard from '$lib/components/entities/CampaignCard.svelte';
	import AdventureCard from '$lib/components/entities/AdventureCard.svelte';
	import type { Entity, AdventureEntity } from '$lib/types/entity';
	import { EntityType } from '$lib/types/entity';
	import type { Campaign } from '$lib/entities/campaign';

	let sidebarCollapsed = $state(false);
	let searchQuery = $state('');
	let campaigns = $state<Campaign[]>([]);
	let adventures = $state(new Map<string, AdventureEntity>());

	onMount(() => {
		// Load campaigns from entity store
		campaigns = entityStore.getCampaigns();
		loadAdventures();
	});

	// Reload adventures when entity store changes
	$effect(() => {
		// This will re-run when campaigns change (e.g., after adding adventure)
		campaigns.length;
		loadAdventures();
	});

	function loadAdventures() {
		const allEntities = entityStore.searchEntities('');
		adventures = new Map(
			allEntities
				.filter(e => e.type === 'adventure')
				.map(e => [e.id, e as AdventureEntity])
		);
	}

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}

	function openCampaign(campaign: Campaign) {
		// Convert legacy campaign to entity format for tab
		const entity: Entity = {
			id: campaign.id,
			type: 'campaign' as any,
			name: campaign.name,
			description: campaign.description || '',
			tags: [],
			metadata: {
				createdAt: campaign.createdAt,
				updatedAt: campaign.updatedAt || campaign.createdAt
			},
			relationships: [],
			customFields: { campaign }
		};
		tabStore.openTab(entity);
	}

	function openAdventure(adventure: AdventureEntity) {
		tabStore.openTab(adventure);
	}

	function addAdventure(campaignId: string) {
		const campaign = campaigns.find(c => c.id === campaignId);
		if (!campaign) return;

		const adventureCount = Array.from(adventures.values()).filter(a => a.campaignId === campaignId).length;

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
		loadAdventures();
		openAdventure(newAdventure);
	}

	function deleteCampaign(id: string) {
		const updated = campaigns.filter(c => c.id !== id);
		entityStore.updateCampaigns(updated);
		campaigns = updated;
		tabStore.closeTab(id);
	}

	function updateCampaignName(id: string, name: string) {
		const campaign = campaigns.find(c => c.id === id);
		if (campaign) {
			campaign.name = name;
			campaign.updatedAt = new Date();
			entityStore.updateCampaigns(campaigns);
			tabStore.updateTabTitle(`tab-${id}*`, name);
		}
	}

	function deleteAdventure(id: string) {
		entityStore.deleteEntity(id);
		loadAdventures();
		tabStore.closeTab(id);
	}

	function updateAdventureName(id: string, name: string) {
		entityStore.updateEntity(id, { name });
		loadAdventures();
	}

	function updateAdventureStatus(id: string, status: string) {
		const adventure = adventures.get(id);
		if (adventure) {
			adventure.status = status as any;
			entityStore.updateEntity(id, { status } as any);
			loadAdventures();
		}
	}

	// Use $derived for computed values instead of $effect to avoid infinite loops
	let currentEntity = $derived.by(() => {
		const tab = $activeTab;
		if (!tab) return null;

		if (tab.entityType === 'campaign') {
			return null;
		} else if (tab.entityType === 'adventure') {
			return null;
		}
		return null;
	});

	let currentCampaign = $derived.by(() => {
		const tab = $activeTab;
		if (!tab || tab.entityType !== 'campaign') return null;
		return campaigns.find(c => c.id === tab.entityId) || null;
	});

	let currentAdventure = $derived.by(() => {
		const tab = $activeTab;
		if (!tab || tab.entityType !== 'adventure') return null;
		return adventures.get(tab.entityId) || null;
	});

	let breadcrumbs = $derived.by(() => {
		const tab = $activeTab;
		if (!tab) return [];

		if (tab.entityType === 'campaign') {
			const campaign = campaigns.find(c => c.id === tab.entityId);
			return campaign ? [{ id: campaign.id, name: campaign.name, type: 'campaign' }] : [];
		} else if (tab.entityType === 'adventure') {
			const adventure = adventures.get(tab.entityId);
			if (!adventure) return [];

			const campaign = campaigns.find(c => c.id === adventure.campaignId);
			return campaign
				? [
						{ id: campaign.id, name: campaign.name, type: 'campaign' },
						{ id: adventure.id, name: adventure.name, type: 'adventure' }
				  ]
				: [{ id: adventure.id, name: adventure.name, type: 'adventure' }];
		}
		return [];
	});

	function navigateToBreadcrumb(item: { id: string; type: string }) {
		if (item.type === 'campaign') {
			const campaign = campaigns.find(c => c.id === item.id);
			if (campaign) openCampaign(campaign);
		} else if (item.type === 'adventure') {
			const adventure = adventures.get(item.id);
			if (adventure) openAdventure(adventure);
		}
	}
</script>

<div class="workspace">
	<!-- Top Navigation Bar -->
	<div class="top-nav">
		<div class="nav-left">
			<a href="/" class="logo">
				<span class="text-3xl">🎲</span>
				<span class="logo-text">Inspire Tables</span>
			</a>
			<div class="breadcrumb">
				{#if breadcrumbs.length > 0}
					{#each breadcrumbs as crumb, index}
						{#if index > 0}
							<span class="breadcrumb-separator">›</span>
						{/if}
						<button
							onclick={() => navigateToBreadcrumb(crumb)}
							class="breadcrumb-item"
						>
							{crumb.type === 'campaign' ? '🎭' : crumb.type === 'adventure' ? '🗺️' : '📄'}
							{crumb.name}
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<div class="nav-center">
			<div class="search-bar">
				<span class="search-icon">🔍</span>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search entities... (Ctrl+P)"
					class="search-input"
				/>
			</div>
		</div>

		<div class="nav-right">
			<a href="/tables" class="nav-link">Tables</a>
			<a href="/campaigns" class="nav-link">Legacy Campaigns</a>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="main-container">
		<!-- Left Sidebar -->
		<aside class="sidebar {sidebarCollapsed ? 'collapsed' : ''}">
			<div class="sidebar-header">
				<h2 class="sidebar-title">Navigator</h2>
				<button onclick={toggleSidebar} class="collapse-btn">
					{sidebarCollapsed ? '→' : '←'}
				</button>
			</div>

			{#if !sidebarCollapsed}
				<div class="sidebar-content">
					<!-- Favorites Section -->
					<div class="sidebar-section">
						<h3 class="section-title">⭐ Favorites</h3>
						<p class="empty-message">No favorites yet</p>
					</div>

					<!-- Open Tabs Section -->
					<div class="sidebar-section">
						<h3 class="section-title">📑 Open Tabs</h3>
						{#if $tabStore.tabs.length > 0}
							<ul class="entity-list">
								{#each $tabStore.tabs as tab}
									<li class="entity-item {$tabStore.activeTabId === tab.id ? 'active' : ''}">
										<button onclick={() => tabStore.setActiveTab(tab.id)} class="entity-button">
											<span class="entity-icon">{tab.entityType === 'campaign' ? '🎭' : '📄'}</span>
											<span class="entity-name">{tab.title}</span>
											{#if tab.isPinned}
												<span class="pin-icon">📌</span>
											{/if}
										</button>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="empty-message">No open tabs</p>
						{/if}
					</div>

					<!-- Campaigns Tree -->
					<div class="sidebar-section">
						<h3 class="section-title">🎭 Campaigns</h3>
						{#if campaigns.length > 0}
							<ul class="entity-list">
								{#each campaigns as campaign}
									<li class="entity-item">
										<button onclick={() => openCampaign(campaign)} class="entity-button">
											<span class="entity-icon">🎭</span>
											<span class="entity-name">{campaign.name}</span>
										</button>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="empty-message">No campaigns yet</p>
							<a href="/campaigns" class="create-link">Create your first campaign →</a>
						{/if}
					</div>

					<!-- Adventures List -->
					<div class="sidebar-section">
						<h3 class="section-title">🗺️ Adventures</h3>
						{#if adventures.size > 0}
							<ul class="entity-list">
								{#each Array.from(adventures.values()) as adventure}
									<li class="entity-item">
										<button onclick={() => openAdventure(adventure)} class="entity-button">
											<span class="entity-icon">🗺️</span>
											<span class="entity-name">{adventure.name}</span>
											{#if adventure.campaignId}
												{#each campaigns as campaign}
													{#if campaign.id === adventure.campaignId}
														<span class="entity-tag">{campaign.name}</span>
													{/if}
												{/each}
											{/if}
										</button>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="empty-message">No adventures yet</p>
						{/if}
					</div>

					<!-- Recent Section -->
					<div class="sidebar-section">
						<h3 class="section-title">⏱️ Recent</h3>
						<p class="empty-message">No recent items</p>
					</div>
				</div>
			{/if}
		</aside>

		<!-- Center Content -->
		<div class="content-area">
			<TabBar />

			<div class="entity-view">
				{#if currentCampaign}
					<CampaignCard
						campaign={currentCampaign}
						showActions={true}
						onDelete={deleteCampaign}
						onNameChange={updateCampaignName}
						onAddAdventure={addAdventure}
						onOpenAdventure={(id) => {
							const adv = adventures.get(id);
							if (adv) openAdventure(adv);
						}}
					/>
				{:else if currentAdventure}
					<AdventureCard
						adventure={currentAdventure}
						showActions={true}
						onDelete={deleteAdventure}
						onNameChange={updateAdventureName}
						onStatusChange={updateAdventureStatus}
					/>
				{:else if $activeTab}
					<div class="entity-content">
						<h1 class="entity-title">{$activeTab.title}</h1>
						<p class="entity-type-badge">{$activeTab.entityType}</p>
						<div class="entity-details">
							<p class="text-purple-200">Entity type "{$activeTab.entityType}" view not yet implemented</p>
						</div>
					</div>
				{:else}
					<div class="empty-state">
						<div class="empty-icon">📂</div>
						<h2 class="empty-title">No entity open</h2>
						<p class="empty-description">Select an entity from the sidebar or search to get started</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.workspace {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: linear-gradient(to bottom right, rgb(15 23 42), rgb(88 28 135), rgb(15 23 42));
	}

	/* Top Navigation */
	.top-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.5);
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
		backdrop-filter: blur(12px);
		z-index: 50;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: white;
		font-weight: bold;
		font-size: 1.125rem;
	}

	.logo-text {
		background: linear-gradient(to right, rgb(216 180 254), rgb(251 207 232), rgb(191 219 254));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
	}

	.breadcrumb-separator {
		color: rgb(216 180 254 / 0.5);
		margin: 0 0.25rem;
		font-size: 0.875rem;
	}

	.breadcrumb-item {
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: none;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		cursor: pointer;
		border-radius: 0.25rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.breadcrumb-item:hover {
		background: rgb(168 85 247 / 0.1);
		color: white;
	}

	.nav-center {
		flex: 2;
		display: flex;
		justify-content: center;
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		width: 100%;
		max-width: 500px;
	}

	.search-icon {
		font-size: 1rem;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		color: white;
		outline: none;
		font-size: 0.875rem;
	}

	.search-input::placeholder {
		color: rgb(216 180 254 / 0.5);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
		justify-content: flex-end;
	}

	.nav-link {
		color: rgb(216 180 254);
		text-decoration: none;
		font-size: 0.875rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.nav-link:hover {
		background: rgb(168 85 247 / 0.1);
		color: white;
	}

	/* Main Container */
	.main-container {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* Sidebar */
	.sidebar {
		width: 280px;
		background: rgb(30 27 75 / 0.3);
		border-right: 1px solid rgb(168 85 247 / 0.2);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: width 0.3s;
	}

	.sidebar.collapsed {
		width: 48px;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.1);
	}

	.sidebar-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(216 180 254);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.collapse-btn {
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: none;
		color: rgb(216 180 254);
		cursor: pointer;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.collapse-btn:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.sidebar-section {
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.entity-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.entity-item {
		margin-bottom: 0.25rem;
	}

	.entity-item.active .entity-button {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.entity-button {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.entity-button:hover {
		background: rgb(168 85 247 / 0.1);
		color: white;
	}

	.entity-icon {
		flex-shrink: 0;
	}

	.entity-name {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.entity-tag {
		flex-shrink: 0;
		font-size: 0.65rem;
		padding: 0.125rem 0.375rem;
		background: rgb(168 85 247 / 0.2);
		color: rgb(216 180 254 / 0.7);
		border-radius: 0.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 80px;
	}

	.pin-icon {
		flex-shrink: 0;
		font-size: 0.75rem;
	}

	.empty-message {
		color: rgb(216 180 254 / 0.5);
		font-size: 0.75rem;
		font-style: italic;
		padding: 0.5rem 0.75rem;
	}

	.create-link {
		display: block;
		color: rgb(168 85 247);
		font-size: 0.75rem;
		padding: 0.5rem 0.75rem;
		text-decoration: none;
		transition: color 0.2s;
	}

	.create-link:hover {
		color: rgb(192 132 252);
	}

	/* Content Area */
	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.entity-view {
		flex: 1;
		overflow-y: auto;
		padding: 2rem;
	}

	.entity-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.entity-title {
		font-size: 2.5rem;
		font-weight: bold;
		color: white;
		margin-bottom: 0.5rem;
	}

	.entity-type-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: rgb(168 85 247 / 0.2);
		color: rgb(216 180 254);
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 2rem;
	}

	.entity-details {
		color: rgb(216 180 254);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: white;
		margin-bottom: 0.5rem;
	}

	.empty-description {
		color: rgb(216 180 254);
		font-size: 0.875rem;
	}
</style>
