<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import type { WorldMap } from '$lib/entities/location/worldMap';
	import type { Nation } from '$lib/entities/location/nation';
	import type { City } from '$lib/entities/location/city';
	import type { Unit } from '$lib/entities/military/unit';
	import { HexMapRenderer } from './webgl/HexMapRenderer';

	interface Props {
		worldMap: WorldMap;
		nations?: Nation[];
		cities?: City[];
		units?: Unit[];
	}

	let { worldMap, nations = [], cities = [], units = [] }: Props = $props();

	const dispatch = createEventDispatcher();

	let containerEl: HTMLDivElement;
	let renderer: HexMapRenderer | null = $state(null);
	let isLoading = $state(true);
	let zoomPercent = $state(0);
	let viewMode = $state('Planetary View');

	/**
	 * Pan to a global hex coordinate (exposed for external use)
	 */
	export function panToGlobalHex(globalX: number, globalY: number, zoomLevel?: number): void {
		renderer?.panToGlobalHex(globalX, globalY, zoomLevel);
	}

	/**
	 * Pan to a planetary hex coordinate (exposed for external use)
	 */
	export function panToPlanetaryHex(hexX: number, hexY: number, zoomLevel?: number): void {
		renderer?.panToPlanetaryHex(hexX, hexY, zoomLevel);
	}

	// Update zoom display periodically
	let updateInterval: number | null = null;

	onMount(async () => {
		isLoading = true;
		renderer = new HexMapRenderer();

		// Set up event handlers
		renderer.setOnHexSelected((event) => {
			dispatch('hexSelected', { hex: event.hex });
		});

		renderer.setOnRegionalHexSelected((event) => {
			dispatch('regionalHexSelected', {
				planetaryHex: event.planetaryHex,
				regionalHex: event.regionalHex,
				detailedHex: event.detailedHex,
				globalX: event.globalX,
				globalY: event.globalY
			});
		});

		await renderer.init(containerEl, worldMap);

		// Apply all entities AFTER init is complete (fixes navigation back issue)
		// The $effect blocks may have fired before init() completed, so we need to apply manually
		if (nations.length > 0) {
			renderer.updateNations(nations);
		}
		if (cities.length > 0) {
			renderer.updateCities(cities);
		}
		if (units.length > 0) {
			renderer.updateUnits(units);
		}

		isLoading = false;

		// Update zoom display
		updateInterval = window.setInterval(() => {
			if (renderer) {
				zoomPercent = renderer.getZoomPercent();
				viewMode = renderer.getViewMode();
			}
		}, 100);
	});

	onDestroy(() => {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
		renderer?.destroy();
	});

	// Watch for worldMap changes
	$effect(() => {
		if (renderer && worldMap) {
			renderer.updateWorldMap(worldMap);
		}
	});

	// Watch for nations changes
	$effect(() => {
		if (renderer && nations) {
			renderer.updateNations(nations);
		}
	});

	// Watch for cities changes
	$effect(() => {
		if (renderer && cities) {
			renderer.updateCities(cities);
		}
	});

	// Watch for units changes
	$effect(() => {
		if (renderer && units) {
			renderer.updateUnits(units);
		}
	});

	function handleZoomIn() {
		renderer?.zoomIn();
	}

	function handleZoomOut() {
		renderer?.zoomOut();
	}

	function handleResetZoom() {
		renderer?.resetZoom();
	}
</script>

<div class="hex-map-webgl-container">
	<div class="zoom-controls">
		<button class="zoom-btn" onclick={handleZoomIn} title="Zoom in">+</button>
		<button class="zoom-btn" onclick={handleZoomOut} title="Zoom out">−</button>
		<button class="zoom-btn reset-btn" onclick={handleResetZoom} title="Reset zoom">⟲</button>
		<span class="zoom-level">{zoomPercent}%</span>
		<span class="view-mode">{viewMode}</span>
	</div>
	<div class="canvas-wrapper">
		<div bind:this={containerEl} class="webgl-canvas-container"></div>
		{#if isLoading}
			<div class="loading-overlay">
				<div class="loading-spinner"></div>
				<span class="loading-text">Loading map...</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.hex-map-webgl-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: rgb(15 23 42);
		border-radius: 0.5rem;
		padding: 1rem;
		position: relative;
	}

	.zoom-controls {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
	}

	.zoom-btn {
		width: 36px;
		height: 36px;
		background: rgb(30 41 59);
		border: 2px solid rgb(71 85 105);
		border-radius: 0.375rem;
		color: rgb(203 213 225);
		font-size: 1.25rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.zoom-btn:hover {
		background: rgb(51 65 85);
		border-color: rgb(147 51 234);
		color: white;
	}

	.reset-btn {
		font-size: 1.5rem;
	}

	.zoom-level {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		font-weight: 500;
		min-width: 50px;
		text-align: center;
	}

	.view-mode {
		color: rgb(147 51 234);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		background: rgb(30 27 75 / 0.5);
		border-radius: 0.25rem;
		margin-left: 0.5rem;
	}

	.webgl-canvas-container {
		width: 100%;
		height: 600px;
		border: 2px solid rgb(71 85 105);
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.webgl-canvas-container :global(canvas) {
		display: block;
	}

	.canvas-wrapper {
		position: relative;
		width: 100%;
	}

	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		background: rgb(15 23 42 / 0.9);
		border-radius: 0.375rem;
		z-index: 10;
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgb(71 85 105);
		border-top-color: rgb(147 51 234);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		color: rgb(203 213 225);
		font-size: 0.875rem;
		font-weight: 500;
	}
</style>
