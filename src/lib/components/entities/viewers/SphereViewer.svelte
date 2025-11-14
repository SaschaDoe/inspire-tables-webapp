<script lang="ts">
	import type { Sphere } from '$lib/entities/celestial/sphere';
	import { SphereCreator } from '$lib/entities/celestial/sphereCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';
	import { entityStore } from '$lib/stores/entityStore';
	import type { SphereConnection } from '$lib/entities/celestial/sphereConnection';
	import { EntityType } from '$lib/types/entity';
	import type { Entity } from '$lib/types/entity';

	interface Props {
		sphere: Sphere;
		parentEntity?: any;
	}

	let { sphere, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	// Auto-save nested entities to navigator
	onMount(() => {
		autoSaveNestedEntities(
			{
				galaxies: { entities: sphere.galaxies, entityType: 'galaxy' }
			},
			parentEntity,
			dispatch
		);
	});

	const basicInfo = $derived([
		{ label: 'Name', value: sphere.name },
		{ label: 'Rule', value: sphere.rule },
		{ label: 'Birth', value: sphere.birth },
		...(sphere.layer !== undefined ? [{ label: 'Layer', value: sphere.layer.toString() }] : [])
	]);

	// Get connection entities
	const outgoingConnections = $derived(
		(sphere.outgoingConnectionIds || [])
			.map((id) => entityStore.getEntity(id) as SphereConnection | undefined)
			.filter((conn) => conn !== undefined) as SphereConnection[]
	);

	const incomingConnections = $derived(
		(sphere.incomingConnectionIds || [])
			.map((id) => entityStore.getEntity(id) as SphereConnection | undefined)
			.filter((conn) => conn !== undefined) as SphereConnection[]
	);

	const galaxyRules = SphereCreator.NESTED_ENTITY_RULES.galaxies;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddGalaxy = createAddEntityHandler(sphere, 'galaxies', parentEntity, dispatch);

	function openConnection(connection: SphereConnection) {
		const connectionEntity: Entity = {
			id: connection.id,
			type: EntityType.SphereConnection,
			name: connection.name,
			description: connection.description,
			tags: connection.tags || [],
			parentId: sphere.parentId,
			metadata: connection.metadata,
			relationships: connection.relationships || [],
			customFields: connection.customFields || {}
		};
		dispatch('openEntity', { entity: connectionEntity });
	}
</script>

<div class="sphere-viewer">
	<Section title="Sphere Information">
		<InfoGrid items={basicInfo} />
	</Section>

	{#if outgoingConnections.length > 0 || incomingConnections.length > 0}
		<Section title="Sphere Connections">
			{#if outgoingConnections.length > 0}
				<div class="connections-section">
					<h4 class="connections-heading">Outgoing Connections</h4>
					<div class="connections-list">
						{#each outgoingConnections as connection}
							<button class="connection-card" onclick={() => openConnection(connection)}>
								<div class="connection-header">
									<span class="connection-name">{connection.name}</span>
									<span class="connection-badge {connection.connectionType}">
										{connection.connectionType}
									</span>
								</div>
								<div class="connection-details">
									<span class="connection-arrow">→</span>
									<span class="connection-target">{connection.toSphereName}</span>
								</div>
								<div class="connection-meta">
									<span class="connection-method">{connection.travelMethod}</span>
									{#if connection.isOneWay}
										<span class="connection-oneway">One-way</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if incomingConnections.length > 0}
				<div class="connections-section">
					<h4 class="connections-heading">Incoming Connections</h4>
					<div class="connections-list">
						{#each incomingConnections as connection}
							<button class="connection-card" onclick={() => openConnection(connection)}>
								<div class="connection-header">
									<span class="connection-name">{connection.name}</span>
									<span class="connection-badge {connection.connectionType}">
										{connection.connectionType}
									</span>
								</div>
								<div class="connection-details">
									<span class="connection-arrow">←</span>
									<span class="connection-target">{connection.fromSphereName}</span>
								</div>
								<div class="connection-meta">
									<span class="connection-method">{connection.travelMethod}</span>
									{#if connection.isOneWay}
										<span class="connection-oneway">One-way</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</Section>
	{/if}

	<EntityList
		entities={sphere.galaxies}
		entityType={galaxyRules.entityType}
		displayName={galaxyRules.displayName}
		displayNamePlural="Galaxies"
		icon="🌀"
		minRequired={galaxyRules.min}
		maxAllowed={galaxyRules.max}
		{parentEntity}
		onAddEntity={handleAddGalaxy}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	{#if sphere.description}
		<Section title="Description">
			<p class="description-text">{sphere.description}</p>
		</Section>
	{/if}
</div>

<style>
	.sphere-viewer {
		padding: 0;
	}

	.connections-section {
		margin-bottom: 1.5rem;
	}

	.connections-heading {
		color: var(--text-1, #e0e0e0);
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
	}

	.connections-list {
		display: grid;
		gap: 0.75rem;
	}

	.connection-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--surface-2, #1e1e1e);
		border: 1px solid var(--border-color, #333);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		width: 100%;
	}

	.connection-card:hover {
		background: var(--surface-3, #2a2a2a);
		border-color: var(--accent, #60a5fa);
		transform: translateY(-2px);
	}

	.connection-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}

	.connection-name {
		color: var(--text-1, #e0e0e0);
		font-weight: 600;
		font-size: 0.9375rem;
		flex: 1;
	}

	.connection-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.connection-badge.aligned {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
	}

	.connection-badge.conflicting {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.connection-badge.adjacent {
		background: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
	}

	.connection-badge.distant {
		background: rgba(99, 102, 241, 0.2);
		color: #6366f1;
	}

	.connection-badge.merged {
		background: rgba(139, 92, 246, 0.2);
		color: #8b5cf6;
	}

	.connection-badge.portal {
		background: rgba(245, 158, 11, 0.2);
		color: #f59e0b;
	}

	.connection-badge.natural {
		background: rgba(132, 204, 22, 0.2);
		color: #84cc16;
	}

	.connection-badge.divine {
		background: rgba(251, 191, 36, 0.2);
		color: #fbbf24;
	}

	.connection-details {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.connection-arrow {
		color: var(--accent, #60a5fa);
		font-size: 1.25rem;
		font-weight: bold;
	}

	.connection-target {
		color: var(--text-2, #999);
		font-size: 0.875rem;
	}

	.connection-meta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.connection-method {
		color: var(--text-2, #999);
		font-size: 0.8125rem;
		text-transform: capitalize;
	}

	.connection-oneway {
		padding: 0.125rem 0.5rem;
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.description-text {
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-left: 3px solid rgb(168 85 247);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
		white-space: pre-wrap;
	}
</style>
