<script lang="ts">
	import { onMount } from 'svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import { tabStore, activeTab, canGoBack, canGoForward } from '$lib/stores/tabStore';
	import { entityStore, adventureEntities } from '$lib/stores/entityStore'; // Phase 2: Import adventureEntities derived store
	import CampaignCard from '$lib/components/entities/CampaignCard.svelte';
	import AdventureCard from '$lib/components/entities/AdventureCard.svelte';
	import StoryBoard from '$lib/components/storyboard/StoryBoard.svelte';
	import EntityGeneratorModal from '$lib/components/entities/EntityGeneratorModal.svelte';
	import EntityViewer from '$lib/components/entities/EntityViewer.svelte';
	import EntityNavigator from '$lib/components/entities/EntityNavigator.svelte';
	import type { Entity, AdventureEntity } from '$lib/types/entity';
	import { EntityType } from '$lib/types/entity';
	import type { Campaign } from '$lib/entities/campaign';
	import { autoGenerateChildEntities } from '$lib/utils/entityAutoGenerator';
	import { extractAndSaveNestedEntities } from '$lib/utils/nestedEntityExtractor';
	import { getEntityCreator } from '$lib/entities/entityRegistry';

	let sidebarCollapsed = $state(false);
	let searchQuery = $state('');
	let campaigns = $state<Campaign[]>([]);
	// Phase 2: Removed `adventures` and `allOtherEntities` - using derived stores instead
	let isEntityModalOpen = $state(false);
	let isLoadingEntities = $state(true); // Phase 1: Track loading state

	onMount(() => {
		// Phase 1: Defer data loading to next tick so UI renders immediately
		setTimeout(() => {
			// Load campaigns from entity store
			campaigns = entityStore.getCampaigns();
			// Phase 2: Removed loadAllEntities() - derived stores update automatically

			// Check if there's an entity ID in the URL
			const urlParams = new URLSearchParams(window.location.search);
			const entityId = urlParams.get('entity');
			if (entityId) {
				const entity = entityStore.getEntity(entityId);
				if (entity) {
					tabStore.openTab(entity);
				}
			}

			// Mark loading as complete
			isLoadingEntities = false;
		}, 0);

		// Phase 2: Removed entity-created event listener - derived stores update automatically via Svelte reactivity
	});

	// Phase 2: Removed loadAllEntities() function - redundant with derived stores

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
		// Use cascading delete which handles parent arrays and children
		const result = entityStore.deleteEntityCascading(id);

		// Close tabs for all deleted entities
		for (const deletedId of result.deletedEntityIds) {
			tabStore.closeTabByEntityId(deletedId);
		}

		// Phase 2: Removed loadAllEntities() - derived stores update automatically

		console.log(`[workspace] Deleted ${result.deletedEntityIds.length} entities, updated ${result.updatedParentIds.length} parents`);
	}

	function openStoryBoard(adventureId: string) {
		const adventure = $adventureEntities.find(a => a.id === adventureId); // Phase 2: Use derived store
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

		const adventureCount = $adventureEntities.filter(a => a.campaignId === campaignId).length; // Phase 2: Use derived store

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
		// Phase 2: Removed loadAdventures() - derived stores update automatically
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
		// Use cascading delete
		const result = entityStore.deleteEntityCascading(id);

		// Close tabs for all deleted entities
		for (const deletedId of result.deletedEntityIds) {
			tabStore.closeTabByEntityId(deletedId);
		}
		// Phase 2: Removed loadAdventures() - derived stores update automatically
		tabStore.closeTabByEntityId(id);
	}

	function updateAdventureName(id: string, name: string) {
		entityStore.updateEntity(id, { name });
		// Phase 2: Removed loadAdventures() - derived stores update automatically
	}

	function updateAdventureStatus(id: string, status: string) {
		const adventure = $adventureEntities.find(a => a.id === id); // Phase 2: Use derived store
		if (adventure) {
			adventure.status = status as any;
			entityStore.updateEntity(id, { status } as any);
			// Phase 2: Removed loadAdventures() - derived stores update automatically
		}
	}

	// Phase 2: Simplified using entityStore directly instead of local state
	// Use Svelte 4 store auto-subscription with $ prefix
	let currentGenericEntity = $derived.by(() => {
		const tab = $activeTab;
		if (!tab || tab.entityType === 'storyboard') return null;

		// Access the store reactively using $ auto-subscription
		const entity = $entityStore.entities.get(tab.entityId);
		if (!entity) return null;

		// For campaigns, only return if it's a generated entity (has customFields.generatedEntity)
		if (tab.entityType === 'campaign') {
			return entity?.customFields?.generatedEntity ? entity : null;
		}

		// For other entity types, return the entity
		return entity;
	});

	let currentCampaign = $derived.by(() => {
		const tab = $activeTab;
		if (!tab || tab.entityType !== 'campaign') return null;
		// Only look in campaigns array for old-style campaigns
		return campaigns.find(c => c.id === tab.entityId) || null;
	});

	// No longer needed - adventures now use generic entity viewer
	// let currentAdventure = $derived.by(() => {
	// 	const tab = $activeTab;
	// 	if (!tab || tab.entityType !== 'adventure') return null;
	// 	return adventures.get(tab.entityId) || null;
	// });

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
			const adventure = $adventureEntities.find(a => a.id === tab.entityId); // Phase 2: Use derived store
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
			const adventure = $adventureEntities.find(a => a.id === item.id); // Phase 2: Use derived store
			if (adventure) openAdventure(adventure);
		}
	}

	function openEntityModal() {
		isEntityModalOpen = true;
	}

	function closeEntityModal() {
		isEntityModalOpen = false;
	}

	/**
	 * WORKSPACE CREATION PATH - Direct entity creation from navigator
	 *
	 * This is PATH 2 mentioned in viewerUtils.createAddEntityHandler
	 *
	 * Flow:
	 * 1. User clicks "New Universe" (or other entity) in workspace navigator
	 * 2. Entity is generated via creator
	 * 3. This handler saves entity to store
	 * 4. Extracts nested entities immediately (sphere connections, etc.)
	 * 5. Opens entity in a new tab
	 *
	 * Difference from Modal Path (PATH 1):
	 * - Direct extraction happens here (no deferred extraction)
	 * - No parent-child relationship (entity is standalone in workspace)
	 * - Opens in tab immediately
	 */
	function handleSaveEntity(entity: any, entityType: string) {
		console.log('Saved entity:', entityType, entity);

		// Wrap the generated entity with Entity interface
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

		// Save to entity store
		entityStore.createEntity(workspaceEntity);

		// CRITICAL: Extract nested entities immediately
		// This saves sphere connections, rooms, entrances, etc. to the store
		const extractedEntities = extractAndSaveNestedEntities(workspaceEntity);
		console.log(`Extracted ${extractedEntities.length} nested entities from ${entityType}`);

		// Auto-generate child entities if configured
		autoGenerateChildEntities(workspaceEntity);

		// Reload entities to show the newly created children

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

	function handleNestedEntityOpen(event: CustomEvent<{ entity: any }>) {
		const clickedEntity = event.detail.entity;

		console.log('[workspace] handleNestedEntityOpen called for:', clickedEntity.name, 'id:', clickedEntity.id, 'has type:', !!clickedEntity.type, 'has metadata:', !!clickedEntity.metadata);

		// Check if this is already a workspace Entity or just a nested object
		if (clickedEntity.type && clickedEntity.metadata) {
			// Already a workspace entity, just open it
			console.log('[workspace] Opening as workspace entity');
			openGenericEntity(clickedEntity as Entity);
		} else {
			// This is a nested entity object (like a Sphere from Universe)
			// We need to create a workspace Entity wrapper and save it

			// Determine the entity type from the object structure
			let entityType = 'unknown';
			if (clickedEntity.galaxies !== undefined) {
				entityType = 'sphere';
			} else if (clickedEntity.solarSystems !== undefined) {
				entityType = 'galaxy';
			} else if (clickedEntity.planets !== undefined || clickedEntity.stars !== undefined) {
				entityType = 'solarSystem';
			} else if (clickedEntity.spheres !== undefined) {
				entityType = 'universe';
			} else if (clickedEntity.hexTiles !== undefined) {
				entityType = 'continent';
			} else if (clickedEntity.beginning !== undefined && clickedEntity.climax !== undefined && clickedEntity.ending !== undefined) {
				entityType = 'adventure';
			} else if (clickedEntity.adventures !== undefined && clickedEntity.universes !== undefined) {
				entityType = 'campaign';
			}

			// Check if this entity already exists in the store by ID
			const existingEntity = entityStore.getEntity(clickedEntity.id);
			if (existingEntity) {
				// Entity already exists, just open it
				openGenericEntity(existingEntity);
				return;
			}

			// Create workspace entity wrapper
			const workspaceEntity: Entity = {
				id: clickedEntity.id,
				type: entityType as any,
				name: clickedEntity.name || `${entityType} ${clickedEntity.id.slice(0, 8)}`,
				description: clickedEntity.description || '',
				tags: [],
				metadata: {
					createdAt: new Date(),
					updatedAt: new Date()
				},
				relationships: [],
				customFields: { generatedEntity: clickedEntity }
			};

			// Save to store
			entityStore.createEntity(workspaceEntity);

			// Reload entities
		
			// Open it
			openGenericEntity(workspaceEntity);
		}
	}

	// Phase 2: Removed handleNestedRefresh - derived stores update automatically

	function handleEntityUpdated(event: CustomEvent<{ entity: Entity }>) {
		// The entity has already been updated in the store by the viewer handler
		// The reactive store subscription will handle the update automatically
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

			<!-- Navigation History Buttons -->
			<div class="nav-history">
				<button
					class="nav-history-btn"
					disabled={!$canGoBack}
					onclick={() => tabStore.goBack()}
					title="Go back"
				>
					←
				</button>
				<button
					class="nav-history-btn"
					disabled={!$canGoForward}
					onclick={() => tabStore.goForward()}
					title="Go forward"
				>
					→
				</button>
			</div>

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
					isLoading={isLoadingEntities}
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
							const adv = $adventureEntities.find(a => a.id === id); // Phase 2: Use derived store
							if (adv) openAdventure(adv);
						}}
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
						<div class="entity-viewer-container">
							{#if currentGenericEntity.customFields?.generatedEntity}
								<EntityViewer
									entity={currentGenericEntity.customFields.generatedEntity}
									entityType={currentGenericEntity.type as string}
									parentEntity={currentGenericEntity}
									on:openEntity={handleNestedEntityOpen}
									on:entityUpdated={handleEntityUpdated}
								/>
							{:else}
								<p class="text-purple-200">No entity data available</p>
							{/if}
						</div>

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

	.nav-history {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-left: 1rem;
	}

	.nav-history-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.nav-history-btn:hover:not(:disabled) {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247 / 0.6);
		color: white;
	}

	.nav-history-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
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

	.entity-viewer-container {
		background: rgb(30 27 75 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		overflow: hidden;
	}
</style>
