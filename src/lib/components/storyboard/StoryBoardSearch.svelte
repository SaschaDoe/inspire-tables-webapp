<script lang="ts">
	import { storyboardStore, activeBoard, activeNodes } from '$lib/stores/storyboardStore';
	import type { StoryBoardNode } from '$lib/types/storyboard';

	let searchQuery = $state('');
	let isSearchOpen = $state(false);
	let searchResults = $state<StoryBoardNode[]>([]);

	// Filter nodes based on search query
	$effect(() => {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		const query = searchQuery.toLowerCase();
		searchResults = $activeNodes.filter((node) => {
			const label = (node.label || '').toLowerCase();
			const notes = (node.notes || '').toLowerCase();
			const entityType = (node.entityType || '').toLowerCase();

			return label.includes(query) || notes.includes(query) || entityType.includes(query);
		});
	});

	function zoomToNode(node: StoryBoardNode) {
		if (!$activeBoard) return;

		// Deselect all and select this node
		storyboardStore.deselectAll($activeBoard.id);
		storyboardStore.selectNode($activeBoard.id, node.id, false);

		// Center view on the node
		const centerX = -(node.x + node.width / 2) * $activeBoard.viewport.zoom + window.innerWidth / 2;
		const centerY = -(node.y + node.height / 2) * $activeBoard.viewport.zoom + window.innerHeight / 2;

		storyboardStore.setViewport($activeBoard.id, {
			...$activeBoard.viewport,
			x: centerX,
			y: centerY
		});

		// Close search after selecting
		isSearchOpen = false;
		searchQuery = '';
	}

	function handleKeyDown(e: KeyboardEvent) {
		// Ctrl+F to open search
		if (e.ctrlKey && e.key === 'f') {
			e.preventDefault();
			isSearchOpen = !isSearchOpen;
			if (isSearchOpen) {
				// Focus search input after a short delay
				setTimeout(() => {
					document.getElementById('storyboard-search-input')?.focus();
				}, 50);
			}
		}

		// Escape to close search
		if (e.key === 'Escape' && isSearchOpen) {
			e.preventDefault();
			isSearchOpen = false;
			searchQuery = '';
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isSearchOpen}
	<div
		class="search-overlay"
		onclick={() => {
			isSearchOpen = false;
			searchQuery = '';
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				isSearchOpen = false;
				searchQuery = '';
			}
		}}
		role="button"
		tabindex="0"
		aria-label="Close search"
	>
		<div class="search-container" role="dialog" aria-modal="true">
			<div class="search-header">
				<input
					id="storyboard-search-input"
					type="text"
					bind:value={searchQuery}
					placeholder="Search cards..."
					class="search-input"
				/>
				<button
					class="close-btn"
					onclick={() => {
						isSearchOpen = false;
						searchQuery = '';
					}}
					title="Close (Esc)"
				>
					✕
				</button>
			</div>

			<div class="search-results">
				{#if searchQuery && searchResults.length === 0}
					<div class="no-results">
						<p>No cards found matching "{searchQuery}"</p>
					</div>
				{:else if searchResults.length > 0}
					<div class="results-header">
						Found {searchResults.length} card{searchResults.length === 1 ? '' : 's'}
					</div>
					{#each searchResults as node}
						<button class="result-item" onclick={() => zoomToNode(node)}>
							<div class="result-icon">{node.icon || '📝'}</div>
							<div class="result-content">
								<div class="result-label">{node.label || 'Unnamed'}</div>
								{#if node.notes}
									<div class="result-notes">{node.notes.substring(0, 60)}{node.notes.length > 60 ? '...' : ''}</div>
								{/if}
								{#if node.entityType}
									<div class="result-type">{node.entityType}</div>
								{/if}
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.search-overlay {
		position: fixed;
		inset: 0;
		background: rgb(0 0 0 / 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 5rem;
		z-index: 1000;
	}

	.search-container {
		width: 100%;
		max-width: 600px;
		background: rgb(30 27 75 / 0.98);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.75rem;
		box-shadow: 0 20px 60px rgb(0 0 0 / 0.5);
		overflow: hidden;
	}

	.search-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
	}

	.search-input {
		flex: 1;
		background: rgb(15 23 42);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		color: white;
		font-size: 1rem;
		outline: none;
	}

	.search-input:focus {
		border-color: rgb(168 85 247);
		box-shadow: 0 0 0 3px rgb(168 85 247 / 0.2);
	}

	.close-btn {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(168 85 247 / 0.1);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247 / 0.4);
	}

	.search-results {
		max-height: 400px;
		overflow-y: auto;
	}

	.results-header {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: rgb(216 180 254);
		font-weight: 600;
		background: rgb(168 85 247 / 0.1);
	}

	.no-results {
		padding: 2rem;
		text-align: center;
		color: rgb(216 180 254);
	}

	.result-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		width: 100%;
		background: transparent;
		border: none;
		border-bottom: 1px solid rgb(168 85 247 / 0.1);
		color: white;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.result-item:hover {
		background: rgb(168 85 247 / 0.1);
	}

	.result-item:last-child {
		border-bottom: none;
	}

	.result-icon {
		font-size: 1.5rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.result-content {
		flex: 1;
		min-width: 0;
	}

	.result-label {
		font-weight: 600;
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.result-notes {
		font-size: 0.875rem;
		color: rgb(216 180 254);
		margin-bottom: 0.25rem;
	}

	.result-type {
		font-size: 0.75rem;
		text-transform: uppercase;
		color: rgb(168 85 247);
		font-weight: 600;
	}
</style>
