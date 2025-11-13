<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Section from './Section.svelte';
	import EntityLink from './EntityLink.svelte';
	import AddNestedEntityModal from '../AddNestedEntityModal.svelte';

	interface Props {
		entities: any[];
		entityType: string;
		displayName: string;
		displayNamePlural: string;
		icon: string;
		minRequired: number;
		maxAllowed?: number;
		parentEntity?: any;
		onAddEntity: (entity: any) => void; // Callback to add entity to parent array
	}

	let {
		entities,
		entityType,
		displayName,
		displayNamePlural,
		icon,
		minRequired,
		maxAllowed = undefined,
		parentEntity = undefined,
		onAddEntity
	}: Props = $props();

	const dispatch = createEventDispatcher();

	let isAddModalOpen = $state(false);

	const currentCount = $derived(entities?.length || 0);
	const needsMore = $derived(currentCount < minRequired);
	const canAddMore = $derived(maxAllowed === undefined || currentCount < maxAllowed);
	const shouldEnableButton = $derived(needsMore || canAddMore);

	const title = $derived(
		currentCount > 1 ? `${displayNamePlural} (${currentCount})` : displayNamePlural
	);

	function handleEntityClick(event: CustomEvent<{ entity: any }>) {
		dispatch('openEntity', { entity: event.detail.entity });
	}

	function openAddModal() {
		isAddModalOpen = true;
	}

	function closeAddModal() {
		isAddModalOpen = false;
	}

	function handleAddEntity(entity: any) {
		// Call the parent's callback to add the entity
		onAddEntity(entity);
	}
</script>

<Section {title}>
	{#if entities && entities.length > 0}
		<div class="entities-list">
			{#each entities as entity (entity.id)}
				<EntityLink {entity} {icon} on:click={handleEntityClick} />
			{/each}
		</div>
	{:else}
		<p class="empty-message">No {displayNamePlural.toLowerCase()} yet</p>
	{/if}

	<!-- Add Entity Button -->
	<button
		class="add-button"
		disabled={!shouldEnableButton}
		onclick={openAddModal}
		title={needsMore
			? `Add a ${displayName.toLowerCase()} (minimum ${minRequired} required)`
			: maxAllowed !== undefined && currentCount >= maxAllowed
				? `Maximum ${displayNamePlural.toLowerCase()} limit reached (${maxAllowed})`
				: `Add another ${displayName.toLowerCase()}`}
	>
		<span class="plus-icon">+</span>
		Add {displayName}
	</button>
</Section>

<AddNestedEntityModal
	bind:isOpen={isAddModalOpen}
	{entityType}
	{displayName}
	onClose={closeAddModal}
	onAdd={handleAddEntity}
/>

<style>
	.entities-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.empty-message {
		text-align: center;
		color: rgb(216 180 254 / 0.6);
		font-style: italic;
		padding: 1rem;
		margin: 0 0 1rem 0;
	}

	.add-button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: linear-gradient(135deg, rgb(168 85 247 / 0.2), rgb(192 132 252 / 0.2));
		border: 1px dashed rgb(168 85 247 / 0.5);
		color: rgb(216 180 254);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.add-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgb(168 85 247 / 0.3), rgb(192 132 252 / 0.3));
		border-color: rgb(168 85 247);
		color: white;
		transform: translateY(-1px);
	}

	.add-button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		transform: none;
	}

	.plus-icon {
		font-size: 1.25rem;
		font-weight: bold;
	}
</style>
