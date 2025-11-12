<script lang="ts">
	import type { Dungeon } from '$lib/entities/dungeon/dungeon';
	import { entityStore } from '$lib/stores/entityStore';
	import { createEventDispatcher } from 'svelte';
	import type { Entity } from '$lib/types/entity';
	import DungeonGraphViewer from './DungeonGraphViewer.svelte';

	interface Props {
		dungeon: Dungeon;
	}

	let { dungeon }: Props = $props();
	const dispatch = createEventDispatcher<{
		openEntity: { entity: Entity };
	}>();

	// Get child Room and Entrance entities from the entity store
	// For preview mode (before saving), we'll use the nested arrays instead
	const childEntities = $derived(entityStore.getChildEntities(dungeon.id));
	const roomEntities = $derived(childEntities.filter((e) => e.type === 'room'));
	const entranceEntities = $derived(childEntities.filter((e) => e.type === 'entrance'));

	// Fallback to nested arrays if no child entities in store (preview mode)
	const entranceCount = $derived(entranceEntities.length || dungeon.entrances?.length || 0);
	const roomCount = $derived(roomEntities.length || dungeon.rooms?.length || 0);
	const hasNestedData = $derived(dungeon.entrances?.length > 0 || dungeon.rooms?.length > 0);

	// Use entity store data if available, otherwise use nested arrays for preview
	const displayEntrances = $derived(entranceEntities.length > 0 ? entranceEntities : (dungeon.entrances || []));
	const displayRooms = $derived(roomEntities.length > 0 ? roomEntities : (dungeon.rooms || []));

	function handleOpenEntity(event: CustomEvent<{ entity: Entity }>) {
		dispatch('openEntity', event.detail);
	}

	function openEntity(entity: Entity) {
		dispatch('openEntity', { entity });
	}
</script>

<div class="dungeon-viewer">
	<!-- Dungeon Overview -->
	<div class="section">
		<h3 class="section-title">Dungeon Overview</h3>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">Name:</span>
				<span class="info-value">{dungeon.name}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Type:</span>
				<span class="info-value"
					>{dungeon.type}{dungeon.adjective ? ` (${dungeon.adjective})` : ''}</span
				>
			</div>
			<div class="info-item">
				<span class="info-label">Size:</span>
				<span class="info-value">{dungeon.size}</span>
			</div>
			<div class="info-item">
				<span class="info-label">State:</span>
				<span class="info-value">{dungeon.state}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Structure:</span>
				<span class="info-value">{dungeon.arrangements?.join(', ') || 'None'}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Entries:</span>
				<span class="info-value">{entranceCount}</span>
			</div>
			<div class="info-item">
				<span class="info-label">Number of Rooms:</span>
				<span class="info-value">{roomCount}</span>
			</div>
		</div>
	</div>

	<!-- Purposes -->
	{#if dungeon.purposes && dungeon.purposes.length > 0}
		<div class="section">
			<h3 class="section-title">Purposes</h3>
			<ul class="list">
				{#each dungeon.purposes as purpose, index (index)}
					<li class="list-item">{purpose}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Interactive Dungeon Map -->
	{#if displayEntrances.length > 0 || displayRooms.length > 0}
		<div class="section graph-section">
			<h3 class="section-title">🗺️ Interactive Dungeon Map</h3>
			<DungeonGraphViewer {dungeon} on:openEntity={handleOpenEntity} />
		</div>
	{/if}

	<!-- Entrances -->
	{#if displayEntrances.length > 0}
		<div class="section">
			<h3 class="section-title">Entrances ({displayEntrances.length})</h3>
			<div class="entity-grid">
				{#each displayEntrances as entrance, index (entrance.id || index)}
					<button class="entity-card clickable" onclick={() => openEntity(entrance)}>
						<div class="entity-card-header">
							<span class="entity-icon">🚪</span>
							<span class="entity-name">{entrance.name || `Entrance ${index + 1}`}</span>
							<span class="open-icon">→</span>
						</div>
						{#if entrance.description}
							<p class="entity-description">{entrance.description}</p>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Rooms -->
	{#if displayRooms.length > 0}
		<div class="section">
			<h3 class="section-title">Rooms ({displayRooms.length})</h3>
			<div class="entity-grid">
				{#each displayRooms as room (room.id)}
					<button class="entity-card clickable" onclick={() => openEntity(room)}>
						<div class="entity-card-header">
							<span class="entity-icon">🚪</span>
							<span class="entity-name">{room.name}</span>
							<span class="open-icon">→</span>
						</div>
						{#if room.description}
							<p class="entity-description">{room.description}</p>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.dungeon-viewer {
		padding: 0;
	}

	.section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--surface-2, #1e1e1e);
		border-radius: 8px;
		border: 1px solid var(--border-color, #333);
	}

	.section-title {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-1, #e0e0e0);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-2, #999);
		letter-spacing: 0.05em;
	}

	.info-value {
		font-size: 0.9375rem;
		color: var(--text-1, #e0e0e0);
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.list-item {
		padding: 0.75rem 1rem;
		background: var(--surface-3, #2a2a2a);
		border-radius: 6px;
		border-left: 3px solid var(--accent, #60a5fa);
		color: var(--text-1, #e0e0e0);
		font-size: 0.875rem;
	}

	.entity-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.entity-card {
		background: var(--surface-3, #2a2a2a);
		border: 1px solid var(--border-color, #444);
		border-radius: 8px;
		padding: 1rem;
		text-align: left;
		transition: all 0.2s;
		width: 100%;
	}

	.entity-card.clickable {
		cursor: pointer;
	}

	.entity-card.clickable:hover {
		background: var(--surface-4, #333);
		border-color: var(--accent, #60a5fa);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
	}

	.entity-card-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.entity-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.entity-name {
		flex: 1;
		font-weight: 600;
		color: var(--text-1, #e0e0e0);
		font-size: 1rem;
	}

	.open-icon {
		font-size: 1.25rem;
		color: var(--accent, #60a5fa);
		opacity: 0;
		transition: opacity 0.2s;
	}

	.entity-card.clickable:hover .open-icon {
		opacity: 1;
	}

	.entity-description {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--text-2, #999);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Graph Section Styles */
	.graph-section {
		padding: 1.5rem;
		background: var(--surface-2, #1e1e1e);
	}
</style>
