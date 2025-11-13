<script lang="ts">
	import type { Universe } from '$lib/entities/celestial/universe';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import EntityLink from '../shared/EntityLink.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		universe: Universe;
	}

	let { universe }: Props = $props();

	const dispatch = createEventDispatcher();

	const basicInfo = $derived([
		{ label: 'Name', value: universe.name },
		{ label: 'Age', value: universe.age },
		{ label: 'Dimensional Structure', value: universe.dimensionalStructure },
		{ label: 'Fundamental Laws', value: universe.fundamentalLaws },
		{ label: 'Number of Spheres', value: universe.spheres.length.toString() }
	]);

	function handleSphereClick(event: CustomEvent<{ entity: any }>) {
		// Bubble up the event to parent (EntityViewer)
		dispatch('openEntity', { entity: event.detail.entity });
	}
</script>

<div class="universe-viewer">
	<Section title="Universe Information">
		<InfoGrid items={basicInfo} />
	</Section>

	{#if universe.spheres.length > 0}
		<Section title="Spheres">
			<div class="spheres-list">
				{#each universe.spheres as sphere}
					<EntityLink entity={sphere} icon="🌌" on:click={handleSphereClick} />
				{/each}
			</div>
		</Section>
	{/if}

	{#if universe.description}
		<Section title="Description">
			<p class="description-text">{universe.description}</p>
		</Section>
	{/if}
</div>

<style>
	.universe-viewer {
		padding: 0;
	}

	.spheres-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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
