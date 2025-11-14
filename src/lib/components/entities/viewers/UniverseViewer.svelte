<script lang="ts">
	import type { Universe } from '$lib/entities/celestial/universe';
	import { UniverseCreator } from '$lib/entities/celestial/universeCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import SphereGraphViewer from '../SphereGraphViewer.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';
	import { entityStore } from '$lib/stores/entityStore';
	import type { SphereConnection } from '$lib/entities/celestial/sphereConnection';

	interface Props {
		universe: Universe;
		parentEntity?: any;
	}

	let { universe, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	// Auto-save nested entities to navigator
	onMount(() => {
		autoSaveNestedEntities(
			{
				spheres: { entities: universe.spheres, entityType: 'sphere' }
			},
			parentEntity,
			dispatch
		);
	});

	const basicInfo = $derived([
		{ label: 'Name', value: universe.name },
		{ label: 'Age', value: universe.age },
		{ label: 'Structure Type', value: universe.structureType || 'custom' },
		{ label: 'Dimensional Structure', value: universe.dimensionalStructure }
	]);

	const connectionStats = $derived(() => {
		const connectionCount = universe.sphereConnectionIds?.length || 0;
		const sphereCount = universe.spheres?.length || 0;

		// Get connection type breakdown
		const typeBreakdown: Record<string, number> = {};
		for (const connId of universe.sphereConnectionIds || []) {
			const conn = entityStore.getEntity(connId) as SphereConnection | undefined;
			if (conn) {
				typeBreakdown[conn.connectionType] = (typeBreakdown[conn.connectionType] || 0) + 1;
			}
		}

		return {
			total: connectionCount,
			spheres: sphereCount,
			avgPerSphere: sphereCount > 0 ? (connectionCount / sphereCount).toFixed(1) : '0',
			breakdown: Object.entries(typeBreakdown).map(([type, count]) => ({ type, count }))
		};
	});

	const sphereRules = UniverseCreator.NESTED_ENTITY_RULES.spheres;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddSphere = createAddEntityHandler(universe, 'spheres', parentEntity, dispatch);
</script>

<div class="universe-viewer">
	<Section title="Universe Information">
		<InfoGrid items={basicInfo} />
	</Section>

	{#if (universe.sphereConnectionIds?.length || 0) > 0}
		<Section title="Connection Statistics">
			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-label">Total Connections:</span>
					<span class="stat-value">{connectionStats().total}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Avg per Sphere:</span>
					<span class="stat-value">{connectionStats().avgPerSphere}</span>
				</div>
			</div>
			{#if connectionStats().breakdown.length > 0}
				<div class="breakdown">
					<h4 class="breakdown-title">By Type:</h4>
					<div class="breakdown-list">
						{#each connectionStats().breakdown as { type, count }}
							<div class="breakdown-item">
								<span class="breakdown-type">{type}:</span>
								<span class="breakdown-count">{count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</Section>
	{/if}

	<!-- Interactive Sphere Graph -->
	{#if (universe.spheres?.length || 0) > 1}
		<div class="section graph-section">
			<h3 class="section-title">🌐 Interactive Sphere Connection Graph</h3>
			<SphereGraphViewer {universe} on:openEntity={handleOpenEntity} />
		</div>
	{/if}

	<EntityList
		entities={universe.spheres}
		entityType={sphereRules.entityType}
		displayName={sphereRules.displayName}
		displayNamePlural="Spheres"
		icon="🌌"
		minRequired={sphereRules.min}
		maxAllowed={sphereRules.max}
		{parentEntity}
		onAddEntity={handleAddSphere}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	{#if universe.description}
		<Section title="Description">
			<p class="description-text">{universe.description}</p>
		</Section>
	{/if}
</div>

<style>
	.universe-viewer {
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

	/* Graph Section Styles */
	.graph-section {
		padding: 1.5rem;
		background: var(--surface-2, #1e1e1e);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--surface-3, #2a2a2a);
		border-radius: 6px;
		border: 1px solid var(--border-color, #444);
	}

	.stat-label {
		color: var(--text-2, #999);
		font-size: 0.875rem;
	}

	.stat-value {
		color: var(--accent, #60a5fa);
		font-size: 1.25rem;
		font-weight: 600;
	}

	.breakdown {
		margin-top: 1rem;
	}

	.breakdown-title {
		color: var(--text-1, #e0e0e0);
		font-size: 0.9375rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
	}

	.breakdown-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.5rem;
	}

	.breakdown-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: var(--surface-3, #2a2a2a);
		border-radius: 4px;
	}

	.breakdown-type {
		color: var(--text-2, #999);
		font-size: 0.8125rem;
		text-transform: capitalize;
	}

	.breakdown-count {
		color: var(--text-1, #e0e0e0);
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
