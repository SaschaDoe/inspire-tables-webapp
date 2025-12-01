<script lang="ts">
	import type { HexTile } from '$lib/entities/location/hexTile';
	import type { RegionalHexData } from '$lib/entities/location/regionalHexData';
	import { DetailedHexTile } from '$lib/entities/location/detailedHexTile';
	import { WorldMap } from '$lib/entities/location/worldMap';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import HexMapWebGL from '$lib/components/worldmap/HexMapWebGL.svelte';
	import { TerrainType } from '$lib/entities/location/terrainType';
	import { createEventDispatcher, onMount } from 'svelte';

	interface Props {
		hexTile: HexTile;
		parentEntity?: any;
	}

	let { hexTile, parentEntity }: Props = $props();

	console.log('[HexTileViewer] Component initialized');
	console.log('[HexTileViewer] hexTile:', hexTile);
	console.log('[HexTileViewer] hexTile type:', typeof hexTile);
	console.log('[HexTileViewer] hexTile.regionalHexes:', hexTile?.regionalHexes);
	console.log('[HexTileViewer] hexTile.regionalGridSize:', hexTile?.regionalGridSize);

	const dispatch = createEventDispatcher();

	let selectedRegionalHex: RegionalHexData | null = $state(null);
	let selectedDetailedHex: DetailedHexTile | null = $state(null);
	let wrapperWorldMap: WorldMap | null = $state(null);
	let mapKey = $state(0);
	let hexMapComponent: HexMapWebGL | null = $state(null);

	// Create a wrapper WorldMap containing just this single HexTile
	onMount(() => {
		console.log('[HexTileViewer] onMount called');
		createWrapperWorldMap();
	});

	function createWrapperWorldMap() {
		console.log('[HexTileViewer] createWrapperWorldMap called');
		console.log('[HexTileViewer] hexTile.regionalHexes exists:', !!hexTile.regionalHexes);
		console.log('[HexTileViewer] hexTile.regionalHexes length:', hexTile.regionalHexes?.length);

		// Create a minimal WorldMap with just this HexTile
		const worldMap = new WorldMap();

		// Set up a 1x1 grid with just this hex tile
		worldMap.hexTiles = [[hexTile]];
		worldMap.width = 1;
		worldMap.height = 1;

		// Use the regional grid size from the hex tile
		const gridSize = hexTile.regionalGridSize || 5;
		worldMap.gridSize = gridSize;
		worldMap.detailedWidth = gridSize;
		worldMap.detailedHeight = gridSize;

		// Create detailed hex tiles from the regional hex data
		const detailedTiles = new Map<string, DetailedHexTile>();

		if (hexTile.regionalHexes && hexTile.regionalHexes.length > 0) {
			for (let y = 0; y < hexTile.regionalHexes.length; y++) {
				const row = hexTile.regionalHexes[y];
				if (!row) continue;

				for (let x = 0; x < row.length; x++) {
					const regionalHex = row[x];
					if (!regionalHex) continue;

					// Create a DetailedHexTile from RegionalHexData
					const detailedHex = createDetailedHexFromRegional(regionalHex, x, y);
					const key = `${x},${y}`;
					detailedTiles.set(key, detailedHex);
				}
			}
		}

		worldMap.detailedHexTiles = detailedTiles;
		wrapperWorldMap = worldMap;
		mapKey++;

		// Auto-zoom to show regional view after map is ready
		setTimeout(() => {
			if (hexMapComponent) {
				// Pan to center of the single hex and zoom in to 200% (regional view)
				hexMapComponent.panToPlanetaryHex(0, 0, 200);
			}
		}, 500);
	}

	function createDetailedHexFromRegional(regional: RegionalHexData, x: number, y: number): DetailedHexTile {
		const tile = new DetailedHexTile();

		tile.globalX = x;
		tile.globalY = y;
		tile.localX = x;
		tile.localY = y;
		tile.parentHexX = 0;
		tile.parentHexY = 0;

		tile.terrainType = regional.terrainType;
		tile.elevation = regional.elevation;
		tile.feature = regional.feature;
		tile.hasRiver = regional.hasRiver;
		tile.riverSides = regional.riverSides || [];

		tile.yields = regional.yields;
		tile.defensiveBonus = regional.defensiveBonus;
		tile.movementCost = regional.movementCost;
		tile.isImpassable = regional.isImpassable;
		tile.isCoastal = regional.isCoastal;

		tile.ownerNationId = regional.ownerNationId || null;
		tile.ownerCityId = regional.ownerCityId || null;

		return tile;
	}

	function handleRegionalHexSelected(event: CustomEvent<{
		planetaryHex: HexTile;
		regionalHex: RegionalHexData;
		detailedHex: DetailedHexTile | undefined;
		globalX: number;
		globalY: number;
	}>) {
		selectedRegionalHex = event.detail.regionalHex;
		selectedDetailedHex = event.detail.detailedHex ?? null;
	}

	function handleHexSelected(event: CustomEvent<{ hex: HexTile }>) {
		// When the general hex is selected, reset to no specific regional selection
		selectedRegionalHex = null;
		selectedDetailedHex = null;
	}

	// Basic info about the parent hex tile
	const hexInfo = $derived([
		{ label: 'Position', value: `(${hexTile.x}, ${hexTile.y})` },
		{ label: 'Terrain', value: TerrainType[hexTile.terrainType] },
		{ label: 'Elevation', value: hexTile.elevation.toString() },
		{ label: 'Temperature', value: `${hexTile.temperature.toFixed(0)}°` },
		{ label: 'Dryness', value: `${hexTile.dryness.toFixed(0)}%` },
		{ label: 'Regional Grid', value: `${hexTile.regionalGridSize}x${hexTile.regionalGridSize}` }
	]);

	// Info about selected regional hex
	const regionalHexInfo = $derived(
		selectedDetailedHex
			? [
				{ label: 'Local Position', value: `(${selectedDetailedHex.localX}, ${selectedDetailedHex.localY})` },
				{ label: 'Terrain', value: TerrainType[selectedDetailedHex.terrainType] },
				{ label: 'Elevation', value: selectedDetailedHex.elevation.toString() },
				{ label: 'Feature', value: selectedDetailedHex.feature || 'None' },
				{ label: 'Has River', value: selectedDetailedHex.hasRiver ? 'Yes' : 'No' },
				{ label: 'Food', value: selectedDetailedHex.yields.food.toString() },
				{ label: 'Production', value: selectedDetailedHex.yields.production.toString() },
				{ label: 'Gold', value: selectedDetailedHex.yields.gold.toString() },
				{ label: 'Defense Bonus', value: `${selectedDetailedHex.defensiveBonus}%` },
				{ label: 'Movement Cost', value: selectedDetailedHex.movementCost.toString() }
			]
			: selectedRegionalHex
			? [
				{ label: 'Position', value: `(${selectedRegionalHex.x}, ${selectedRegionalHex.y})` },
				{ label: 'Terrain', value: TerrainType[selectedRegionalHex.terrainType] },
				{ label: 'Elevation', value: selectedRegionalHex.elevation.toString() },
				{ label: 'Feature', value: selectedRegionalHex.feature || 'None' },
				{ label: 'Has River', value: selectedRegionalHex.hasRiver ? 'Yes' : 'No' },
				{ label: 'Food', value: selectedRegionalHex.yields.food.toString() },
				{ label: 'Production', value: selectedRegionalHex.yields.production.toString() },
				{ label: 'Gold', value: selectedRegionalHex.yields.gold.toString() }
			]
			: []
	);
