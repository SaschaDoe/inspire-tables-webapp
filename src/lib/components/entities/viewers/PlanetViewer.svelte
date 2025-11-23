<script lang="ts">
	import type { Planet } from '$lib/entities/celestial/planet';
	import { PlanetCreator } from '$lib/entities/celestial/planetCreator';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityList from '../shared/EntityList.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { autoSaveNestedEntities, createAddEntityHandler, createEventForwarders } from './viewerUtils';
	import PlanetRenderer from '$lib/components/three/PlanetRenderer.svelte';
	import HexMapCanvas from '$lib/components/worldmap/HexMapCanvas.svelte';
	import { WorldMapCreator } from '$lib/entities/location/worldMapCreator';
	import type { HexTile } from '$lib/entities/location/hexTile';
	import { TerrainType } from '$lib/entities/location/terrainType';
	import { entityStore } from '$lib/stores/entityStore';

	interface Props {
		planet: Planet;
		parentEntity?: any;
	}

	let { planet, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	let selectedHex: HexTile | null = $state(null);
	let showWorldMapError: string | null = $state(null);
	let mapKey = $state(0); // Force re-render of map component
	let showContinents = $state(false);
	let continentSelectionMode = $state(false);

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

	function generateWorldMap() {
		console.log('[PlanetViewer] Generate World Map button clicked');
		showWorldMapError = null;
		try {
			console.log('[PlanetViewer] Creating world map for planet:', planet.name);
			planet.worldMap = WorldMapCreator.create(planet);
			console.log('[PlanetViewer] World map created successfully');
			mapKey++; // Force re-render

			// Save continents to entity store so they appear in navigator
			autoSaveNestedEntities(
				{
					continents: { entities: planet.continents, entityType: 'continent' }
				},
				parentEntity,
				dispatch
			);
			console.log('[PlanetViewer] Continents saved to entity store');

			// Update the parent entity in the store to trigger reactivity
			if (parentEntity) {
				const existingEntity = entityStore.getEntity(parentEntity.id);
				if (existingEntity) {
					// Create a deep copy to ensure reactivity
					const updatedGeneratedEntity = JSON.parse(JSON.stringify(planet));

					entityStore.updateEntity(parentEntity.id, {
						...existingEntity,
						customFields: {
							...existingEntity.customFields,
							generatedEntity: updatedGeneratedEntity
						},
						metadata: {
							...existingEntity.metadata,
							updatedAt: new Date()
						}
					});
					console.log('[PlanetViewer] Entity store updated');
				}

				dispatch('entityUpdated', { entity: parentEntity });
			}
		} catch (error) {
			console.error('[PlanetViewer] Error generating world map:', error);
			showWorldMapError = error instanceof Error ? error.message : 'Failed to generate world map';
		}
	}

	function regenerateWorldMap() {
		const confirmed = confirm(
			'This will overwrite the existing world map. Are you sure you want to continue?'
		);
		if (confirmed) {
			// Change the seed to generate a different map
			planet.seed = Math.floor(Math.random() * 1000000);
			generateWorldMap();
		}
	}

	function handleHexSelected(event: CustomEvent<{ hex: HexTile }>) {
		selectedHex = event.detail.hex;
	}

	function handleContinentSelected(
		event: CustomEvent<{ continent: any; tiles: HexTile[] }>
	) {
		const continentInfo = event.detail.continent;

		// Navigate to the continent entity if it has an entityId
		if (continentInfo.entityId) {
			const continentEntity = planet.continents.find((c) => c.id === continentInfo.entityId);
			if (continentEntity) {
				dispatch('openEntity', { entity: continentEntity });
				return;
			}
		}

		// Fallback: just show the first tile info from the continent
		selectedHex = event.detail.tiles[0] || null;
	}

	// When continent selection mode is enabled, automatically show continents
	$effect(() => {
		if (continentSelectionMode) {
			showContinents = true;
		}
	});

	const hexInfo = $derived(
		selectedHex
			? [
					{ label: 'X', value: selectedHex.x.toString() },
					{ label: 'Y', value: selectedHex.y.toString() },
					{ label: 'Terrain', value: TerrainType[selectedHex.terrainType] },
					{ label: 'Elevation', value: selectedHex.elevation.toString() },
					{ label: 'Temperature', value: `${selectedHex.temperature.toFixed(0)}°` },
					{
						label: 'Dryness',
						value: `${selectedHex.dryness.toFixed(0)}% (${selectedHex.dryness > 60 ? 'Dry' : selectedHex.dryness > 40 ? 'Moderate' : 'Wet'})`
					}
				]
			: []
	);
</script>

<div class="planet-viewer">
	<!-- Planet name as heading -->
	<h2 class="planet-name">{planet.name}</h2>

	<!-- Side-by-side layout: Basic info and 3D visualization -->
	<div class="planet-overview">
		<div class="planet-info">
			<InfoGrid items={basicInfo} />
		</div>
		<div class="planet-3d-container">
			<PlanetRenderer {planet} containerWidth={400} containerHeight={400} />
		</div>
	</div>

	<!-- World Map Section -->
	{#if planet.type !== 'gas giant'}
		<Section title="World Map">
			{#if planet.worldMap}
				<div class="world-map-controls">
					<div class="continent-controls">
						<label class="toggle-label">
							<input type="checkbox" bind:checked={showContinents} />
							<span>Show Continents</span>
						</label>
						<label class="toggle-label">
							<input type="checkbox" bind:checked={continentSelectionMode} />
							<span>Continent Selection Mode</span>
						</label>
						{#if planet.worldMap.continents && planet.worldMap.continents.length > 0}
							<span class="continent-count"
								>{planet.worldMap.continents.length}
								{planet.worldMap.continents.length === 1 ? 'Continent' : 'Continents'} Detected</span
							>
						{/if}
					</div>
					<button class="regenerate-btn" onclick={regenerateWorldMap}>Regenerate Map</button>
				</div>
				{#key mapKey}
					<HexMapCanvas
						worldMap={planet.worldMap}
						{showContinents}
						{continentSelectionMode}
						on:hexSelected={handleHexSelected}
						on:continentSelected={handleContinentSelected}
					/>
				{/key}
				{#if selectedHex}
					<div class="hex-info-panel">
						<h4 class="hex-info-title">Selected Hex</h4>
						<InfoGrid items={hexInfo} />
					</div>
				{/if}
			{:else}
				<div class="no-map-container">
					{#if showWorldMapError}
						<p class="error-message">{showWorldMapError}</p>
					{/if}
					<p class="no-map-text">No world map generated yet.</p>
					<button class="generate-btn" onclick={generateWorldMap}>Generate World Map</button>
				</div>
			{/if}
		</Section>
	{/if}

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

	.planet-name {
		font-size: 2rem;
		font-weight: 700;
		color: rgb(192 132 252);
		margin: 0 0 1.5rem 0;
		text-align: center;
		letter-spacing: 0.02em;
	}

	.planet-overview {
		display: flex;
		gap: 2rem;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.planet-info {
		flex: 0 0 auto;
		width: 280px;
		min-width: 250px;
	}

	/* Make info items display vertically in the planet info section */
	.planet-info :global(.info-grid) {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.planet-info :global(.info-item) {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.375rem;
		border-left: 3px solid rgb(147 51 234 / 0.5);
	}

	.planet-info :global(.info-label) {
		min-width: 90px;
		flex-shrink: 0;
		font-size: 0.7rem;
	}

	.planet-info :global(.info-value) {
		flex: 1;
		font-size: 0.8rem;
	}

	.planet-3d-container {
		width: 500px;
		height: 500px;
		flex-shrink: 0;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.world-map-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.continent-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgb(203 213 225);
		font-size: 0.875rem;
		cursor: pointer;
		user-select: none;
	}

	.toggle-label input[type='checkbox'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: rgb(147 51 234);
	}

	.toggle-label:hover span {
		color: rgb(192 132 252);
	}

	.continent-count {
		color: rgb(192 132 252);
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.375rem;
		border: 1px solid rgb(147 51 234 / 0.3);
	}

	.generate-btn,
	.regenerate-btn {
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

	.generate-btn:hover,
	.regenerate-btn:hover {
		background: linear-gradient(135deg, rgb(126, 34, 206), rgb(107, 33, 168));
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
	}

	.no-map-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
	}

	.no-map-text {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		margin: 0;
	}

	.error-message {
		color: rgb(252 165 165);
		background: rgb(127 29 29 / 0.3);
		padding: 0.75rem 1rem;
		border-left: 3px solid rgb(239 68 68);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		margin: 0;
	}

	.hex-info-panel {
		margin-top: 1rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border-radius: 0.5rem;
		border: 2px solid rgb(147 51 234 / 0.3);
	}

	.hex-info-title {
		margin: 0 0 0.75rem 0;
		color: rgb(192 132 252);
		font-size: 1rem;
		font-weight: 600;
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
