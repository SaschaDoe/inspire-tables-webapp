<script lang="ts">
	import { entityStore } from '$lib/stores/entityStore';
	import { getEntityRelationships, type EntityRelationship } from '$lib/config/entityRelationships';
	import { addOneChildEntity, generateMultipleChildEntities } from '$lib/utils/entityAutoGenerator';
	import { type Entity } from '$lib/types/entity';
	import { createEventDispatcher } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		parentEntity: Entity;
	}

	let { parentEntity }: Props = $props();

	const dispatch = createEventDispatcher<{
		openEntity: { entity: Entity };
		refresh: void;
	}>();

	console.log('[NestedEntitiesSection] Initialized with parent:', {
		parentId: parentEntity.id,
		parentName: parentEntity.name,
		parentType: parentEntity.type
	});

	// Get relationships for this entity type
	const relationships = getEntityRelationships(parentEntity.type);

	console.log('[NestedEntitiesSection] Found relationships:', relationships);

	// Reactive trigger to force re-render when entities change
	let updateTrigger = $state(0);

	// Create a reactive map of relationship -> child entities
	const childrenByRelationship = $derived.by(() => {
		// Access updateTrigger to create reactivity dependency
		updateTrigger;

		const map = new SvelteMap<EntityRelationship, Entity[]>();
		for (const relationship of relationships) {
			const allChildren = entityStore.getChildEntities(parentEntity.id);
			// Convert to lowercase for comparison since entity types are lowercase
			const expectedType = relationship.childType.toLowerCase();
			const filtered = allChildren.filter(child => child.type === expectedType);
			console.log(`[NestedEntitiesSection] Getting children for ${relationship.label}:`, filtered.length);
			map.set(relationship, filtered);
		}
		return map;
	});

	// Add one entity manually
	async function addOneEntity(relationship: EntityRelationship) {
		console.log('[NestedEntitiesSection] Add one entity clicked!', {
			parentEntity: parentEntity.name,
			relationship
		});

		const newEntity = addOneChildEntity(parentEntity, relationship);

		console.log('[NestedEntitiesSection] Entity created:', newEntity);

		if (newEntity) {
			console.log('[NestedEntitiesSection] Incrementing updateTrigger to force UI refresh');
			updateTrigger++;
			console.log('[NestedEntitiesSection] Dispatching refresh event');
			dispatch('refresh');
		} else {
			console.warn('[NestedEntitiesSection] No entity was created');
		}
	}

	// Generate multiple entities
	async function generateMultiple(relationship: EntityRelationship) {
		const createdEntities = generateMultipleChildEntities(parentEntity, relationship);
		if (createdEntities.length > 0) {
			updateTrigger++;
			dispatch('refresh');
		}
	}

	function handleEntityClick(entity: Entity) {
		dispatch('openEntity', { entity });
	}
</script>

{#if relationships.length > 0}
	<div class="nested-entities-container">
		{#each relationships as relationship (relationship.childType)}
			{@const childEntities = childrenByRelationship.get(relationship) || []}
			{@const count = childEntities.length}

			<div class="relationship-section">
				<div class="relationship-header">
					<h4>{relationship.label}</h4>
					<span class="count-badge">{count}</span>
				</div>

				<div class="entity-grid">
					{#if childEntities.length === 0}
						<div class="empty-state">
							<p>No {relationship.label.toLowerCase()} yet</p>
						</div>
					{:else}
						{#each childEntities as entity (entity.id)}
							<button class="entity-card" onclick={() => handleEntityClick(entity)}>
								<div class="entity-card-header">
									<span class="entity-name">{entity.name}</span>
									{#if entityStore.isFavorite(entity.id)}
										<span class="favorite-icon">⭐</span>
									{/if}
								</div>
								{#if entity.description}
									<p class="entity-description">{entity.description.slice(0, 80)}{entity.description.length > 80 ? '...' : ''}</p>
								{/if}
							</button>
						{/each}
					{/if}
				</div>

				<div class="action-buttons">
					<button class="add-one-btn" onclick={() => addOneEntity(relationship)}>
						<span class="icon">+</span>
						Add One {relationship.label.slice(0, -1)}
					</button>
					<button class="generate-multiple-btn" onclick={() => generateMultiple(relationship)}>
						<span class="icon">🎲</span>
						Generate Multiple ({relationship.minCount}-{relationship.maxCount})
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.nested-entities-container {
		margin-top: 2rem;
		padding: 1.5rem;
		background: var(--surface-2, #252525);
		border-radius: 8px;
		border: 1px solid var(--border-color, #333);
	}

	.nested-entities-container h3 {
		margin: 0 0 1.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-1, #e0e0e0);
	}

	.relationship-section {
		margin-bottom: 2rem;
	}

	.relationship-section:last-child {
		margin-bottom: 0;
	}

	.relationship-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.relationship-header h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-1, #e0e0e0);
	}

	.count-badge {
		background: var(--accent, #60a5fa);
		color: var(--surface-1, #1a1a1a);
		padding: 0.25rem 0.625rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.entity-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.empty-state {
		grid-column: 1 / -1;
		padding: 2rem;
		text-align: center;
		color: var(--text-2, #999);
		font-style: italic;
		background: var(--surface-3, #2a2a2a);
		border-radius: 6px;
		border: 2px dashed var(--border-color, #444);
	}

	.empty-state p {
		margin: 0;
	}

	.entity-card {
		background: var(--surface-3, #2a2a2a);
		border: 1px solid var(--border-color, #444);
		border-radius: 6px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		width: 100%;
	}

	.entity-card:hover {
		background: var(--surface-4, #333);
		border-color: var(--accent, #60a5fa);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.entity-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.entity-name {
		font-weight: 600;
		color: var(--text-1, #e0e0e0);
		font-size: 0.9375rem;
	}

	.favorite-icon {
		font-size: 0.875rem;
	}

	.entity-description {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--text-2, #999);
		line-height: 1.4;
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.add-one-btn,
	.generate-multiple-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.add-one-btn {
		background: var(--accent, #60a5fa);
		color: var(--surface-1, #1a1a1a);
	}

	.add-one-btn:hover {
		background: var(--accent-hover, #3b82f6);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(96, 165, 250, 0.4);
	}

	.generate-multiple-btn {
		background: var(--surface-4, #333);
		color: var(--text-1, #e0e0e0);
		border: 1px solid var(--border-color, #444);
	}

	.generate-multiple-btn:hover {
		background: var(--surface-5, #3a3a3a);
		border-color: var(--accent, #60a5fa);
		transform: translateY(-1px);
	}

	.icon {
		font-size: 1.125rem;
	}
</style>
