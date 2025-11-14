<script lang="ts">
	import type { Galaxy } from '$lib/entities/celestial/galaxy';
	import { GalaxyCreator } from '$lib/entities/celestial/galaxyCreator';
	import { GalaxyAnomaliesTable } from '$lib/tables/locationTables/galaxyTables/galaxyAnomaliesTable';
	import { Dice } from '$lib/utils/dice';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';

	interface Props {
		galaxy: Galaxy;
		parentEntity?: any;
	}

	let { galaxy, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	// Auto-save nested entities to navigator
	onMount(() => {
		autoSaveNestedEntities(
			{
				solarSystems: { entities: galaxy.solarSystems, entityType: 'solarSystem' }
			},
			parentEntity,
			dispatch
		);
	});

	const basicInfo = $derived([
		{ label: 'Name', value: galaxy.name },
		{ label: 'Type', value: galaxy.type },
		{ label: 'Age', value: `${galaxy.ageInYears.toLocaleString()} million years (${galaxy.age})` },
		{ label: 'Size', value: `${galaxy.sizeInLightyears.toLocaleString()} ly (${galaxy.size})` },
		{ label: 'Mass', value: `${galaxy.massInSolarMasses} solar masses (${galaxy.mass})` },
		{ label: 'Active Nucleus', value: galaxy.hasActiveGalacticNucleus ? 'Yes' : 'No' },
		{ label: 'Rotation Velocity', value: `${galaxy.rotationVelocity} km/s` }
	]);

	const solarSystemRules = GalaxyCreator.NESTED_ENTITY_RULES.solarSystems;

	const { handleOpenEntity, handleEntityUpdated } = createEventForwarders(dispatch);
	const handleAddSolarSystem = createAddEntityHandler(galaxy, 'solarSystems', parentEntity, dispatch);

	function scanForAnomalies() {
		if (!galaxy.isAlreadyScannedForAnomalies) {
			const dice = new Dice();
			const numberOfAnomalies = dice.rollInterval(1, 6);
			const anomaliesTable = new GalaxyAnomaliesTable();

			for (let i = 0; i < numberOfAnomalies; i++) {
				const anomaly = anomaliesTable.roleWithCascade(dice).text;
				if (!galaxy.anomalies.includes(anomaly)) {
					galaxy.anomalies.push(anomaly);
				}
			}

			galaxy.isAlreadyScannedForAnomalies = true;
			dispatch('entityUpdated', { entity: galaxy });
		}
	}
</script>

<div class="galaxy-viewer">
	<!-- Galaxy Image Section -->
	{#if galaxy.imagePath}
		<Section title="Visual">
			<div class="image-container">
				<img class="galaxy-image" src={galaxy.imagePath} alt={galaxy.name} />
				<div class="color-overlay" style="background: {galaxy.color};"></div>
				{#each galaxy.solarSystems as system, i}
					<button
						class="solar-system-marker"
						style="left: {system.positionX}px; top: {system.positionY}px;"
						title="{system.name || `Solar System ${i + 1}`}"
						onclick={() => dispatch('openEntity', { entity: system })}
					></button>
				{/each}
			</div>
		</Section>
	{/if}

	<Section title="Galaxy Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<!-- Anomalies Section -->
	<Section title="Anomalies">
		{#if !galaxy.isAlreadyScannedForAnomalies}
			<button class="scan-button" onclick={scanForAnomalies}> Scan for Anomalies </button>
		{:else if galaxy.anomalies.length > 0}
			<ul class="anomalies-list">
				{#each galaxy.anomalies as anomaly}
					<li>{anomaly}</li>
				{/each}
			</ul>
		{:else}
			<p class="no-anomalies">No anomalies detected.</p>
		{/if}
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
		onAddEntity={handleAddSolarSystem}
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

	.image-container {
		position: relative;
		height: 300px;
		width: 100%;
		max-width: 450px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.galaxy-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.color-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		mix-blend-mode: multiply;
		pointer-events: none;
	}

	.solar-system-marker {
		position: absolute;
		background: transparent;
		border: 3px solid rgb(192 132 252);
		width: 16px;
		height: 16px;
		border-radius: 50%;
		box-sizing: border-box;
		z-index: 10;
		pointer-events: all;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 0 12px rgba(192, 132, 252, 0.8), inset 0 0 8px rgba(192, 132, 252, 0.3);
		animation: pulse 2s ease-in-out infinite;
		transform: translate(-50%, -50%);
		padding: 0;
	}

	.solar-system-marker:hover {
		border-color: rgb(233 213 255);
		border-width: 4px;
		width: 20px;
		height: 20px;
		box-shadow: 0 0 20px rgba(233, 213, 255, 1), inset 0 0 12px rgba(233, 213, 255, 0.5);
		animation: none;
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 0 12px rgba(192, 132, 252, 0.8), inset 0 0 8px rgba(192, 132, 252, 0.3);
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			box-shadow: 0 0 20px rgba(233, 213, 255, 1), inset 0 0 12px rgba(233, 213, 255, 0.5);
			transform: translate(-50%, -50%) scale(1.1);
		}
	}

	.scan-button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, rgb(147, 51, 234), rgb(126, 34, 206));
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 0.875rem;
	}

	.scan-button:hover {
		background: linear-gradient(135deg, rgb(126, 34, 206), rgb(107, 33, 168));
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
	}

	.anomalies-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.anomalies-list li {
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.3);
		border-left: 3px solid rgb(239 68 68);
		border-radius: 0.375rem;
		margin-bottom: 0.5rem;
		color: rgb(252 165 165);
		font-size: 0.875rem;
	}

	.no-anomalies {
		padding: 1rem;
		background: rgb(30 27 75 / 0.2);
		border-left: 3px solid rgb(34 197 94);
		border-radius: 0.375rem;
		color: rgb(134 239 172);
		font-size: 0.875rem;
		margin: 0;
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
