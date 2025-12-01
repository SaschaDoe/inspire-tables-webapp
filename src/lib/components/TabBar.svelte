<script lang="ts">
	import { tabStore } from '$lib/stores/tabStore';
	import type { Tab } from '$lib/stores/tabStore';

	let tabs = $derived($tabStore.tabs);
	let activeTabId = $derived($tabStore.activeTabId);

	let tabsContainer: HTMLDivElement;
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

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

	function handleCloseAllTabs() {
		const confirmed = confirm('Close all tabs except pinned ones?');
		if (confirmed) {
			tabStore.closeAllTabs();
		}
	}

	function updateScrollButtons() {
		if (!tabsContainer) return;

		const { scrollLeft, scrollWidth, clientWidth } = tabsContainer;
		canScrollLeft = scrollLeft > 0;
		canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
	}

	function scrollLeft() {
		if (!tabsContainer) return;
		tabsContainer.scrollBy({ left: -200, behavior: 'smooth' });
	}

	function scrollRight() {
		if (!tabsContainer) return;
		tabsContainer.scrollBy({ left: 200, behavior: 'smooth' });
	}

	$effect(() => {
		if (tabsContainer) {
			updateScrollButtons();
			tabsContainer.addEventListener('scroll', updateScrollButtons);
			window.addEventListener('resize', updateScrollButtons);

			return () => {
				tabsContainer.removeEventListener('scroll', updateScrollButtons);
				window.removeEventListener('resize', updateScrollButtons);
			};
		}
	});

	// Update scroll buttons when tabs change
	$effect(() => {
		tabs; // Watch tabs array
		if (tabsContainer) {
			setTimeout(updateScrollButtons, 0);
		}
	});

	function getEntityIcon(entityType: string): string {
		const icons: Record<string, string> = {
			// Campaign & Story
			campaign: '🎭',
			adventure: '🗺️',
			quest: '🎯',
			storyBeat: '📖',
			initialMeeting: '🤝',
			scene: '🎬',

			// Characters & NPCs
			character: '👤',
			villain: '🦹',
			monster: '👹',

			// Locations - Celestial
			sphere: '🌌',
			galaxy: '🌠',
			solarSystem: '☀️',
			planet: '🪐',
			star: '⭐',

			// Locations - Terrestrial
			continent: '🗾',
			nation: '🏛️',
			region: '🏞️',
			city: '🏘️',
			building: '🏢',
			hexTile: '⬢',
			location: '📍',

			// Dungeons
			dungeon: '⚔️',
			entrance: '🚪',
			room: '🏠',
			trap: '🪤',

			// Factions & Organizations
			faction: '⚔️',
			organization: '🏢',

			// Magic & Religion
			magicSystem: '✨',
			spell: '🔮',
			ritual: '🕯️',
			god: '👁️',

			// Items & Objects
			artifact: '💎',
			treasure: '💰',
			vehicle: '🚗',
			talent: '🌟',

			// Events & World Elements
			event: '⚡',
			rumor: '💬',
			prophecy: '📜',
			illness: '🦠',
			clue: '🔍',
			weatherEvent: '🌤️',

			// Misc
			plot: '📖',
			session: '📅',
			sign: '🛡️',
			relationshipType: '💞'
		};
		return icons[entityType] || '📄';
	}
</script>

<div class="tab-bar">
	{#if canScrollLeft}
		<button class="scroll-btn scroll-left" onclick={scrollLeft} title="Scroll left">
			<span>‹‹</span>
		</button>
	{/if}

	<div class="tabs-container" bind:this={tabsContainer}>
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

	{#if canScrollRight}
		<button class="scroll-btn scroll-right" onclick={scrollRight} title="Scroll right">
			<span>››</span>
		</button>
	{/if}

	<button class="close-all-btn" onclick={handleCloseAllTabs} title="Close all tabs (except pinned)">
		<span>⊗</span>
	</button>

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
		overflow: hidden;
	}

	.tabs-container {
		display: flex;
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none; /* Hide scrollbar for Firefox */
		-ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
	}

	.tabs-container::-webkit-scrollbar {
		display: none; /* Hide scrollbar for Chrome, Safari and Opera */
	}

	.scroll-btn {
		padding: 0.75rem 0.5rem;
		background: rgb(168 85 247 / 0.1);
		border: none;
		color: rgb(216 180 254);
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
		border-right: 1px solid rgb(168 85 247 / 0.1);
		flex-shrink: 0;
	}

	.scroll-btn:hover {
		background: rgb(168 85 247 / 0.2);
		color: white;
	}

	.scroll-left {
		border-left: none;
	}

	.scroll-right {
		border-right: 1px solid rgb(168 85 247 / 0.1);
		border-left: 1px solid rgb(168 85 247 / 0.1);
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

	.close-all-btn {
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		color: rgb(248 113 113);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		border-left: 1px solid rgb(168 85 247 / 0.1);
		flex-shrink: 0;
	}

	.close-all-btn:hover {
		background: rgb(220 38 38 / 0.1);
		color: rgb(252 165 165);
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
		flex-shrink: 0;
	}

	.new-tab-btn:hover {
		background: rgb(168 85 247 / 0.1);
		color: white;
	}
</style>
