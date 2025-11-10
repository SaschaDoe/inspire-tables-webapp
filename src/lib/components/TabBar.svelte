<script lang="ts">
	import { tabStore } from '$lib/stores/tabStore';
	import type { Tab } from '$lib/stores/tabStore';

	let tabs = $derived($tabStore.tabs);
	let activeTabId = $derived($tabStore.activeTabId);

	function handleTabClick(tabId: string) {
		tabStore.setActiveTab(tabId);
	}

	function handleCloseTab(event: MouseEvent, tabId: string) {
		event.stopPropagation();
		tabStore.closeTab(tabId);
	}

	function handlePinTab(event: MouseEvent, tabId: string) {
		event.stopPropagation();
		tabStore.togglePin(tabId);
	}

	function getEntityIcon(entityType: string): string {
		const icons: Record<string, string> = {
			campaign: '🎭',
			adventure: '🗺️',
			character: '👤',
			location: '📍',
			artifact: '⚔️',
			plot: '📖',
			faction: '⚔️',
			session: '📅',
			event: '⚡',
			monster: '👹'
		};
		return icons[entityType] || '📄';
	}
</script>

<div class="tab-bar">
	<div class="tabs-container">
		{#each tabs as tab (tab.id)}
			<div
				class="tab {activeTabId === tab.id ? 'active' : ''} {tab.isPinned ? 'pinned' : ''}"
				onclick={() => handleTabClick(tab.id)}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabClick(tab.id); }}}
				title={tab.title}
				role="button"
				tabindex="0"
			>
				<span class="tab-icon">{getEntityIcon(tab.entityType)}</span>
				<span class="tab-title">{tab.title}</span>
				{#if tab.isModified}
					<span class="modified-indicator"></span>
				{/if}
				<div class="tab-actions">
					<button
						class="tab-action pin-btn"
						onclick={(e) => handlePinTab(e, tab.id)}
						title={tab.isPinned ? 'Unpin tab' : 'Pin tab'}
					>
						{tab.isPinned ? '📌' : '📍'}
					</button>
					{#if !tab.isPinned}
						<button
							class="tab-action close-btn"
							onclick={(e) => handleCloseTab(e, tab.id)}
							title="Close tab"
						>
							✕
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<button class="new-tab-btn" title="Open entity...">
		<span>+</span>
	</button>
</div>

<style>
	.tab-bar {
		display: flex;
		align-items: center;
		background: linear-gradient(to bottom, rgb(30 27 75 / 0.9), rgb(24 21 66 / 0.9));
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
		overflow-x: auto;
		scrollbar-width: thin;
		scrollbar-color: rgb(168 85 247 / 0.3) transparent;
	}

	.tabs-container {
		display: flex;
		flex: 1;
		min-width: 0;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-right: 1px solid rgb(168 85 247 / 0.1);
		color: rgb(216 180 254);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
		min-width: 120px;
		max-width: 200px;
	}

	.tab:hover {
		background: rgb(168 85 247 / 0.1);
		color: rgb(233 213 255);
	}

	.tab.active {
		background: rgb(168 85 247 / 0.15);
		color: white;
		border-bottom: 2px solid rgb(168 85 247);
	}

	.tab.pinned {
		background: rgb(168 85 247 / 0.05);
	}

	.tab-icon {
		flex-shrink: 0;
		font-size: 1rem;
	}

	.tab-title {
		flex: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.modified-indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgb(251 191 36);
		flex-shrink: 0;
	}

	.tab-actions {
		display: none;
		align-items: center;
		gap: 0.25rem;
		margin-left: 0.5rem;
	}

	.tab:hover .tab-actions {
		display: flex;
	}

	.tab-action {
		padding: 0.125rem 0.25rem;
		background: transparent;
		border: none;
		color: rgb(216 180 254);
		cursor: pointer;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		transition: all 0.2s;
	}

	.tab-action:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.close-btn {
		font-size: 1rem;
		line-height: 1;
	}

	.new-tab-btn {
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		color: rgb(216 180 254);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		border-left: 1px solid rgb(168 85 247 / 0.1);
	}

	.new-tab-btn:hover {
		background: rgb(168 85 247 / 0.1);
		color: white;
	}
</style>
