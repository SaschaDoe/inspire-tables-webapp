<script lang="ts">
	import { onMount } from 'svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import { tabStore, activeTab } from '$lib/stores/tabStore';
	import { entityStore } from '$lib/stores/entityStore';
	import CampaignCard from '$lib/components/entities/CampaignCard.svelte';
	import AdventureCard from '$lib/components/entities/AdventureCard.svelte';
	import StoryBoard from '$lib/components/storyboard/StoryBoard.svelte';
	import EntityGeneratorModal from '$lib/components/entities/EntityGeneratorModal.svelte';
	import EntityViewer from '$lib/components/entities/EntityViewer.svelte';
	import EntityNavigator from '$lib/components/entities/EntityNavigator.svelte';
	import NestedEntitiesSection from '$lib/components/entities/NestedEntitiesSection.svelte';
	import type { Entity, AdventureEntity } from '$lib/types/entity';
	import { EntityType } from '$lib/types/entity';
	import type { Campaign } from '$lib/entities/campaign';
	import { autoGenerateChildEntities } from '$lib/utils/entityAutoGenerator';
	import { extractAndSaveNestedEntities } from '$lib/utils/nestedEntityExtractor';
	import { getEntityCreator } from '$lib/entities/entityRegistry';

	let sidebarCollapsed = $state(false);
	let searchQuery = $state('');
	let campaigns = $state<Campaign[]>([]);
	let adventures = $state(new Map<string, AdventureEntity>());
	let allOtherEntities = $state<Map<string, Entity[]>>(new Map());
	let isEntityModalOpen = $state(false);

	onMount(() => {
		// Load campaigns from entity store
		campaigns = entityStore.getCampaigns();
		loadAllEntities();
	});

	// Reload entities when entity store changes
	$effect(() => {
		// This will re-run when campaigns change (e.g., after adding adventure)
		campaigns.length;
		loadAllEntities();
	});

	function loadAllEntities() {
		const allEntities = entityStore.searchEntities('');

		// Load adventures
		adventures = new Map(
			allEntities
				.filter(e => e.type === 'adventure')
				.map(e => [e.id, e as AdventureEntity])
		);

		// Group other entities by type
		const groupedEntities = new Map<string, Entity[]>();
		allEntities
			.filter(e => e.type !== 'adventure' && e.type !== 'campaign')
			.forEach(entity => {
				const type = entity.type as string;
				if (!groupedEntities.has(type)) {
					groupedEntities.set(type, []);
				}
				groupedEntities.get(type)!.push(entity);
			});

		allOtherEntities = groupedEntities;
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

	function openGenericEntity(entity: Entity) {
		tabStore.openTab(entity);
	}

	function deleteGenericEntity(id: string) {
		entityStore.deleteEntity(id);
		loadAllEntities();

		// Close the tab associated with this entity
		tabStore.closeTabByEntityId(id);
	}

	function openStoryBoard(adventureId: string) {
		const adventure = adventures.get(adventureId);
		if (!adventure) return;

		// Create a special tab for the story board
		const storyboardTab: Entity = {
			id: `storyboard-${adventureId}`,
			type: 'storyboard' as any,
			name: `${adventure.name} - Story Board`,
			description: 'Visual story planning canvas',
			tags: [],
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [],
			customFields: { adventureId }
		};

		tabStore.openTab(storyboardTab);
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
		tabStore.closeTabByEntityId(id);
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
		tabStore.closeTabByEntityId(id);
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
	let currentGenericEntity = $derived.by(() => {
		const tab = $activeTab;
		if (!tab) return null;

		// Check if this is a generic generated entity (not campaign, adventure, or storyboard)
		if (tab.entityType !== 'campaign' && tab.entityType !== 'adventure' && tab.entityType !== 'storyboard') {
			const entity = entityStore.getEntity(tab.entityId);
			return entity;
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

	let currentStoryBoardAdventureId = $derived.by(() => {
		const tab = $activeTab;
		if (!tab || tab.entityType !== 'storyboard') return null;
		return tab.customFields?.adventureId || null;
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

	function openEntityModal() {
		isEntityModalOpen = true;
	}

	function closeEntityModal() {
		isEntityModalOpen = false;
	}

	function handleSaveEntity(entity: any, entityType: string) {
		console.log('Saved entity:', entityType, entity);

		// Create a workspace entity from the generated entity
		const workspaceEntity: Entity = {
			id: entity.id,
			type: entityType as any,
			name: entity.name || `${entityType} ${entity.id.slice(0, 8)}`,
			description: entity.description || '',
			tags: [],
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date()
			},
			relationships: [],
			customFields: { generatedEntity: entity }
		};

		entityStore.createEntity(workspaceEntity);

		// Extract and save nested entities (rooms, entrances, etc.)
		const extractedEntities = extractAndSaveNestedEntities(workspaceEntity);
		console.log(`Extracted ${extractedEntities.length} nested entities from ${entityType}`);

		// Auto-generate child entities if configured
		autoGenerateChildEntities(workspaceEntity);

		// Reload entities to show the newly created children
		loadAllEntities();

		// Open the entity in a tab
		tabStore.openTab(workspaceEntity);
	}

	// Handle EntityNavigator events
	function handleNavigatorSelectEntity(event: CustomEvent<{ entity: Entity }>) {
		const { entity } = event.detail;
		// Check if it's a legacy campaign
		if (entity.type === EntityType.Campaign && entity.customFields?.campaign) {
			openCampaign(entity.customFields.campaign as Campaign);
		} else if (entity.type === EntityType.Adventure) {
			openAdventure(entity as AdventureEntity);
		} else {
			openGenericEntity(entity);
		}
	}

	function handleNavigatorCreateEntity(event: CustomEvent<{ type: EntityType }>) {
		const { type } = event.detail;

		// Get the creator for this entity type
		const creator = getEntityCreator(type);
		if (!creator) {
			console.error('No creator found for entity type:', type);
			return;
		}

		// Generate the entity directly
		const generatedEntity = creator.create();

		// Set a default name if it doesn't have one
		if (!generatedEntity.name) {
			generatedEntity.name = `${type} ${generatedEntity.id.slice(0, 8)}`;
		}

		// Save it to the store (uses the existing handleSaveEntity logic)
		handleSaveEntity(generatedEntity, type);
	}

	function handleNestedEntityOpen(event: CustomEvent<{ entity: Entity }>) {
		openGenericEntity(event.detail.entity);
	}

	function handleNestedRefresh() {
		loadAllEntities();
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
			<button onclick={openEntityModal} class="btn-new-entity">
				<span class="btn-icon">✨</span>
				<span>New Entity</span>
			</button>
			<a href="/tables" class="nav-link">Tables</a>
			<a href="/campaigns" class="nav-link">Legacy Campaigns</a>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="main-container">
		<!-- Left Sidebar -->
		<aside class="sidebar {sidebarCollapsed ? 'collapsed' : ''}">
			{#if !sidebarCollapsed}
				<EntityNavigator
					selectedEntityId={$activeTab?.entityId}
					onselectEntity={handleNavigatorSelectEntity}
					oncreateEntity={handleNavigatorCreateEntity}
				/>
			{:else}
				<div class="sidebar-header">
					<button onclick={toggleSidebar} class="collapse-btn" title="Expand Navigator">
						→
					</button>
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
						onOpenStoryBoard={openStoryBoard}
					/>
				{:else if currentStoryBoardAdventureId}
					<StoryBoard adventureId={currentStoryBoardAdventureId} />
				{:else if currentGenericEntity}
					<div class="entity-content">
						<div class="entity-header">
							<div>
								<h1 class="entity-title">{currentGenericEntity.name}</h1>
								<p class="entity-type-badge">{currentGenericEntity.type}</p>
							</div>
							<div class="entity-actions">
								<button
									onclick={() => deleteGenericEntity(currentGenericEntity.id)}
									class="btn-delete"
									title="Delete entity"
								>
									🗑️ Delete
								</button>
							</div>
						</div>
						{#if currentGenericEntity.description}
							<div class="entity-description">
								<p>{currentGenericEntity.description}</p>
							</div>
						{/if}
						<div class="entity-viewer-container">
							{#if currentGenericEntity.customFields?.generatedEntity}
								<EntityViewer
									entity={currentGenericEntity.customFields.generatedEntity}
									entityType={currentGenericEntity.type as string}
									parentEntity={currentGenericEntity}
									on:openEntity={handleNestedEntityOpen}
								/>
							{:else}
								<p class="text-purple-200">No entity data available</p>
							{/if}
						</div>

						<!-- Nested Entities Section -->
						<NestedEntitiesSection
							parentEntity={currentGenericEntity}
							on:openEntity={handleNestedEntityOpen}
							on:refresh={handleNestedRefresh}
						/>
					</div>
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

<EntityGeneratorModal
	bind:isOpen={isEntityModalOpen}
	onClose={closeEntityModal}
	onSave={handleSaveEntity}
/>

<style>
	.btn-new-entity {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, rgb(168 85 247), rgb(192 132 252));
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 6px -1px rgba(168, 85, 247, 0.3);
	}

	.btn-new-entity:hover {
		background: linear-gradient(135deg, rgb(192 132 252), rgb(216 180 254));
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.4);
	}

	.btn-icon {
		font-size: 1rem;
	}
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

	.entity-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 2rem;
		gap: 2rem;
	}

	.entity-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-delete {
		padding: 0.5rem 1rem;
		background: rgb(220 38 38 / 0.2);
		color: rgb(252 165 165);
		border: 1px solid rgb(220 38 38 / 0.3);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-delete:hover {
		background: rgb(220 38 38 / 0.3);
		color: white;
		border-color: rgb(220 38 38 / 0.5);
	}

	.entity-description {
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-left: 4px solid rgb(168 85 247);
		border-radius: 0.5rem;
		margin-bottom: 2rem;
	}

	.entity-description p {
		color: rgb(216 180 254);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
	}

	.entity-viewer-container {
		background: rgb(30 27 75 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		overflow: hidden;
	}
</style>
