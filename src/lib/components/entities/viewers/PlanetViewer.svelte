<script lang="ts">
	import type { Planet } from '$lib/entities/celestial/planet';
	import { PlanetCreator } from '$lib/entities/celestial/planetCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		planet: Planet;
		parentEntity?: any; // The workspace entity wrapper
	}

	let { planet, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	const basicInfo = $derived([
		{ label: 'Name', value: planet.name },
		{ label: 'Type', value: planet.type },
		{ label: 'Livable', value: planet.isLivable ? 'Yes' : 'No' }
	]);

	// Get the rules from PlanetCreator
	const continentRules = PlanetCreator.NESTED_ENTITY_RULES.continents;

	function handleOpenEntity(event: CustomEvent<{ entity: any }>) {
		dispatch('openEntity', { entity: event.detail.entity });
	}

	function handleEntityUpdated(event: CustomEvent<{ entity: any }>) {
		dispatch('entityUpdated', { entity: event.detail.entity });
	}
</script>

<div class="planet-viewer">
	<Section title="Planet Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<EntityList
		entities={planet.continents}
		entityType={continentRules.entityType}
		displayName={continentRules.displayName}
		displayNamePlural="Continents"
		icon="🗺️"
		minRequired={continentRules.min}
		maxAllowed={continentRules.max}
		{parentEntity}
		bind:parentEntityArray={planet.continents}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	{#if planet.description}
		<Section title="Description">
			<p class="description-text">{planet.description}</p>
		</Section>
	{/if}
</div>

<style>
	.planet-viewer {
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
