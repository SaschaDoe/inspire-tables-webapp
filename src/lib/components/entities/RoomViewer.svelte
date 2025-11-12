<script lang="ts">
	import type { Room } from '$lib/entities/dungeon/dungeon';
	import type { Entity } from '$lib/types/entity';
	import type { RoomConnector } from '$lib/entities/dungeon/roomConnector';
	import { entityStore } from '$lib/stores/entityStore';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		room: Room;
		parentEntity?: Entity;
	}

	let { room, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher<{
		openEntity: { entity: Entity };
	}>();

	// Subscribe to entityStore to make it reactive
	const entities = $derived($entityStore.entities);

	// Get the parent dungeon to access roomConnectors
	// parentEntity is the room entity, so we need to get its parent (the dungeon)
	const dungeonEntity = $derived(parentEntity?.parentId ? entities.get(parentEntity.parentId) : null);
	const parentDungeon = $derived(dungeonEntity?.customFields?.generatedEntity);

	// Get connection details for each connected room
	interface ConnectionDetail {
		room: Entity | null;
		roomData: Room | null;
		connector: RoomConnector | null;
		connectorType: string;
		connectorIcon: string;
	}

	const connections = $derived.by(() => {
		if (!room.connectedRoomIds || !parentDungeon?.roomConnectors) {
			return [];
		}

		const result: ConnectionDetail[] = [];

		for (const connectedRoomId of room.connectedRoomIds) {
			// Find the connector between this room and the connected room
			const connector = parentDungeon.roomConnectors.find((rc: RoomConnector) =>
				(rc.fromRoomId === room.id && rc.toRoomId === connectedRoomId) ||
				(rc.fromRoomId === connectedRoomId && rc.toRoomId === room.id)
			);

			// Try to find the room entity in the store (for rooms that were extracted)
			// Get all sibling room entities (children of the dungeon)
			const dungeonId = dungeonEntity?.id || '';
			const childEntities = Array.from(entities.values()).filter(e => e.parentId === dungeonId);
			let connectedRoomEntity = childEntities.find(e => {
				const roomData = e.customFields?.generatedEntity;
				return roomData && roomData.id === connectedRoomId;
			}) || null;

			// Get the room data
			const connectedRoomData = connectedRoomEntity?.customFields?.generatedEntity ||
				parentDungeon.rooms?.find((r: Room) => r.id === connectedRoomId) || null;

			// Determine icon based on connector type
			let icon = '🚪';
			if (connector?.connectorType === 'tunnel') icon = '🌉';
			else if (connector?.connectorType === 'obstacle') icon = '⚠️';

			result.push({
				room: connectedRoomEntity,
				roomData: connectedRoomData,
				connector,
				connectorType: connector?.connectorType || 'door',
				connectorIcon: icon
			});
		}

		return result;
	});

	function handleConnectionClick(connection: ConnectionDetail) {
		if (connection.room) {
			// If the room is in the entity store, open it
			dispatch('openEntity', { entity: connection.room });
		}
	}
</script>

<div class="room-viewer">
	<!-- Room Overview -->
	<div class="section">
		<h3 class="section-title">Room Details</h3>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">Name:</span>
				<span class="info-value">{room.name}</span>
			</div>
			{#if room.description}
				<div class="info-item full-width">
					<span class="info-label">Description:</span>
					<span class="info-value">{room.description}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Room Features -->
	<div class="section">
		<h3 class="section-title">Room Features</h3>
		<div class="features-grid">
			{#if room.furnishing}
				<div class="feature-card">
					<div class="feature-icon">🪑</div>
					<div class="feature-content">
						<h4 class="feature-title">Furnishing</h4>
						<p class="feature-text">{room.furnishing}</p>
					</div>
				</div>
			{/if}

			{#if room.obstacle}
				<div class="feature-card obstacle">
					<div class="feature-icon">⚠️</div>
					<div class="feature-content">
						<h4 class="feature-title">Obstacle</h4>
						<p class="feature-text">{room.obstacle}</p>
					</div>
				</div>
			{/if}

			{#if room.treasure}
				<div class="feature-card treasure">
					<div class="feature-icon">💎</div>
					<div class="feature-content">
						<h4 class="feature-title">Treasure</h4>
						<p class="feature-text">{room.treasure}</p>
					</div>
				</div>
			{/if}

			{#if room.trap}
				<div class="feature-card trap">
					<div class="feature-icon">🪤</div>
					<div class="feature-content">
						<h4 class="feature-title">Trap</h4>
						<p class="feature-text">{room.trap}</p>
					</div>
				</div>
			{/if}
		</div>

		{#if !room.furnishing && !room.obstacle && !room.treasure && !room.trap}
			<p class="empty-message">This room appears to be empty with no notable features.</p>
		{/if}
	</div>

	<!-- Connections -->
	{#if connections.length > 0}
		<div class="section">
			<h3 class="section-title">🗺️ Connections</h3>
			<div class="connections-grid">
				{#each connections as connection (connection.roomData?.id)}
					<button
						class="connection-card"
						onclick={() => handleConnectionClick(connection)}
						disabled={!connection.room}
						title={connection.room ? 'Click to open this room' : 'Room not in workspace'}
					>
						<div class="connection-icon">{connection.connectorIcon}</div>
						<div class="connection-content">
							<div class="connection-type">{connection.connectorType}</div>
							<div class="connection-name">{connection.roomData?.name || 'Unknown Room'}</div>
							{#if connection.connector?.description}
								<div class="connection-description">{connection.connector.description}</div>
							{/if}
						</div>
						<div class="connection-arrow">→</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.room-viewer {
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

	.info-item.full-width {
		grid-column: 1 / -1;
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
		line-height: 1.5;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.feature-card {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: var(--surface-3, #2a2a2a);
		border-radius: 8px;
		border: 2px solid var(--border-color, #444);
		transition: all 0.2s;
	}

	.feature-card.obstacle {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.1);
	}

	.feature-card.treasure {
		border-color: #fbbf24;
		background: rgba(251, 191, 36, 0.1);
	}

	.feature-card.trap {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	.feature-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.feature-content {
		flex: 1;
	}

	.feature-title {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-1, #e0e0e0);
	}

	.feature-text {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-2, #999);
		line-height: 1.4;
	}

	.empty-message {
		text-align: center;
		color: var(--text-2, #999);
		font-style: italic;
		padding: 2rem;
		margin: 0;
	}

	.connections-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.connection-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--surface-3, #2a2a2a);
		border: 2px solid #3b82f6;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		width: 100%;
	}

	.connection-card:hover:not(:disabled) {
		background: var(--surface-4, #333);
		border-color: #60a5fa;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.connection-card:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		border-color: #666;
	}

	.connection-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.connection-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.connection-type {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #60a5fa;
		letter-spacing: 0.05em;
	}

	.connection-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-1, #e0e0e0);
	}

	.connection-description {
		font-size: 0.875rem;
		color: var(--text-2, #999);
		margin-top: 0.25rem;
	}

	.connection-arrow {
		font-size: 1.5rem;
		color: #60a5fa;
		flex-shrink: 0;
	}
</style>
