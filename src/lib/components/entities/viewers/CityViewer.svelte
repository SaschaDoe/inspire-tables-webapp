<script lang="ts">
	import type { City } from '$lib/entities/location/city';
	import { entityStore } from '$lib/stores/entityStore';
	import type { Nation } from '$lib/entities/location/nation';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import { EntityType } from '$lib/types/entity';

	interface Props {
		city: City;
	}

	let { city }: Props = $props();

	// Determine mode
	const isSimulationMode = $derived(city.isSimulationGenerated);

	// Get nation name for simulation mode
	function getNationName(nationId: string): string {
		if (!nationId) return 'Independent';
		const nation = entityStore.getEntity(nationId) as Nation;
		return nation?.name || 'Unknown Nation';
	}

	// Settlement Overview Info - shown for ALL cities (RPG and simulation)
	const settlementInfo = $derived([
		{ label: 'Name', value: city.name },
		{ label: 'Size', value: city.size || 'Unknown' },
		{ label: 'Fame', value: city.fame || 'Unknown' },
		{ label: 'Population', value: city.population.toLocaleString() },
		...(isSimulationMode && city.foundedYear ? [{ label: 'Founded', value: `Year ${city.foundedYear}` }] : []),
		...(isSimulationMode && city.isCapital ? [{ label: 'Capital', value: '⭐ Yes' }] : [])
	]);
</script>

<!-- ALL CITIES use Settlement Overview as primary view -->
<div class="city-viewer">
	<Section title="Settlement Overview">
		<InfoGrid items={settlementInfo} />
	</Section>

	{#if city.rpgDescription || city.description}
		<Section title="Description">
			<p class="description-text">{city.rpgDescription || city.description}</p>
		</Section>
	{/if}

	{#if city.rpgEvents && city.rpgEvents.length > 0}
		<Section title="Recent Events">
			<ul class="event-list">
				{#each city.rpgEvents as event, index (index)}
					<li class="event-item">{event}</li>
				{/each}
			</ul>
		</Section>
	{/if}

	<!-- Optional: Show simulation details for simulation cities -->
	{#if isSimulationMode && city.ownerNationId}
		<Section title="Nation">
			<p class="nation-info">{getNationName(city.ownerNationId)}</p>
		</Section>
	{/if}
</div>

<style>
	.city-viewer {
		padding: 0;
	}

	.event-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.event-item {
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
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

	.nation-info {
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(168 85 247 / 0.3);
		border-radius: 0.5rem;
		color: rgb(216 180 254);
		font-size: 0.9rem;
		margin: 0;
	}
</style>
