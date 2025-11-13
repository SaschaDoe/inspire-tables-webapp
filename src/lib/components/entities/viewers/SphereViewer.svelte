<script lang="ts">
	import type { Sphere } from '$lib/entities/celestial/sphere';
	import { SphereCreator } from '$lib/entities/celestial/sphereCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		sphere: Sphere;
		parentEntity?: any; // The workspace entity wrapper
	}

	let { sphere, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	const basicInfo = $derived([
		{ label: 'Name', value: sphere.name },
		{ label: 'Rule', value: sphere.rule },
		{ label: 'Birth', value: sphere.birth }
	]);

	// Get the rules from SphereCreator
	const galaxyRules = SphereCreator.NESTED_ENTITY_RULES.galaxies;

	function handleOpenEntity(event: CustomEvent<{ entity: any }>) {
		dispatch('openEntity', { entity: event.detail.entity });
	}

	function handleEntityUpdated(event: CustomEvent<{ entity: any }>) {
		dispatch('entityUpdated', { entity: event.detail.entity });
	}
</script>

<div class="sphere-viewer">
	<Section title="Sphere Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<EntityList
		entities={sphere.galaxies}
		entityType={galaxyRules.entityType}
		displayName={galaxyRules.displayName}
		displayNamePlural="Galaxies"
		icon="🌀"
		minRequired={galaxyRules.min}
		maxAllowed={galaxyRules.max}
		{parentEntity}
		bind:parentEntityArray={sphere.galaxies}
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
