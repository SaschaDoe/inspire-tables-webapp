<script lang="ts">
	import type { Sphere } from '$lib/entities/celestial/sphere';
	import { SphereCreator } from '$lib/entities/celestial/sphereCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityLink from '../shared/EntityLink.svelte';
	import AddNestedEntityModal from '../AddNestedEntityModal.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		sphere: Sphere;
		parentEntity?: any; // The workspace entity wrapper
	}

	let { sphere, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	let isAddGalaxyModalOpen = $state(false);

	const basicInfo = $derived([
		{ label: 'Name', value: sphere.name },
		{ label: 'Rule', value: sphere.rule },
		{ label: 'Birth', value: sphere.birth }
	]);

	// Get the rules from SphereCreator
	const galaxyRules = SphereCreator.NESTED_ENTITY_RULES.galaxies;
	const currentGalaxyCount = $derived(sphere.galaxies?.length || 0);
	const needsMoreGalaxies = $derived(currentGalaxyCount < galaxyRules.min);

	const galaxiesTitle = $derived(
		currentGalaxyCount > 1 ? `Galaxies (${currentGalaxyCount})` : 'Galaxies'
	);

	function handleGalaxyClick(event: CustomEvent<{ entity: any }>) {
		// Bubble up the event to parent (EntityViewer)
		dispatch('openEntity', { entity: event.detail.entity });
	}

	function openAddGalaxyModal() {
		isAddGalaxyModalOpen = true;
	}

	function closeAddGalaxyModal() {
		isAddGalaxyModalOpen = false;
	}

	function handleAddGalaxy(galaxy: any) {
		// Add galaxy to the sphere's galaxies array (use reassignment for Svelte 5 reactivity)
		if (!sphere.galaxies) {
			sphere.galaxies = [];
		}
		sphere.galaxies = [...sphere.galaxies, galaxy];

		// Update the parent entity in the store if it exists
		if (parentEntity) {
			dispatch('entityUpdated', { entity: parentEntity });
		}
	}
</script>

<div class="sphere-viewer">
	<Section title="Sphere Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title={galaxiesTitle}>
		{#if sphere.galaxies && sphere.galaxies.length > 0}
			<div class="galaxies-list">
				{#each sphere.galaxies as galaxy}
					<EntityLink entity={galaxy} icon="🌀" on:click={handleGalaxyClick} />
				{/each}
			</div>
		{:else}
			<p class="empty-message">No galaxies yet</p>
		{/if}

		<!-- Add Galaxy Button -->
		<button
			class="add-button"
			disabled={!needsMoreGalaxies}
			onclick={openAddGalaxyModal}
			title={needsMoreGalaxies
				? `Add a galaxy (minimum ${galaxyRules.min} required)`
				: `Minimum galaxies requirement met`}
		>
			<span class="plus-icon">+</span>
			Add Galaxy
		</button>
	</Section>

	{#if sphere.description}
		<Section title="Description">
			<p class="description-text">{sphere.description}</p>
		</Section>
	{/if}
</div>

<AddNestedEntityModal
	bind:isOpen={isAddGalaxyModalOpen}
	entityType={galaxyRules.entityType}
	displayName={galaxyRules.displayName}
	onClose={closeAddGalaxyModal}
	onAdd={handleAddGalaxy}
/>

<style>
	.sphere-viewer {
		padding: 0;
	}

	.galaxies-list {
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
