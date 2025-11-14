<script lang="ts">
	import type { Planet } from '$lib/entities/celestial/planet';
	import { PlanetCreator } from '$lib/entities/celestial/planetCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';
	import PlanetRenderer from '$lib/components/three/PlanetRenderer.svelte';

	interface Props {
		planet: Planet;
		parentEntity?: any;
	}

	let { planet, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	// Auto-save nested entities to navigator
	onMount(() => {
		autoSaveNestedEntities(
			{
				continents: { entities: planet.continents, entityType: 'continent' }
			},
			parentEntity,
			dispatch
		);
	});

	const basicInfo = $derived([
		{ label: 'Name', value: planet.name },
		{
			label: 'Translation',
			value: planet.nameTranslation ? `${planet.nameTranslation} - "${planet.nameMeaning}"` : '-'
		},
		{ label: 'Type', value: planet.type },
		{ label: 'Livable', value: planet.isLivable ? 'Yes' : 'No' },
		{ label: 'Size', value: planet.size }
	]);

	const atmosphereInfo = $derived([
		{ label: 'Atmosphere', value: planet.atmosphere },
		{ label: 'Weather', value: planet.weather }
	]);

	const orbitalInfo = $derived([
		{ label: 'Distance from Star', value: `${planet.distanceFromStar.toFixed(2)} AU` },
		{
			label: 'Orbital Period',
			value: `${planet.orbitPeriod} days (${(planet.orbitPeriod / 365).toFixed(2)} Earth years)`
		},
		{ label: 'Rotation Period', value: `${planet.rotationPeriod} hours` },
		{ label: 'Axial Tilt', value: `${planet.obliquity}°` }
	]);

	const physicalInfo = $derived([
		{ label: 'Surface Gravity', value: `${planet.surfaceGravity.toFixed(2)}g` },
		{ label: 'Magnetic Field', value: planet.hasMagneticField ? 'Yes' : 'No' },
		{ label: 'Rings', value: planet.rings.length > 0 ? `${planet.rings.length} ring(s)` : 'None' },
		{ label: 'Moons', value: planet.moons.length > 0 ? planet.moons.join(', ') : 'None' }
	]);

	const continentRules = PlanetCreator.NESTED_ENTITY_RULES.continents;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddContinent = createAddEntityHandler(planet, 'continents', parentEntity, dispatch);
</script>

<div class="planet-viewer">
	<Section title="3D Visualization">
		<div class="planet-3d-container">
			<PlanetRenderer {planet} containerWidth={400} containerHeight={400} />
		</div>
	</Section>

	<Section title="Basic Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Atmosphere">
		<InfoGrid items={atmosphereInfo} />
	</Section>

	<Section title="Orbital Mechanics">
		<InfoGrid items={orbitalInfo} />
	</Section>

	<Section title="Physical Properties">
		<InfoGrid items={physicalInfo} />
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
		onAddEntity={handleAddContinent}
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

	.planet-3d-container {
		width: 400px;
		height: 400px;
		margin: 0 auto;
		border-radius: 0.5rem;
		overflow: hidden;
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
