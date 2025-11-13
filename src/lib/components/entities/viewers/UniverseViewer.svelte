<script lang="ts">
	import type { Universe } from '$lib/entities/celestial/universe';
	import { UniverseCreator } from '$lib/entities/celestial/universeCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		universe: Universe;
		parentEntity?: any; // The workspace entity wrapper
	}

	let { universe, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	const basicInfo = $derived([
		{ label: 'Name', value: universe.name },
		{ label: 'Age', value: universe.age },
		{ label: 'Dimensional Structure', value: universe.dimensionalStructure }
	]);

	// Get the rules from UniverseCreator
	const sphereRules = UniverseCreator.NESTED_ENTITY_RULES.spheres;

	function handleOpenEntity(event: CustomEvent<{ entity: any }>) {
		dispatch('openEntity', { entity: event.detail.entity });
	}

	function handleEntityUpdated(event: CustomEvent<{ entity: any }>) {
		dispatch('entityUpdated', { entity: event.detail.entity });
	}

	function handleAddSphere(sphere: any) {
		universe.spheres = [...universe.spheres, sphere];
		if (parentEntity) {
			dispatch('entityUpdated', { entity: parentEntity });
		}
	}
</script>

<div class="universe-viewer">
	<Section title="Universe Information">
		<InfoGrid items={basicInfo} />
	</Section>

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
