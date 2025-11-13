<script lang="ts">
	import type { SolarSystem } from '$lib/entities/celestial/solarSystem';
	import { SolarSystemCreator } from '$lib/entities/celestial/solarSystemCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		solarSystem: SolarSystem;
		parentEntity?: any; // The workspace entity wrapper
	}

	let { solarSystem, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	const basicInfo = $derived([{ label: 'Name', value: solarSystem.name }]);

	// Get the rules from SolarSystemCreator
	const planetRules = SolarSystemCreator.NESTED_ENTITY_RULES.planets;
	const starRules = SolarSystemCreator.NESTED_ENTITY_RULES.stars;

	function handleOpenEntity(event: CustomEvent<{ entity: any }>) {
		dispatch('openEntity', { entity: event.detail.entity });
	}

	function handleEntityUpdated(event: CustomEvent<{ entity: any }>) {
		dispatch('entityUpdated', { entity: event.detail.entity });
	}

	function handleAddStar(star: any) {
		solarSystem.stars = [...solarSystem.stars, star];
		if (parentEntity) {
			dispatch('entityUpdated', { entity: parentEntity });
		}
	}

	function handleAddPlanet(planet: any) {
		console.log('[SolarSystemViewer] handleAddPlanet called', {
			planet,
			planetsBeforeAdd: solarSystem.planets,
			parentEntity
		});
		solarSystem.planets = [...solarSystem.planets, planet];
		console.log('[SolarSystemViewer] planets after reassignment:', solarSystem.planets);
		if (parentEntity) {
			console.log('[SolarSystemViewer] dispatching entityUpdated with parentEntity:', parentEntity);
			dispatch('entityUpdated', { entity: parentEntity });
		} else {
			console.warn('[SolarSystemViewer] No parentEntity - entityUpdated not dispatched!');
		}
	}
</script>

<div class="solar-system-viewer">
	<Section title="Solar System Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<EntityList
		entities={solarSystem.stars}
		entityType={starRules.entityType}
		displayName={starRules.displayName}
		displayNamePlural="Stars"
		icon="⭐"
		minRequired={starRules.min}
		maxAllowed={starRules.max}
		{parentEntity}
		onAddEntity={handleAddStar}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	<EntityList
		entities={solarSystem.planets}
		entityType={planetRules.entityType}
		displayName={planetRules.displayName}
		displayNamePlural="Planets"
		icon="🌍"
		minRequired={planetRules.min}
		maxAllowed={planetRules.max}
		{parentEntity}
		onAddEntity={handleAddPlanet}
		on:openEntity={handleOpenEntity}
		on:entityUpdated={handleEntityUpdated}
	/>

	{#if solarSystem.description}
		<Section title="Description">
			<p class="description-text">{solarSystem.description}</p>
		</Section>
	{/if}
</div>

<style>
	.solar-system-viewer {
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
