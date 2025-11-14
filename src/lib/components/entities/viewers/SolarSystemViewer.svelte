<script lang="ts">
	import type { SolarSystem } from '$lib/entities/celestial/solarSystem';
	import { SolarSystemCreator } from '$lib/entities/celestial/solarSystemCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';
	import SolarSystemScene from '$lib/components/three/SolarSystemScene.svelte';

	interface Props {
		solarSystem: SolarSystem;
		parentEntity?: any;
	}

	let { solarSystem, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	let selectedPlanetId: string | null = $state(null);
	let sceneComponent: SolarSystemScene | null = null;

	// Auto-save nested entities to navigator
	onMount(() => {
		autoSaveNestedEntities(
			{
				planets: { entities: solarSystem.planets, entityType: 'planet' },
				stars: { entities: solarSystem.stars, entityType: 'star' }
			},
			parentEntity,
			dispatch
		);
	});

	const basicInfo = $derived([
		{ label: 'Name', value: solarSystem.name },
		{ label: 'Stage', value: solarSystem.stage },
		{ label: 'Age', value: `${solarSystem.age.toFixed(1)} billion years` },
		{
			label: 'Habitable Zone',
			value: `${solarSystem.habitableZoneStart.toFixed(2)} - ${solarSystem.habitableZoneEnd.toFixed(2)} AU`
		}
	]);

	function resetCamera() {
		if (sceneComponent) {
			sceneComponent.resetCamera();
		}
	}

	const planetRules = SolarSystemCreator.NESTED_ENTITY_RULES.planets;
	const starRules = SolarSystemCreator.NESTED_ENTITY_RULES.stars;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddStar = createAddEntityHandler(solarSystem, 'stars', parentEntity, dispatch);
	const handleAddPlanet = createAddEntityHandler(solarSystem, 'planets', parentEntity, dispatch);
</script>

<div class="solar-system-viewer">
	<Section title="3D Solar System">
		<div class="solar-system-3d-container">
			<SolarSystemScene
				bind:this={sceneComponent}
				{solarSystem}
				containerWidth={600}
				containerHeight={600}
				bind:selectedPlanetId
				on:openEntity={handleOpenEntity}
			/>
			<button class="reset-camera-btn" onclick={resetCamera}>Reset Camera</button>
		</div>
	</Section>

	<Section title="Solar System Information">
		<InfoGrid items={basicInfo} />
	</Section>

	{#if solarSystem.stageDescription}
		<Section title="System Stage">
			<p class="description-text">{solarSystem.stageDescription}</p>
		</Section>
	{/if}

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

	.solar-system-3d-container {
		width: 600px;
		height: 650px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.reset-camera-btn {
		padding: 0.5rem 1rem;
		background: rgb(99 102 241);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.reset-camera-btn:hover {
		background: rgb(79 70 229);
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