</script>

<div class="hex-tile-viewer">
	<h2 class="hex-tile-title">
		Hex Tile at ({hexTile.x}, {hexTile.y})
	</h2>

	<Section title="Overview">
		<InfoGrid items={hexInfo} />
	</Section>

	<Section title="Regional Hex Map">
		{#if wrapperWorldMap}
			<p class="map-hint">
				This shows the {hexTile.regionalGridSize}x{hexTile.regionalGridSize} regional hexes within this tile. Click on a hex to see its details.
			</p>
			{#key mapKey}
				<HexMapWebGL
					bind:this={hexMapComponent}
					worldMap={wrapperWorldMap}
					on:hexSelected={handleHexSelected}
					on:regionalHexSelected={handleRegionalHexSelected}
				/>
			{/key}
		{:else}
			<div class="no-regional-hexes">
				<p>No regional hex data available for this tile.</p>
			</div>
		{/if}
	</Section>

	{#if selectedRegionalHex || selectedDetailedHex}
		<Section title="Selected Regional Hex">
			<div class="selected-hex-info">
				<InfoGrid items={regionalHexInfo} />
			</div>
		</Section>
	{/if}

	{#if hexTile.dungeons && hexTile.dungeons.length > 0}
		<Section title="Dungeons">
			<div class="dungeon-list">
				{#each hexTile.dungeons as dungeon (dungeon.id || dungeon.name)}
					<div class="dungeon-item">
						<span class="dungeon-name">{dungeon.name}</span>
					</div>
				{/each}
			</div>
		</Section>
	{/if}

	{#if hexTile.settlements && hexTile.settlements.length > 0}
		<Section title="Settlements">
			<div class="settlement-list">
				{#each hexTile.settlements as settlement (settlement.id || settlement.name)}
					<div class="settlement-item">
						<span class="settlement-name">{settlement.name}</span>
					</div>
				{/each}
			</div>
		</Section>
	{/if}

	{#if hexTile.hazards && hexTile.hazards.length > 0}
		<Section title="Hazards">
			<div class="hazard-list">
				{#each hexTile.hazards as hazard (hazard)}
					<span class="hazard-tag">{hazard}</span>
				{/each}
			</div>
		</Section>
	{/if}
</div>

<style>
	.hex-tile-viewer {
		padding: 0;
	}

	.hex-tile-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: rgb(192 132 252);
		margin: 0 0 1.5rem 0;
		text-align: center;
	}

	.map-hint {
		color: rgb(148 163 184);
		font-size: 0.875rem;
		margin: 0 0 1rem 0;
		text-align: center;
	}

	.no-regional-hexes {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
	}

	.no-regional-hexes p {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		margin: 0;
	}

	.selected-hex-info {
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border-radius: 0.5rem;
		border: 2px solid rgb(34 197 94 / 0.3);
	}

	.dungeon-list,
	.settlement-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.dungeon-item,
	.settlement-item {
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.5rem;
		border-left: 3px solid rgb(147 51 234);
	}

	.dungeon-name,
	.settlement-name {
		color: rgb(226 232 240);
		font-weight: 500;
	}

	.hazard-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.hazard-tag {
		padding: 0.375rem 0.75rem;
		background: rgb(239 68 68 / 0.2);
		border: 1px solid rgb(239 68 68 / 0.4);
		border-radius: 0.5rem;
		color: rgb(254 202 202);
		font-size: 0.875rem;
	}
</style>
