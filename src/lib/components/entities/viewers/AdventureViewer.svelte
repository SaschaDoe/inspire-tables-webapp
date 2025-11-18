<script lang="ts">
	import type { Adventure, RisingActionEntity } from '$lib/entities/adventure/adventure';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import StoryBoard from '$lib/components/storyboard/StoryBoard.svelte';
	import EntityGeneratorModal from '../EntityGeneratorModal.svelte';
	import { getTvTropesUrl } from '$lib/utils/tvTropesUtils';
	import { parsePlaceholder } from '$lib/utils/placeholderParser';
	import { entityStore } from '$lib/stores/entityStore';
	import { tabStore } from '$lib/stores/tabStore';

	interface Props {
		adventure: Adventure;
	}

	let { adventure }: Props = $props();

	const basicInfo = $derived([{ label: 'Name', value: adventure.name }]);

	// Modal state for entity generation
	let isEntityModalOpen = $state(false);
	let entityTypeToGenerate = $state<string | null>(null);
	let pendingRisingActionIndex = $state<number | null>(null);
	let refreshTrigger = $state(0); // Used to force refresh after updates

	// Get current adventure data (refreshes when refreshTrigger changes)
	const currentAdventure = $derived.by(() => {
		// Access refreshTrigger to create dependency
		refreshTrigger;
		// Fetch fresh data from store
		const freshEntity = entityStore.getEntity(adventure.id);
		if (freshEntity) {
			// If it's a workspace entity with customFields, extract the adventure data
			if (freshEntity.customFields?.generatedEntity) {
				return freshEntity.customFields.generatedEntity as Adventure;
			}
			// Otherwise assume the entity itself is the adventure
			return freshEntity as any;
		}
		return adventure;
	});

	function handlePlaceholderClick(index: number, entityType: string) {
		pendingRisingActionIndex = index;
		entityTypeToGenerate = entityType;
		isEntityModalOpen = true;
	}

	function handleCloseModal() {
		isEntityModalOpen = false;
		entityTypeToGenerate = null;
		pendingRisingActionIndex = null;
	}

	function handleSaveEntity(entity: any, entityType: string) {
		if (pendingRisingActionIndex === null) return;

		// Create workspace entity from generated entity
		const workspaceEntity = {
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

		// Save entity to store
		entityStore.createEntity(workspaceEntity);

		// Dispatch event to tell workspace to refresh its entity list
		window.dispatchEvent(new CustomEvent('entity-created', {
			detail: { entityId: workspaceEntity.id, entityType: entityType }
		}));

		// Get the placeholder info to extract the prefix
		const placeholderInfo = parsePlaceholder(adventure.risingAction[pendingRisingActionIndex]);

		// Create new arrays/objects for reactivity (don't mutate existing ones)
		const newRisingAction = [...adventure.risingAction];
		newRisingAction[pendingRisingActionIndex] = `${placeholderInfo.prefix}: ${workspaceEntity.name}`;

		const newRisingActionEntities = { ...adventure.risingActionEntities };
		newRisingActionEntities[pendingRisingActionIndex] = {
			entityId: entity.id,
			entityType: entityType,
			entityName: workspaceEntity.name
		};

		// Update the adventure object directly (for local reactivity)
		adventure.risingAction = newRisingAction;
		adventure.risingActionEntities = newRisingActionEntities;

		// Get the current entity from store to update it properly
		const currentEntity = entityStore.getEntity(adventure.id);
		if (currentEntity) {
			// If it's stored in customFields.generatedEntity, update that
			if (currentEntity.customFields?.generatedEntity) {
				const updatedEntity = {
					...currentEntity,
					customFields: {
						...currentEntity.customFields,
						generatedEntity: {
							...currentEntity.customFields.generatedEntity,
							risingAction: newRisingAction,
							risingActionEntities: newRisingActionEntities
						}
					}
				};
				entityStore.updateEntity(adventure.id, updatedEntity as any);
			} else {
				// Otherwise update at top level
				entityStore.updateEntity(adventure.id, {
					risingAction: newRisingAction,
					risingActionEntities: newRisingActionEntities
				} as any);
			}
		}

		// Trigger refresh to reload adventure data
		refreshTrigger++;

		// Close modal
		handleCloseModal();
	}

	function handleEntityClick(entityId: string) {
		const entity = entityStore.getEntity(entityId);
		if (entity) {
			tabStore.openTab(entity);
		}
	}
</script>

<div class="adventure-viewer">
	<!-- Adventure Information Section -->
	<Section title="Adventure Overview">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Story Structure">
		<div class="story-timeline">
			<div class="story-phase">
				<h4 class="phase-title">Beginning</h4>
				<p class="phase-content">
					<a
						href={getTvTropesUrl(currentAdventure.beginning)}
						target="_blank"
						rel="noopener noreferrer"
						class="story-link"
					>
						{currentAdventure.beginning}
						<span class="external-icon">↗</span>
					</a>
				</p>
			</div>

			<div class="story-phase">
				<h4 class="phase-title">Rising Action</h4>
				<ul class="phase-list">
					{#each currentAdventure.risingAction as event, i (i)}
						{@const linkedEntity = currentAdventure.risingActionEntities?.[i]}
						{@const placeholderInfo = parsePlaceholder(event)}
						{@const eventPrefix = event.includes(':') ? event.split(':')[0].trim() : ''}
						<li class="phase-item">
							{#if linkedEntity}
								<!-- Display linked entity with navigation -->
								{#if eventPrefix}
									<span class="event-text">{eventPrefix}:</span>
								{/if}
								<button
									class="entity-link-btn"
									onclick={() => handleEntityClick(linkedEntity.entityId)}
								>
									{linkedEntity.entityName}
									<span class="entity-icon">→</span>
								</button>
							{:else if placeholderInfo.hasPlaceholder}
								<!-- Display placeholder with click to generate -->
								<span class="event-text">{placeholderInfo.prefix}:</span>
								<button
									class="placeholder-btn"
									onclick={() => handlePlaceholderClick(i, placeholderInfo.entityType)}
								>
									{placeholderInfo.placeholder}
									<span class="generate-icon">+</span>
								</button>
							{:else}
								<!-- Regular TV Tropes link -->
								<a
									href={getTvTropesUrl(event)}
									target="_blank"
									rel="noopener noreferrer"
									class="story-link"
								>
									{event}
									<span class="external-icon">↗</span>
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			<div class="story-phase climax-phase">
				<h4 class="phase-title">Climax</h4>
				<p class="phase-content">
					<a
						href={getTvTropesUrl(currentAdventure.climax)}
						target="_blank"
						rel="noopener noreferrer"
						class="story-link"
					>
						{currentAdventure.climax}
						<span class="external-icon">↗</span>
					</a>
				</p>
			</div>

			<div class="story-phase">
				<h4 class="phase-title">Ending</h4>
				<p class="phase-content">
					<a
						href={getTvTropesUrl(currentAdventure.ending)}
						target="_blank"
						rel="noopener noreferrer"
						class="story-link"
					>
						{currentAdventure.ending}
						<span class="external-icon">↗</span>
					</a>
				</p>
			</div>
		</div>
	</Section>

	{#if currentAdventure.plotTropes && currentAdventure.plotTropes.length > 0}
		<Section title="Plot Tropes">
			<ul class="trope-list">
				{#each currentAdventure.plotTropes as trope, i (i)}
					<li class="trope-item">
						<a
							href={getTvTropesUrl(trope)}
							target="_blank"
							rel="noopener noreferrer"
							class="trope-link"
						>
							{trope}
							<span class="external-icon">↗</span>
						</a>
					</li>
				{/each}
			</ul>
		</Section>
	{/if}

	<Section title="Full Description">
		<p class="description-text">{currentAdventure.description}</p>
	</Section>

	<!-- Storyboard Section - Now integrated below -->
	<div class="storyboard-section">
		<h3 class="storyboard-title">🎬 Story Board</h3>
		<div class="storyboard-container">
			{#key currentAdventure.id}
				<StoryBoard adventureId={currentAdventure.id} />
			{/key}
		</div>
	</div>
</div>

<!-- Entity Generator Modal -->
<EntityGeneratorModal
	bind:isOpen={isEntityModalOpen}
	onClose={handleCloseModal}
	onSave={handleSaveEntity}
	defaultEntityType={entityTypeToGenerate}
/>

<style>
	.adventure-viewer {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.storyboard-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 2px solid rgb(168 85 247 / 0.3);
	}

	.storyboard-title {
		margin: 0 0 1.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: rgb(216 180 254);
		padding: 0 1.5rem;
	}

	.storyboard-container {
		min-height: 600px;
		height: 600px;
		background: rgb(30 27 75 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.story-timeline {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.story-phase {
		padding: 1.25rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		border-left: 4px solid rgb(168 85 247 / 0.5);
		transition: all 0.2s;
	}

	.story-phase:hover {
		border-color: rgb(168 85 247 / 0.5);
		background: rgb(30 27 75 / 0.7);
		transform: translateX(4px);
	}

	.climax-phase {
		border-left-color: rgb(220 38 38);
		background: rgb(88 28 135 / 0.2);
	}

	.phase-title {
		font-size: 1rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.phase-content {
		color: rgb(216 180 254 / 0.9);
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 0;
	}

	.story-link {
		color: rgb(216 180 254);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		transition: color 0.2s;
	}

	.story-link:hover {
		color: rgb(233 213 255);
		text-decoration: underline;
	}

	.phase-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.phase-item {
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border-left: 2px solid rgb(168 85 247 / 0.5);
		border-radius: 0.25rem;
		color: rgb(216 180 254 / 0.9);
		font-size: 0.875rem;
	}

	.trope-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.trope-item {
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.trope-item:hover {
		background: rgb(30 27 75 / 0.7);
		border-color: rgb(168 85 247 / 0.4);
		transform: translateX(2px);
	}

	.trope-link {
		color: rgb(216 180 254);
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		transition: color 0.2s;
	}

	.trope-link:hover {
		color: rgb(233 213 255);
	}

	.external-icon {
		font-size: 0.75rem;
		color: rgb(168 85 247);
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.trope-link:hover .external-icon {
		opacity: 1;
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

	/* Rising Action Entity Links */
	.event-text {
		color: rgb(216 180 254 / 0.9);
		margin-right: 0.5rem;
	}

	.placeholder-btn {
		background: rgb(168 85 247 / 0.2);
		border: 1px dashed rgb(168 85 247 / 0.6);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		padding: 0.25rem 0.625rem;
		cursor: pointer;
		font-size: 0.875rem;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		transition: all 0.2s;
	}

	.placeholder-btn:hover {
		background: rgb(168 85 247 / 0.3);
		border-color: rgb(168 85 247);
		color: rgb(233 213 255);
		transform: translateX(2px);
	}

	.generate-icon {
		font-size: 0.875rem;
		color: rgb(168 85 247);
		font-weight: bold;
	}

	.entity-link-btn {
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.4);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		padding: 0.25rem 0.625rem;
		cursor: pointer;
		font-size: 0.875rem;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		transition: all 0.2s;
	}

	.entity-link-btn:hover {
		background: rgb(168 85 247 / 0.2);
		border-color: rgb(168 85 247);
		color: rgb(233 213 255);
		transform: translateX(2px);
	}

	.entity-icon {
		font-size: 0.875rem;
		color: rgb(168 85 247);
	}
</style>
