<script lang="ts">
	import { onMount } from 'svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import { tabStore, activeTab } from '$lib/stores/tabStore';
	import { entityStore } from '$lib/stores/entityStore';
	import type { Entity } from '$lib/types/entity';

	let sidebarCollapsed = $state(false);
	let inspectorCollapsed = $state(false);
	let searchQuery = $state('');
	let campaigns = $state<any[]>([]);

	onMount(() => {
		// Load campaigns from entity store
		campaigns = entityStore.getCampaigns();
	});

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}

	function toggleInspector() {
		inspectorCollapsed = !inspectorCollapsed;
	}

	function openCampaign(campaign: any) {
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

	let currentTab = $state($activeTab);
	$effect(() => {
		currentTab = $activeTab;
	});
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
				{#if currentTab}
					<span class="breadcrumb-item">{currentTab.title}</span>
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
				{#if currentTab}
					<div class="entity-content">
						<h1 class="entity-title">{currentTab.title}</h1>
						<p class="entity-type-badge">{currentTab.entityType}</p>

						<!-- This is where specific entity views will be rendered -->
						<div class="entity-details">
							{#if currentTab.entityType === 'campaign'}
								<p class="text-purple-200">Campaign details will be shown here...</p>
							{:else}
								<p class="text-purple-200">Entity details for {currentTab.entityType} will be shown here...</p>
							{/if}
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

		<!-- Right Inspector -->
		<aside class="inspector {inspectorCollapsed ? 'collapsed' : ''}">
			<div class="inspector-header">
				<button onclick={toggleInspector} class="collapse-btn">
					{inspectorCollapsed ? '←' : '→'}
				</button>
				{#if !inspectorCollapsed}
					<h2 class="inspector-title">Inspector</h2>
				{/if}
			</div>

			{#if !inspectorCollapsed}
				<div class="inspector-content">
					{#if currentTab}
						<!-- Quick Actions -->
						<div class="inspector-section">
							<h3 class="section-title">Quick Actions</h3>
							<button class="action-btn">
								<span>+ Add Related Entity</span>
							</button>
							<button class="action-btn">
								<span>🎲 Roll Table</span>
							</button>
						</div>

						<!-- Related Entities -->
						<div class="inspector-section">
							<h3 class="section-title">Related Entities</h3>
							<p class="empty-message">No related entities</p>
						</div>

						<!-- Tags -->
						<div class="inspector-section">
							<h3 class="section-title">Tags</h3>
							<p class="empty-message">No tags</p>
						</div>
					{:else}
						<p class="empty-message">Select an entity to see details</p>
					{/if}
				</div>
			{/if}
		</aside>
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

	/* Inspector */
	.inspector {
		width: 280px;
		background: rgb(30 27 75 / 0.3);
		border-left: 1px solid rgb(168 85 247 / 0.2);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: width 0.3s;
	}

	.inspector.collapsed {
		width: 48px;
	}

	.inspector-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.1);
	}

	.inspector-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(216 180 254);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.inspector-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}

	.inspector-section {
		margin-bottom: 1.5rem;
	}

	.action-btn {
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: linear-gradient(to right, rgb(147 51 234), rgb(219 39 119));
		border: none;
		border-radius: 0.5rem;
		color: white;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 0.5rem;
	}

	.action-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgb(168 85 247 / 0.5);
	}
</style>
