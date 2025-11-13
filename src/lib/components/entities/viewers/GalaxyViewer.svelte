<script lang="ts">
	import type { Galaxy } from '$lib/entities/celestial/galaxy';
	import { GalaxyCreator } from '$lib/entities/celestial/galaxyCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		galaxy: Galaxy;
		parentEntity?: any; // The workspace entity wrapper
	}

	let { galaxy, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	const basicInfo = $derived([
		{ label: 'Name', value: galaxy.name },
		{ label: 'Size', value: galaxy.size }
	]);

	// Get the rules from GalaxyCreator
	const solarSystemRules = GalaxyCreator.NESTED_ENTITY_RULES.solarSystems;

	function handleOpenEntity(event: CustomEvent<{ entity: any }>) {
		dispatch('openEntity', { entity: event.detail.entity });
	}

	function handleEntityUpdated(event: CustomEvent<{ entity: any }>) {
		dispatch('entityUpdated', { entity: event.detail.entity });
	}
</script>

<div class="galaxy-viewer">
	<Section title="Galaxy Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<EntityList
		entities={galaxy.solarSystems}
		entityType={solarSystemRules.entityType}
		displayName={solarSystemRules.displayName}
		displayNamePlural="Solar Systems"
		icon="☀️"
		minRequired={solarSystemRules.min}
		maxAllowed={solarSystemRules.max}
		{parentEntity}
		bind:parentEntityArray={galaxy.solarSystems}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	{#if galaxy.description}
		<Section title="Description">
			<p class="description-text">{galaxy.description}</p>
		</Section>
	{/if}
</div>

<style>
	.galaxy-viewer {
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
